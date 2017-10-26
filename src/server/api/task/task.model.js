'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Model = mongoose.Model;

// this will pass request object to middleware
Model.customSave = function search (doc,req) {
  var model = new this(doc);
  return model.save(req);
}


function toUpper (v) {
  return v.toUpperCase().replace(/\s/g,"-");
}

var MySchema = new Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category"},
  info: String,
  date: { type: Date, default: Date.now() },

  place : String,
  location : {
    lat : Number, // 12.9490685
    lng : Number  // 77.7030139
  },

  // will store all indivisual service-user's bidding
  biddings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref:"User"},
    price: {
      currency: { type: String, default: "INR",  set: toUpper },
      amount: String
    }
  }],

  assignTo : { type: mongoose.Schema.Types.ObjectId, ref:"User", autopopulate: { select: 'name' } },

  /* internal properties (change in own risk) */
  _deleted: Boolean,                          // Auto updated by "inActive" instance method
  _updatedOn: Date,	                          // Auto fill by "addAddtionalInfoMiddleware"
  _updatedBy: { type: mongoose.Schema.Types.ObjectId, ref:"User"}, // Auto fill by "addAddtionalInfoMiddleware"
  _createdBy: { type: mongoose.Schema.Types.ObjectId, ref:"User"}  // Auto fill by "addAddtionalInfoMiddleware"
});


//MySchema.plugin(require("mongoose-autopopulate"));



/*  
    **************************************
    *                                    *
    *  Hooks for all the fetch operation *
    *                                    *  
    **************************************
 */

/*
    pre hook for find & findOne to add condition 
    ============================================
 */

function findNotDeletedMiddleware(next) {
    this.where({ _deleted : { $ne : true } });
    next();
};
MySchema.pre('find', findNotDeletedMiddleware);
MySchema.pre('findOne', findNotDeletedMiddleware);


/*
    pre hook for find & findOne to convert _id to date 
    ==================================================
 */

function addCreatedOnMiddleware(next, doc){
  doc._createdOn = doc._createdOn || doc._id.getTimestamp();
  next();
};
MySchema.pre('init', addCreatedOnMiddleware);


/*  
    ***************************************
    *                                     *
    * Hooks for all the insert operations *
    *                                     *  
    ***************************************
 */

/*
    (Important :: This is highest priority between all the pre-save hooks)
    This will remove the internal properties if provided by request
    =================================================================
 */
 function deleteInternalPropertyMiddleware(next){
    this._deleted   = undefined;
    //this._createdBy = undefined; // commented bcz it will be added in seed file
    this._updatedOn = undefined;
    this._updatedBy = undefined;
    next();
 };
 MySchema.pre('save', deleteInternalPropertyMiddleware);


/*
    This will add '_updatedOn', '_updatedBy' & '_createdBy' from request
    refer : mongoose.model.customSave
    ============================================================================
 */

function addAddtionalInfoMiddleware(next, req){
	if(!this.isNew){
		this._updatedOn = Date.now();
		this._updatedBy = req.user;
	}
	else{
    this._createdOn = Date.now();
		this._createdBy = this._createdBy || req.user;
  }
	next();
};
MySchema.pre('save', addAddtionalInfoMiddleware);

/*  
    ****************************
    *                          *
    * All the instance methods *
    *                          *
    ****************************
 */

MySchema.methods = {
  // in-active the document
  inActive : function(cb){
    return this.set("_deleted", true, 'Boolean').save(cb);
  }
};


/**
 * after saving of task
 */


// MySchema.post('save', function (doc) {
//   require("../event/emitter").emitter.emit("task:new-task", doc);
// });


/*  
    *************************
    * Create Model & export *
    *************************
 */ 
var Task = mongoose.model('Task', MySchema);
module.exports = Task;

