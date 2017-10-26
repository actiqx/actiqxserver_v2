// Array proto functions

(function(){

// replaced while loop with forloop (siba)
Array.prototype.forEach2 = function myForEach(callback){
    
    var $this = this;
    
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 1. call callback each time
    // 2. break the for loop if callback return false 
    for (var i = 0, len = $this.length ; i < len; i++) {  
        if(callback( $this[i], i , $this ) === false) break;
    }
    return $this;
};

// change array indivisuals to lowecase
Array.prototype.toLowerCase = function() {

	if(!this)
		return this;

    for (var i = 0, len = this.length ; i < len ; i++) {    	
    	var isObject = ( typeof this[i] == "object" );
    	if(isObject)
    		this[i] = JSON.stringify(this[i]);

        this[i] = this[i].toString().toLowerCase();

        if(isObject)
    		this[i] = JSON.parse(this[i]);
    }

    return this;
}


/*
    remove the properties recursively.
    =================================

    e.g.
    results.sp_cleanProperties({ properties : ["@fieldTypes","@type","@class"], cleanNested: false })
*/

Array.prototype.sp_cleanProperties = function cleanProperties(options) {

    options = options || {};

    var cleanNested = options.cleanNested != false ? true : false;
    var clean_properties  = options.properties || [];

    
    (function _cleanAll(array){
        array.forEach2(function(object){
            if(!object)
                return;
            Object.keys(object).forEach2(function(b){
                if( b.startsWith("in_")  || 
                    b.startsWith("out_") || 
                    clean_properties.indexOf(b) != -1 )             
                    delete object[b];
                else if( Array.isArray(object[b]) && cleanNested )
                    _cleanAll(object[b]);
                else if( typeof object[b] === "object" && cleanNested  )
                    _cleanAll([object[b]]);
            });

            if(object["@rid"]){
              object["id"] = object["@rid"].toString();
              delete object["@rid"];
            }

            if( object["created_on"] )
                object["_created_on"] = new Date(object["created_on"]);
        });
    })(this);   

    return this;
};

/*
    set value for all the object specific keys
    ==========================================

    e.g.

    // target array
    var test = [{ name : "siba", age : 22 },{ name : "prakash", age : 23 }];

    // modify all the "name" value to "something"
    console.log(test.sp_setProperties({key : "name", value : "something"}));

*/



Array.prototype.sp_setProperties = function cleanProperties(array) {

    if(!array) return this;
   
    if(!Array.isArray(array)) array = [array];

    var $this = this;

    array.forEach(function(obj){
        $this.map(function(a){
            a[obj.key] = obj.value;
        });
    });
    return $this;
}


})();




