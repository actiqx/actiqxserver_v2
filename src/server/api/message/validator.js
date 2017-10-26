
var reqValidate = require("../../utils/req-validate");

exports.create = function(req, res, next) {	
	req.checkBody({
		// 'title': {
		// 	optional: true, // won't validate if field is empty	
		// 	notEmpty: true,			  
		// 	errorMessage: 'Invalid parameter'
		// }

		'to':{
			notEmpty: true,
			errorMessage: 'Invalid parameter',
			isUserExist: {errorMessage:"User is not exist with this id"},
			isValidMongooseId: {errorMessage:"Invalid Id"}
		},
		'msg.content': {
			notEmpty: true,
			errorMessage: 'Invalid parameter'
		}
	});

	//reqValidate.check(req, res, next); // mandatory
	reqValidate.checkAsync(req, res, next); // mandatory
};
