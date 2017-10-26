exports.check = function check(req, res, next){
	var errors = req.validationErrors();
	if (errors) {		
		res.status(422);
		res.json({
			"msg" : "Validation Failed" , 
			"raw" : errors
		});
		return;
	}
	next();
};


// check async
exports.checkAsync = function checkAsync(req, res, next) {	
	req.asyncValidationErrors().then(function(respons){
		//console.log("pos - 4");
		next();
	}).catch(function(errors) {
		//console.log(errors)
	  	if (errors) {	
			res.status(422);
			res.json({
				"msg" : "Validation Failed" , 
				"raw" : errors,
				"level" : 1
			});
			// next({
			// 	"msg" : "Validation Failed" , 
			// 	"raw" : errors,
			// 	"level" : 1
			// });

			//return next("some error");
		}
	});	
};