Scoped.define("module:Functions", [
    "module:Time",
    "module:Types"
], function(Time, Types) {

    /**
     * Function and Function Argument Support
     * 
     * @module BetaJS.Functions
     */
    return {

        /**
         * Returns the current stack trace.
         * 
         * @param {int} index optional stack trace start index
         * 
         * @return {array} stack trace array
         */
        getStackTrace: function(index) {
            var stack = (new Error()).stack.split("\n");
            while (stack.length > 0 && stack[0].trim().toLowerCase() === "error")
                stack.shift();
            return index ? stack.slice(index) : stack;
        },

        /**
         * Takes a function and an instance and returns the method call as a function
         * 
         * @param {function} func function
         * @param {object} instance instance
         * @return method call 
         */
        as_method: function(func, instance) {
            return function() {
                return func.apply(instance, arguments);
            };
        },

        /**
         * Takes a function name and returns the method call on the global object as a function
         *
         * @param {function} func function
         * @return method call
         */
        global_method: function(func) {
            var f = Scoped.getGlobal(func);
            return f ? this.as_method(f, Scoped.getGlobal()) : f;
        },


        /**
         * Takes a function and returns a function that calls the original function on the first call and returns the return value on all subsequent call. In other words a lazy function cache.
         * 
         * @param {function} func function
         * @return cached function 
         */
        once: function(func) {
            var result = false;
            var executed = false;
            return function() {
                if (executed)
                    return result;
                executed = true;
                result = func.apply(this, arguments);
                func = null;
                return result;
            };
        },


        /**
         * Converts some other function's arguments to an array
         * 
         * @param args function arguments
         * @param {integer} slice number of arguments to be omitted (default: 0)
         * @return {array} arguments as array 
         */
        getArguments: function(args, slice) {
            return Array.prototype.slice.call(args, slice || 0);
        },


        /**
         * Matches functions arguments against some pattern
         * 
         * @param args function arguments
         * @param {integer} skip number of arguments to be omitted (default: 0) 
         * @param {object} pattern typed pattern
         * @return {object} matched arguments as associative array 
         */
        matchArgs: function(args, skip, pattern) {
            if (arguments.length < 3) {
                pattern = skip;
                skip = 0;
            }
            var i = skip;
            var result = {};
            for (var key in pattern) {
                var config = pattern[key];
                if (config === true)
                    config = {
                        required: true
                    };
                else if (typeof config == "string")
                    config = {
                        type: config
                    };
                if (config.required || (config.type && Types.type_of(args[i]) == config.type)) {
                    result[key] = args[i];
                    i++;
                } else if (config.def) {
                    result[key] = Types.is_function(config.def) ? config.def(result) : config.def;
                }
            }
            return result;
        },


        /**
         * Creates a function for creating new instances of a class.
         *  
         * @param {object} cls Class
         * @return {function} class instantiation function 
         * @suppress {checkTypes}
         */
        newClassFunc: function(cls) {
            return function() {
                var args = arguments;

                function F() {
                    return cls.apply(this, args);
                }
                F.prototype = cls.prototype;
                return new F();
            };
        },


        /**
         * Creates a new class instance with arguments.
         *  
         * @param {object} cls Class
         * @return {function} class instance 
         */
        newClass: function(cls) {
            return this.newClassFunc(cls).apply(this, this.getArguments(arguments, 1));
        },


        /**
         * Call an object method.
         *  
         * @param {object} context object instance
         * @param method function or string of method
         * @return result of function call 
         */
        callWithin: function(context, method) {
            if (Types.is_string(method))
                method = context[method];
            return method.apply(context, this.getArguments(arguments, 2));
        },

        /**
         * Takes an argument function and returns a new function. The returned function will trigger the argument function at most once every 'wait' ms, no matter how many times it's called.
         *
         * @param {function} func - the argument function
         * @param {number} wait - delay (in ms) between each call to argument function
         * @return {function} the returned function
         */
        throttle: function(func, wait) {
            var args, context, previous = 0;

            var throttled = function() {
                var now = Time.now();
                var nextCall = previous + wait - now;
                context = this;
                args = arguments;
                if (nextCall <= 0) {
                    previous = now;
                    return func.apply(context, args);
                }
            };

            return throttled;
        },

        /**
         * Takes an argument function and returns a new function. If the returned function is called multiple times in sequence, the argument function will only be triggered once.
         *
         * @param {function} func - argument function
         * @param {number} wait - time delay (in ms) that defines the end of a sequence
         * @param {boolean} immediate - should trigger argument function immediately instead of waiting until the end of the sequence
         * @return {function} returned function
         */
        debounce: function(func, wait, immediate) {
            var args, context, timeout;

            var later = function() {
                var delay = Time.now() - lastCall;
                if (delay < wait) {
                    timeout = setTimeout(later, wait - delay);
                    return;
                }
                timeout = null;
                if (!immediate) func.apply(context, args);
            };

            var debounced = function() {
                context = this;
                args = arguments;
                lastCall = Time.now();
                if (!timeout) {
                    timeout = setTimeout(later, wait);
                    if (immediate) func.apply(this, arguments);
                }
            };

            return debounced;
        }

    };
});