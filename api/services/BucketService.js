// var gm = require('gm');
var fs = require('fs-extra');
var fsPath = require('path');

module.exports = {

  addFile     : function (files, params, startTime, cb) {
    var document;
    var totalDuration = Math.round(((new Date()).getTime() - startTime) / 1000),
        metadata = {};

    // Parse file metadata fields to json
    for (var field in params) {
      if (field.indexOf("metadata") === 0) {
        metadata[field.split('_')[1]] = params[field];
      }
    }

    document = {
      name       : params.name,
      fsType     : params.type,
      path       : params.path,
      clientPath : params.clientPath,
      size       : params.size,
      company    : params.company || 'Imtech',
      job        : params.job,
      description: params.comments,
      files      : files,
      duration   : totalDuration,
      metadata   : metadata,
      serverPath : fsPath.resolve(sails.config.globals.damPath + params.path), // Todo: Add Client directory to path
      thumbnail  : fsPath.resolve(sails.config.appPath + sails.config.globals.thumbDir + '/' + params.name.split('.')[0] + '.png')
    };

    // Create DB Entry
    Bucket.create(document, function (err, record) {

      if (err) return cb(err);
      // Render complete screen
      return cb(null, document);

    });

    // Todo Implement parsing metadata IMAGES, VIDEO and Audio files
    // Get Thumbnails where available
    //  gm(document.files[0].fd).options({imageMagick: true}).thumb(400, 0, document.thumbnail, 1, function (err, path) {
    //    if (err) return cb(err)
    //  });
  },
  addDir      : function (params, cb) {
    var document = {
      name      : params.name,
      fsType    : params.type,
      path      : params.path,
      clientPath: params.clientPath,
      size      : params.size,
      serverPath: fsPath.resolve(sails.config.globals.damPath + params.path), // Todo: Append Company path
      thumbnail : fsPath.resolve(sails.config.globals.thumbDir + 'dir_thumb.png')
    };

    // Make sure server path exists if no create it
    fs.mkdirs(document.serverPath, function (err) {
      if (err) return cb(err, null);

      // Create DB Entry
      Bucket.create(document, function (err, record) {
        if (err) return cb(err, null);

        // Render complete screen
        cb(null, document);
      });
    });
  },
  sealedUpload: function (files, params, sealer, startTime, cb) {
    var totalDuration = Math.round(((new Date()).getTime() - startTime) / 1000);
    var document = {
      name      : params.name,
      fsType    : params.type,
      serverPath: fsPath.resolve(sails.config.globals.damPath + params.path), // Todo: Add Company path
      path      : params.path,
      clientPath: params.clientPath,
      size      : params.size,
      thumbnail : fsPath.resolve(sails.config.globals.thumbDir + 'dir_thumb.png'),
      company   : params.company,
      job       : params.job,
      comments  : params.comments,
      files     : files,
      duration  : totalDuration,
      sealedBy  : sealer
    };

    // Create
    Bucket.create(document, function (err, record) {

      if (err)  return cb(err, null);

      //Send Email
      EmailService.sendConfirmationEmail(document, function (err, record) {

        if (err) return cb(err, null);

        // Update Seal
        Seal.update(
          {code: document.sealedBy.code, email: document.sealedBy.email}, {codeCount: 1}, function (err, sealer) {

            if (err) return cb(err, null);

            // Render complete screen
            cb(null, document)
          });
      });
    });
  }
};
