var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	identifier: String, // This is for internal use (e.g new_task_created) 
	title: String,		// This will be used for notification title in mobile
	users: [{
        device : {
            platform : String,
            token : String,
            socket : String
        }        
    }],
    createdOn: { type: Date, default: Date.now },

    msg: Schema.Types.Mixed, // Actual body for notification
    result: Schema.Types.Mixed // Push Notification Response from GCM/APN
	
},{strict:true /*, capped: { size: 10240000, max: 1000, autoIndexId: true } */ });

/**
 * after saving of task
 */

var EventEmitter = require("../event/emitter").emitter;

schema.post('save', function (doc) {
  EventEmitter.emit("notification:new", doc);
})

module.exports = mongoose.model('Notification', schema);