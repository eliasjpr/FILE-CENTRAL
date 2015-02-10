/**
 * Seal.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var mailgun = require('mailgun-js')({
  apiKey: "key-4b3912e74966f8f1259596dfb2924fa6",
  domain: "mailgun.imtechgraphics.com"
});

module.exports = {

  attributes: {
    email    : {
      type    : 'email',
      required: true
    },
    code     : {
      type      : 'string',
      required  : true,
      defaultsTo: function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 6; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
      }
    },

    codeCount: {
      type      : "integer",
      defaultsTo: 0,
      max       : 1
    },
    buckets  : {
      collection: 'bucket',
      via       : 'sealedBy'
    }
  },
  /*
   * Creates a SEAL and sends a verification email to user
   * @options  {object} Email address of the user to create
   * @param  	{Function} cb
   */
  verify    : function (opts, cb) {

    // Save sending user
    Seal.create({email: opts.email}, function (err, record) {
        if (err) return cb(err, {record: record});

        return cb(err, {
          record     : record,
          verify_html: verify_html,
          verify_txt : verify_txt,
          data       : data,
          body       : body
        });
    });
  },

  isValid: function (opts, cb) {
    Seal.findOne(opts.id)
      .exec(function (err, seal) {
        if (err) {
          return cb(err, null)
        }

        return cb(null, (seal.codeCount == 0), seal)
      });
  }

};
