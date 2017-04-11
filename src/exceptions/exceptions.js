Scoped.define("module:Exceptions.Exception", [
    "module:Class",
    "module:Comparators"
], function(Class, Comparators, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Exception Class
         * 
         * @class BetaJS.Exceptions.Exception
         */
        return {

            /**
             * Instantiates a new exception.
             * 
             * @param {string} message Exception message
             */
            constructor: function(message) {
                inherited.constructor.call(this);
                this.__message = message;
                try {
                    throw new Error();
                } catch (e) {
                    this.__stack = e.stack;
                }
            },

            /**
             * Asserts to be a certain type of exception. Throws this as an exception of assertion fails.
             * 
             * @param {object} exception_class Exception class to be asserted
             * @return {object} this
             */
            assert: function(exception_class) {
                if (!this.instance_of(exception_class))
                    throw this;
                return this;
            },

            /**
             * Returns exception message string.
             * 
             * @return {string} Exception message string
             */
            message: function() {
                return this.__message;
            },

            /**
             * Returns exception stack.
             * 
             * @return Exception stack
             */
            stack: function() {
                return this.__stack;
            },

            /**
             * Format exception as string.
             * 
             * @return {string} Exception string
             */
            toString: function() {
                return this.message();
            },

            /**
             * Format exception as string including the classname.
             * 
             * @return {string} Exception string plus classname
             */
            format: function() {
                return this.cls.classname + ": " + this.toString();
            },

            /**
             * Returns exception data as JSON.
             * 
             * @return {object} exception data
             */
            json: function() {
                return {
                    classname: this.cls.classname,
                    message: this.message(),
                    stack: this.stack()
                };
            },

            /**
             * Determines whether this exception is equal to another.
             * 
             * @param {object} other Other exception
             * @return {boolean} True if equal
             */
            equals: function(other) {
                return other && this.cls === other.cls && Comparators.deepEqual(this.json(), other.json(), -1);
            }

        };
    }, {

        /**
         * Ensures that a given exception is an instance of an Exception class
         * 
         * @param e Exception
         * @return {object} Exception instance
         */
        ensure: function(e) {
            if (!this.is_instance_of(e))
                throw "Unasserted Exception " + e;
            return e;
        }

    });
});


Scoped.define("module:Exceptions.NativeException", [
    "module:Types",
    "module:Objs",
    "module:Exceptions.Exception"
], function(Types, Objs, Exception, scoped) {

    var NativeException = Exception.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Native Exception Wrapper Class
         * 
         * @class BetaJS.Exceptions.NativeException
         */
        return {

            /**
             * Instantiates a native exception wrapper.
             * 
             * @param {object} object Native exception object
             */
            constructor: function(object) {
                var message = "null";
                this.__data = {};
                if (object) {
                    ["name", "message", "filename", "lineno"].forEach(function(key) {
                        if (key in object)
                            this.__data[key] = object[key];
                    }, this);
                }
                inherited.constructor.call(this, object ? Objs.values(this.__data).join("; ") : "null");
                this.__object = object;
            },

            /**
             * Returns the original native exception object.
             * 
             * @return {object} Native exception object
             */
            object: function() {
                return this.__object;
            },

            /**
             * Returns the extracted data.
             * 
             * @return {object} Extracted data
             */
            data: function() {
                return this.__data;
            },

            /**
             * Returns exception data as JSON.
             * 
             * @return {object} exception data
             */
            json: function() {
                var j = inherited.json.call(this);
                j.data = this.data();
                return j;
            }

        };
    }, {

        /**
         * Ensures that a given exception is an instance of an Exception class
         * 
         * @param e Exception
         * @return {object} Exception instance, possibly wrapping e as a NativeException
         */
        ensure: function(e) {
            return NativeException.is_instance_of(e) ? e : new NativeException(e);
        }

    });

    return NativeException;
});