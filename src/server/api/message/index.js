var controller = require('./controller');
var validator = require('./validator');
var auth = require('../../auth/auth.service');

var router = require('express').Router();

/**
 * @apiIgnore Not Going to use
 * @api {get} /api/messages Messages
 * @apiName Get Message
 * @apiGroup Message
 * @apiSuccessExample {json} Success-Response:
 * 200 OK 
 */
//router.get('/', controller.index);

/**
 * @api {get} /api/messages/conversations Get Last Message from Each conversation
 * @apiGroup Message
 * @apiHeaderExample {json} Header-Example:
 * {
 *	 "Authorization": "Bearer Token" 
 * }
 * @apiSuccessExample {json} Success-Response:
 * 200 OK 
 */
router.get('/conversations', auth.isAuthenticated(), controller.conversations);

/**
 * @api {get} /api/messages/conversations/:id Get Single User Conversation
 * @apiGroup Message
 * @apiHeaderExample {json} Header-Example:
 * {
 *	 "Authorization": "Bearer Token" 
 * }
 * @apiSuccessExample {json} Success-Response:
 * 200 OK 
 */
router.get('/conversations/:userId', auth.isAuthenticated(), controller.conversation);

/**
 * @api {post} /api/messages Send Message
 * @apiGroup Message
 * @apiHeaderExample {json} Header-Example:
 * {
 *	 "Content-Type":"application/json"
 *	 "Authorization": "Bearer Token" 
 * }
 * @apiParamExample {json} Request-Example:
 * {
 *  "to" : "xxxxxx",
 *	"msg" : {    
 *		"content" : "Hello world"
 *	}
 * }
 * @apiSuccessExample {json} Success-Response:
 * 201 OK
 */

router.post('/', validator.create, auth.isAuthenticated(), controller.create);


// socket-documents
// =================

/**
 * @apiGroup Message 
 */




module.exports = router;