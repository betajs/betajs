BetaJS.Types = {
	
	is_object: function (x) {
		return typeof x == "object";
	},
	
	is_array: function (x) {
		return Object.prototype.toString.call(x) === '[object Array]';
	},
	
	is_undefined: function (x) {
		return typeof x == "undefined";		
	},
	
	is_null: function (x) {
		return x == null;
	},
	
	is_none: function (x) {
		return this.is_undefined(x) || this.is_null(x);
	},
	
	is_defined: function (x) {
		return typeof x != "undefined";
	},
	
	is_empty: function (x) {
		if (this.is_none(x)) 
			return true;
		if (this.is_array(x))
			return x.length == 0;
		if (this.is_object(x)) {
			for (var key in x)
				return false;
			return true;
		}
		return false; 
	},
	
	is_string: function (x) {
		return typeof x == "string";
	},
	
	is_function: function (x) {
		return typeof x == "function";
	},
	
	is_boolean: function (x) {
		return typeof x == "boolean";
	},
	
	compare: function (x, y) {
		if (BetaJS.Types.is_boolean(x) && BetaJS.Types.is_boolean(y))
			return x == y ? 0 : (x ? 1 : -1);
		if (BetaJS.Types.is_array(x) && BetaJS.Types.is_array(y)) {
			var len_x = x.length;
			var len_y = y.length;
			var len = Math.min(len_x, len_y);
			for (var i=0; i < len; ++i) {
				var c = this.compare(x[i], y[i]);
				if (c != 0)
					return c;
			}
			return len_x == len_y ? 0 : (len_x > len_y ? 1 : -1);
		}
		return x.localeCompare(y);			
	},
	
	parseBool: function (x) {
		if (this.is_boolean(x))
			return x;
		if (x == "true")
			return true;
		if (x == "false")
			return false;
		return null;
	}

};
