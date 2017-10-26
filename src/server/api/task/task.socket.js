/**
 * Broadcast updates to client when the model changes
 */

// 'use strict';

// var Task = require('./task.model');

// exports.register = function(socketIo) {
//   Task.schema.post('save', function (doc) {
//     onSave(socketIo, doc);
//   });
//   Task.schema.post('remove', function (doc) {
//     onRemove(socketIo, doc);
//   }); 
// }

// function onSave(socketIo, doc, cb) {
//   socketIo.emit('task:save', doc);
// }

// function onRemove(socketIo, doc, cb) {
//   socketIo.emit('task:remove', doc);
// }

// var NotificationCtrl = require('../notification/notification.controller');
// const assert = require('assert');
// Task.findOne({_id: "5778ad3c409e08b7122dc17b"},function(err,doc){
// 	Task.onSave(doc).then(NotificationCtrl.save); 
// })
