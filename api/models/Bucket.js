/**
 * Uploader.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


module.exports = {

  attributes: {
    name       : {type: 'string', required: true},
    fsType     : {type: 'string'},
    serverPath : {type: 'string'},
    mimeType   : {type: 'string'},
    clientPath : {type: 'string'},
    path       : {type: 'string'},
    size       : {type: 'integer'},
    description: {type: 'string'},
    duration   : {type: 'integer'},
    speedKbps  : {type: 'string'},
    speedMbps  : {type: 'string'},
    metadata   : {type: 'json'},
    thumbnail  : {type: 'string'},
    company    : {type: 'string'},
    job        : {type: 'string'},
    files      : {
      collection: 'file',
      via: 'bucket'
    },
    sealedBy   : {
      model: 'seal'
    }
  }
};

