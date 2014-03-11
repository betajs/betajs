/** @class */
BetaJS.Functions = {
	
    /** Takes a function and an instance and returns the method call as a function
     * 
     * @param func function
     * @param instance instance
     * @return method call 
     */
	as_method: function (func, instance) {
		return function() {
			return func.apply(instance, arguments);
		};
	},
	
    /** Takes a function and returns a function that calls the original function on the first call and returns the return value on all subsequent call. In other words a lazy function cache.
     * 
     * @param func function
     * @return cached function 
     */
	once: function (func) {
		var result = false;
		var executed = false;
		return function () {
			if (executed)
				return result;
			executed = true;
			result = func.apply(this, arguments);
			func = null;
			return result;
		};
	},
	
    /** Converts some other function's arguments to an array
     * 
     * @param func function arguments
     * @param slice number of arguments to be omitted (default: 0)
     * @return arguments as array 
     */	
	getArguments: function (args, slice) {
		return Array.prototype.slice.call(args, slice || 0);
	},
	
    /** Matches functions arguments against some pattern
     * 
     * @param args function arguments
     * @param pattern typed pattern
     * @return matched arguments as associative array 
     */	
	matchArgs: function (args, pattern) {
		var i = 0;
		var result = {};
		for (var key in pattern) {
			if (pattern[key] === true || BetaJS.Types.type_of(args[i]) == pattern[key]) {
				result[key] = args[i];
				i++;
			}
		}
		return result;
	}
	
};
