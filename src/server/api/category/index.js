var controller = require('./controller');
var validator = require('./validator');

var router = require('express').Router();

/**
 * @api {get} /api/categories Get Categories
 * @apiGroup Category
 * @apiHeaderExample {json} Header-Example:
 * {
 *	 "Authorization": "Bearer Token" 
 * }
 * @apiSuccessExample {json} Success-Response:
 * 200 OK 
 */
router.get('/', controller.index);


/**
	@api {post} /api/categories Save Categories
	@apiGroup Category
	@apiHeaderExample {json} Header-Example:
	{
		"Content-Type":"application/json"
		"Authorization": "Bearer Token" 
	}
	@apiParam {String} [parent]  Optional Parent Category ID.
	@apiParamExample {json} Request-Example:
	{
		"title": "Pick and Delivery Service",
		"info": "Pick and Delivery Service",
		"icon": "http://dailyscot.com/wp-content/uploads/2014/08/parcel.jpg",
		"userRole": "Parcel delivery",
		"parent": "57f6a0a10c450f331485b6d3"
	}
	@apiSuccessExample {json} Success-Response:
	201 OK
 */

router.post('/', validator.create, controller.create);

/**
 * @api {put} /api/categories Update Category
 * @apiGroup Category
 * @apiHeaderExample {json} Header-Example:
 * {
 *	 "Content-Type":"application/json"
 *	 "Authorization": "Bearer Token" 
 * }
 * @apiSuccessExample {json} Success-Response:
 * 201 OK
 */

router.put('/:id', validator.create, controller.update);


module.exports = router;