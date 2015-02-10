/**
 * UploadController
 *
 * @description :: Server-side logic for uploading files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var fsPath = require('path');

module.exports = {

  // Send  verification email
  verify: function (req, res) {

    // Create Seal for this user
    Seal.create({email: req.body['email']}, function (err, seal) {
      if (err) {
        return res.serverError(err);
      }

      EmailService.sendVerificationEmail(seal, function (err, data) {
        if (err) {
          return res.serverError(err);
        }

        res.redirect('bucket/index/' + seal.id);
      });

    });
  },

  // Display upload form
  index : function (req, res) {
    // Todo: Check if incomming code is valid req.param('code')
    Seal.isValid({code: req.params.code, id: req.params.id}, function (err, valid, sealer) {

      res.view('uploader', {sessionUUID: sealer.id, code: sealer.code || ""});
    })


  },
  // Upload File
  upload: function (req, res) {

    // Validate verification code
    var code = req.body.code,
        sessionUUID = req.body.sessionUUID,
        uploadPath = fsPath.resolve(sails.config.appPath, '/assets/client'),
        startTime = (new Date()).getTime(),
        maxbytes = 14000000000; // 14 GB

    Seal.findOne({code: code}).exec(function (err, seal) {

      var codeUsage = parseInt(seal.codeCount), sealer = seal;

      if (err) {
        return res.serverError(err);
      }

      // If the code was used send them back to homepage
      if (codeUsage > 0) res.view('homepage', {msg: 'The code ' + code + ' has already been used.'});

      req.file('files').upload({
          dirName   : uploadPath,
          maxBytes  : maxbytes,
          onProgress: function (progress) {
            // Todo Implement socket emitter
            EmitterService.blast(progress, sessionUUID, startTime)
          }
        },
        function (err, files) {
          if (err) {
            return res.serverError(err);
          }

          BucketService.sealedUpload(files, req.body, sealer, startTime, function (err, bucket) {
            if (err) {
              return res.serverError(err);
            }

            res.view('complete', {bucket: bucket});
          });
        });

    });
  }


};
