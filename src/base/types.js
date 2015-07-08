Scoped.define("module:Types", function () {
	/** Type-Testing and Type-Parsing
	 * @module BetaJS.Types
	 */
	return {
		/**
		 * Returns whether argument is an object
		 * 
		 * @param x
		 *            argument
		 * @return true if x is an object
		 */
		is_object : function(x) {
			return typeof x == "object";
		},

		/**
		 * Returns whether argument is an array
		 * 
		 * @param x
		 *            argument
		 * @return true if x is an array
		 */
		is_array : function(x) {
			return Object.prototype.toString.call(x) === '[object Array]';
		},

		/**
		 * Returns whether argument is undefined (which is different from being
		 * null)
		 * 
		 * @param x
		 *            argument
		 * @return true if x is undefined
		 */
		is_undefined : function(x) {
			return typeof x == "undefined";
		},

		/**
		 * Returns whether argument is null (which is different from being
		 * undefined)
		 * 
		 * @param x
		 *            argument
		 * @return true if x is null
		 */
		is_null : function(x) {
			return x === null;
		},

		/**
		 * Returns whether argument is undefined or null
		 * 
		 * @param x
		 *            argument
		 * @return true if x is undefined or null
		 */
		is_none : function(x) {
			return this.is_undefined(x) || this.is_null(x);
		},

		/**
		 * Returns whether argument is defined (could be null)
		 * 
		 * @param x
		 *            argument
		 * @return true if x is defined
		 */
		is_defined : function(x) {
			return typeof x != "undefined";
		},

		/**
		 * Returns whether argument is empty (undefined, null, an empty array or
		 * an empty object)
		 * 
		 * @param x
		 *            argument
		 * @return true if x is empty
		 */
		is_empty : function(x) {
			if (this.is_none(x))
				return true;
			if (this.is_array(x))
				return x.length === 0;
			if (this.is_object(x)) {
				for ( var key in x)
					return false;
				return true;
			}
			return false;
		},

		/**
		 * Returns whether argument is a string
		 * 
		 * @param x
		 *            argument
		 * @return true if x is a a string
		 */
		is_string : function(x) {
			return typeof x == "string";
		},

		/**
		 * Returns whether argument is a function
		 * 
		 * @param x
		 *            argument
		 * @return true if x is a function
		 */
		is_function : function(x) {
			return typeof x == "function";
		},

		/**
		 * Returns whether argument is boolean
		 * 
		 * @param x
		 *            argument
		 * @return true if x is boolean
		 */
		is_boolean : function(x) {
			return typeof x == "boolean";
		},

		/**
		 * Compares two values
		 * 
		 * If values are booleans, we compare them directly. If values are
		 * arrays, we compare them recursively by their components. Otherwise,
		 * we use localeCompare which compares strings.
		 * 
		 * @param x
		 *            left value
		 * @param y
		 *            right value
		 * @return 1 if x > y, -1 if x < y and 0 if x == y
		 */
		compare : function(x, y) {
			if (this.is_boolean(x) && this.is_boolean(y))
				return x == y ? 0 : (x ? 1 : -1);
			if (this.is_array(x) && this.is_array(y)) {
				var len_x = x.length;
				var len_y = y.length;
				var len = Math.min(len_x, len_y);
				for (var i = 0; i < len; ++i) {
					var c = this.compare(x[i], y[i]);
					if (c !== 0)
						return c;
				}
				return len_x == len_y ? 0 : (len_x > len_y ? 1 : -1);
			}
			return x.localeCompare(y);
		},

		/**
		 * Parses a boolean string
		 * 
		 * @param x
		 *            boolean as a string
		 * @return boolean value
		 */
		parseBool : function(x) {
			if (this.is_boolean(x))
				return x;
			if (x == "true")
				return true;
			if (x == "false")
				return false;
			return null;
		},

		/**
		 * Returns the type of a given expression
		 * 
		 * @param x
		 *            expression
		 * @return type string
		 */
		type_of : function(x) {
			if (this.is_array(x))
				return "array";
			return typeof x;
		},

		parseType : function(x, type) {
			if (!this.is_string(x))
				return x;
			type = type.toLowerCase();
			if (type == "bool" || type == "boolean")
				return this.parseBool(x);
			if (type == "int" || type == "integer")
				return parseInt(x, 10);
			if (type == "date" || type == "time" || type == "datetime")
				return parseInt(x, 10);
			return x;
		},
		
		objectType: function (obj) {
			if (!this.is_object(obj))
				return null;
			var matcher = obj.match(/\[object (.*)\]/);
			return matcher ? matcher[1] : null;
		}
		
		
	};
});
