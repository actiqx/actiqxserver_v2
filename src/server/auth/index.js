'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/environment');
var User = require('../api/user/user.model');

// Passport Configuration
require('./local/passport').setup(User, config);
require('./facebook/passport').setup(User, config);
require('./google/passport').setup(User, config);
require('./twitter/passport').setup(User, config);

var router = express.Router();

/**
 * @api {post} /auth/local Login
 * @apiName Login
 * @apiGroup User
 * @apiParam {String} username Username (email/mobile).
 * @apiParam {String} password Password.
 * @apiParamExample {json} Request-Example:
 *{
 *	"username": "siba4269@gmail.com",
 *	"password": "siba",
 *}
 *
 * @apiSuccessExample {json} Success-Response:
 * 200 OK
 *{
 *	"token" : "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *}
 */

router.use('/local', require('./local'));
router.use('/facebook', require('./facebook'));
router.use('/twitter', require('./twitter'));
router.use('/google', require('./google'));

module.exports = router;