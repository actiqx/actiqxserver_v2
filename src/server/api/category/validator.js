
var reqValidate = require("../../utils/req-validate");

exports.create = function(req, res, next) {		
	req.checkBody({
		'title': {			
			notEmpty: true,			  
			errorMessage: 'Invalid parameter'
		},
		'info': {
			notEmpty: true,			  
			errorMessage: 'Invalid parameter'
		},
		'icon': {
			notEmpty: true,			  
			errorMessage: 'Invalid parameter'
		},
		'userRole': {
			notEmpty: true,
			onlyLettersAndSpace: {errorMessage: 'Only Letters & spaces allowed'},
			errorMessage: 'Invalid parameter'
		},
		'parent': {
			optional: true, // won't validate if field is empty
			notEmpty: true,
			isCategoryExist: {errorMessage:"Category is not exist"},
			isValidMongooseId: {errorMessage:"Invalid Id"},		  
			errorMessage: 'Invalid parameter'
		}		
	});

	//reqValidate.check(req, res, next); // mandatory
	reqValidate.checkAsync(req, res, next); // mandatory

};
