'use strict';

var express = require('express');
var controller = require('./thing.controller');
var validator = require('./thing.validator');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', validator.create, controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;