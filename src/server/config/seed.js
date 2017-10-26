/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// Insert seed models below
var Task = require('../api/task/task.model');
//var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Category = require('../api/category/model');

// Insert seed data below
var taskSeed = require('../api/task/task.seed.json');
//var thingSeed = require('../api/thing/thing.seed.json');
var categorySeed = require('../api/category/seed.json');

var userSeed = require('../api/user/user.seed.json');


// Insert seed inserts below
Task.findOne({},function(err,doc){
	if(err){
		console.log("Task seed");
		console.log(err);
	}
	else if(doc==null) Task.create(taskSeed, function(err){ if(!err) console.log('populated taskSeed') });
});

Category.findOne().exec(function(err,doc){
	if(err){
		console.log(err);
	}
	else if(doc==null) Category.create(categorySeed, function(err){ if(!err) console.log('populated categorySeed') });
});

// Thing.findOne({}).exec(function(err,doc){
// 	if(doc==null) Thing.create(thingSeed, function(err){ if(!err) console.log('populated thingSeed') });
// });


User.findOne().exec(function(err,doc){
	if(err){
		console.log(err);
	}
	else if(doc==null) User.create(userSeed, function(err){ if(!err) console.log('populated userSeed') });
});


