Scoped.define("module:Exceptions.Exception", [
    "module:Class",
    "module:Comparators"
], function (Class, Comparators, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		
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
			constructor: function (message) {
				inherited.constructor.call(this);
				this.__message = message;
			},
			
			/**
			 * Asserts to be a certain type of exception. Throws this as an exception of assertion fails.
			 * 
			 * @param {object} exception_class Exception class to be asserted
			 * @return {object} this
			 */
			assert: function (exception_class) {
				if (!this.instance_of(exception_class))
					throw this;
				return this;
			},
			
			/**
			 * Returns exception message string.
			 * 
			 * @return {string} Exception message string
			 */
			message: function () {
				return this.__message;
			},
			
			/**
			 * Format exception as string.
			 * 
			 * @return {string} Exception string
			 */
			toString: function () {
				return this.message();
			},
			
			/**
			 * Format exception as string including the classname.
			 * 
			 * @return {string} Exception string plus classname
			 */
			format: function () {
				return this.cls.classname + ": " + this.toString();
			},
			
			/**
			 * Returns exception data as JSON.
			 * 
			 * @return {object} exception data
			 */
			json: function () {
				return {
					classname: this.cls.classname,
					message: this.message()
				};
			},
			
			/**
			 * Determines whether this exception is equal to another.
			 * 
			 * @param {object} other Other exception
			 * @return {boolean} True if equal
			 */
			equals: function (other) {
				return other && this.cls === other.cls && Comparators.deepEqual(this.json(), other.json(), -1);
			}			
			
		};
	}, {
		
		/**
		 * Ensures that a given exception is an instance of an Exception class
		 * 
		 * @param e Exception
		 * @return {object} Exception instance, possibly wrapping e as a NativeException
		 */
		ensure: function (e) {
			throw "Should be overwritten via Scoped.";
		}
		
	});
});


Scoped.define("module:Exceptions.NativeException", ["module:Exceptions.Exception"], function (Exception, scoped) {
	return Exception.extend({scoped: scoped}, function (inherited) {
		
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
			constructor: function (object) {
				inherited.constructor.call(this, object ? ("toString" in object ? object.toString() : object) : "null");
				this.__object = object;
			},
			
			/**
			 * Returns the original native exception object.
			 * 
			 * @return {object} Native exception object
			 */
			object: function () {
				return this.__object;
			}

		};
	});
});


Scoped.extend("module:Exceptions", ["module:Types", "module:Exceptions.Exception", "module:Exceptions.NativeException"], function (Types, Exception, NativeException) {
	
	/**
	 * The Exception module
	 * 
	 * @module BetaJS.Exceptions
	 */
	return {
		
		/**
		 * Ensures that a given exception is an instance of an Exception class
		 * 
		 * @param e Exception
		 * @return {object} Exception instance, possibly wrapping e as a NativeException
		 */
		ensure: function (e) {
			return Exception.is_instance_of(e) ? e : new NativeException(e);
		}

	};
});

Scoped.extend("module:Exceptions.Exception", ["module:Exceptions"], ["module:Exceptions.ensure"], function (Exceptions) {
	
	return {
		
		ensure: function (e) {
			return Exceptions.ensure(e).assert(this);
		}
		
	};
});
