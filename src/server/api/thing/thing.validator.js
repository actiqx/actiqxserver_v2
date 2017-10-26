
var reqValidate = require("../../utils/req-validate");

exports.create = function(req, res, next) {		
	req.checkBody({
		'info': {
			optional: true, // won't validate if field is empty
			notEmpty: true,			  
			errorMessage: 'Invalid Info'
		},
		'name': {
			notEmpty: true,			  
			errorMessage: 'Invalid Name'
		}
	});

	reqValidate.check(req, res, next); // mandatory
};

