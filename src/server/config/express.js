/**
 * Express configuration
 */

'use strict';

var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var expressValidator = require('express-validator');
var config = require('./environment');
var passport = require('passport');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

module.exports = function(app) {
  var env = app.get('env');

  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // this line must be immediately after express.bodyParser()!
  app.use(expressValidator({
    customValidators: {
      isArray: function(value) {
        return Array.isArray(value);
      },
      gte: function(param, num) {
        return param >= num;
      },
      isISOFormat: function(value){
        return /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(value);
      },
      isLatitude: function(value){
        return /^(-?[1-8]?\d(?:\.\d{1,8})?|90(?:\.0{1,8})?)$/.test(value);
      },
      isLongitude: function(value){
        return /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,8})?|180(?:\.0{1,8})?)$/.test(value);
      },
      onlyLettersAndSpace: function(value){
        return /^[a-zA-Z\s]*$/.test(value);
      },
      isValidMongooseId: function(value){
        return mongoose.Types.ObjectId.isValid(value);
      },
      isCategoryExist: function(value){
        return new Promise(function(resolve, reject) {
          require('../api/category/model')
            .findById(value, function(err,doc){
              if(err || !doc) return reject("some error");
              return resolve(doc)
            })           
        });
      },
      isUserExist: function(value){
        console.log("check-1");
        return new Promise(function(resolve, reject) {
          console.log("check-2",value);

          //reject(new Error("eror"));

          return require('../api/user/model')
            .findById(value, function(err,doc){

              console.log("I m here inside custom validation");
              console.log(err,doc);

              if(err || !doc) return reject("some error");
              return resolve(doc)
            })           
        });
      }
    }
  }));

  app.use(methodOverride());
  app.use(cookieParser());
  app.use(passport.initialize());

  // Persist sessions with mongoStore
  // We need to enable sessions for passport twitter because its an oauth 1.0 strategy
  app.use(session({
    secret: config.secrets.session,
    resave: true,
    saveUninitialized: true,
    store: new mongoStore({
      mongooseConnection: mongoose.connection,
      db: 'task'
    })
  }));
  

  //debugger;
  // ref : https://www.npmjs.com/package/mongoose-request-context
  // wrap requests in the 'request' namespace
  //app.use(require('request-context').middleware('request'));
  // NOTE: ==== this is not working because of domain is undefined inside mongoose callback
  //^0.1.6

  
  app.use("/doc",express.static(path.join(process.cwd(),'doc')));  
  app.use(express.static(path.join(process.cwd(),'src', 'client')));  

  // static file configuration
  // app.use("/docs",express.static(path.join(config.root,'doc')));
  // app.use(express.static(config.root));
  // app.use(express.static(path.normalize(config.root+"/../")));
  
  
  if ('production' === env) {
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};