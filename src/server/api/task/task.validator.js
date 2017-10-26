
var reqValidate = require("../../utils/req-validate");

exports.create = function(req, res, next) {		
	req.checkBody({
		'info': {			
			notEmpty: true,			  
			errorMessage: 'Invalid info'
		},
		'place': {
			notEmpty: true,			  
			errorMessage: 'Invalid place name'
		},
		'location.lat': {
			notEmpty: true,			  
			errorMessage: 'Invalid latitude'
		},
		'location.lng': {
			notEmpty: true,			  
			errorMessage: 'Invalid longitude'
		}


		// 'info': {
		// 	optional: true, // won't validate if field is empty
		// 	notEmpty: true,			  
		// 	errorMessage: 'Invalid Info'
		// }		

		// "info": "This is one task",
		// "place" : "Marathahalli",
		// "location" : {
			// "lat" : 12.9490685,
			// "lng" : 77.7030139
		// }



	});

	reqValidate.check(req, res, next); // mandatory
};

exports.bidding = function(req, res, next){

	req.checkBody({
		'price.amount': {			
			notEmpty: true,			  
			errorMessage: 'Invalid Price Amount'
		}
	});

	reqValidate.check(req, res, next); // mandatory
};


exports.assign = function(req, res, next){
	req.checkBody({
		'user': {			
			notEmpty: true,			  
			errorMessage: 'Invalid assignTo',
			isUserExist: {errorMessage:"User is not exist"}
		}
	});

	reqValidate.check(req, res, next); // mandatory
};