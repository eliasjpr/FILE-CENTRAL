/**
* Uploader.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	name: { type: 'string', required: true},
  	company: { type: 'string', required: true },
  	job: { type: 'string'},
  	comments: { type: 'string'},
  	
  	duration: { type: 'integer', required: true},
  	speedKbps: {type: 'string', required: true},
  	speedMbps: {type: 'string', required: true},
  	message: {type: 'string', required: true},
  	files:{
        collection: 'file',
        via: 'uploadedBy'
    },
    sealedBy:{
	  	model:'seal'
  	}
  }
};

