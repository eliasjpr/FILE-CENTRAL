/**
 * Global Variable Configuration
 * (sails.config.globals)
 *
 * Configure which global variables which will be exposed
 * automatically by Sails.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.globals.html
 */
module.exports.globals = {
  damPath : require('path').resolve('/yoda-uploader/UPLOADS/'),
  thumbDir: require('path').resolve('/assets/images/thumbs/')
};
