'use strict';

var express = require('express');
var controller = require('./user.controller');
var validator = require('./user.validator');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// for developer only
router.get('/', /*auth.hasRole('admin'),*/ controller.index);

// service-user?role=pujari&date=2016-07-02T12:00:00.000Z&latitude=12.9443302&longitude=77.70567632&radius=5

/**
 * @apiIgnore Not Going to use
 * @api {get} /api/users/service-user Search service users
 * @apiName Search Users
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 *	service-user?role=pujari&date=2016-07-02T12:00:00.000Z&latitude=12.9443302&longitude=77.70567632&radius=5
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 */

//router.get('/service-user', validator.serviceUser, controller.serviceUser);

/**
 * @api {get} /api/users/me Login User Info
 * @apiHeaderExample {json} Header-Example:
 * {
 *	 "Authorization": "Bearer Token" 
 * }
 * @apiGroup User
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 */
router.get('/me', auth.isAuthenticated(), controller.me);

//router.get('/:id', /*auth.hasRole('admin'),*/ controller.show);

/**
 * @api {get} /api/users/isExist/:field/:value check field value exist
 * @apiName Check User Property
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 *  {
 *		"field": "email",
 *		"value": "siba4269@gmail.com",
 *  }
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 */
router.get('/isExist/:field/:value', controller.isAvailable);


router.get('/forgot-password/:username', controller.forgotPassword);


/**
 * @api {post} /api/users Signup
 * @apiHeaderExample {json} Header-Example:
 * {
 *	 "Content-Type":"application/json"
 * }
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 *	{
 *		"name": "siba prakash",
 *		"email": "siba4269@gmail.com",
 *		"mobile": "8892220323",
 *		"password": "siba",
 *		"role": "user",
 *		"avatar": "https://gymkhana.iitb.ac.in/~sports/images/profile.png",
 *	    "timeSlots": [{
 *			"start": 6.0,
 *			"end": 11.0,
 *			"status": 1
 *		}],
 *		"location" : {
 *		   "latitude" : 12.894009,
 *		   "longitude" : 77.60108
 *		}
 *	}
 *
 * @apiSuccessExample {json} Success-Response:
 * 201 Created
 *	{
 *		"token" : "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *	}
 */
router.post('/', validator.create, controller.create);

/**
 * @api {patch} /api/users update device token
 * @apiName Patch User (device token)
 * @apiGroup User
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Content-Type": "application/json",
 *	 "Authorization": "Bearer token"
 * }
 * @apiParamExample {json} Request-Example:
 *	{
 *		"device": {
 *			"typ": "ANDROID",
 *			"token": "xxxxxxxx"
 *		}
 *  }
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 */
router.patch('/', auth.isAuthenticated(), controller.patch);

/**
 * @api {patch} /api/users/add-role Add Role to user
 * @apiGroup User
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Content-Type": "application/json",
 *	 "Authorization": "Bearer token"
 * }
 * @apiParamExample {json} Request-Example:
 *	{
 *		"newRole" : "grocery-delivery-service"
 *  }
 *
 * @apiSuccessExample {json} Success-Response:
 * 201 OK
 */
router.patch('/add-role', auth.isAuthenticated(), validator.addRole, controller.addRole);

/**
 * @api {delete} /api/users/remove-role/:role Remove Role from user
 * @apiGroup User
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Content-Type": "application/json",
 *	 "Authorization": "Bearer token"
 * }
 * @apiParamExample {json} Request-Example:
 *	{
 *		"role" : "grocery-delivery-service"
 *  }
 *
 * @apiSuccessExample {json} Success-Response:
 * 201 OK
 */
router.delete('/remove-role/:role', auth.isAuthenticated(), controller.removeRole);

/**
 * @api {put} /api/users/:id/password Change Password
 * @apiName Change Password
 * @apiGroup User
 * @apiHeaderExample {json} Header-Example:
 * {
 *	 "Content-Type":"application/json"
 *	 "Authorization": "Bearer Token" 
 * }
 * @apiParamExample {json} Request-Example:
 *  {
 *		"oldPassword": "email",
 *		"newPassword": "siba4269@gmail.com",
 *  }
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 */
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);

//router.delete('/:id', /*auth.hasRole('admin'),*/ controller.destroy);



module.exports = router;
