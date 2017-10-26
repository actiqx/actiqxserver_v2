'use strict';

var _ = require('lodash');
var Task = require('./task.model');
var UserCtrl = require('../user/user.controller');

// Get list of tasks
exports.index = function(req, res) {
  Task.find(function (err, tasks) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(tasks);
  });
};

// Get a single task
exports.show = function(req, res) {
  Task.findById(req.params.id, function (err, task) {
    if(err) { return handleError(res, err); }
    if(!task) { return res.status(404).send('Not Found'); }
    return res.json(task);
  });
};

// Creates a new task in the DB.
exports.create = function(req, res) {
  Task.customSave(req.body,req)
    .then(function(doc){
      // notify new task creation
      process.nextTick(function(){
        require("../event/emitter").emitter.emit("task:new-task", doc);
      })
      return res.status(201).json(doc);
    })
    .catch(function(err){
      return handleError(res, err);
    })
};

// Updates an existing task in the DB.
exports.update = function(req, res) {
  deleteIfExist(req.body, "_id");
  
  Task.findById(req.params.id, function (err, task) {
    if (err) { return handleError(res, err); }
    if(!task) { return res.status(404).send('Not Found'); }
    var updated = _.merge(task, req.body);
    updated.save(req)
      .then(function(doc){
        return res.status(200).json(doc);
      })
      .catch(function(err){
        return handleError(res, err);
      })
  });
};


exports.newBidding = function(req,res,next){
  var TaskId = req.params.id;
  var user = req.user;

  Task.findOne({_id:req.params.id, assignTo: {$exists: false}}, function (err, task) {
    if (err) { return handleError(res, err); }
    if(!task) { return res.status(404).send('Task Not Found (or) Bidding closed'); }
    
    req.body.user = UserCtrl.public(user);
    task.biddings.push(req.body);

    task.save(req)
      .then(function(doc){
        // notify new bidding creation
        process.nextTick(function(){
          require("../event/emitter").emitter.emit("task:new-bidding", doc, req.body);
        })        
        return res.status(200).json(doc);
      })
      .catch(function(err){
        return handleError(res, err);
      })
  });
  //res.send("TO-DO");
}

exports.removeAssigned = function(req, res, next){

  // not completed till

  var reason = req.body.reason;
  var user = req.user;

  Task.findOne({_id:req.params.id}, function (err, task) {
    if (err) { return handleError(res, err); }
    if(!task) { return res.status(404).send('Task Not Found'); }

    task.assignTo = undefined;

    task.save(req)
      .then(function(doc){
        // notify cancellation
        process.nextTick(function(){
          require("../event/emitter").emitter.emit("task:cancel-assign", task);
        })        
        return res.status(200).json(doc);
      })
      .catch(function(err){
        return handleError(res, err);
      })

  });
}

exports.assign = function(req, res, next){
  //res.send("TO-DO");
  var TaskId = req.params.id;
  var user = req.user;

  Task.findOne({_id:req.params.id}, function (err, task) {
    if (err) { return handleError(res, err); }
    if(!task) { return res.status(404).send('Task Not Found (or) Bidding closed'); }

    if(task._createdBy.toString() !== user._id.toString()){
      return res.status(404).send('Not Allowed');
    }

    task.assignTo = req.body.user;
    //UserCtrl.public(user);

    task.save(req)
      .then(function(doc){
        // notify cancellation
        process.nextTick(function(){
          require("../event/emitter").emitter.emit("task:new-assign", task);
        })        
        return res.status(200).json(doc);
      })
      .catch(function(err){
        return handleError(res, err);
      })

  });
    

}

// Deletes a task from the DB.
exports.destroy = function(req, res) {
  Task.findById(req.params.id, function (err, task) {
    if(err) { return handleError(res, err); }
    if(!task) { return res.status(404).send('Not Found'); }    
    task.inActive(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

function deleteIfExist(object, key){
  if(object.hasOwnProperty(key)) delete object[key];   
}