'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];

function toLower (v) {
  return v.toLowerCase().replace(/\s/g,"-");
}

var UserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true, unique: true, set: toLower },
  mobile: { type: String, unique: true },
  avatar: { type: String, default: "https://gymkhana.iitb.ac.in/~sports/images/profile.png"},
  roles: [String], // user
  timeSlots : [{
  	start: Number,
  	end: Number,
  	status : {
  		type: Number,
  		enum: [0,1], // 1: Available, 0: UnAvailable
  		default: 1
  	}
  }],  
  activeTasks : [{
  	task : { type:mongoose.Schema.Types.ObjectId, ref: "Task" },
  	date : Date
  }],
  location: { 
  	type : {
  		type: String,
  		enum: "Point",
  		default: "Point"
  	}, 
  	coordinates: {
  		type: [Number],
  		default: [0,0]
  	}
  },  
  hashedPassword: String,
  provider: String,
  salt: String,
  device: {
    platform: { 
      type: String, 
      default:"ANDROID", 
      enum:["ANDROID","IOS"]
    },
    token: String,
    socket: String
  },
  forgotPass: {
    token: String,
    expiry: String
  },
  facebook: {},
  twitter: {},
  google: {},
  github: {}
});

// create index
UserSchema.index({ location: '2dsphere' });

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      '_id': this._id,
      'name': this.name,
      'avatar': this.avatar,
      'roles': this.roles
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'roles': this.roles
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};



/*  
    **************************************
    *                                    *
    *  Hooks for all the fetch operation *
    *                                    *  
    **************************************
 */

/*
    pre hook for find & findOne to add condition 
    ============================================
 */

function findNotDeletedMiddleware(next) {
    this.where({ _deleted : { $ne : true } });
    next();
};
UserSchema.pre('find', findNotDeletedMiddleware);
UserSchema.pre('findOne', findNotDeletedMiddleware);


/*
    pre hook for find & findOne to convert _id to date 
    ==================================================
 */

function addCreatedOnMiddleware(next, doc){
  doc._createdOn = doc._createdOn || doc._id.getTimestamp();
  // if (doc.roles && doc.roles.length==1 && doc.roles.indexOf("user")==0){
  //   doc.activeTasks = null;
  //   doc.timeSlots = null;
  // }
  next();
};
UserSchema.pre('init', addCreatedOnMiddleware);


/*  
    ***************************************
    *                                     *
    * Hooks for all the insert operations *
    *                                     *  
    ***************************************
 */

UserSchema
  .pre('save', function(next) {
    debugger;
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });


// delete activeTasks & timeSlots if user role is only user
UserSchema
  .pre('save', function(next) {
    if (this.roles.length==1 && this.roles.indexOf("user")==0){
      this.activeTasks = undefined;
      this.timeSlots = undefined;
    }
    next();
  });

// format the latitude & longitude
// UserSchema
//   .pre('save', function(next) {
//     if (!this.location || this.location.coordinates){
//       this.activeTasks = undefined;
//       this.timeSlots = undefined;
//     }
//     next();
//   });

// delete location if it is empty
// UserSchema.pre('save', function (next) {
//   if (Array.isArray(this.location) && 0 === this.location.length) {
//     this.location = undefined;
//   }
//   next();
// })
  
  

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

/**
 * Methods (static)
 */
UserSchema.statics = {
  /**
   * Check if exist the field & value
   *
   * @param {String} field
   * @param {String} value
   * @param {Callback} cb
   * @return {Callback}
   */
  isExist : function isExist (field, value, cb) {
    var condition = {};
    condition[field] = new RegExp(value, 'i');
    this.count(condition)
      .exec(function (err, count) {
         return cb(err, !! count);
      });
  }
}

module.exports = mongoose.model('User', UserSchema);
