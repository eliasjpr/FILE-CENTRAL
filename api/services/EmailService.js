// EmailService.js - in api/services

var mailgun = require('mailgun-js')({
  apiKey: "key-4b3912e74966f8f1259596dfb2924fa6",
  domain: "mailgun.imtechgraphics.com"
});


module.exports = {

  sendVerificationEmail: function (record, cb) {

    sails.renderView('email_templates/verify_html', {code: record.code}, function (err, verify_html) {

      if (err) { return {record: record, verify_html: verify_html}; }

      sails.renderView('email_templates/verify_txt', {code: record.code}, function (err, verify_txt) {

        if (err) return cb(err, {
          record     : record,
          verify_html: verify_html,
          verify_txt : verify_txt
        });

        var message = {
          from   : 'support@imtechgraphics.com',
          to     : record.email,
          subject: 'ImlinkUp verification code',
          text   : verify_txt,
          html   : verify_html
        };

        //Send Email
        mailgun.messages().send(message, function (err, body) {

          if (err) { return {err: err, body: body}; }

          console.log("Verification email sent!");

          cb(err, body);
        });
      });
    });
  },


  sendConfirmationEmail: function (record, cb) {
    sails.renderView('email_templates/confirmation_html', {record: record}, function (err, verify_html) {
      if (err) { return console.log(err); }

      sails.renderView('email_templates/confirmation_txt', {record: record}, function (err, verify_txt) {

        if (err) { return cb(err, {err: err, record: record, verify_html: verify_html, verify_txt: verify_txt}); }

        var message = {
          from   : 'support@imtechgraphics.com',
          to     : record.sealedBy.email,
          subject: 'ImlinkUp Upload Confirmation',
          html   : verify_html,
          text   : verify_txt
        };

        //Send Email
        mailgun.messages().send(message, function (err, body) {

          if (err) { return {err: err, body: body}; }

          console.log("Confirmation email sent!")

          cb(err, record);
        });

      });
    });
  }


};
