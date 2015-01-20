/**
 * UploadController
 *
 * @description :: Server-side logic for uploading files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var util = require('util');
var uuid = require('node-uuid');
var mailgun = require('mailgun-js')({
	apiKey: "key-4b3912e74966f8f1259596dfb2924fa6",
	domain: "mailgun.imtechgraphics.com"
});


module.exports = {
	// Send  verification email
	verify: function(req, res) {

		// Save sending user
		Seal.verify({
				email: req.body['email']
			},
			function(err, record) {
				if (err) return res.serverError(err);

				console.log(record)
			});
	},

	// Display upload form
	index: function(req, res) {

		// Check if incomming code is valid req.param('repo')

		res.set(200, 'Cache-Control', 'no-cache');
		res.view('uploader', {
			sessionUUID: uuid.v4(),
			code: req.param('code') || ""
		});

	},

	// Upload File
	upload: function(req, res) {

		// Validate verification code
		var sealer,
			code        = req.body['code'],
			sessionUUID = req.body['sessionUUID'];

		Seal.findOne({
			code: code
		}).exec(function(err, seal) {

			sealer = seal;

			if (err) return res.serverError(err);

			if (parseInt(seal.codeCount) > 0) {
				res.view('homepage', {
					msg: 'The code ' + code + ' has already been used.'
				});

			} else {
				var startTime = (new Date()).getTime(),
					endTime,
					downloadSize,
					speedBps,
					speedKbps,
					speedMbps;


				req.file('files').upload({
						dirname: '/var/tmp/',
						maxBytes: 20000000000,
						onProgress: function(progress) {

							//console.log(this)
							endTime   = (new Date()).getTime();
							duration  = Math.round((endTime - startTime) / 1000);
							speedBps  = Math.round(progress.written / duration);
							speedKbps = (speedBps / 1024).toFixed(2);
							speedMbps = (speedKbps / 1024).toFixed(2);

							// Todo: Emit messages to specific session
							sails.sockets.blast(sessionUUID, {
								total         : Math.floor((progress.written / progress.stream.byteCount) * 100),
								duration      : duration,
								speedKbps     : speedKbps,
								speedMbps     : speedMbps,
								totalSize     : progress.stream.byteCount,
								totalUploaded : progress.written,
								fileName      : progress.name
							});
						}
					},
					function(err, files) {
						if (err) return res.serverError(err);

						// No errors continue
						endTime       = (new Date()).getTime();
						totalDuration = Math.round((endTime - startTime) / 1000);

						var result = {
							name      : req.body['name'],
							company   : req.body['company'],
							job       : req.body['job'],
							comments  : req.body['comments'],
							message   : files.length + ' file(s) uploaded successfully!',
							files     : files,
							duration  : totalDuration,
							speedKbps : speedKbps,
							speedMbps : speedMbps,
							sealedBy  : sealer.id
						};

						// Create
						Uploader.create(result, function(err, record) {
							// Send email to user
              var data = {
								from    : 'support@imtechgraphics.com',
								to      : sealer.email,
								subject : 'ImlinkUp File Transfer confirmation',
								text    : result.message
							};

							//Send Email
							mailgun.messages().send(data, function(error, body) {
								if (err) return res.serverError(err);
							});

							// Update Seal
							Seal.update({ code  : sealer.code, email : sealer.email }, { codeCount: 1 }, function(err, updated) {
								if(err) res.serverError(err)
							});
						});

						// Render complete screen
						res.view('complete', {
							upload: result
						});
					});
			}
		});

	}
};
