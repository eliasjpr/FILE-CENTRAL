/**
 * UploadController
 *
 * @description :: Server-side logic for uploading files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var uuid = require('node-uuid');

module.exports = {
  // Send  verification email
  verify: function (req, res) {

    // Create Seal for this user
    Seal.create({email: req.body['email']}, function (err, record) {
      if (err) {
        return res.serverError(err);
      }

      EmailService.sendVerificationEmail(record, function (err, data) {
        res.redirect('uploader/index');
      });

    });

  },

  // Display upload form
  index : function (req, res) {

    // Check if incomming code is valid req.param('code')
    res.set(200, 'Cache-Control', 'no-cache');

    res.view('uploader', {
      sessionUUID: uuid.v4(),
      code       : req.param('code') || ""
    });

  },

  // Upload File
  upload: function (req, res) {

    // Validate verification code
    var sealer,
        code = req.body['code'],
        sessionUUID = req.body['sessionUUID'];

    Seal.findOne({
      code: code
    }).exec(function (err, seal) {

      if (err) {
        return res.serverError(err);
      }

      sealer = seal;
      var codeUsage = parseInt(seal.codeCount);

      if (codeUsage > 0) {
        console.log("Code ", code , " has been used ", codeUsage, " times.");

        res.view('homepage', { msg: 'The code ' + code + ' has already been used.' });

      } else {

        var startTime = (new Date()).getTime(),
            endTime,
            duration,
            speedBps,
            speedKbps,
            speedMbps;

        req.file('files').upload({
            dirName   : '/var/tmp/',
            maxBytes  : 20000000000,
            onProgress: function (progress) {

              endTime = (new Date()).getTime();
              duration = Math.round((endTime - startTime) / 1000);
              speedBps = Math.round(progress.written / duration);
              speedKbps = (speedBps / 1024).toFixed(2);
              speedMbps = (speedKbps / 1024).toFixed(2);

              // Emiting messages to specific session sessionUUID
              sails.sockets.blast(sessionUUID, {
                total        : Math.floor((progress.written / progress.stream.byteCount) * 100),
                duration     : duration,
                speedKbps    : speedKbps,
                speedMbps    : speedMbps,
                totalSize    : progress.stream.byteCount,
                totalUploaded: progress.written,
                fileName     : progress.name
              });
            }
          },
          function (err, files) {
            if (err) {
              return res.serverError(err);
            }

            endTime = (new Date()).getTime();

            var totalDuration = Math.round((endTime - startTime) / 1000);

            var newUpload = {
              name     : req.body.name,
              company  : req.body.company,
              job      : req.body.job,
              comments : req.body.comments,
              message  : files.length + ' file(s) uploaded successfully!',
              files    : files,
              duration : totalDuration,
              speedKbps: speedKbps,
              speedMbps: speedMbps,
              sealedBy : sealer
            };

            // Create
            Uploader.create(newUpload, function (err, record) {

              if (err) {
                return res.serverError(err);
              }

              //Send Email
              EmailService.sendConfirmationEmail(newUpload, function (err, record) {

                if (err) {
                  return res.serverError(err);
                }

                // Update Seal
                Seal.update({
                  code : newUpload.sealedBy.code,
                  email: newUpload.sealedBy.email
                }, {codeCount: 1}, function (err, sealer) {
                  if (err) {
                    return res.serverError(err);
                  }

                  // Render complete screen
                  res.view('complete', {upload: newUpload}).end();
                });
              });
            });
          });
      }
    });
  }
};
