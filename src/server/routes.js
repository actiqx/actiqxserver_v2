/**
 * Main application routes
 */

'use strict';

var path = require('path');
var express =  require('express');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/tasks', require('./api/task'));
  app.use('/api/categories', require('./api/category'));
  app.use('/api/messages', require('./api/message'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  // for openshift
  app.get('/health', function(req,res){
    res.writeHead(200);
    res.end();
  });
 

  //All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
  .get(function(req, res){
    return res.status(404).send("Plz check the url");
  });

  //All other routes should redirect to the index.html
  app.route('/*')
  .get(function(req, res) {
    return res.sendFile(path.join(process.cwd(), 'src' , 'client', 'index.html'))
  });

};
