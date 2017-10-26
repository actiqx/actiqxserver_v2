/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// aditional prototype helpers
require("./utils/proto/array.extend");

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

var Promise = require('bluebird');

Promise.config({
    warnings: false
});

mongoose.Promise = Promise;

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
	console.error('MongoDB connection error: ' + err);
	process.exit(0);
	}
);

mongoose.set("debug",true);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  //serveClient: config.env !== 'production',
  //path: '/socket.io-client'
});

// CORS enable
// var cors = require('cors');
// app.use(cors({ origin: false, credentials: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-ACCESS_TOKEN, Access-Control-Allow-Origin, Authorization, Origin, x-requested-with, Content-Type, Content-Range, Content-Disposition, Content-Description");
    next();
});


require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);


// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
