var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function toLower (v) {
  return v.toLowerCase().replace(/\s/g,"-");
}

var schema = new Schema({
	from      : { type: mongoose.Schema.Types.ObjectId, ref: "User"},
	to        : { type: mongoose.Schema.Types.ObjectId, ref: "User"},

	msg       : {
		type: { 
			type : String, 
			default : 'TEXT',
			enum:["TEXT","AUDIO","VIDEO"]
		},
		content : String
	},	

	// delivered : Date,
	// seen      : Date,
	// status    : { type : String, default : 'C' }, // C-Created, D-Delivered, S-Seen

	_createdOn : { type: Date, default: Date.now },
	_deleted : Boolean
});


/*
    pre hook for find & findOne to add condition 
    ============================================
 */

function findNotDeletedMiddleware(next) {
    this.where({ _deleted : { $ne : true } }).sort({ "$natural": -1 });
    next();
};
schema.pre('find', findNotDeletedMiddleware);
schema.pre('findOne', findNotDeletedMiddleware);


module.exports = mongoose.model('Message', schema);