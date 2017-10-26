var Model = require('./model');

function list(){}

function one(){}

function save(doc){
	console.log("I m here");
	return Model.create(doc);
}
exports.save = save;


function saveNotificationResponse(doc){
	return function(result){
		console.log("update notification")
		console.log(result);

		if(!doc){
			console.log("Need Notification id to save response");
		}

		// update Notification collection
		Model.update({
			_id:doc._id
		},{
			$set: {result: result}
		},{
			upsert: true
		},function(error){
			if(error)
				console.log(error)
			if(!error)
				console.log(`saved response to ${doc._id}`)
		})
	}	
}
exports.saveNotificationResponse = saveNotificationResponse;