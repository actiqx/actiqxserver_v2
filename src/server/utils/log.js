/*
usage
------

var $log = require('../../utils/log')(true|false);
$log.console("Test3");

*/

var jsome = require('jsome');
var logIsActive = true; 		// global switch for log

jsome.level = {
	  'show'    : false
	, 'char'    : '.'
	, 'color'   : 'red'
	, 'spaces'  : 2
	, 'start'   : 0
};

jsome.colors = {
	  'num'   : 'cyan'    // stands for numbers 
	, 'str'   : 'magenta' // stands for strings 
	, 'bool'  : 'red'     // stands for booleans 
	, 'regex' : 'blue'    // stands for regular expressions 
	, 'undef' : 'grey'    // stands for undefined 
	, 'null'  : 'grey'    // stands for null 
	, 'attr'  : 'green'   // objects attributes -> { attr : value } 
	, 'quot'  : 'yellow'  // strings quotes -> "..." 
	, 'punc'  : 'yellow'  // commas seperating arrays and objects values -> [ , , , ] 
	, 'brack' : 'yellow'  // for both {} and [] 
};

module.exports = function logging(isActive){

	var object = {
		isActive : isActive
	};

	object.console = function(){

		if(object.isActive == false || logIsActive == false){			
			// no logs to console
		}else{

			arguments = Array.prototype.slice.call(arguments);

			//console.log(arguments);

			arguments.forEach(function(argument){

				jsome(argument);
				
			})			
		}
	};

	return object;
};


