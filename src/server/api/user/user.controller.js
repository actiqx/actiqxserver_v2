'use strict';

var _ = require('lodash');
var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');
var moment = require('moment');
var jsonpatch = require('fast-json-patch');
var moment = require('moment');
var sendgrid = require('sendgrid')("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");
  
function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      _.merge(entity,patches);
      //jsonpatch.apply(entity, patches, /*validate*/ false);
    } catch(err) {
      return Promise.reject(err);
    }
    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(function(){
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function filter(user){
  return {
    _id : user._id,
    name : user.name,
    avatar : user.avatar
  };
}
exports.public = filter;

function getUsers(conditions, selects, option){
  conditions = conditions || {};
  selects = selects || {};

  if(_.values(selects).map(Number).indexOf(0) != -1){
    var defaultObj = { salt: 0, hashedPassword: 0 };
    _.defaults (selects, selects, defaultObj);
  }

  return User.find(conditions).select(selects).lean().exec()
}
exports.list = getUsers;

function getUser(conditions, selects){
  selects = selects || {};

  if(_.values(selects).map(Number).indexOf(0) != -1){
    var defaultObj = { salt: 0, hashedPassword: 0 };
    _.defaults (selects, selects, defaultObj);
  }
  
  return User.findOne(conditions).select(selects).exec()
}
exports.get = getUser;

function getServiceUsers(option){
  
  var roles = [].concat(option.roles),
  date = new Date(option.date),
  date = moment(date).utc().format("h.mm"),
  latitude = option.latitude,
  longitude = option.longitude,
  radius = option.radius || 5,
  limit = option.limit,
  skip = option.skip,
  sort = option.sortBy, // TO-DO 
  select = option.select || {},
  excludeUsers = option.excludeUsers || [];
  
  var condtion = {
    _id : { $nin : excludeUsers },
    "roles": { $in: roles },
    "activeTasks.date": {
      "$not": {
        "$gte": date,
        "$lt": date
      }
    },
    "timeSlots": {
      "$elemMatch": {
        "start": {          
          "$lte": date
        },
        "end": {
          "$gt": date
        },
        "status": {
          "$ne": 0
        }
      }
    },
    "location": {
      "$geoWithin": {
        "$centerSphere": [
          [
            longitude,
            latitude
          ], radius / 3959
        ]
      }
    }
  }

  var selectDefault = { 
    timeSlots: 0, 
    activeTasks: 0, 
    location: 0,
    roles: 0,
    __v: 0,
    provider: 0
  };
  _.defaults (select, select, selectDefault);

  return getUsers(condtion, select,{
    limit: limit,
    skip: skip
  });
}
exports.getServiceUsers = getServiceUsers;

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  return getUsers()
    .then(respondWithResult(res))
    .catch(handleError(res));
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  return getUser({_id:req.params.id})
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
};

/**
 * Get a service users
 */

// console.log(moment("2016-07-02T13:13:00.000Z").utc().format("h.mm"));
// console.log(moment("2016-07-02T13:13:00.000Z").utc())
exports.serviceUser = function (req, res, next) {
  var role = req.query.role;
  var date = req.query.date;
  var latitude = Number(req.query.latitude);
  var longitude = Number(req.query.longitude);
  var radius = Number(req.query.radius || "7"); // miles
  var skip = req.query.skip || 0;
  var limit = req.query.limit || 15;

  return getServiceUsers({
    roles: role, 
    date: date, 
    latitude: latitude, 
    longitude: longitude, 
    radius: radius,
    skip: skip,
    limit: limit
  })
  .then(respondWithResult(res))
  .catch(handleError(res));
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  req.body.roles = ['user'];
  req.body.location.coordinates = [req.body.location.longitude, req.body.location.latitude];
  req.body.provider = 'local';

  return User.create(req.body)
    .then(function(user){
      return { token: auth.signToken(user._id) }
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
};


/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  // User.findByIdAndRemove(req.params.id, function(err, user) {
  //   if(err) return res.status(500).send(err);
  //   return res.status(204).send('No Content');
  // });

  return User.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(function(entity){
      entity.remove(function(err){
        if(err)  throw new Error('error');
        return null;
      })
    })
    .then(handleEntityNotFound(res))
    .catch(handleError(res));
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

// Updates an existing in the DB.
exports.patch = function(req, res) {
  if(req.body._id) { 
    delete req.body._id; 
    delete req.body.roles;
  }

  // "device": {
  //   "typ": "ANDROID",
  //   "token": String
  // }

  User.findById(req.user._id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
};

exports.addRole = function(req, res, next){
  var newRole = req.body.newRole;

  User.findById(req.user._id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(function(entity){
      var existingRoles = entity.roles;
      var newRoles = existingRoles.push(newRole);
      return {
        roles : newRoles
      }
    })
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));

}

exports.removeRole = function(req, res, next){
  var targetRole = req.params.role;
  if(targetRole == "user"){
    return handleError(res)("Not Permit to Delete the Role");
  }

  User.findById(req.user._id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(function(entity){
      _.pull(entity.roles, targetRole);
      return entity;
    })
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}



/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Check Availability of any field with value
 */

exports.isAvailable = function(req, res, next){
  User.isExist(req.params.field, req.params.value, function(err, is){
    if(err) return res.status(500).send(err);
    return res.send(is);
  })
}

function generateAndSaveToken(user){

  if(!user) 
    return null;

  var tomorrow = moment().add(1, 'day');
  user.forgotPass = {
    token : ( Math.floor(Math.random() * 9999) + 1000 ),
    expiry : tomorrow
  }

  return user.save()
}

function sendTokenByEmail(user){
  if(!user) 
    return null;

  var email = user.email;
  var token = user.forgotPass.token;
  var expiry = user.forgotPass.expiry;
 
  var request = sendgrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [
        {
          to: [
            {
              email: email,
            },
          ],
          subject: 'Forgot Password',
        },
      ],
      from: {
        email: 'task@example.com',
      },
      content: [
        {
          type: 'text/html',
          value: `Your Token is <a href='www.google.com'><b>${token}</b></a>
                  <br>
                  valid till <span style="color:red">${expiry}</span>`,
        },
      ],
    },
  });

  //With promise
  return sendgrid.API(request)
    .then(response => {
      console.log("success");
      console.log(response);
      return response;
    })
    .catch(error => {
      console.log("failed");
      console.log(error.response);
      return error;
    });    
}

// sendTokenByEmail({
//   email: "siba4269@gmail.com",
//   forgotPass: {
//     token: Date.now()
//   }
// }).then(function(){
//   console.log("Email sent successfuly")
// });

exports.forgotPassword = function(req, res, next){
  var username = req.params.username;
  User.findOne({
    $or:[ {'email': username.toLowerCase()}, {'mobile': username} ]
  })
  .exec()
  .then(handleEntityNotFound(res))
  .then(generateAndSaveToken)
  .then(sendTokenByEmail)
  .then(function(){
    return "Token sent"
  })
  .then(respondWithResult(res))
  .catch(handleError(res));

}

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
