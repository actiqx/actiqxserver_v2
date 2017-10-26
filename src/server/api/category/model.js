var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function toLower (v) {
  return v.toLowerCase().replace(/\s/g,"-");
}

var schema = new Schema({
	title: String,
	info: String,
	icon: String,
	userRole: { type: String, set: toLower }, // this will map with user role

	parent: this,
	approved: { type: Boolean, default: false },
	_deleted : Boolean
});

schema.methods.populateRecursive = function(options, cb) {  
  	var model = this.model('Category');
  	var root = this;
  	options = options || {};
	return (function _populate(node){
		return model.populate(node, options).then(function(doc) {
		  return doc.parent ? _populate(doc.parent) : Promise.resolve(root);
		});
	})(root);	
}

schema.methods.getAllRoles = function getAllRoles(){
	var roles = [];
	(function _get(d){
		roles.push(d.userRole);
		if(d.parent){
			return _get(d.parent);
		}
	})(this);
	return roles;
}


module.exports = mongoose.model('Category', schema);