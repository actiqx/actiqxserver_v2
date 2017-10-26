console.log("Loaded emitter.js");

var events = require('events');
var eventEmitter = new events.EventEmitter();
exports.emitter = eventEmitter;

exports.register = function(socketIo) {
	eventEmitter.on('task:new-bidding', onNewBidding(socketIo,true));
	eventEmitter.on('task:new-task', onNewTask(socketIo,true));
	eventEmitter.on('notification:new', onNewNotification(socketIo));
	eventEmitter.on('task:new-assign', onNewTaskAssign(socketIo, true));
	eventEmitter.on('msg:new-msg', onNewPrivateMsg(socketIo, false));
}

/**
 * constant identifiers for socket events
 * This will used for socket emit & can be listened using socket client
 */
var identifiers = {
	new_task_created 	: "event:new:task_created",
	new_bidding_created	: "event:new:bidding_created",
	new_task_assignment	: "event:new:task_assignment",
	new_private_message	: "event:new:private_message"
};

var CategoryCtrl = require('../category/controller');
var UserCtrl = require('../user/user.controller');
var NotificationCtrl = require('../notification/controller');
var Promise = require("bluebird");
var async = Promise.promisifyAll(require("async")); 
var NotificationSend = require("../notification/send");


function onNewTask(socketIo, willToSaveNotification){
	return function(task){
		console.log("onNewTask");
		//console.log(task);

		try{
			task = task.toJSON();  
		}catch(err){
			console.log(err);
		}
		  
		async.waterfallAsync([
			function roles(callback) {
				CategoryCtrl.getDoc({ 
				  condition: task.category,
				  selects: {parent: 1, userRole: 1, title: 1}
				}).then(function(doc){
				    // replace doc with id
				    task.category = doc.toJSON();
				    doc.populateRecursive({ path: "parent"}).then(function(doc){
				      var roles = doc.getAllRoles();
				      callback(null, roles);            
				    }).catch(callback);         
				}).catch(callback);
			},
			function users(roles, callback) {
				UserCtrl.getServiceUsers({
				    roles: roles, 
				    date: task.date,
				    latitude: task.location.lat, 
				    longitude: task.location.lng,
				    sortBy: 'rating',
				    select: {name:0, email:0, avatar:0},
				    excludeUsers: [task._createdBy] // user ids (User who is creating the task) which will exclude
				}).then(function(users){
				  callback(null,users);
				}).catch(callback);
			},
			function format(users, callback){
				callback(null,{          
				  msg:{
				  	task: task._id,
					category: {
						_id: task.category._id,
						title: task.category.title
					}
				  },
				  users: users,
				  title: "New Task",
				  identifier: identifiers["new_task_created"]
				})
			}
		])
		.then(function(data){
			NotificationSend.sendToUsers(socketIo, data, willToSaveNotification);				
		})
		.catch(console.log);
	}
}

function onNewBidding(socketIo, willToSaveNotification){
	return function(task,bidding){
		console.log("onNewBidding");

		UserCtrl.get({_id:task._createdBy},{device:1,name:1,avatar:1})
			.then(function format(user){
				return {          
					msg:{
						task: task._id,
						bidding: bidding
					},
					users: [].concat(user),
					title: "New Bidding",
					identifier: identifiers["new_bidding_created"]
				}
			})
			.then(function(data){
				NotificationSend.sendToUsers(socketIo, data, willToSaveNotification);				
			})
			.catch(console.log);
	}	
}

function onNewTaskAssign(socketIo, willToSaveNotification){
	return function(task){	
		console.log("onNewAssign");
		//console.log(task);

		try{
			task = task.toJSON()
		}catch(err){}

		UserCtrl.get({_id: task.assignTo},{device:1,name:1,avatar:1})
			.then(function(user){
				delete task.biddings;
				delete task._updatedBy;

				return {          
					msg:{
						task: task
					},
					users: [].concat(user),
					title: "New Task Assignment",
					identifier: identifiers["new_task_assignment"]
				}
			})
			.then(function(data){
				NotificationSend.sendToUsers(socketIo, data, willToSaveNotification, NotificationCtrl.saveNotificationResponse);				
			})
			.catch(console.log);
	}	
}

function onNewPrivateMsg(socketIo, willToSaveNotification){
	return function(msg){
		console.log("onNewPrivateMsg");

		try{
			msg = msg.toJSON();
		}catch(err){}

		UserCtrl.get({_id: msg.to},{device:1})
			.then(function(user){
				return {          
					msg: msg,
					users: [].concat(user),
					title: "New Private Message",
					identifier: identifiers["new_private_message"]
				}
			})
			.then(function(data){
				NotificationSend.sendToUsers(socketIo, data, willToSaveNotification, NotificationCtrl.saveNotificationResponse);				
			})
			.catch(console.log);
	}
}

function onNewNotification(socketIo){
	return function(doc){
		console.log("onNewNotification");
		
		try{
			doc = doc.toJSON();
		}catch(err){
			console.log(err);
		}

		NotificationSend.sendToUsers(socketIo, doc, false, NotificationCtrl.saveNotificationResponse(doc));
	}
}
