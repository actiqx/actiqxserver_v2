'use strict';

var express = require('express');
var controller = require('./task.controller');
var validator = require('./task.validator');
var auth = require('../../auth/auth.service');

var router = express.Router();

// for developer only
router.get('/', controller.index);

/**
 * @api {get} /api/tasks/:id Get Task
 * @apiHeaderExample {json} Header-Example:
 * {
 *	 "Authorization": "Bearer Token" 
 * }
 * @apiGroup Task
 * @apiParamExample {json} Request-Example:
 * {
 *   "id" : "xxxxx"	
 * }
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 */
router.get('/:id', controller.show);

/**
 * @api {post} /api/tasks Create Task
 * @apiGroup Task
 * @apiHeaderExample {json} Header-Example:
 * {
 *	 "Content-Type":"application/json"
 *	 "Authorization": "Bearer Token" 
 * }
 * @apiParamExample {json} Request-Example:
	{
	    "info" : "This is one task",
	    "category" : "57e6b396c9fa01cc1b6cef39",
	    "place" : "SGR College",
	    "location" : {
	        "lat" : 12.9443301999999996,
	        "lng" : 77.7056763199999949
	    },
	    "date" : "2016-07-02T17:30:00.000+05:30"
	}
 *
 * @apiSuccessExample {json} Success-Response:
 * 201 Created 
 */
router.post('/', auth.isAuthenticated(),  validator.create, controller.create);
//router.put('/:id', controller.update);

/**
 * @api {patch} /api/tasks/:id/bidding Add bidding
 * @apiGroup Task
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Content-Type": "application/json",
 *	 "Authorization": "Bearer token"
 * }
 * @apiParamExample {json} Request-Example:
{
	"price": {
		"currency": "INR",
		"amount": "100.00"
	}
}
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 */
router.patch('/:id/bidding', auth.isAuthenticated(), validator.bidding, controller.newBidding);

/**
 * @api {patch} /api/tasks/:id/assign/ Assign Task for service User
 * @apiGroup Task
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Content-Type": "application/json",
 *	 "Authorization": "Bearer token"
 * }
 * @apiParamExample {json} Request-Example:
{
	user : "xxxxxxxxxxxxx"
}
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 */
router.patch('/:id/assign', auth.isAuthenticated(), validator.assign, controller.assign);

//router.delete('/:id', controller.destroy);

module.exports = router;