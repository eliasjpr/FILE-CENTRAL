/**
* File.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	fd: { type: 'string', required: true},
  	size: { type: 'integer', required: true},
  	type: { type: 'string', required: true},
  	filename: { type: 'string', required: true},
  	status: { type: 'string', required: true},
  	field: { type: 'string', required: true},
  	uploadedBy:{
	  	model:'uploader'
  	}
  }
};

