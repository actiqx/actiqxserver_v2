// 'use strict';

// var Model = require('./model');
// var Notification = require('../notification/socket');
// var UserCtrl = require('../user/user.controller');

// exports.register = function(socketIo) {
//   console.log("message/socket.js>register");
//   Model.schema.post('save', function (doc) {
//     onSave(socketIo, doc);
//   });
// }

// function onSave(socketIo, doc){
// 	console.log("message/socket.js>onSave");

// 	console.log(doc);
// 	doc = doc.toJSON();

// 	UserCtrl
// 		.list({_id:{ $in:[doc.to, doc.from]}},{device:1,name:1,avatar:1})
// 		.then(function(users){
// 			if(!users.length) return;

// 			var user_to = users.find((u)=> (u._id.toString() == doc.to));
// 			var user_from = users.find((u)=> (u._id.toString() == doc.from));

// 			var users = [].concat(user_to);
			
// 			// format message
// 			var msg = {
// 				from : user_from,
// 				msg : doc.msg
// 			};
			
// 			delete msg.from.device;

// 			console.log("sending message format");
// 			console.log(msg);

// 			Notification.sendToUsers(socketIo, users, msg);

// 	}).catch(function(err){
// 		console.log("message/socket.js>onSave user error");
// 		console.log(err);
// 	});



// 	// UserCtrl.get({_id:doc.to},{device:1}).then(function(user){
// 	// 	console.log("message/socket.js>onSave after user");
// 	// 	doc.to = user;
// 	// 	var users = [].concat(doc.to);

// 	// 	console.log(doc);

// 	// 	Notification.sendToUsers(socketIo, users, doc);
// 	// }).catch(function(err){
// 	// 	console.log("message/socket.js>onSave user error");
// 	// 	console.log(err);
// 	// });
// }