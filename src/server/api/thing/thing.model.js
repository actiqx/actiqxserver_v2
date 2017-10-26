'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Schema = new Schema({
  name: String,
  info: String,
  
  _deleted: Boolean,  

  _updatedOn: Date,	// Auto fill by "addUpdatedOnMiddleware"
  _updatedBy: mongoose.Schema.Types.ObjectId, // Auto fill by "mongoose-request-context"
  _createdBy: mongoose.Schema.Types.ObjectId  // // Auto fill by "mongoose-request-context"
});

function findNotDeletedMiddleware(next) {
    this.where({ deleted : { $ne : true } }); 
    next();
}

Schema.pre('find', findNotDeletedMiddleware);
Schema.pre('findOne', findNotDeletedMiddleware);

module.exports = mongoose.model('Thing', Schema);