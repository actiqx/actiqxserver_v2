
var reqValidate = require("../../utils/req-validate");

exports.serviceUser = function(req, res, next) {	
	req.checkQuery({
		'role': {			
			notEmpty: true,			  
			errorMessage: 'Invalid query parameter Role'
		},
		'date': {			
			notEmpty: true,
			isISOFormat: true, 			  
			errorMessage: 'Invalid query parameter ISO Date'
		},
		'latitude': {			
			notEmpty: true,
			isLatitude: true,			  
			errorMessage: 'Invalid query parameter Latitude'
		},
		'longitude': {
			notEmpty: true,
			isLongitude: true,		  
			errorMessage: 'Invalid query parameter Longitude'
		},
		'radius': {
			optional: true, // won't validate if field is empty
			notEmpty: true,
			isInt: true,		  
			errorMessage: 'Invalid query parameter Radius'
		}
	});

	reqValidate.check(req, res, next); // mandatory
};

exports.create = function(req, res, next) {

	req.checkBody({
		'name': {			
			notEmpty: true,			  
			errorMessage: 'Invalid Field'
		},
		'email': { // This is mandatory till full support of mobile
			notEmpty: true,			  
			errorMessage: 'Invalid Field'
		},
		'password': {
			notEmpty: true,			  
			errorMessage: 'Invalid Field'
		},
		// commented: default role for signup is always 'user'
		// 'role': {	
		// 	notEmpty: true,			  
		// 	errorMessage: 'Invalid Field'
		// },		
		'location.latitude' : {
			notEmpty: true,
			isLatitude: true,			  
			errorMessage: 'Invalid Latitude'
		},
		'location.longitude' : {
		   notEmpty: true,
		   isLongitude: true,		  
		   errorMessage: 'Invalid Longitude'
		}
	});

	reqValidate.check(req, res, next); // mandatory
};

exports.addRole = function(req, res, next) {
	req.checkBody({
		'newRole': {			
			notEmpty: true,			  
			errorMessage: 'Invalid Field'
		},		
		'timeSlots': {
			isArray: true,
			errorMessage: 'Invalid Array'
		}
	});

	reqValidate.check(req, res, next); // mandatory
}
