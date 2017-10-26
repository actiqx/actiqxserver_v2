
'use strict';

var _ = require('lodash');
//var Model = require('./model');
var Ctrl = require('./controller');

var config = require('../../config/environment');

/**
 *	send message to users (socket emit / pushnotification)
 *  @param socketIo - instance of io from socket.io
 *  @param users - array of users (instance of user schema)
 *  @param cb - callback function with result
 */
function sendToUsers(socketIo, data, willToSaveNotification, cb) {

	//console.log(data);


	if(willToSaveNotification){
		process.nextTick(function(){
			Ctrl.save(data);
		})
		return;
	}

	var msgToBeSend = {
		title: data.title,
		identifier: data.identifier,
		msg: data.msg
	}
 
  	/**
  	 *  process socket users
  	 */

  	var socketUsers 		= data.users.filter((user)=> _.get(user,"device.socket"));
  	process.nextTick(function(){
  		onSocketUsers(socketUsers, msgToBeSend, socketIo)
  	})

  	/**
  	 *  process push-notificatio users
  	 */

  	var notificationUsers = data.users.filter((user)=> !_.has(user,"device.socket") && _.get(user,"device.token"));
	
	process.nextTick(function(){
  		onNotificationUsers(notificationUsers, msgToBeSend, cb)
  	}) 
}
exports.sendToUsers = sendToUsers;

function onSocketUsers(users, msg, socketIo){
	users.forEach(function(user){
		console.log(`I m emiting to ${user.device.socket} using event ${msg.identifier}`);		
		socketIo.to(user.device.socket).emit(msg.identifier, msg);
	})
}

function onNotificationUsers(users,msg, cb){
	var groupedUsers = _.groupBy(users, "device.platform");

	for (var platform in groupedUsers) {
    	var tokens = groupedUsers[platform].map((u)=> _.get(u,'device.token'));

    	var data = {
    		tokens: tokens,
    		msg: msg
    	};

		switch(platform){
			case "IOS":
				pushIOS(data, cb);
				break;
			case "ANDROID":
				pushAndroid(data, cb);
				break;
			default:
				console.log("unknown device platform : " + platform);
		}
	}

};


//ref: https://github.com/argon/node-apn
var apn = require('apn'); 
var gcm = require('node-gcm');

function pushAndroid(data, cb){
	console.log("I m inside pushAndroid");
	var tokens = data.tokens, msg = data.msg;
	console.log(tokens);

	var sender = new gcm.Sender(config.GCM.key);

	// Prepare a message to be sent
	var message = new gcm.Message({
	    data: {
	        title : msg.title,
	      	message : msg
	    },
	    // notification: {
	    //     title: "Hello, World",
	    //     icon: "ic_launcher",
	    //     body: "This is a notification that will be displayed ASAP."
	    // }
	});

	// Actually send the message
	sender.send(message, { 
		registrationTokens: tokens 
	}, 10, handlePushNotificationCallback('gcm',cb));

}

function handlePushNotificationCallback(type, cb){
	return function update(err, response){
		console.log("inside: save response push notifications")
		if (err) return console.error(err);

		console.log(cb);

		// update Notification document with GCM/APN response
		if(typeof cb == "function"){
			var updated = {};
			updated[type] = response || err;
			cb(updated);
		}

		// var updated = {};
		// updated[type] = response || err;

		// // update Notification collection
		// Notification.update({
		// 	_id:id
		// },{
		// 	$set: updated
		// },{
		// 	upsert: true
		// },function(error){
		// 	if(error)
		// 		console.log(error)
		// 	if(!error)
		// 		console.log(`saved ${type} response to ${id}`)
		// })
	}
}

function pushIOS(data, cb){
	console.log("TO-DO pushIOS");		
	//handlePushNotificationCallback('apn',data.raw._id)(err, response)
}