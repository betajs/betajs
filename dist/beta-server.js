/*!
  betajs - v0.0.2 - 2014-03-17
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*!
  betajs - v0.0.2 - 2014-03-17
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*!
  betajs - v0.0.2 - 2014-03-17
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
var BetaJS = BetaJS || {};
/*
 * Export for NodeJS
 */
if (typeof module != "undefined" && "exports" in module)
	module.exports = BetaJS;

/** @class */
BetaJS.Types = {
	
    /** Returns whether argument is an object
     * 
     * @param x argument
     * @return true if x is an object
     */
	is_object: function (x) {
		return typeof x == "object";
	},
	
    /** Returns whether argument is an array
     * 
     * @param x argument
     * @return true if x is an array
     */
	is_array: function (x) {
		return Object.prototype.toString.call(x) === '[object Array]';
	},
	
    /** Returns whether argument is undefined (which is different from being null)
     * 
     * @param x argument
     * @return true if x is undefined
     */
	is_undefined: function (x) {
		return typeof x == "undefined";		
	},
	
    /** Returns whether argument is null (which is different from being undefined)
     * 
     * @param x argument
     * @return true if x is null
     */
	is_null: function (x) {
		return x === null;
	},
	
    /** Returns whether argument is undefined or null
     * 
     * @param x argument
     * @return true if x is undefined or null
     */
	is_none: function (x) {
		return this.is_undefined(x) || this.is_null(x);
	},
	
    /** Returns whether argument is defined (could be null)
     * 
     * @param x argument
     * @return true if x is defined
     */
	is_defined: function (x) {
		return typeof x != "undefined";
	},
	
    /** Returns whether argument is empty (undefined, null, an empty array or an empty object)
     * 
     * @param x argument
     * @return true if x is empty
     */
	is_empty: function (x) {
		if (this.is_none(x)) 
			return true;
		if (this.is_array(x))
			return x.length === 0;
		if (this.is_object(x)) {
			for (var key in x)
				return false;
			return true;
		}
		return false; 
	},
	
    /** Returns whether argument is a string
     * 
     * @param x argument
     * @return true if x is a a string
     */
	is_string: function (x) {
		return typeof x == "string";
	},
	
    /** Returns whether argument is a function
     * 
     * @param x argument
     * @return true if x is a function
     */
	is_function: function (x) {
		return typeof x == "function";
	},
	
    /** Returns whether argument is boolean
     * 
     * @param x argument
     * @return true if x is boolean
     */
	is_boolean: function (x) {
		return typeof x == "boolean";
	},
	
    /** Compares two values
     * 
     * If values are booleans, we compare them directly.
     * If values are arrays, we compare them recursively by their components.
     * Otherwise, we use localeCompare which compares strings.
     * 
     * @param x left value
     * @param y right value
     * @return 1 if x > y, -1 if x < y and 0 if x == y
     */
	compare: function (x, y) {
		if (BetaJS.Types.is_boolean(x) && BetaJS.Types.is_boolean(y))
			return x == y ? 0 : (x ? 1 : -1);
		if (BetaJS.Types.is_array(x) && BetaJS.Types.is_array(y)) {
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
	
    /** Parses a boolean string
     * 
     * @param x boolean as a string
     * @return boolean value
     */	
	parseBool: function (x) {
		if (this.is_boolean(x))
			return x;
		if (x == "true")
			return true;
		if (x == "false")
			return false;
		return null;
	},
	
    /** Returns the type of a given expression
     * 
     * @param x expression
     * @return type string
     */	
	type_of: function (x) {
		if (this.is_array(x))
			return "array";
		return typeof x;
	}

};

/** @class */
BetaJS.Strings = {
	
    /** Converts a string new lines to html <br /> tags
     * 
     * @param s string
     * @return string with new lines replaced by <br /> 
     */
	nl2br: function (s) {
		return (s + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
	},
	
    /** Converts special characters in a string to html entitiy symbols
     * 
     * @param s string
     * @return converted string
     */
	htmlentities: function (s) {
		return (s + "").
			replace(/&/g, '&amp;').
			replace(/</g, '&lt;').
			replace(/>/g, '&gt;').
			replace(/"/g, '&quot;').
			replace(/'/g, '&#x27;').
			replace(/\//g, '&#x2F;');
	},
	
	JS_ESCAPES: {
		"'":      "'",
		'\\':     '\\',
		'\r':     'r',
		'\n':     'n',
		'\t':     't',
		'\u2028': 'u2028',
		'\u2029': 'u2029'
	},
	
	JS_ESCAPER_REGEX: function () {
		if (!this.JS_ESCAPER_REGEX_CACHED)
			this.JS_ESCAPER_REGEX_CACHED = new RegExp(BetaJS.Objs.keys(this.JS_ESCAPES).join("|"), 'g');
		return this.JS_ESCAPER_REGEX_CACHED;
	},
	
    /** Converts string such that it can be used in javascript by escaping special symbols
     * 
     * @param s string
     * @return escaped string
     */
	js_escape: function (s) {
		var self = this;
		return s.replace(this.JS_ESCAPER_REGEX(), function(match) {
			return '\\' + self.JS_ESCAPES[match];
		});
	},
	
    /** Determines whether a string starts with a sub string
     * 
     * @param s string in question
     * @param needle sub string
     * @return true if string in question starts with sub string
     */
	starts_with: function (s, needle) {
		return s.substring(0, needle.length) == needle;
	},
	
    /** Determines whether a string ends with a sub string
     * 
     * @param s string in question
     * @param needle sub string
     * @return true if string in question ends with sub string
     */
	ends_with: function(s, needle) {
    	return s.indexOf(needle, s.length - needle.length) !== -1;
	},
	
    /** Removes sub string from a string if string starts with sub string
     * 
     * @param s string in question
     * @param needle sub string
     * @return string without sub string if it starts with sub string otherwise it returns the original string
     */
	strip_start: function (s, needle) {
		return this.starts_with(s, needle) ? s.substring(needle.length) : s;
	},
	
    /** Returns the complete remaining part of a string after a the last occurrence of a sub string
     * 
     * @param s string in question
     * @param needle sub string
     * @return remaining part of the string in question after the last occurrence of the sub string
     */
	last_after: function (s, needle) {
		return s.substring(s.lastIndexOf(needle) + needle.length, s.length);
	},
	
	EMAIL_ADDRESS_REGEX: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	
    /** Determines whether a string is a syntactically valid email address
     * 
     * @param s string in question
     * @return true if string looks like an email address
     */
	is_email_address: function (s) {
		return this.EMAIL_ADDRESS_REGEX.test(s);
	},
	
	STRIP_HTML_REGEX: /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi,
		
    /** Removes all html from data and returns plain text
     * 
     * @param html string containing html
     * @return string containing the plain text part of it
     */
	strip_html: function (html) {
    	return html.replace(this.STRIP_HTML_REGEX, '');
    },
   
    /** Trims all trailing and leading whitespace and removes block indentations
     * 
     * @param s string
     * @return string with trimmed whitespaces and removed block indentation
     */
    nltrim: function(s) {
		var a = s.replace(/\t/g, "  ").split("\n");
		var len = null;
		var i = 0;
		for (i = 0; i < a.length; ++i) {
			var j = 0;
			while (j < a[i].length) {
				if (a[i].charAt(j) != ' ')
					break;
				++j;
			}
			if (j < a[i].length)
				len = len === null ? j : Math.min(j, len);	
		}
		for (i = 0; i < a.length; ++i)
			a[i] = a[i].substring(len);
		return a.join("\n").trim();
	}

};

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

/** @class */
BetaJS.SyncAsync = {
	
    /** Converts a synchronous function to an asynchronous one and calls it
     * 
     * @param callbacks callbacks object with success and failure
     * @param syncCall the synchronous function
     * @param context optional object context
     */	
	syncToAsync: function (callbacks, syncCall, context) {
		try {
			callbacks.success.call(callbacks.context || this, syncCall.apply(context || this));
		} catch (e) {
			callbacks.failure.call(callbacks.context || this, e);
		}
	},
	
    /** Either calls a synchronous or asynchronous function depending on whether useSync is given
     * 
     * @param callbacks callbacks object with success and failure (or null)
     * @param useSync use synchronous call?
     * @param syncCall the synchronous function
     * @param asyncCall the asynchronous function
     * @param context optional object context
     * @return the function return data
     */	
	either: function (callbacks, useSync, syncCall, asyncCall, context) {
		context = context || this;
		if (callbacks) {
			if (useSync)
				this.syncToAsync(callbacks, syncCall, context);
			else
				asyncCall.call(context, callbacks);
		} else
			return syncCall.apply(context);
		return null;
	},
	
	SYNC: 1,
	ASYNC: 2,
	ASYNCSINGLE: 3,
	
	toCallbackType: function (callbacks, type) {
		if (type == this.ASYNCSINGLE)
			return function (err, result) {
				if (err)
					callbacks.failure.call(callbacks.context || this, err);
				callbacks.success.call(callbacks.context || this, result);
			};
		return callbacks;
	},
	
	then: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number",
			callbacks: true,
			success_ctx: "object",
			success: "function"
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var callbacks = args.callbacks;
		var type = args.type || (callbacks ? this.ASYNC : this.SYNC);
		var success_ctx = args.success_ctx || func_ctx;
		var success = args.success;
		if (type != this.SYNC) {			
			params.push(this.toCallbackType(success ? {
				context: callbacks.context,
				success: function (ret) {
					success.call(success_ctx, ret, callbacks);
				},
				failure: callbacks.failure
			} : callbacks, type));
			func.apply(func_ctx, params);
		} else if (callbacks) {
			try {
				if (success)
					success.call(success_ctx, func.apply(func_ctx, params), callbacks);
				else
					callbacks.success.call(callbacks.context || this, func.apply(func_ctx, params));
			} catch (e) {
				callbacks.failure.call(callbacks.context || this, e);
			}
		} else {
			var ret = func.apply(func_ctx, params);
			if (success)
				success.call(success_ctx, ret, {
					success: function (retv) {
						ret = retv;
					},
					failure: function (err) {
						throw err;
					}
				});
			return ret;
		}
		return null;
	}

};

/** @class */
BetaJS.Scopes = {
	
	/** Takes a string and returns the global object associated with it by name.
     * 
     * @param s string (example: "BetaJS")
     * @param base a global namespace base (optional, will autodetect the right one if not provided)
     * @return global object (example: BetaJS object)
     */
	base: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		if (base)
			return base[s];
		try {
			if (window)
				return window[s];
		} catch (e) {}
		try {
			if (global && global[s])
				return global[s];
		} catch (e) {}
		try {
			if (module && module.exports)
				return module.exports;
		} catch (e) {}
		return null;
	},
	
	/** Takes an object address string and returns the object associated with it.
     * 
     * @param s string (example: "BetaJS.Strings")
     * @param base a global namespace base (optional, will autodetect the right one if not provided)
     * @return global object (example BetaJS.Strings object)
     */
	resolve: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var a = s.split(".");			
		var object = this.base(a[0], base);
		for (var i = 1; i < a.length; ++i)
			object = object[a[i]];
		return object;
	},
	
	/** Takes an object address string and returns the object associated with it.
	 *  If the address does not exist, it will be created.
     * 
     * @param s string (example: "BetaJS.Strings.FooBar")
     * @param base a global namespace base (optional, will autodetect the right one if not provided)
     * @return global object (example BetaJS.Strings.FooBar object)
     */
	touch: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var a = s.split(".");		
		var object = this.base(a[0], base);
		for (var i = 1; i < a.length; ++i) {
			if (!(a[i] in object))
				object[a[i]] = {};
			object = object[a[i]];
		}
		return object;
	},
	
	/** Takes an object address string and overwrites it by a given object.
	 *  If the address does not exist, it will be created.
     * 
     * @param obj object (example: {test: "foobar"})
     * @param s string (example: "BetaJS.Strings.FooBar")
     * @param base a global namespace base (optional, will autodetect the right one if not provided)
     * @return global object (example BetaJS.Strings.FooBar object)
     */
	set: function (obj, s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var a = s.split(".");			
		var object = this.base(a[0], base);
		for (var i = 1; i < a.length - 1; ++i) {
			if (!(a[i] in object))
				object[a[i]] = {};
			object = object[a[i]];
		}
		if (a.length > 1)
			object[a[a.length - 1]] = obj;
		return obj;
	}
	
};

/** @class */
BetaJS.Ids = {
	
	__uniqueId: 0,
	
    /** Returns a unique identifier
     * 
     * @param prefix a prefix string for the identifier (optional)
     * @return unique identifier
     */
	uniqueId: function (prefix) {
		return (prefix || "") + (this.__uniqueId++);
	},
	
    /** Returns the object's unique identifier
     * 
     * @param object the object
     * @return object's unique identifier
     */
	objectId: function (object) {
		if (!object.__cid)
			object.__cid = this.uniqueId("cid_");
		return object.__cid;
	}
	
};
/** @class */
BetaJS.Tokens = {
	
    /** Returns a new token
     * 
     * @param length optional length of token, default is 16
     * @return token
     */
	generate_token: function (length) {
		length = length || 16;
		var s = "";
		while (s.length < length)
			s += Math.random().toString(36).substr(2); 
		return s.substr(0, length);
	}
	
};
BetaJS.Objs = {
	
	count: function (obj) {
		if (BetaJS.Types.is_array(obj))
			return obj.length;
		else {
			var c = 0;
			for (var key in obj)
				c++;
			return c;
		}
	},
	
	clone: function (item, depth) {
		if (!depth || depth <= 0)
			return item;
		if (BetaJS.Types.is_array(item))
			return item.slice(0);
		else if (BetaJS.Types.is_object(item))
			return this.extend({}, item, depth-1);
		else
			return item;
	},
	
	acyclic_clone: function (object, def) {
		if (object === null || ! BetaJS.Types.is_object(object))
			return object;
		var s = "__acyclic_cloned";
		if (object[s])
			return def || "CYCLE";
		object[s] = true;
		var result = {};
		for (var key in object) {
			if (key != s)
				result[key] = this.acyclic_clone(object[key], def);
		}
		delete object[s];
		return result;
	},
	
	extend: function (target, source, depth) {
		target = target || {};
		if (source) {
			for (var key in source)
				target[key] = this.clone(source[key], depth);
		}
		return target;
	},
	
	merge: function (secondary, primary, options) {
		secondary = secondary || {};
		primary = primary || {};
		var result = {};
		var keys = BetaJS.Objs.extend(BetaJS.Objs.keys(secondary, true), BetaJS.Objs.keys(primary, true));
		for (var key in keys) {
			var opt = key in options ? options[key] : "primary";
			if (opt == "primary" || opt == "secondary") {
				if (key in primary || key in secondary) {
					if (opt == "primary")
						result[key] = key in primary ? primary[key] : secondary[key];
					else
						result[key] = key in secondary ? secondary[key] : primary[key];
				}			
			}
			else if (BetaJS.Types.is_function(opt))
				result[key] = opt(secondary[key], primary[key]);
			else if (BetaJS.Types.is_object(opt))
				result[key] = BetaJS.Objs.merge(secondary[key], primary[key], opt);
		}
		return result;
	},
	
	tree_merge: function (secondary, primary) {
		secondary = secondary || {};
		primary = primary || {};
		var result = {};
		var keys = BetaJS.Objs.extend(BetaJS.Objs.keys(secondary, true), BetaJS.Objs.keys(primary, true));
		for (var key in keys) {
			if (BetaJS.Types.is_object(primary[key]) && secondary[key])
				result[key] = BetaJS.Objs.tree_merge(secondary[key], primary[key]);
			else
				result[key] = key in primary ? primary[key] : secondary[key];
		}
		return result;
	},

	keys: function(obj, mapped) {
		var result = null;
		var key = null;
		if (BetaJS.Types.is_undefined(mapped)) {
			result = [];
			for (key in obj)
				result.push(key);
			return result;
		} else {
			result = {};
			for (key in obj)
				result[key] = mapped;
			return result;
		}
	},
	
	map: function (obj, f, context) {
		var result = null;
		if (BetaJS.Types.is_array(obj)) {
			result = [];
			for (var i = 0; i < obj.length; ++i)
				result.push(context ? f.apply(context, [obj[i], i]) : f(obj[i], i));
			return result;
		} else {
			result = {};
			for (var key in obj)
				result[key] = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
			return result;
		}
	},
	
	values: function (obj) {
		var result = [];
		for (var key in obj)
			result.push(obj[key]);
		return result;
	},
	
	filter: function (obj, f, context) {
		var ret = null;
		if (BetaJS.Types.is_array(obj)) {
			ret = [];
			for (var i = 0; i < obj.length; ++i) {
				if (context ? f.apply(context, [obj[i], i]) : f(obj[i], i))
					ret.push(obj[i]);
			}
			return ret;
		} else {
			ret = {};
			for (var key in obj) {
				if (context ? f.apply(context, [obj[key], key]) : f(obj[key], key))
					ret[key] = obj[key];
			}
			return ret;
		}
	},
	
	equals: function (obj1, obj2, depth) {
		var key = null;
		if (depth && depth > 0) {
			for (key in obj1) {
				if (!key in obj2 || !this.equals(obj1[key], obj2[key], depth-1))
					return false;
			}
			for (key in obj2) {
				if (!key in obj1)
					return false;
			}
			return true;
		} else
			return obj1 == obj2;
	},
	
	iter: function (obj, f, context) {
		var result = null;
		if (BetaJS.Types.is_array(obj)) {
			for (var i = 0; i < obj.length; ++i) {
				result = context ? f.apply(context, [obj[i], i]) : f(obj[i], i);
				if (BetaJS.Types.is_defined(result) && !result)
					return false;
			}
		} else {
			for (var key in obj) {
				result = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
				if (BetaJS.Types.is_defined(result) && !result)
					return false;
			}
		}
		return true;
	},
	
	intersect: function (a, b) {
		var c = {};
		for (var key in a) {
			if (key in b)
				c[key] = a[key];
		}
		return c;
	},
	
	contains_key: function (obj, key) {
		if (BetaJS.Types.is_array(obj))
			return BetaJS.Types.is_defined(obj[key]);
		else
			return key in obj;
	},
	
	contains_value: function (obj, value) {
		if (BetaJS.Types.is_array(obj)) {
			for (var i = 0; i < obj.length; ++i) {
				if (obj[i] === value)
					return true;
			}
		} else {
			for (var key in obj) {
				if (obj[key] === value)
					return true;
			}
		}
		return false;
	},
	
	exists: function (obj, f, context) {
		var success = false;
		BetaJS.Objs.iter(obj, function () {
			success = success || f.apply(this, arguments);
			return !success;
		}, context);
		return success;
	},
	
	all: function (obj, f, context) {
		var success = true;
		BetaJS.Objs.iter(obj, function () {
			success = success && f.apply(this, arguments);
			return success;
		}, context);
		return success;
	},
	
	objectify: function (arr, f, context) {
		var result = {};
		var is_function = BetaJS.Types.is_function(f);
		if (BetaJS.Types.is_undefined(f))
			f = true;
		for (var i = 0; i < arr.length; ++i)
			result[arr[i]] = is_function ? f.apply(context || this, [arr[i], i]) : f;
		return result;
	}

};

BetaJS.Class = function () {};

BetaJS.Class.classname = "Class";

BetaJS.Class.extend = function (classname, objects, statics, class_statics) {
	objects = objects || [];
	if (!BetaJS.Types.is_array(objects))
		objects = [objects];
	statics = statics || [];
	if (!BetaJS.Types.is_array(statics))
		statics = [statics];
	class_statics = class_statics || [];
	if (!BetaJS.Types.is_array(class_statics))
		class_statics = [class_statics];
	
	var parent = this;
	
	var result;
	
	// Setup JavaScript Constructor
	BetaJS.Objs.iter(objects, function (obj) {
		if (obj.hasOwnProperty("constructor"))
			result = obj.constructor;
	});
	var has_constructor = BetaJS.Types.is_defined(result);
	if (!BetaJS.Types.is_defined(result))
		result = function () { parent.apply(this, arguments); };

	// Add Parent Statics
	BetaJS.Objs.extend(result, parent);

	// Add External Statics
	BetaJS.Objs.iter(statics, function (stat) {
		BetaJS.Objs.extend(result, stat);
	});
	
	
	// Add Class Statics
	var class_statics_keys = {};
	if (parent.__class_statics_keys) {
		for (var key in parent.__class_statics_keys) 
			result[key] = BetaJS.Objs.clone(parent[key], 1);
	}
	BetaJS.Objs.iter(class_statics, function (stat) {
		BetaJS.Objs.extend(result, stat);
		BetaJS.Objs.extend(class_statics_keys, BetaJS.Objs.keys(stat, true));
	});
	if (parent.__class_statics_keys)
		BetaJS.Objs.extend(class_statics_keys, parent.__class_statics_keys);
	result.__class_statics_keys = class_statics_keys;
	
	// Parent & Children Hierarchy
	result.parent = parent;
	result.children = [];
	result.extend = this.extend;
	if (!parent.children)
		parent.children = [];
	parent.children.push(result);
	
	// Setup Prototype
	var ctor = function () {};
	ctor.prototype = parent.prototype;
	result.prototype = new ctor();

	// ClassNames
	result.prototype.cls = result;
	result.classname = classname;
	
	// Enforce ClassName in namespace
	if (classname)
		BetaJS.Scopes.set(result, classname);
	
	// Setup Prototype
	result.__notifications = {};
	
	if (parent.__notifications)
		BetaJS.Objs.extend(result.__notifications, parent.__notifications, 1);		

	BetaJS.Objs.iter(objects, function (object) {
		BetaJS.Objs.extend(result.prototype, object);

		// Note: Required for Internet Explorer
		if ("constructor" in object)
			result.prototype.constructor = object.constructor;

		if (object._notifications) {
			for (var key in object._notifications) {
				if (!result.__notifications[key])
					result.__notifications[key] = [];
				result.__notifications[key].push(object._notifications[key]);
			}
		}
	});	
	delete result.prototype._notifications;

	if (!has_constructor)
		result.prototype.constructor = parent.prototype.constructor;
		
	return result; 
};



BetaJS.Class.prototype.constructor = function () {
	this._notify("construct");
};

BetaJS.Class.prototype.as_method = function (s) {
	return BetaJS.Functions.as_method(this[s], this);
};

BetaJS.Class.prototype._auto_destroy = function (obj) {
	if (!this.__auto_destroy_list)
		this.__auto_destroy_list = [];
	this.__auto_destroy_list.push(obj);
	return obj;
};

BetaJS.Class.prototype._notify = function (name) {
	if (!this.cls.__notifications)
		return;
	var rest = Array.prototype.slice.call(arguments, 1);
	var table = this.cls.__notifications[name];
	if (table) {
		for (var i in table) {
			var method = BetaJS.Types.is_function(table[i]) ? table[i] : this[table[i]];
			if (!method)
				throw this.cls.classname  + ": Could not find " + name + " notification handler " + table[i];
			method.apply(this, rest);
		}
	}
};

BetaJS.Class.prototype.destroy = function () {
	this._notify("destroy");
	if (this.__auto_destroy_list) {
		for (var i = 0; i < this.__auto_destroy_list.length; ++i) {
			if ("destroy" in this.__auto_destroy_list[i])
				this.__auto_destroy_list[i].destroy();
		}
	}
	for (var key in this)
		delete this[key];
};

BetaJS.Class.prototype._inherited = function (cls, func) {
	return cls.parent.prototype[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
};

BetaJS.Class._inherited = function (cls, func) {
	return cls.parent[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
};

BetaJS.Class.prototype.instance_of = function (cls) {
	return this.cls.ancestor_of(cls);
};

BetaJS.Class.ancestor_of = function (cls) {
	return (this == cls) || (this != BetaJS.Class && this.parent.ancestor_of(cls));
};

BetaJS.Class.prototype.cid = function () {
	return BetaJS.Ids.objectId(this);
};



BetaJS.Class.prototype.cls = BetaJS.Class;

BetaJS.Class.__notifications = {};

BetaJS.Class.is_class_instance = function (object) {
	return object && BetaJS.Types.is_object(object) && ("_inherited" in object) && ("cls" in object);
};


BetaJS.Exceptions = {
	
	ensure: function (e) {
		if (e && BetaJS.Types.is_object(e) && ("instance_of" in e) && (e.instance_of(BetaJS.Exceptions.Exception)))
			return e;
		return new BetaJS.Exceptions.NativeException(e);
	}
	
};


BetaJS.Class.extend("BetaJS.Exceptions.Exception", {
	
	constructor: function (message) {
		this._inherited(BetaJS.Exceptions.Exception, "constructor");
		this.__message = message;
	},
	
	assert: function (exception_class) {
		if (!this.instance_of(exception_class))
			throw this;
		return this;
	},
	
	callstack: function () {
		var callstack = [];
		var current = arguments.callee.caller;
		while (current) {
			callstack.push(current.toString());
			current = current.caller;
		}
		return callstack;
	},
	
	callstack_to_string: function () {
		return this.callstack().join("\n");
	},
	
	message: function () {
		return this.__message;
	},
	
	toString: function () {
		return this.message();
	},
	
	format: function () {
		return this.cls.classname + ": " + this.toString() + "\n\nCall Stack:\n" + this.callstack_to_string();
	},
	
	json: function () {
		return {
			classname: this.cls.classname,
			message: this.message()
		};
	}
	
}, {
	
	ensure: function (e) {
		e = BetaJS.Exceptions.ensure(e);
		e.assert(this);
		return e;
	}
	
});


BetaJS.Exceptions.Exception.extend("BetaJS.Exceptions.NativeException", {
	
	constructor: function (object) {
		this._inherited(BetaJS.Exceptions.NativeException, "constructor", object.toString());
		this.__object = object;
	},
	
	object: function () {
		return this.__object;
	}
	
});

BetaJS.Class.extend("BetaJS.Lists.AbstractList", {
	
	_add: function (object) {},
	_remove: function (ident) {},
	_get: function (ident) {},
	_iterate: function (callback, context) {},
	
	get_ident: function (object) {
		var ident = null;
		this._iterate(function (obj, id) {
			if (obj == object) {
				ident = id;
				return false;
			}
			return true;	
		});
		return ident;
	},
	
	exists: function (object) {
		return object && this.get_ident(object) !== null;
	},
	
	_ident_changed: function (object, new_ident) {},
	
	constructor: function (objects) {
		this._inherited(BetaJS.Lists.AbstractList, "constructor");
		this.__count = 0;
		if (objects)
			BetaJS.Objs.iter(objects, function (object) {
				this.add(object);
			}, this);
	},
	
	add: function (object) {
		var ident = this._add(object);
		if (BetaJS.Types.is_defined(ident))
			this.__count++;
		return ident;
	},
	
	count: function () {
		return this.__count;
	},
	
	clear: function () {
		this._iterate(function (object, ident) {
			this.remove_by_ident(ident);
			return true;
		}, this);
	},
	
	remove_by_ident: function (ident) {
		var ret = this._remove(ident);
		if (BetaJS.Types.is_defined(ret))
			this.__count--;
		return ret;
	},
	
	remove: function (object) {
		return this.remove_by_ident(this.get_ident(object));
	},
	
	remove_by_filter: function (filter) {
		this._iterate(function (object, ident) {
			if (filter(object))
				this.remove_by_ident(ident);
			return true;
		}, this);
	},
	
	get: function (ident) {
		return this._get(ident);
	},
	
	iterate: function (cb, context) {
		this._iterate(function (object, ident) {
			var ret = cb.apply(this, [object, ident]);
			return BetaJS.Types.is_defined(ret) ? ret : true;
		}, context);
	}

});

BetaJS.Lists.AbstractList.extend("BetaJS.Lists.LinkedList", {
	
	constructor: function (objects) {
		this.__first = null;
		this.__last = null;
		this._inherited(BetaJS.Lists.LinkedList, "constructor", objects);
	},
	
	_add: function (obj) {
		this.__last = {
			obj: obj,
			prev: this.__last,
			next: null
		};
		if (this.__first)
			this.__last.prev.next = this.__last;
		else
			this.__first = this.__last;
		return this.__last;
	},
	
	_remove: function (container) {
		if (container.next)
			container.next.prev = container.prev;
		else
			this.__last = container.prev;
		if (container.prev)
			container.prev.next = container.next;
		else
			this.__first = container.next;
		return container.obj;
	},
	
	_get: function (container) {
		return container.obj;
	},
	
	_iterate: function (cb, context) {
		var current = this.__first;
		while (current) {
			var prev = current;
			current = current.next;
			if (!cb.apply(context || this, [prev.obj, prev]))
				return;
		}
	}
});


BetaJS.Lists.AbstractList.extend("BetaJS.Lists.ObjectIdList",  {
	
	constructor: function (objects) {
		this.__map = {};
		this._inherited(BetaJS.Lists.ObjectIdList, "constructor", objects);
	},

	_add: function (object) {
		var id = BetaJS.Ids.objectId(object);
		this.__map[id] = object;
		return id;
	},
	
	_remove: function (ident) {
		var obj = this.__map[ident];
		delete this.__map[ident];
		return obj;
	},
	
	_get: function (ident) {
		return this.__map[ident];
	},
	
	_iterate: function (callback, context) {
		for (var key in this.__map)
			callback.apply(context || this, [this.__map[key], key]);
	},
	
	get_ident: function (object) {
		var ident = BetaJS.Ids.objectId(object);
		return this.__map[ident] ? ident : null;
	}
	
});



BetaJS.Lists.AbstractList.extend("BetaJS.Lists.ArrayList", {
	
	constructor: function (objects, options) {
		this.__idToIndex = {};
		this.__items = [];
		options = options || {};
		if ("compare" in options)
			this._compare = options["compare"];
		this._inherited(BetaJS.Lists.ArrayList, "constructor", objects);
	},
	
	set_compare: function (compare) {
		this._compare = compare;
		if (compare)
			this.sort();
	},
	
	get_compare: function () {
		return this._compare;
	},
	
	sort: function (compare) {
		compare = compare || this._compare;
		if (!compare)
			return;
		this.__items.sort(compare);
		for (var i = 0; i < this.__items.length; ++i)
			this.__ident_changed(this.__items[i], i);
		this._sorted();
	},
	
	_sorted: function () {},
		
	re_index: function (index) {
		if (!this._compare)
			return index;
		var last = this.__items.length - 1;
		var object = this.__items[index];
		var i = index;	
		while (i < last && this._compare(this.__items[i], this.__items[i + 1]) > 0) {
			this.__items[i] = this.__items[i + 1];
			this.__ident_changed(this.__items[i], i);
			this.__items[i + 1] = object;
			++i;
		}
		if (i == index) {
			while (i > 0 && this._compare(this.__items[i], this.__items[i - 1]) < 0) {
				this.__items[i] = this.__items[i - 1];
				this.__ident_changed(this.__items[i], i);
				this.__items[i - 1] = object;
				--i;
			}
		}
		if (i != index) {
			this.__ident_changed(object, i);
			this._re_indexed(object);
		}
		return i;
	},
	
	_re_indexed: function (object) {},
	
	_add: function (object) {
		var last = this.__items.length;
		this.__items.push(object);
		var i = this.re_index(last);
		this.__idToIndex[BetaJS.Ids.objectId(object)] = i;
		return i;
	},
	
	_remove: function (ident) {
		var obj = this.__items[ident];
		for (var i = ident + 1; i < this.__items.length; ++i) {
			this.__items[i-1] = this.__items[i];
			this.__ident_changed(this.__items[i-1], i-1);
		}
		this.__items.pop();
		delete this.__idToIndex[BetaJS.Ids.objectId(obj)];
		return obj;
	},
	
	_get: function (ident) {
		return this.__items[ident];
	},
	
	_iterate: function (callback, context) {
		var items = BetaJS.Objs.clone(this.__items, 1);
		for (var i = 0; i < items.length; ++i)
			callback.apply(context || this, [items[i], this.get_ident(items[i])]);
	},

	__ident_changed: function (object, index) {
		this.__idToIndex[BetaJS.Ids.objectId(object)] = index;
		this._ident_changed(object, index);
	},

	get_ident: function (object) {
		var id = BetaJS.Ids.objectId(object);
		return id in this.__idToIndex ? this.__idToIndex[id] : null;
	},
	
	ident_by_id: function (id) {
		return this.__idToIndex[id];
	}

});
BetaJS.Iterators = {
	
	ensure: function (mixed) {
		if (mixed === null)
			return new BetaJS.Iterators.ArrayIterator([]);
		if (mixed.instance_of(BetaJS.Iterators.Iterator))
			return mixed;
		if (BetaJS.Types.is_array(mixed))
			return new BetaJS.Iterators.ArrayIterator(mixed);
		return new BetaJS.Iterators.ArrayIterator([mixed]);
	}
	
};

BetaJS.Class.extend("BetaJS.Iterators.Iterator", {
	
	asArray: function () {
		var arr = [];
		while (this.hasNext())
			arr.push(this.next());
		return arr;
	}
	
});

BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.ArrayIterator", {
	
	constructor: function (arr) {
		this._inherited(BetaJS.Iterators.ArrayIterator, "constructor");
		this.__array = arr;
		this.__i = 0;
	},
	
	hasNext: function () {
		return this.__i < this.__array.length;
	},
	
	next: function () {
		var ret = this.__array[this.__i];
		this.__i++;
		return ret;
	}
	
});

BetaJS.Iterators.ArrayIterator.extend("BetaJS.Iterators.ObjectKeysIterator", {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Iterators.ObjectKeysIterator, "constructor", BetaJS.Objs.keys(obj));
	}
	
});

BetaJS.Iterators.ArrayIterator.extend("BetaJS.Iterators.ObjectValuesIterator", {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Iterators.ObjectValuesIterator, "constructor", BetaJS.Objs.values(obj));
	}
	
});

BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.MappedIterator", {
	
	constructor: function (iterator, map, context) {
		this._inherited(BetaJS.Iterators.MappedIterator, "constructor");
		this.__iterator = iterator;
		this.__map = map;
		this.__context = context || this;
	},
	
	hasNext: function () {
		return this.__iterator.hasNext();
	},
	
	next: function () {
		return this.hasNext() ? this.__map.call(this.__context, this.__iterator.next()) : null;
	}
	
});

BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.FilteredIterator", {
	
	constructor: function (iterator, filter, context) {
		this._inherited(BetaJS.Iterators.FilteredIterator, "constructor");
		this.__iterator = iterator;
		this.__filter = filter;
		this.__context = context || this;
		this.__next = null;
	},
	
	hasNext: function () {
		this.__crawl();
		return this.__next !== null;
	},
	
	next: function () {
		this.__crawl();
		var item = this.__next;
		this.__next = null;
		return item;
	},
	
	__crawl: function () {
		while (!this.__next && this.__iterator.hasNext()) {
			var item = this.__iterator.next();
			if (this.__filter_func(item))
				this.__next = item;
		}
	},
	
	__filter_func: function (item) {
		return this.__filter.apply(this.__context, [item]);
	}

});


BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.SkipIterator", {
	
	constructor: function (iterator, skip) {
		this._inherited(BetaJS.Iterators.SkipIterator, "constructor");
		this.__iterator = iterator;
		while (skip > 0) {
			iterator.next();
			skip--;
		}
	},
	
	hasNext: function () {
		return this.__iterator.hasNext();
	},
	
	next: function () {
		return this.__iterator.next();
	}

});


BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.LimitIterator", {
	
	constructor: function (iterator, limit) {
		this._inherited(BetaJS.Iterators.LimitIterator, "constructor");
		this.__iterator = iterator;
		this.__limit = limit;
	},
	
	hasNext: function () {
		return this.__limit > 0 && this.__iterator.hasNext();
	},
	
	next: function () {
		if (this.__limit <= 0)
			return null;
		this.__limit--;
		return this.__iterator.next();
	}

});


BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.SortedIterator", {
	
	constructor: function (iterator, compare) {
		this._inherited(BetaJS.Iterators.SortedIterator, "constructor");
		this.__array = iterator.asArray();
		this.__array.sort(compare);
		this.__i = 0;
	},
	
	hasNext: function () {
		return this.__i < this.__array.length;
	},
	
	next: function () {
		var ret = this.__array[this.__i];
		this.__i++;
		return ret;
	}
	
});

BetaJS.Events = {};

BetaJS.Events.EVENT_SPLITTER = /\s+/;

BetaJS.Events.EventsMixin = {
	
	__create_event_object: function (callback, context, options) {
		options = options || {};
		var obj = {
			callback: callback,
			context: context
		};
		if (options.min_delay)
			obj.min_delay = new BetaJS.Timers.Timer({
				delay: options.min_delay,
				once: true,
				start: false,
				context: this,
				fire: function () {
					if (obj.max_delay)
						obj.max_delay.stop();
					obj.callback.apply(obj.context || this, obj.params);
				}
			});
		if (options.max_delay)
			obj.max_delay = new BetaJS.Timers.Timer({
				delay: options.max_delay,
				once: true,
				start: false,
				context: this,
				fire: function () {
					if (obj.min_delay)
						obj.min_delay.stop();
					obj.callback.apply(obj.context || this, obj.params);
				}
			});
		return obj;
	},
	
	__destroy_event_object: function (object) {
		if (object.min_delay)
			object.min_delay.destroy();
		if (object.max_delay)
			object.max_delay.destroy();
	},
	
	__call_event_object: function (object, params) {
		if (object.min_delay)
			object.min_delay.restart();
		if (object.max_delay)
			object.max_delay.start();
		if (!object.min_delay && !object.max_delay)
			object.callback.apply(object.context || this, params);
		else
			object.params = params;
	},
	
	on: function(events, callback, context, options) {
		this.__events_mixin_events = this.__events_mixin_events || {};
		events = events.split(BetaJS.Events.EVENT_SPLITTER);
		var event;
		while (true) {
			event = events.shift();
			if (!event)
				break;
			this.__events_mixin_events[event] = this.__events_mixin_events[event] || new BetaJS.Lists.LinkedList();
			this.__events_mixin_events[event].add(this.__create_event_object(callback, context, options));
		}
		return this;
	},
	
	off: function(events, callback, context) {
		this.__events_mixin_events = this.__events_mixin_events || {};
		if (events) {
			events = events.split(BetaJS.Events.EVENT_SPLITTER);
			var event;
			while (true) {
				event = events.shift();
				if (!event)
					break;
				if (this.__events_mixin_events[event]) {
					this.__events_mixin_events[event].remove_by_filter(function (object) {
						var result = (!callback || object.callback == callback) && (!context || object.context == context);
						if (result && this.__destroy_event_object)
							this.__destroy_event_object(object);
						return result;
					});
					if (this.__events_mixin_events[event].count() === 0) {
						this.__events_mixin_events[event].destroy();
						delete this.__events_mixin_events[event];
					}
				}
			}
		} else {
			for (event in this.__events_mixin_events) {
				this.__events_mixin_events[event].remove_by_filter(function (object) {
					var result = (!callback || object.callback == callback) && (!context || object.context == context);
					if (result && this.__destroy_event_object)
						this.__destroy_event_object(object);
					return result;
				});
				if (this.__events_mixin_events[event].count() === 0) {
					this.__events_mixin_events[event].destroy();
					delete this.__events_mixin_events[event];
				}
			}
		}
		return this;
	},
	
	triggerAsync: function () {
		var self = this;
		var args = BetaJS.Functions.getArguments(arguments);
		var timeout = setTimeout(function () {
			clearTimeout(timeout);
			self.trigger.apply(self, args);
		}, 0);
	},

    trigger: function(events) {
    	var self = this;
    	events = events.split(BetaJS.Events.EVENT_SPLITTER);
    	var rest = BetaJS.Functions.getArguments(arguments, 1);
		var event;
		if (!this.__events_mixin_events)
			return this;
		while (true) {
			event = events.shift();
			if (!event)
				break;
    		if (this.__events_mixin_events[event])
    			this.__events_mixin_events[event].iterate(function (object) {
    				self.__call_event_object(object, rest);
    			});
			if (this.__events_mixin_events && "all" in this.__events_mixin_events)
				this.__events_mixin_events["all"].iterate(function (object) {
					self.__call_event_object(object, [event].concat(rest));
				});
		}
    	return this;
    },
    
    once: function (events, callback, context, options) {
        var self = this;
        var once = BetaJS.Functions.once(function() {
          self.off(events, once);
          callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context, options);
    },
    
    delegateEvents: function (events, source, prefix, params) {
    	params = params || []; 
    	prefix = prefix ? prefix + ":" : "";
    	if (events === null) {
    		source.on("all", function (event) {
				var rest = BetaJS.Functions.getArguments(arguments, 1);
				this.trigger.apply(this, [prefix + event].concat(params).concat(rest));
    		}, this);
    	} else {
    		if (!BetaJS.Types.is_array(events))
    			events = [events];
	   		BetaJS.Objs.iter(events, function (event) {
				source.on(event, function () {
					var rest = BetaJS.Functions.getArguments(arguments);
					this.trigger.apply(this, [prefix + event].concat(params).concat(rest));
				}, this);
			}, this);
		}
    }
	
};

BetaJS.Class.extend("BetaJS.Events.Events", BetaJS.Events.EventsMixin);



BetaJS.Events.ListenMixin = {
		
	_notifications: {
		"destroy": "listenOff" 
	},
		
	listenOn: function (target, events, callback, options) {
		if (!this.__listen_mixin_listen) this.__listen_mixin_listen = {};
		this.__listen_mixin_listen[BetaJS.Ids.objectId(target)] = target;
		target.on(events, callback, this, options);
	},
	
	listenOnce: function (target, events, callback, options) {
		if (!this.__listen_mixin_listen) this.__listen_mixin_listen = {};
		this.__listen_mixin_listen[BetaJS.Ids.objectId(target)] = target;
		target.once(events, callback, this, options);
	},
	
	listenOff: function (target, events, callback) {
		if (!this.__listen_mixin_listen)
			return;
		if (target) {
			target.off(events, callback, this);
			if (!events && !callback)
				delete this.__listen_mixin_listen[BetaJS.Ids.objectId(target)];
		}
		else
			BetaJS.Objs.iter(this.__listen_mixin_listen, function (obj) {
				obj.off(events, callback, this);
				if (!events && !callback)
					delete this.__listen_mixin_listen[BetaJS.Ids.objectId(obj)];
			}, this);
	}
	
};

BetaJS.Class.extend("BetaJS.Events.Listen", BetaJS.Events.ListenMixin);

BetaJS.Classes = {};


BetaJS.Classes.AutoDestroyMixin = {
	
	_notifications: {
		construct: "__initialize_auto_destroy",
		destroy: "__finalize_auto_destroy"
	},
	
	__initialize_auto_destroy: function () {
		this.__auto_destroy = {};
	},
	
	__finalize_auto_destroy: function () {
		var copy = this.__auto_destroy;
		this.__auto_destroy = {};
		BetaJS.Objs.iter(copy, function (object) {
			object.unregister(this);
		}, this);
	},

	register_auto_destroy: function (object) {
		if (object.cid() in this.__auto_destroy)
			return;
		this.__auto_destroy[object.cid()] = object;
		object.register(this);
		this._notify("register_auto_destroy", object);
	},
	
	unregister_auto_destroy: function (object) {
		if (!(object.cid() in this.__auto_destroy))
			return;
		this._notify("unregister_auto_destroy", object);
		delete this.__auto_destroy[object.cid()];
		object.unregister(this);
		if (BetaJS.Types.is_empty(this.__auto_destroy))
			this.destroy();
	}
		
};


BetaJS.Class.extend("BetaJS.Classes.AutoDestroyObject", {
		
	constructor: function () {
		this._inherited(BetaJS.Classes.AutoDestroyObject, "constructor");
		this.__objects = {};
	},
	
	register: function (object) {
		var id = BetaJS.Ids.objectId(object);
		if (id in this.__objects)
			return;
		this.__objects[id] = object;
		object.register_auto_destroy(this);
	},
	
	unregister: function (object) {
		var id = BetaJS.Ids.objectId(object);
		if (!(id in this.__objects))
			return;
		delete this.__objects[id];
		object.unregister_auto_destroy(this);
	},
	
	clear: function () {
		BetaJS.Objs.iter(this.__objects, function (object) {
			this.unregister(object);
		}, this);
	}
	
});



BetaJS.Class.extend("BetaJS.Classes.ObjectCache", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (options) {
		this._inherited(BetaJS.Classes.ObjectCache, "constructor");
		this.__size = "size" in options ? options.size : null;
		this.__destroy_on_remove = "destroy_on_remove" in options ? options.destroy_on_remove : true;
		this.__id_to_container= {};
		this.__first = null;
		this.__last = null;
		this.__count = 0;
	},
	
	destroy: function () {
		this.clear();
		this._inherited(BetaJS.Classes.ObjectCache, "destroy");
	},
	
	add: function (object) {
		if (this.get(object))
			return;
		if (this.__size !== null && this.__count >= this.__size && this.__first)
			this.remove(this.__first.object);
		var container = {
			object: object,
			prev: this.__last,
			next: null
		};
		this.__id_to_container[BetaJS.Ids.objectId(object)] = container;
		if (this.__first)
			this.__last.next = container;
		else
			this.__first = container;
		this.__last = container;
		this.__count++;		
		this.trigger("cache", object);
	},
	
	remove: function (id) {
		if (BetaJS.Class.is_class_instance(id))
			id = BetaJS.Ids.objectId(id);
		var container = this.__id_to_container[id];
		if (!container)
			return;
		delete this.__id_to_container[id];
		if (container.next)
			container.next.prev = container.prev;
		else
			this.__last = container.prev;
		if (container.prev)
			container.prev.next = container.next;
		else
			this.__first = container.next;
		this.__count--;		
		this.trigger("release", container.object);
		if (this.__destroy_on_remove)
			container.object.destroy();
	},
	
	get: function (id) {
		if (BetaJS.Class.is_class_instance(id))
			id = BetaJS.Ids.objectId(id);
		return this.__id_to_container[id] ? this.__id_to_container[id].object : null;
	},
	
	clear: function () {
		BetaJS.Objs.iter(this.__id_to_container, function (container) {
			this.remove(container.object);
		}, this);
	}
	
}]);



BetaJS.Classes.ModuleMixin = {
	
	_notifications: {
		construct: function () {
			this.__modules = {};
		},
		destroy: function () {
			BetaJS.Objs.iter(this.__modules, this.remove_module, this);
		}
	},
	
	add_module: function (module) {
		if (module.cid() in this.__modules)
			return;
		this.__modules[module.cid()] = module;
		module.register(this);
		this._notify("add_module", module);
	},
	
	remove_module: function (module) {
		if (!(module.cid() in this.__modules))
			return;
		delete this.__modules[module.cid()];
		module.unregister(this);
		this._notify("remove_module", module);
	}
	
};


BetaJS.Class.extend("BetaJS.Classes.Module", {
		
	constructor: function (options) {
		this._inherited(BetaJS.Classes.Module, "constructor");
		this._objects = {};
		this.__auto_destroy = "auto_destroy" in options ? options.auto_destroy : true;
	},
	
	destroy: function () {
		BetaJS.Objs.iter(this._objects, this.unregister, this);
		this._inherited(BetaJS.Classes.Module, "destroy");
	},
	
	register: function (object) {
		var id = BetaJS.Ids.objectId(object);
		if (id in this._objects)
			return;
		var data = {};
		this._objects[id] = {
			object: object,
			data: data
		};
		object.add_module(this);
		this._register(object, data);
	},
	
	_register: function (object) {},
	
	unregister: function (object) {
		var id = BetaJS.Ids.objectId(object);
		if (!(id in this._objects))
			return;
		var data = this._objects[id].data;
		this._unregister(object, data);
		delete this._objects[id];
		object.remove_module(this);
		if ("off" in object)
			object.off(null, null, this);
		if (this.__auto_destroy && BetaJS.Types.is_empty(this._objects))
			this.destroy();
	},
	
	_unregister: function (object) {},
	
	_data: function (object) {
		return this._objects[BetaJS.Ids.objectId(object)].data;
	}
	
}, {
	
	__instance: null,
	
	singleton: function () {
		if (!this.__instance)
			this.__instance = new this({auto_destroy: false});
		return this.__instance;
	}
	
});



BetaJS.Classes.SyncAsyncMixin = {
	
	isSync: function () {
		return !this._is_async;
	},
	
	isAsync: function () {
		return !!this._is_async;
	},
	
	either: function (callbacks, syncFunc, asyncFunc, useSync) {
		if (BetaJS.Types.is_undefined(useSync))
			useSync = this.isSync();
		return BetaJS.SyncAsync.either(callbacks, useSync, syncFunc, asyncFunc, this);
	},
	
	eitherFactory: function (property, callbacks, syncFunc, asyncFunc) {
		var ctx = this;
		return this.either(callbacks, function () {
			if (!this[property])
				this[property] = syncFunc.apply(this);
			return this[property];				
		}, function () {
			asyncFunc.apply(this, {
				context: callbacks.context,
				success: function (result) {
					ctx[property] = result;
					callbacks.success.call(callbacks.context || obj, result);
				},
				failure: callbacks.failure
			});			
		}, this.isSync() || this[property]);
	},
	
	then: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number",
			callbacks: true,
			success_ctx: "object",
			success: true
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var callbacks = args.callbacks;
		var type = args.type || (this.isSync() ? BetaJS.SyncAsync.SYNC : BetaJS.SyncAsync.ASYNC);
		var success_ctx = args.success_ctx || this;
		var success = args.success;
		return BetaJS.SyncAsync.then(func_ctx, func, params, type, callbacks, success_ctx, success);
	},
	
	thenSingle: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number",
			callbacks: true,
			success_ctx: "object",
			success: true
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var callbacks = args.callbacks;
		var type = args.type || (this.isSync() ? BetaJS.SyncAsync.SYNC : BetaJS.SyncAsync.ASYNCSINGLE);
		var success_ctx = args.success_ctx || this;
		var success = args.success;
		return BetaJS.SyncAsync.then(func_ctx, func, params, type, callbacks, success_ctx, success);
	}
	
};

BetaJS.Properties = {};


BetaJS.Properties.TYPE_VALUE = 0;
BetaJS.Properties.TYPE_BINDING = 1;
BetaJS.Properties.TYPE_COMPUTED = 2;



BetaJS.Properties.PropertiesMixin = {
	
	get: function (key) {
		return key in this.__properties ? this.__properties[key].value : null;
	},
	
	_canSet: function (key, value) {
		return true;
	},
	
	_beforeSet: function (key, value) {
		return value;
	},
	
	_afterSet: function (key, value, options) {
	},
	
	has: function (key) {
		return key in this.__properties;
	},
	
	setAll: function (obj, options) {
		for (var key in obj)
			this.set(key, obj[key], options);
	},
	
	keys: function (mapped) {
		return BetaJS.Objs.keys(this.__properties, mapped);
	},
	
	binding: function (key) {
		return {
			type: BetaJS.Properties.TYPE_BINDING,
			bindee: this,
			property: key
		};
	},
	
	computed : function (f, dependencies) {
		return {
			type: BetaJS.Properties.TYPE_COMPUTED,
			func: f,
			dependencies: dependencies || []
		};
	},
	
	_isBinding: function (object) {
		return BetaJS.Types.is_object(object) && object && object.type && object.type == BetaJS.Properties.TYPE_BINDING && object.bindee && object.property;
	},
	
	_isComputed: function (object) {
		return BetaJS.Types.is_object(object) && object && object.type && object.type == BetaJS.Properties.TYPE_COMPUTED && object.func && object.dependencies;
	},
		
	getAll: function () {
		var obj = {};
		for (var key in this.__properties)
			obj[key] = this.get(key);
		return obj;
	},
	
	unset: function (key) {
		if (key in this.__properties) {
			var entry = this.__properties[key];
			if (entry.type == BetaJS.Properties.TYPE_BINDING) {
				entry.bindee.off("change:" + entry.property, null, this.__properties[key]);
			} else if (entry.type == BetaJS.Properties.TYPE_COMPUTED) {
				var self = this;
				BetaJS.Objs.iter(entry.dependencies, function (dep) {
					if (this._isBinding(dep))
						dep.bindee.off("change:" + dep.property, null, this.__properties[key]);
					else if (this._isTimer(dep))
						entry.timers[dep].destroy();
					else
						self.off("change:" + dep, null, this.__properties[key]);
				}, this);
			}
			delete this.__properties[key];
		}
	},
	
	_set_changed: function (key, old_value, options) {
		this._afterSet(key, this.get(key), old_value, options);
		this.trigger("change", key, this.get(key), old_value, options);
		this.trigger("change:" + key, this.get(key), old_value, options);
	},
	
	_isTimer: function (dep) {
		return BetaJS.Strings.starts_with("dep", "timer:");
	},
	
	_parseTimer: function (dep) {
		return parseInt(BetaJS.Strings.strip_start("timer:"), 10);
	},
	
	set: function (key, value, options) {
		var old = this.get(key);
		if (old == value)
			return; 
		var self = this;
		var entry = this.__properties[key];
		if (this._isBinding(value)) {
			this.unset(key);
			this.__properties[key] = {
				type: BetaJS.Properties.TYPE_BINDING,
				bindee: value.bindee,
				property: value.property,
				value: value.bindee.get(value.property)
			};
			value.bindee.on("change:" + value.property, function () {
				var old = self.__properties[key].value;
				self.__properties[key].value = value.bindee.get(value.property);
				self._set_changed(key, old);
			}, this.__properties[key]);
			this._set_changed(key, old, options);
		} else if (this._isComputed(value)) {
			this.unset(key);
			this.__properties[key] = {
				type: BetaJS.Properties.TYPE_COMPUTED,
				func: value.func,
				dependencies: value.dependencies,
				value: value.func.apply(self),
				timers: {}
			};
			BetaJS.Objs.iter(value.dependencies, function (dep) {
				if (this._isBinding(dep))
					dep.bindee.on("change:" + dep.property, function () {
						var old = self.__properties[key].value;
						self.__properties[key].value = value.func.apply(self);
						self._set_changed(key, old);
					}, this.__properties[key]);
				else if (this._isTimer(dep)) {
					this.__properties[key].timers[dep] = new BetaJS.Timers.Timer({
						delay: this._parseTimer(dep),
						fire: function () {
							var old = self.__properties[key].value;
							self.__properties[key].value = value.func.apply(self);
							self._set_changed(key, old);
						}
					});
				} else
					self.on("change:" + dep, function () {
						var old = self.__properties[key].value;
						self.__properties[key].value = value.func.apply(self);
						self._set_changed(key, old);
					}, this.__properties[key]);
			}, this);
			this._set_changed(key, old);
		} else {
			value = this._beforeSet(key, value);
			if (this._canSet(key, value)) {
				if (this.__properties[key] && this.__properties[key].type == BetaJS.Properties.TYPE_BINDING) {
					this.__properties[key].bindee.set(this.__properties[key].property, value);
				} else {
					this.unset(key);
					this.__properties[key] = {
						type: BetaJS.Properties.TYPE_VALUE,
						value: value
					};
					this._set_changed(key, old, options);
				}
			}
		}
	},
	
	_notifications: {
		"construct": "__properties_construct",
		"destroy": "__properties_destroy"
	},
	
	__properties_construct: function () {
		this.__properties = {};
	},
	
	__properties_destroy: function () {
		for (var key in this.__properties) 
			this.unset(key);
	}
	
};

BetaJS.Class.extend("BetaJS.Properties.Properties", [
	BetaJS.Events.EventsMixin,
	BetaJS.Properties.PropertiesMixin, {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Properties.Properties, "constructor");
		if (obj)
			this.setAll(obj);
	}
	
}]);

BetaJS.Class.extend("BetaJS.Collections.Collection", [
	BetaJS.Events.EventsMixin, {
		
	constructor: function (options) {
		this._inherited(BetaJS.Collections.Collection, "constructor");
		options = options || {};
		var list_options = {};
		if ("compare" in options)
			list_options["compare"] = options["compare"];
		this.__data = new BetaJS.Lists.ArrayList([], list_options);
		var self = this;
		this.__data._ident_changed = function (object, index) {
			self._index_changed(object, index);
		};
		this.__data._re_indexed = function (object) {
			self._re_indexed(object);
		};
		this.__data._sorted = function () {
			self._sorted();
		};
		if ("objects" in options)
			this.add_objects(options["objects"]);
	},
	
	set_compare: function (compare) {
		this.__data.set_compare(compare);
	},
	
	get_compare: function () {
		this.__data.get_compare();
	},

	destroy: function () {
		this.__data.iterate(function (object) {
			if ("off" in object)
				object.off(null, null, this);
		}, this);
		this.__data.destroy();
		this.trigger("destroy");
		this._inherited(BetaJS.Collections.Collection, "destroy");
	},
	
	count: function () {
		return this.__data.count();
	},
	
	_index_changed: function (object, index) {
		this.trigger("index", object, index);
	},
	
	_re_indexed: function (object) {
		this.trigger("reindexed", object);
	},
	
	_sorted: function () {
		this.trigger("sorted");
	},
	
	_object_changed: function (object, key, value) {
		this.trigger("change", object, key, value);
		this.trigger("change:" + key, object, value);
		this.__data.re_index(this.getIndex(object));
	},
	
	add: function (object) {
		if (!BetaJS.Class.is_class_instance(object))
			object = new BetaJS.Properties.Properties(object);
		if (this.exists(object))
			return null;
		var ident = this.__data.add(object);
		if (ident !== null) {
			this.trigger("add", object);
			if ("on" in object)
				object.on("change", function (key, value) {
					this._object_changed(object, key, value);
				}, this);
		}
		return ident;
	},
	
	add_objects: function (objects) {
		BetaJS.Objs.iter(objects, function (object) {
			this.add(object);
		}, this);		
	},
	
	exists: function (object) {
		return this.__data.exists(object);
	},
	
	remove: function (object) {
		if (!this.exists(object))
			return null;
		this.trigger("remove", object);
		var result = this.__data.remove(object);
		if ("off" in object)
			object.off(null, null, this);
		return result;
	},
	
	getByIndex: function (index) {
		return this.__data.get(index);
	},
	
	getById: function (id) {
		return this.__data.get(this.__data.ident_by_id(id));
	},
	
	getIndex: function (object) {
		return this.__data.get_ident(object);
	},
	
	iterate: function (cb, context) {
		this.__data.iterate(cb, context);
	},
	
	clear: function () {
		this.iterate(function (obj) {
			this.remove(obj);
		}, this);
	}
		
}]);



BetaJS.Collections.Collection.extend("BetaJS.Collections.FilteredCollection", {
	
	constructor: function (parent, options) {
		this.__parent = parent;
		options = options || {};
		delete options["objects"];
		options.compare = options.compare || parent.get_compare();
		this._inherited(BetaJS.Collections.FilteredCollection, "constructor", options);
		if ("filter" in options)
			this.filter = options["filter"];
		this.__parent.iterate(function (object) {
			this.add(object);
			return true;
		}, this);
		this.__parent.on("add", this.add, this);
		this.__parent.on("remove", this.remove, this);
	},
	
	filter: function (object) {
		return true;
	},
	
	_object_changed: function (object, key, value) {
		this._inherited(BetaJS.Collections.FilteredCollection, "_object_changed", object, key, value);
		if (!this.filter(object))
			this.__selfRemove(object);
	},
	
	destroy: function () {
		this.__parent.off(null, null, this);
		this._inherited(BetaJS.Collections.FilteredCollection, "destroy");
	},
	
	__selfAdd: function (object) {
		return this._inherited(BetaJS.Collections.FilteredCollection, "add", object);
	},
	
	add: function (object) {
		if (this.exists(object) || !this.filter(object))
			return null;
		var id = this.__selfAdd(object);
		this.__parent.add(object);
		return id;
	},
	
	__selfRemove: function (object) {
		return this._inherited(BetaJS.Collections.FilteredCollection, "remove", object);
	},

	remove: function (object) {
		if (!this.exists(object))
			return null;
		var result = this.__selfRemove(object);
		if (!result)
			return null;
		return this.__parent.remove(object);
	}
	
});

BetaJS.Comparators = {
	
	byObject: function (object) {
		return function (left, right) {
			for (key in object) {
				var c = 0;
				if (BetaJS.Properties.Properties.is_class_instance(left) && BetaJS.Properties.Properties.is_class_instance(right))
					c = BetaJS.Comparators.byValue(left.get(key) || null, right.get(key) || null);
				else
					c = BetaJS.Comparators.byValue(left[key] || null, right[key] || null);
				if (c !== 0)
					return c * object[key];
			}
			return 0;
		};
	},
	
	byValue: function (a, b) {
		if (BetaJS.Types.is_string(a))
			return a.localCompare(b);
		if (a < b)
			return -1;
		if (a > b)
			return 1;
		return 0;
	}
	
};

BetaJS.Sort = {
	
	dependency_sort: function (items, identifier, before, after) {
		var identifierf = BetaJS.Types.is_string(identifier) ? function (obj) { return obj[identifier]; } : identifier;
		var beforef = BetaJS.Types.is_string(before) ? function (obj) { return obj[before]; } : before;
		var afterf = BetaJS.Types.is_string(after) ? function (obj) { return obj[after]; } : after;
		var n = items.length;
		var data = [];
		var identifier_to_index = {};
		var todo = {};
		var i = null;
		for (i = 0; i < n; ++i) {
			todo[i] = true;
			var ident = identifierf(items[i], i);
			identifier_to_index[ident] = i;
			data.push({
				before: {},
				after: {}
			});		
		}
		for (i = 0; i < n; ++i) {
			BetaJS.Objs.iter(beforef(items[i], i) || [], function (before) {
				var before_index = identifier_to_index[before];
				if (BetaJS.Types.is_defined(before_index)) {
					data[i].before[before_index] = true;
					data[before_index].after[i] = true;
				}
			});
			BetaJS.Objs.iter(afterf(items[i]) || [], function (after) {
				var after_index = identifier_to_index[after];
				if (BetaJS.Types.is_defined(after_index)) {
					data[i].after[after_index] = true;
					data[after_index].before[i] = true;
				}
			});
		}
		var result = [];
		while (!BetaJS.Types.is_empty(todo)) {
			for (i in todo) {
				if (BetaJS.Types.is_empty(data[i].after)) {
					delete todo[i];
					result.push(items[i]);
					for (bef in data[i].before)
						delete data[bef].after[i];
				}
			}
		}
		return result;
	}
	
};

BetaJS.Locales = {
	
	__data: {},
	
	get: function (key) {
		return key in this.__data ? this.__data[key] : key;
	},
	
	register: function (strings, prefix) {
		prefix = prefix ? prefix + "." : "";
		for (var key in strings)
			this.__data[prefix + key] = strings[key];
	}
	
};
BetaJS.Time = {
	
	format_time: function(t, s) {
		var seconds = this.seconds(t);
		var minutes = this.minutes(t);
		var hours = this.hours(t);
		var replacers = {
			"hh": hours < 10 ? "0" + hours : hours, 
			"h": hours, 
			"mm": minutes < 10 ? "0" + minutes : minutes, 
			"m": minutes, 
			"ss": seconds < 10 ? "0" + seconds : seconds, 
			"s": seconds
		};
		for (var key in replacers)
			s = s.replace(key, replacers[key]);
		return s;
	},
	
	make: function (data) {
		var t = 0;
		var multipliers = {
			hours: 60,
			minutes: 60,
			seconds: 60,
			milliseconds: 1000
		};
		for (var key in multipliers) {
			t *= multipliers[key];
			if (key in data)
				t += data[key];
		}
		return t;
	},
	
	seconds: function (t) {
		return Math.floor(t / 1000) % 60;
	},
	
	minutes: function (t) {
		return Math.floor(t / 60 / 1000) % 60;
	},

	hours: function (t) {
		return Math.floor(t / 60 / 60 / 1000) % 24;
	},

	days: function (t) {
		return Math.floor(t / 24 / 60 / 60 / 1000);
	},

	now: function () {
		var d = new Date();
		return d.getTime();
	},
	
	ago: function (t) {
		return this.now() - t;
	},
	
	days_ago: function (t) {
		return this.days(this.ago(t));
	},
	
	format_ago: function (t) {
		if (this.days_ago(t) > 1)
			return this.format(t, {time: false});
		else
			return this.format_period(Math.max(this.ago(t), 0)) + " ago";
	},
	
	format_period: function (t) {
		t = Math.round(t / 1000);
		if (t < 60)
			return t + " " + BetaJS.Locales.get(t == 1 ? "second" : "seconds");
		t = Math.round(t / 60);
		if (t < 60)
			return t + " " + BetaJS.Locales.get(t == 1 ? "minute" : "minutes");
		t = Math.round(t / 60);
		if (t < 24)
			return t + " " + BetaJS.Locales.get(t == 1 ? "hour" : "hours");
		t = Math.round(t / 24);
		return t + " " + BetaJS.Locales.get(t == 1 ? "day" : "days");
	},
	
	format: function (t, options) {
		options = BetaJS.Objs.extend({
			time: true,
			date: true,
			locale: true
		}, options || {});
		var d = new Date(t);
		if (options.locale) {
			if (options.date) {
				if (options.time)
					return d.toLocaleString();
				else
					return d.toLocaleDateString();
			} else
				return d.toLocaleTimeString();
		} else {
			if (options.date) {
				if (options.time) 
					return d.toString();
				else
					return d.toDateString();
			} else
				return d.toTimeString();
		}
	}
	
};

BetaJS.Class.extend("BetaJS.Timers.Timer", {
	
	/*
	 * int delay (mandatory): number of milliseconds until it fires
	 * bool once (optional, default false): should it fire infinitely often
	 * func fire (optional): will be fired
	 * object context (optional): for fire
	 * bool start (optional, default true): should it start immediately
	 * 
	 */
	constructor: function (options) {
		this._inherited(BetaJS.Timers.Timer, "constructor");
		options = BetaJS.Objs.extend({
			once: false,
			start: true,
			fire: null,
			context: this,
			destroy_on_fire: false
		}, options);
		this.__delay = options.delay;
		this.__destroy_on_fire = options.destroy_on_fire;
		this.__once = options.once;
		this.__fire = options.fire;
		this.__context = options.context;
		this.__started = false;
		if (options.start)
			this.start();
	},
	
	destroy: function () {
		this.stop();
		this._inherited(BetaJS.Timers.Timer, "destroy");
	},
	
	fire: function () {
		if (this.__once)
			this.__started = false;
		if (this.__fire)
			this.__fire.apply(this.__context, [this]);
		if (this.__destroy_on_fire)
			this.destroy();
	},
	
	stop: function () {
		if (!this.__started)
			return;
		if (this.__once)
			clearTimeout(this.__timer);
		else
			clearInterval(this.__timer);
		this.__started = false;
	},
	
	start: function () {
		if (this.__started)
			return;
		var self = this;
		if (this.__once)
			this.__timer = setTimeout(function () {
				self.fire();
			}, this.__delay);
		else
			this.__timer = setInterval(function () {
				self.fire();
			}, this.__delay);
		this.__started = true;
	},
	
	restart: function () {
		this.stop();
		this.start();
	}
	
});
/*
 * Inspired by Underscore's Templating Engine
 * (which itself is inspired by John Resig's implementation)
 */

BetaJS.Templates = {
	
	tokenize: function (s) {
		// Already tokenized?
		if (BetaJS.Types.is_array(s))
			return s;
		var tokens = [];
		var index = 0;
		s.replace(BetaJS.Templates.SYNTAX_REGEX(), function(match, expr, esc, code, offset) {
			if (index < offset) 
				tokens.push({
					type: BetaJS.Templates.TOKEN_STRING,
					data: BetaJS.Strings.js_escape(s.slice(index, offset))
				});
			if (code)
				tokens.push({type: BetaJS.Templates.TOKEN_CODE, data: code});
			if (expr)
				tokens.push({type: BetaJS.Templates.TOKEN_EXPR, data: expr});
			if (esc)
				tokens.push({type: BetaJS.Templates.TOKEN_ESC, data: esc});
		    index = offset + match.length;
		    return match;
		});
		return tokens;
	},
	
	/*
	 * options
	 *  - start_index: token start index
	 *  - end_index: token end index
	 */
	compile: function(source, options) {
		if (BetaJS.Types.is_string(source))
			source = this.tokenize(source);
		options = options || {};
		var start_index = options.start_index || 0;
		var end_index = options.end_index || source.length;
		var result = "__p+='";
		for (var i = start_index; i < end_index; ++i) {
			switch (source[i].type) {
				case BetaJS.Templates.TOKEN_STRING:
					result += source[i].data;
					break;
				case BetaJS.Templates.TOKEN_CODE:
					result += "';\n" + source[i].data + "\n__p+='";
					break;
				case BetaJS.Templates.TOKEN_EXPR:
					result += "'+\n((__t=(" + source[i].data + "))==null?'':__t)+\n'";
					break;
				case BetaJS.Templates.TOKEN_ESC:
					result += "'+\n((__t=(" + source[i].data + "))==null?'':BetaJS.Strings.htmlentities(__t))+\n'";
					break;
				default:
					break;
			}	
		}
		result += "';\n";
		result = 'with(obj||{}){\n' + result + '}\n';
		result = "var __t,__p='',__j=Array.prototype.join," +
		  "echo=function(){__p+=__j.call(arguments,'');};\n" +
		  result + "return __p;\n";
		var func = new Function('obj', result);
		var func_call = function(data) {
			return func.call(this, data);
		};
		func_call.source = 'function(obj){\n' + result + '}';
		return func_call;
	}
		
};

BetaJS.Templates.SYNTAX = {
	OPEN: "{%",
	CLOSE: "%}",
	MODIFIER_CODE: "",
	MODIFIER_EXPR: "=",
	MODIFIER_ESC: "-"
};

BetaJS.Templates.SYNTAX_REGEX = function () {
	var syntax = BetaJS.Templates.SYNTAX;
	if (!BetaJS.Templates.SYNTAX_REGEX_CACHED)
		BetaJS.Templates.SYNTAX_REGEX_CACHED = new RegExp(
			syntax.OPEN + syntax.MODIFIER_EXPR + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_ESC + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_CODE + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			"$",
		'g');
	return BetaJS.Templates.SYNTAX_REGEX_CACHED;
};

BetaJS.Templates.TOKEN_STRING = 1;
BetaJS.Templates.TOKEN_CODE = 2;
BetaJS.Templates.TOKEN_EXPR = 3;
BetaJS.Templates.TOKEN_ESC = 4;



BetaJS.Class.extend("BetaJS.Templates.Template", {
	
	constructor: function (template_string) {
		this._inherited(BetaJS.Templates.Template, "constructor");
		this.__tokens = BetaJS.Templates.tokenize(template_string);
		this.__compiled = BetaJS.Templates.compile(this.__tokens);
	},
	
	evaluate: function (obj) {
		return this.__compiled.apply(this, [obj]);
	}
	
}, {
	
	bySelector: function (selector) {
		return new this(BetaJS.$(selector).html());
	}
	
});
/*
 * <ul>
 *  <li>uri: target uri</li>
 *  <li>method: get, post, ...</li>
 *  <li>data: data as JSON to be passed with the request</li>
 *  <li>success_callback(data): will be called when request was successful</li>
 *  <li>failure_callback(status_code, status_text, data): will be called when request was not successful</li>
 *  <li>complete_callback(): will be called when the request has been made</li>
 * </ul>
 * 
 */
BetaJS.Class.extend("BetaJS.Net.AbstractAjax", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Net.AbstractAjax, "constructor");
		this.__options = BetaJS.Objs.extend({
			"method": "GET",
			"data": {}
		}, options);
	},
	
	syncCall: function (options) {
		var opts = BetaJS.Objs.clone(this.__options, 1);
		opts = BetaJS.Objs.extend(opts, options);
		var success_callback = opts.success_callback;
		delete opts["success_callback"];
		var failure_callback = opts.failure_callback;
		delete opts["failure_callback"];
		var complete_callback = opts.complete_callback;
		delete opts["complete_callback"];
		try {
			var result = this._syncCall(opts);
			if (success_callback)
				success_callback(result);
			if (complete_callback)
				complete_callback();
			return result;
		} catch (e) {
			e = BetaJS.Exceptions.ensure(e);
			e.assert(BetaJS.Net.AjaxException);
			if (failure_callback)
				failure_callback(e.status_code(), e.status_text(), e.data());
			else
				throw e;
		}
		return false;
	},
	
	asyncCall: function (options) {
		var opts = BetaJS.Objs.clone(this.__options, 1);
		opts = BetaJS.Objs.extend(opts, options);
		var success_callback = opts.success_callback;
		delete opts["success_callback"];
		var failure_callback = opts.failure_callback;
		delete opts["failure_callback"];
		var complete_callback = opts.complete_callback;
		delete opts["complete_callback"];
		try {
			var result = this._asyncCall(BetaJS.Objs.extend({
				"success": function (data) {
					if (success_callback)
						success_callback(data);
					if (complete_callback)
						complete_callback();
				},
				"failure": function (status_code, status_text, data) {
					if (failure_callback)
						failure_callback(status_code, status_text, data);
					else
						throw new BetaJS.Net.AjaxException(status_code, status_text, data);
					if (complete_callback)
						complete_callback();
				}
			}, opts));
			return result;
		} catch (e) {
			e = BetaJS.Exceptions.ensure(e);
			e.assert(BetaJS.Net.AjaxException);
			if (failure_callback)
				failure_callback(e.status_code(), e.status_text(), e.data());
			else
				throw e;
		}
		return false;
	},
	
	call: function (options) {
		if (!("async" in options))
			return false;
		var async = options["async"];
		delete options["async"];
		return async ? this.asyncCall(options) : this.syncCall(options);
	},
	
	_syncCall: function (options) {},
	
	_asyncCall: function (options) {}
	
});


BetaJS.Exceptions.Exception.extend("BetaJS.Net.AjaxException", {
	
	constructor: function (status_code, status_text, data) {
		this._inherited(BetaJS.Net.AjaxException, "constructor", status_code + ": " + status_text);
		this.__status_code = status_code;
		this.__status_text = status_text;
		this.__data = data;
	},
	
	status_code: function () {
		return this.__status_code;
	},
	
	status_text: function () {
		return this.__status_text;
	},
	
	data: function () {
		return this.__data;
	},
	
	json: function () {
		var obj = this._inherited(BetaJS.Net.AjaxException, "json");
		obj.data = this.data();
		return obj;
	}
	

});

BetaJS.Net = BetaJS.Net || {};

BetaJS.Net.HttpHeader = {
	
	HTTP_STATUS_OK : 200,
	HTTP_STATUS_CREATED : 201,
	HTTP_STATUS_PAYMENT_REQUIRED : 402,
	HTTP_STATUS_FORBIDDEN : 403,
	HTTP_STATUS_NOT_FOUND : 404,
	HTTP_STATUS_PRECONDITION_FAILED : 412,
	HTTP_STATUS_INTERNAL_SERVER_ERROR : 500,
	
	format: function (code, prepend_code) {
		var ret = "";
		if (code == this.HTTP_STATUS_OK)
			ret = "OK";
		else if (code == this.HTTP_STATUS_CREATED)
			ret = "Created";
		else if (code == this.HTTP_STATUS_PAYMENT_REQUIRED)
			ret = "Payment Required";
		else if (code == this.HTTP_STATUS_FORBIDDEN)
			ret = "Forbidden";
		else if (code == this.HTTP_STATUS_NOT_FOUND)
			ret = "Not found";
		else if (code == this.HTTP_STATUS_PRECONDITION_FAILED)
			ret = "Precondition Failed";
		else if (code == this.HTTP_STATUS_INTERNAL_SERVER_ERROR)
			ret = "Internal Server Error";
		else
			ret = "Other Error";
		return prepend_code ? (code + " " + ret) : ret;
	}
	
};
BetaJS.Net = BetaJS.Net || {};

BetaJS.Net.Uri = {
	
	build: function (obj) {
		var s = "";
		if (obj.username)
			s += obj.username + ":";
		if (obj.password)
			s += obj.password + "@";
		s += obj.server;
		if (obj.port)
			s += ":" + obj.port;
		if (obj.path)
			s += "/" + obj.path;
		return s;
	},
	
	encodeUriParams: function (arr, prefix) {
		prefix = prefix || "";
		var res = [];
		BetaJS.Objs.iter(arr, function (value, key) {
			if (BetaJS.Types.is_object(value))
				res = res.concat(this.encodeUriParams(value, prefix + key + "_"));
			else
				res.push(prefix + key + "=" + encodeURI(value));
		}, this);
		return res.join("&");
	},
	
	appendUriParams: function (uri, arr, prefix) {
		return BetaJS.Types.is_empty(arr) ? uri : (uri + (uri.indexOf("?") != -1 ? "&" : "?") + this.encodeUriParams(arr, prefix));
	},
	
	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License

	parse: function (str, strict) {
		var parser = strict ? this.__parse_strict_regex : this.__parse_loose_regex;
		var m = parser.exec(str);
		var uri = {};
		for (var i = 0; i < this.__parse_key.length; ++i)
			uri[this.__parse_key[i]] = m[i] || "";
		uri.queryKey = {};
		uri[this.__parse_key[12]].replace(this.__parse_key_parser, function ($0, $1, $2) {
			if ($1) uri.queryKey[$1] = $2;
		});

		return uri;
	},
	
	__parse_strict_regex: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
	__parse_loose_regex: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
	__parse_key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	__parse_key_parser: /(?:^|&)([^&=]*)=?([^&]*)/g

};
/*!
  betajs - v0.0.2 - 2014-03-10
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Queries = {

	/*
	 * Syntax:
	 *
	 * queries :== [query, ...]
	 * simples :== [simple, ...]
	 * query :== {pair, ...}
	 * pair :== string: value | $or : queries | $and: queries
	 * value :== simple | {condition, ...}  
	 * condition :== $in: simples | $gt: simple | $lt: simple | $sw: simple | $gtic: simple | $ltic: simple | $swic: simple
	 *
	 */
	
	__increase_dependency: function (key, dep) {
		if (key in dep)
			dep[key]++;
		else
			dep[key] = 1;
		return dep;		
	},
	
	__dependencies_queries: function (queries, dep) {
		BetaJS.Objs.iter(queries, function (query) {
			dep = this.__dependencies_query(query, dep);
		}, this);
		return dep;
	},
	
	__dependencies_query: function (query, dep) {
		for (key in query)
			dep = this.__dependencies_pair(key, query[key], dep);
		return dep;
	},
	
	__dependencies_pair: function (key, value, dep) {
		if (key == "$or" || key == "$and")
			return this.__dependencies_queries(value, dep);
		else
			return this.__increase_dependency(key, dep);
	},

	dependencies : function(query) {
		return this.__dependencies_query(query, {});
	},
		
	__evaluate_query: function (query, object) {
		for (var key in query) {
			if (!this.__evaluate_pair(key, query[key], object))
				return false;
		}
		return true;
	},
	
	__evaluate_pair: function (key, value, object) {
		if (key == "$or")
			return this.__evaluate_or(value, object);
		if (key == "$and")
			return this.__evaluate_and(value, object);
		return this.__evaluate_value(value, object[key]);
	},
	
	__evaluate_value: function (value, object_value) {
		if (BetaJS.Types.is_object(value)) {
			var result = true;
			BetaJS.Objs.iter(value, function (tar, op) {
				if (op == "$in")
					result = result && BetaJS.Objs.contains_value(tar, object_value);
				if (op == "$gt")
					result = result && object_value >= tar;
				if (op == "$gtic")
					result = result && object_value.toLowerCase() >= tar.toLowerCase();
				if (op == "$lt")
					result = result && object_value <= tar;
				if (op == "$ltic")
					result = result && object_value.toLowerCase() <= tar.toLowerCase();
				if (op == "$sw")
					result = result && object_value.indexOf(tar) === 0;
				if (op == "$swic")
					result = result && object_value.toLowerCase().indexOf(tar.toLowerCase()) === 0;
			}, this);
			return result;
		}
		return value == object_value;
	},
	
	__evaluate_or: function (arr, object) {
		BetaJS.Objs.iter(arr, function (query) {
			if (this.__evaluate_query(query, object))
				return true;
		}, this);
		return false;
	},
	
	__evaluate_and: function (arr, object) {
		BetaJS.Objs.iter(arr, function (query) {
			if (!this.__evaluate_query(query, object))
				return false;
		}, this);
		return true;
	},
	
	format: function (query) {
		if (BetaJS.Class.is_class_instance(query))
			return query.format();
		return JSON.stringify(query);
	},
	
	overloaded_evaluate: function (query, object) {
		if (BetaJS.Class.is_class_instance(query))
			return query.evaluate(object);
		if (BetaJS.Types.is_function(query))
			return query(object);
		return this.evaluate(query, object);
	},
	
	evaluate : function(query, object) {
		return this.__evaluate_query(query, object);
	},
/*
	__compile : function(query) {
		if (BetaJS.Types.is_array(query)) {
			if (query.length == 0)
				throw "Malformed Query";
			var op = query[0];
			if (op == "Or") {
				var s = "false";
				for (var i = 1; i < query.length; ++i)
					s += " || (" + this.__compile(query[i]) + ")";
				return s;
			} else if (op == "And") {
				var s = "true";
				for (var i = 1; i < query.length; ++i)
					s += " && (" + this.__compile(query[i]) + ")";
				return s;
			} else {
				if (query.length != 3)
					throw "Malformed Query";
				var key = query[1];
				var value = query[2];
				var left = "object['" + key + "']";
				var right = BetaJS.Types.is_string(value) ? "'" + value + "'" : value;
				return left + " " + op + " " + right;
			}
		} else if (BetaJS.Types.is_object(query)) {
			var s = "true";
			for (key in query)
				s += " && (object['" + key + "'] == " + (BetaJS.Types.is_string(query[key]) ? "'" + query[key] + "'" : query[key]) + ")";
			return s;
		} else
			throw "Malformed Query";
	},

	compile : function(query) {
		var result = this.__compile(query);
		var func = new Function('object', result);
		var func_call = function(data) {
			return func.call(this, data);
		};
		func_call.source = 'function(object){\n return ' + result + '; }';
		return func_call;		
	},
*/	
	emulate: function (query, query_function, query_context) {
		var raw = query_function.apply(query_context || this, {});
		var iter = raw;
		if (!raw)
			iter = BetaJS.Iterators.ArrayIterator([]);
		else if (BetaJS.Types.is_array(raw))
			iter = BetaJS.Iterators.ArrayIterator(raw);		
		return new BetaJS.Iterators.FilteredIterator(iter, function(row) {
			return BetaJS.Queries.evaluate(query, row);
		});
	}	
	
}; 
BetaJS.Queries.Constrained = {
	
	make: function (query, options) {
		return {
			query: query,
			options: options || {}
		};
	},
	
	format: function (instance) {
		var query = instance.query;
		instance.query = BetaJS.Queries.format(query);
		var result = JSON.stringify(instance);
		instance.query = query;
		return result;
	},
	
	emulate: function (constrained_query, query_capabilities, query_function, query_context, callbacks) {
		var query = constrained_query.query;
		var options = constrained_query.options;
		var execute_query = {};
		var execute_options = {};
		if ("sort" in options && "sort" in query_capabilities)
			execute_options.sort = options.sort;
		// Test
		execute_query = query;
		if ("query" in query_capabilities || BetaJS.Types.is_empty(query)) {
			execute_query = query;
			if (!("sort" in options) || "sort" in query_capabilities) {
				if ("skip" in options && "skip" in query_capabilities)
					execute_options.skip = options.skip;
				if ("limit" in options && "limit" in query_capabilities)
					execute_options.limit = options.limit;
			}
		}
		var params = [execute_query, execute_options];
		if (callbacks)
			params.push(callbacks);
		var success_call = function (raw) {
			var iter = raw;
			if (raw === null)
				iter = new BetaJS.Iterators.ArrayIterator([]);
			else if (BetaJS.Types.is_array(raw))
				iter = new BetaJS.Iterators.ArrayIterator(raw);		
			if (!("query" in query_capabilities || BetaJS.Types.is_empty(query)))
				iter = new BetaJS.Iterators.FilteredIterator(iter, function(row) {
					return BetaJS.Queries.evaluate(query, row);
				});
			if ("sort" in options && !("sort" in execute_options))
				iter = new BetaJS.Iterators.SortedIterator(iter, BetaJS.Comparators.byObject(options.sort));
			if ("skip" in options && !("skip" in execute_options))
				iter = new BetaJS.Iterators.SkipIterator(iter, options["skip"]);
			if ("limit" in options && !("limit" in execute_options))
				iter = new BetaJS.Iterators.LimitIterator(iter, options["limit"]);
			if (callbacks && callbacks.success)
				callbacks.success(iter);
			return iter;
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception(e);
			else
				throw e;
		};
		if (callbacks)
			query_function.apply(query_context || this,[execute_query, execute_options, {success: success_call, exception: exception_call}]);
		else
			try {
				var raw = query_function.apply(query_context || this, [execute_query, execute_options]);
				return success_call(raw);
			} catch (e) {
				exception_call(e);
			}
		return true;	
	}
	
	

}; 

BetaJS.Collections.Collection.extend("BetaJS.Collections.QueryCollection", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Collections.QueryCollection, "constructor", options);
		this.__query = BetaJS.Objs.extend({
			func: null,
			select: {},
			skip: 0,
			limit: null,
			forward_steps: null,
			backward_steps: null,
			range: null,
			count: null,
			sort: {}
		}, options.query);
		if (!("objects" in options))
			options.objects = this.__execute_query(this.__query.skip, this.__query.limit, true);
	},
	
	__execute_query: function (skip, limit, clear_before) {
		skip = Math.max(skip, 0);
		var q = {};
		var objs = null;
		var iter = null;
		if (this.__query.sort && !BetaJS.Types.is_empty(this.__query.sort))
			q.sort = this.__query.sort;
		if (clear_before) {
			if (skip > 0)
				q.skip = skip;
			if (limit !== null)
				q.limit = limit;
			iter = this.__query.func(this.__query.select, q);
			objs = iter.asArray();
			this.__query.skip = skip;
			this.__query.limit = limit;
			this.__query.count = !limit || objs.length < limit ? skip + objs.length : null;
			this.clear();
			this.add_objects(objs);
		} else if (skip < this.__query.skip) {
			limit = this.__query.skip - skip;
			if (skip > 0)
				q.skip = skip;
			q.limit = limit;
			iter = this.__query.func(this.__query.select, q);
			objs = iter.asArray();
			this.__query.skip = skip;
			this.__query.limit = !this.__query.limit ? null : this.__query.limit + objs.length;
			this.add_objects(objs);
		} else if (skip >= this.__query.skip) {
			if (this.__query.limit && (!limit || skip + limit > this.__query.skip + this.__query.limit)) {
				limit = (skip + limit) - (this.__query.skip + this.__query.limit);
				skip = this.__query.skip + this.__query.limit;
				if (skip > 0)
					q.skip = skip;
				if (limit)
					q.limit = limit;
				iter = this.__query.func(this.__query.select, q);
				objs = iter.asArray();
				this.__query.limit = this.__query.limit + objs.length;
				if (limit > objs.length)
					this.__query.count = skip + objs.length;
				this.add_objects(objs);
			}
		}
	},
	
	increase_forwards: function (steps) {
		steps = !steps ? this.__query.forward_steps : steps;
		if (!steps || !this.__query.limit)
			return;
		this.__execute_query(this.__query.skip + this.__query.limit, steps, false);
	},
	
	increase_backwards: function (steps) {
		steps = !steps ? this.__query.backward_steps : steps;
		if (steps && this.__query.skip > 0) {
			steps = Math.min(steps, this.__query.skip);
			this.__execute_query(this.__query.skip - steps, steps, false);
		}
	},
	
	paginate: function (index) {
		this.__execute_query(this.__query.range * index, this.__query.range, true);
	},
	
	paginate_index: function () {
		return !this.__query.range ? null : Math.floor(this.__query.skip / this.__query.range);
	},
	
	paginate_count: function () {
		return !this.__query.count || !this.__query.range ? null : Math.ceil(this.__query.count / this.__query.range);
	},
	
	next: function () {
		var paginate_index = this.paginate_index();
		if (!paginate_index)
			return;
		var paginate_count = this.paginate_count();
		if (!paginate_count || paginate_index < this.paginate_count() - 1)
			this.paginate(paginate_index + 1);
	},
	
	prev: function () {
		var paginate_index = this.paginate_index();
		if (!paginate_index)
			return;
		if (paginate_index > 0)
			this.paginate(paginate_index - 1);
	},
	
	isComplete: function () {
		return this.__query.count !== null;
	}
	
});
BetaJS.Class.extend("BetaJS.Queries.ActiveQueryEngine", {
	
	constructor: function () {
		this._inherited(BetaJS.Queries.ActiveQueryEngine, "constructor");
		this.__aqs = {};
		this.__object_to_aqs = {};
	},
	
	__valid_for_aq: function (raw, aq) {
		return BetaJS.Queries.evaluate(aq.query(), raw);
	},
	
	insert: function (object) {
		if (this.__object_to_aqs[BetaJS.Ids.objectId(object)])
			return;
		var raw = object.getAll();
		var aqs = {};
		this.__object_to_aqs[BetaJS.Ids.objectId(object)] = aqs;
		BetaJS.Objs.iter(this.__aqs, function (aq) {
			if (this.__valid_for_aq(raw, aq)) {
				aq._add(object);
				aqs[aq.cid()] = aq;
			}
		}, this);
		object.on("change", function () {
			this.update(object);
		}, this);
	},
	
	remove: function (object) {
		BetaJS.Objs.iter(this.__object_to_aqs[BetaJS.Ids.objectId(object)], function (aq) {
			aq._remove(object);
		}, this);
		delete this.__object_to_aqs[BetaJS.Ids.objectId(object)];
		object.off(null, this, null);
	},
	
	update: function (object) {
		var raw = object.getAll();
		var aqs = this.__object_to_aqs[BetaJS.Ids.objectId(object)];
		BetaJS.Objs.iter(this.__object_to_aqs[BetaJS.Ids.objectId(object)], function (aq) {
			if (!this.__valid_for_aq(raw, aq)) {
				aq._remove(object);
				delete aqs[aq.cid()];
			}
		}, this);
		BetaJS.Objs.iter(this.__aqs, function (aq) {
			if (this.__valid_for_aq(raw, aq)) {
				aq._add(object);
				aqs[aq.cid()] = aq;
			}
		}, this);
	},
	
	register: function (aq) {
		this.__aqs[aq.cid()] = aq;
		var query = aq.query();
		var result = this._query(query);
		while (result.hasNext()) {
			var object = result.next();
			if (this.__object_to_aqs[BetaJS.Ids.objectId(object)]) {
				this.__object_to_aqs[BetaJS.Ids.objectId(object)][aq.cid()] = aq;
				aq._add(object);
			} else
				this.insert(object);
		}
	},
	
	unregister: function (aq) {
		delete this.__aqs[aq.cid()];
		var self = this;
		aq.collection().iterate(function (object) {
			delete self.__object_to_aqs[BetaJS.Ids.objectId(object)][aq.cid()];
		});
	},
	
	_query: function (query) {
	}
	
});

BetaJS.Class.extend("BetaJS.Queries.ActiveQuery", {
	
	constructor: function (engine, query) {
		this._inherited(BetaJS.Queries.ActiveQuery, "constructor");
		this.__engine = engine;
		this.__query = query;
		this.__collection = new BetaJS.Collections.Collection();
		this.__collection.on("destroy", function () {
			this.destroy();
		}, this);
		engine.register(this);
	},
	
	destroy: function () {
		this.__engine.unregister(this);
		this._inherited(BetaJS.Queries.ActiveQuery, "destroy");
	},
	
	isUniform: function () {
		return BetaJS.Types.is_empty(this.query());
	},
	
	engine: function () {
		return this.__engine;
	},
	
	query: function () {
		return this.__query;
	},
	
	collection: function () {
		return this.__collection;
	},
	
	_add: function (object) {
		this.__collection.add(object);		
	},
	
	_remove: function (object) {
		this.__collection.remove(object);
	},
	
	change_query: function (query) {
		this.__engine.unregister(this);
		this.__query = query;
		this.__collection.clear();
		this.__engine.register(this);
	}
	
});

BetaJS.Exceptions.Exception.extend("BetaJS.Stores.StoreException");


/** @class */
BetaJS.Stores.BaseStore = BetaJS.Class.extend("BetaJS.Stores.BaseStore", [
	BetaJS.Events.EventsMixin,
	/** @lends BetaJS.Stores.BaseStore.prototype */
	{
		
	constructor: function (options) {
		this._inherited(BetaJS.Stores.BaseStore, "constructor");
		options = options || {};
		this._id_key = options.id_key || "id";
		this._create_ids = options.create_ids || false;
		this._last_id = 1;
		this._async_write = "async_write" in options ? options.async_write : false;
		this._async_write = this._async_write && this._supports_async_write();
		this._async_read = "async_read" in options ? options.async_read : false;
		this._async_read = this._async_read && this._supports_async_read();
	},
	
	id_key: function () {
		return this._id_key;
	},
	
	_supports_async_read: function () {
		return false;
	},
	
	async_read: function () {
		return this._async_read;
	},
			
	_supports_async_write: function () {
		return false;
	},
	
	async_write: function () {
		return this._async_write;
	},

	/** Insert data to store. Return inserted data with id.
	 * 
 	 * @param data data to be inserted
 	 * @return data that has been inserted with id.
 	 * @exception if it fails
	 */
	_insert: function (data, callbacks) {
	},
	
	/** Remove data from store. Return removed data.
	 * 
 	 * @param id data id
 	 * @exception if it fails
	 */
	_remove: function (id, callbacks) {
	},
	
	/** Get data from store by id.
	 * 
	 * @param id data id
	 * @return data
	 * @exception if it fails
	 */
	_get: function (id, callbacks) {
	},
	
	/** Update data by id.
	 * 
	 * @param id data id
	 * @param data updated data
	 * @return data from store
	 * @exception if it fails
	 */
	_update: function (id, data, callbacks) {
	},
	
	_query_capabilities: function () {
		return {};
	},
	
	/*
	 * @exception if it fails
	 */
	_query: function (query, options, callbacks) {
	},
	
	_new_id: function (callbacks) {
	},

	insert: function (data, callbacks) {
		if (this._create_ids && !(this._id_key in data && data[this._id_key])) {
			if (this._async_write)
				throw new BetaJS.Stores.StoreException("Unsupported Creation of Ids");
			while (this.get(this._last_id))
				this._last_id++;
			data[this._id_key] = this._last_id;
		}
		var self = this;
		var success_call = function (row) {
			self.trigger("insert", row);
			if (callbacks && callbacks.success)
				callbacks.success(row);
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception(e);
			else
				throw e;
		};
		if (this._async_write)
			this._insert(data, {success: success_call, exception: exception_call});
		else
			try {
				var row = this._insert(data);
				success_call(row);
				return row;
			} catch (e) {
				exception_call(e);
			}
		return null;
	},
	
	insert_all: function (data) {
		if (this._async_write) {
			var i = -1;
			var self = this;
			var success = function () {
				i++;
				if (i < data.length)
					self.insert(data[i], {success: success});
			};
			success();
		} else {
			var result = true;
			BetaJS.Objs.iter(data, function (obj) {
				result = result && this.insert(obj);
			}, this);
			return result;
		}
		return null;
	},

	remove: function (id, callbacks) {
		var self = this;
		var success_call = function () {
			self.trigger("remove", id);
			if (callbacks && callbacks.success)
				callbacks.success(id);
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception(e);
			else
				throw e;
		};
		if (this._async_write)
			this._remove(id, {success: success_call, exception: exception_call});
		else
			try {
				this._remove(id);
				success_call();
			} catch (e) {
				exception_call(e);
			}
	},
	
	get: function (id, callbacks) {
		var self = this;
		var success_call = function (row) {
			if (callbacks && callbacks.success)
				callbacks.success(row);
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception(e);
			else
				throw e;
		};
		if (this._async_read)
			this._get(id, {success: success_call, exception: exception_call});
		else
			try {
				var row = this._get(id);
				success_call(row);
				return row;
			} catch (e) {
				exception_call(e);
			}
		return null;
	},
	
	update: function (id, data, callbacks) {
		var self = this;
		var success_call = function (row) {
			self.trigger("update", row, data);
			if (callbacks && callbacks.success)
				callbacks.success(row, data);
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception(e);
			else
				throw e;
		};
		if (this._async_write)
			this._update(id, data, {success: success_call, exception: exception_call});
		else
			try {
				var row = this._update(id, data);
				success_call(row);
				return row;
			} catch (e) {
				exception_call(e);
			}
		return null;
	},
	
	query: function (query, options, callbacks) {
		return BetaJS.Queries.Constrained.emulate(
			BetaJS.Queries.Constrained.make(query, options || {}),
			this._query_capabilities(),
			this._query,
			this,
			callbacks); 
	},
	
	_query_applies_to_id: function (query, id) {
		var row = this.get(id);
		return row && BetaJS.Queries.overloaded_evaluate(query, row);
	},
	
	clear: function () {
		var iter = this.query({});
		while (iter.hasNext())
			this.remove(iter.next().id);
	},
	
	_ensure_index: function (key) {
	},
	
	ensure_index: function (key) {
		this._ensure_index(key);
	}

}]);

BetaJS.Class.extend("BetaJS.Stores.StoresMonitor", [
	BetaJS.Events.EventsMixin,
{
	attach: function (ident, store) {
		store.on("insert", function (row) {
			this.trigger("insert", ident, store, row);
			this.trigger("write", "insert", ident, store, row);
		}, this);
		store.on("remove", function (id) {
			this.trigger("remove", ident, store, id);
			this.trigger("write", "remove", ident, store, id);
		}, this);
		store.on("update", function (row, data) {
			this.trigger("update", ident, store, row, data);
			this.trigger("write", "update", ident, store, row, data);
		}, this);
	}
		
}]);

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.AssocStore", {
	
	_read_key: function (key) {},
	_write_key: function (key, value) {},
	_remove_key: function (key) {},
	_iterate: function () {},
	
	constructor: function (options) {
		options = options || {};
		options.create_ids = true;
		this._inherited(BetaJS.Stores.AssocStore, "constructor", options);
	},
	
	_insert: function (data) {
		this._write_key(data[this._id_key], data);
		return data;
	},
	
	_remove: function (id) {
		var row = this._read_key(id);
		if (row && !this._remove_key(id))
			return null;
		return row;
	},
	
	_get: function (id) {
		return this._read_key(id);
	},
	
	_update: function (id, data) {
		var row = this._get(id);
		if (row) {
			delete data[this._id_key];
			BetaJS.Objs.extend(row, data);
			this._write_key(id, row);
		}
		return row;
	},
	
	_query: function (query, options) {
		return this._iterate();
	}

});

BetaJS.Stores.AssocStore.extend("BetaJS.Stores.MemoryStore", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.MemoryStore, "constructor", options);
		this.__data = {};
	},

	_read_key: function (key) {
		return this.__data[key];
	},
	
	_write_key: function (key, value) {
		this.__data[key] = value;
	},
	
	_remove_key: function (key) {
		delete this.__data[key];
	},
	
	_iterate: function () {
		return new BetaJS.Iterators.ObjectValuesIterator(this.__data);
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.DumbStore", {
	
	_read_last_id: function () {},
	_write_last_id: function (id) {},
	_remove_last_id: function () {},
	_read_first_id: function () {},
	_write_first_id: function (id) {},
	_remove_first_id: function () {},
	_read_item: function (id) {},
	_write_item: function (id, data) {},
	_remove_item: function (id) {},
	_read_next_id: function (id) {},
	_write_next_id: function (id, next_id) {},
	_remove_next_id: function (id) {},
	_read_prev_id: function (id) {},
	_write_prev_id: function (id, prev_id) {},
	_remove_prev_id: function (id) {},
	
	constructor: function (options) {
		options = options || {};
		options.create_ids = true;
		this._inherited(BetaJS.Stores.DumbStore, "constructor", options);
	},

	_insert: function (data) {
		var last_id = this._read_last_id();
		var id = data[this._id_key];
		if (last_id !== null) {
			this._write_next_id(last_id, id);
			this._write_prev_id(id, last_id);
		} else
			this._write_first_id(id);
		this._write_last_id(id);
		this._write_item(id, data);
		return data;
	},
	
	_remove: function (id) {
		var row = this._read_item(id);
		if (row) {
			this._remove_item(id);
			var next_id = this._read_next_id(id);
			var prev_id = this._read_prev_id(id);
			if (next_id !== null) {
				this._remove_next_id(id);
				if (prev_id !== null) {
					this._remove_prev_id(id);
					this._write_next_id(prev_id, next_id);
					this._write_prev_id(next_id, prev_id);
				} else {
					this._remove_prev_id(next_id);
					this._write_first_id(next_id);
				}
			} else if (prev_id !== null) {
				this._remove_next_id(prev_id);
				this._write_last_id(prev_id);
			} else {
				this._remove_first_id();
				this._remove_last_id();
			}
		}
		return row;
	},
	
	_get: function (id) {
		return this._read_item(id);
	},
	
	_update: function (id, data) {
		var row = this._get(id);
		if (row) {
			delete data[this._id_key];
			BetaJS.Objs.extend(row, data);
			this._write_item(id, row);
		}
		return row;
	},
	
	_query_capabilities: function () {
		return {
			query: true
		};
	},

	_query: function (query, options) {
		var iter = new BetaJS.Iterators.Iterator();
		var store = this;
		var fid = this._read_first_id();
		BetaJS.Objs.extend(iter, {
			__id: fid === null ? 1 : fid,
			__store: store,
			__query: query,
			
			hasNext: function () {
				var last_id = this.__store._read_last_id();
				if (last_id === null)
					return false;
				while (this.__id < last_id && !this.__store._read_item(this.__id))
					this.__id++;
				while (this.__id <= last_id) {
					if (this.__store._query_applies_to_id(query, this.__id))
						return true;
					if (this.__id < last_id)
						this.__id = this.__store._read_next_id(this.__id);
					else
						this.__id++;
				}
				return false;
			},
			
			next: function () {
				if (this.hasNext()) {
					var item = this.__store.get(this.__id);
					if (this.__id == this.__store._read_last_id())
						this.__id++;
					else
						this.__id = this.__store._read_next_id(this.__id);
					return item;
				}
				return null;
			}
		});
		return iter;
	}	
	
});

BetaJS.Stores.DumbStore.extend("BetaJS.Stores.AssocDumbStore", {
	
	_read_key: function (key) {},
	_write_key: function (key, value) {},
	_remove_key: function (key) {},
	
	__read_id: function (key) {
		var raw = this._read_key(key);
		return raw ? parseInt(raw, 10) : null;
	},
	
	_read_last_id: function () {
		return this.__read_id("last_id");
	},
	
	_write_last_id: function (id) {
		this._write_key("last_id", id);
	},

	_remove_last_id: function () {
		this._remove_key("last_id");
	},

	_read_first_id: function () {
		return this.__read_id("first_id");
	},
	
	_write_first_id: function (id) {
		this._write_key("first_id", id);
	},
	
	_remove_first_id: function () {
		this._remove_key("first_id");
	},

	_read_item: function (id) {
		return this._read_key("item_" + id);
	},

	_write_item: function (id, data) {
		this._write_key("item_" + id, data);
	},
	
	_remove_item: function (id) {
		this._remove_key("item_" + id);
	},
	
	_read_next_id: function (id) {
		return this.__read_id("next_" + id);
	},

	_write_next_id: function (id, next_id) {
		this._write_key("next_" + id, next_id);
	},
	
	_remove_next_id: function (id) {
		this._remove_key("next_" + id);
	},
	
	_read_prev_id: function (id) {
		return this.__read_id("prev_" + id);
	},

	_write_prev_id: function (id, prev_id) {
		this._write_key("prev_" + id, prev_id);
	},

	_remove_prev_id: function (id) {
		this._remove_key("prev_" + id);
	}
	
});

BetaJS.Stores.AssocDumbStore.extend("BetaJS.Stores.LocalStore", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.LocalStore, "constructor", options);
		this.__prefix = options.prefix;
	},
	
	__key: function (key) {
		return this.__prefix + key;
	},
	
	_read_key: function (key) {
		var prfkey = this.__key(key);
		return prfkey in localStorage ? JSON.parse(localStorage[prfkey]) : null;
	},
	
	_write_key: function (key, value) {
		localStorage[this.__key(key)] = JSON.stringify(value);
	},
	
	_remove_key: function (key) {
		delete localStorage[this.__key(key)];
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.DualStore", {
	
	constructor: function (first, second, options) {
		options = BetaJS.Objs.extend({
			create_options: {},
			update_options: {},
			delete_options: {},
			get_options: {},
			query_options: {}
		}, options || {});
		options.id_key = first._id_key;
		options.async_write = first.async_write();
		this.__first = first;
		this.__second = second;
		this._inherited(BetaJS.Stores.DualStore, "constructor", options);
		this.__create_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then" // "or", "single"
		}, options.create_options);
		this.__update_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then" // "or", "single"
		}, options.update_options);
		this.__remove_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then" // "or", "single"
		}, options.delete_options);
		this.__get_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "or", // "single"
			clone: true, // false
			clone_second: false,
			or_on_null: true // false
		}, options.get_options);
		this.__query_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "or", // "single"
			clone: true, // false (will use "cache_query" if present and inserts otherwise)
			clone_second: false,
			or_on_null: true // false
		}, options.query_options);
	},
	
	first: function () {
		return this.__first;
	},
	
	second: function () {
		return this.__second;
	},

	_supports_async_read: function () {
		return false;
	},
	
	_supports_async_write: function () {
		return this.__first.async_write();
	},

	_insert: function (data, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__create_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__create_options.strategy;
		if (this.async_write()) {
			if (strategy == "then")
				first.insert(data, {
					success: function (row) {
						second.insert(row, callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				return first.insert(data, {
					success: callbacks.success,
					exception: function () {
						second.insert(data, callbacks);
					}
				});
			else
				first.insert(data, callbacks);
		} else {
			if (strategy == "then")
				return second.insert(first.insert(data));
			else if (strategy == "or")
				try {
					return first.insert(data);
				} catch (e) {
					return second.insert(data);
				}
			else
				return first.insert(data);
		}
		return true;
	},

	_update: function (id, data, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__update_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__update_options.strategy;
		if (this.async_write()) {
			if (strategy == "then")
				first.update(id, data, {
					success: function (row) {
						second.update(id, row, callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				return first.update(id, data, {
					success: callbacks.success,
					exception: function () {
						second.update(id, data, callbacks);
					}
				});
			else
				first.update(id, data, callbacks);
		} else {
			if (strategy == "then")
				return second.update(id, first.update(id, data));
			else if (strategy == "or")
				try {
					return first.update(id, data);
				} catch (e) {
					return second.update(id, data);
				}
			else
				return first.update(id, data);
		}
		return true;
	},

	_remove: function (id, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__remove_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__remove_options.strategy;
		if (this.async_write()) {
			if (strategy == "then")
				first.remove(id, {
					success: function () {
						second.remove(id, callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				first.remove(id, {
					success: callbacks.success,
					exception: function () {
						second.remove(id, callbacks);
					}
				});
			else
				first.remove(id, callbacks);
		} else {
			if (strategy == "then") {
				first.remove(id);
				second.remove(id);
			}
			else if (strategy == "or")
				try {
					first.remove(id);
				} catch (e) {
					second.remove(id);
				}
			else
				first.remove(id);
		}
	},

	_get: function (id) {
		var first = this.__first;
		var second = this.__second;
		if (this.__get_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__get_options.strategy;
		var clone = this.__get_options.clone;
		var clone_second = this.__get_options.clone_second;
		var or_on_null = this.__get_options.or_on_null;
		var result = null;
		if (strategy == "or")
			try {
				result = first.get(id);
				if (!result && or_on_null)
					throw new {};
				if (clone_second) {
					try {
						if (second.get(id))
							clone_second = false;
					} catch (e) {
					}
					if (clone_second)
						second.insert(result);
				}
				return result;
			} catch (e) {
				result = second.get(id);
				if (result && clone)
					first.insert(result);
				return result;
			}
		else
			return first.get(id);
	},

	_query_capabilities: function () {
		return {
			"query": true,
			"sort": true,
			"limit": true,
			"skip": true
		};
	},

	_query: function (query, options) {
		var first = this.__first;
		var second = this.__second;
		if (this.__query_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__query_options.strategy;
		var clone = this.__query_options.clone;
		var clone_second = this.__get_options.clone_second;
		var or_on_null = this.__query_options.or_on_null;
		var result = null;
		if (strategy == "or")
			try {
				result = first.query(query, options);
				if (!result && or_on_null)
					throw {};
				if (clone_second) {
					try {
						if (second.get(query, options))
							clone = false;
					} catch (e) {
					}
					if (clone_second) {
						result = result.asArray();
						if ("cache_query" in second)
							second.cache_query(query, options, result);
						else
							second.insert_all(result);
						result = new BetaJS.Iterators.ArrayIterator(result);
					}
				}
				return result;
			} catch (e) {
				result = second.query(query, options);
				if (result && clone) {
					result = result.asArray();
					if ("cache_query" in first)
						first.cache_query(query, options, result);
					else
						first.insert_all(result);
					result = new BetaJS.Iterators.ArrayIterator(result);
				}
				return result;
			}
		else
			return first.query(query, options);
	}

});

BetaJS.Stores.StoreException.extend("BetaJS.Stores.StoreCacheException");

BetaJS.Stores.DualStore.extend("BetaJS.Stores.FullyCachedStore", {
	constructor: function (parent, options) {
		options = options || {};
		this._inherited(BetaJS.Stores.FullyCachedStore, "constructor",
			parent,
			new BetaJS.Stores.FullyCachedStore.InnerStore({id_key: parent.id_key()}),
			BetaJS.Objs.extend({
				get_options: {
					start: "second",
					strategy: "single"
				},
				query_options: {
					start: "second",
					strategy: "single"
				}
			}, options));
	},
	
	cache: function () {
		return this.second();
	},
	
	store: function () {
		return this.first();
	}
});


BetaJS.Stores.MemoryStore.extend("BetaJS.Stores.FullyCachedStore.InnerStore", {
	
	insert: function (row, callbacks) {
		this.trigger("cache", row);
		return this._inherited(BetaJS.Stores.FullyCachedStore.InnerStore, "insert", row, callbacks);
	}
	
});



BetaJS.Stores.DualStore.extend("BetaJS.Stores.QueryCachedStore", {
	constructor: function (parent, options) {
		options = options || {};
		this._inherited(BetaJS.Stores.QueryCachedStore, "constructor",
			parent,
			new BetaJS.Stores.QueryCachedStore.InnerStore({id_key: parent.id_key()}),
			BetaJS.Objs.extend({
				get_options: {
					start: "second",
					strategy: "or"
				},
				query_options: {
					start: "second",
					strategy: "or",
					clone: true,
					or_on_null: true
				}
			}, options));
	},
	
	cache: function () {
		return this.second();
	},
	
	store: function () {
		return this.first();
	}
});


BetaJS.Stores.MemoryStore.extend("BetaJS.Stores.QueryCachedStore.InnerStore", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.QueryCachedStore.InnerStore, "constructor", options);
		this.__queries = {};
	},
	
	_query_capabilities: function () {
		return {
			"query": true,
			"sort": true,
			"limit": true,
			"skip": true
		};
	},

	_query: function (query, options) {
		var constrained = BetaJS.Queries.Constrained.make(query, options);
		var encoded = BetaJS.Queries.Constrained.format(constrained);
		if (encoded in this.__queries)
			return new BetaJS.Iterators.ArrayIterator(BetaJS.Objs.values(this.__queries[encoded]));
		throw new BetaJS.Stores.StoreCacheException();
	},
	
	cache_query: function (query, options, result) {
		var constrained = BetaJS.Queries.Constrained.make(query, options);
		var encoded = BetaJS.Queries.Constrained.format(constrained);
		this.__queries[encoded] = {};
		for (var i = 0; i < result.length; ++i) {
			var row = result[i];
			this.insert(row);
			this.__queries[encoded][row[this.id_key()]] = row;
		}
	},
	
	insert: function (row, callbacks) {
		this.trigger("cache", row);
		return this._inherited(BetaJS.Stores.QueryCachedStore.InnerStore, "insert", row, callbacks);
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.ConversionStore", {
	
	constructor: function (store, options) {
		options = options || {};
		options.id_key = store._id_key;
		this._inherited(BetaJS.Stores.ConversionStore, "constructor", options);
		this.__store = store;
		this.__key_encoding = options["key_encoding"] || {};
		this.__key_decoding = options["key_decoding"] || {};
		this.__value_encoding = options["value_encoding"] || {};
		this.__value_decoding = options["value_decoding"] || {};
	},
	
	encode_object: function (obj) {
		var result = {};
		for (var key in obj)
			result[this.encode_key(key)] = this.encode_value(key, obj[key]);
		return result;
	},
	
	decode_object: function (obj) {
		var result = {};
		for (var key in obj)
			result[this.decode_key(key)] = this.decode_value(key, obj[key]);
		return result;
	},
	
	encode_key: function (key) {
		return key in this.__key_encoding ? this.__key_encoding[key] : key;
	},
	
	decode_key: function (key) {
		return key in this.__key_decoding ? this.__key_decoding[key] : key;
	},
	
	encode_value: function (key, value) {
		return key in this.__value_encoding ? this.__value_encoding[key](value) : value;
	},
	
	decode_value: function (key, value) {
		return key in this.__value_decoding ? this.__value_decoding[key](value) : value;
	},	

	_insert: function (data) {
		return this.decode_object(this.__store.insert(this.encode_object(data)));
	},
	
	_remove: function (id) {
		return this.__store.remove(this.encode_value(this._id_key, id));
	},

	_get: function (id) {
		return this.decode_object(this.__store.get(this.encode_value(this._id_key, id)));
	},
	
	_update: function (id, data) {
		return this.decode_object(this.__store.update(this.encode_value(this._id_key, id), this.encode_object(data)));
	},
	
	_query_capabilities: function () {
		return this.__store._query_capabilities();
	},
	
	_query: function (query, options) {
		var self = this;
		var result = this.__store.query(this.encode_object(query), options);
		return new BetaJS.Iterators.MappedIterator(result, function (row) {
			return self.decode_object(row);
		});
	},
	
	_ensure_index: function (key) {
		return this.__store.ensure_index(key);
	}
	

});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.PassthroughStore", {
	
	constructor: function (store, options) {
		this.__store = store;
		options = options || {};
		options.id_key = store.id_key();
		options.async_read = store.async_read;
		options.async_write = store.async_write;
		this._inherited(BetaJS.Stores.PassthroughStore, "constructor", options);
	},
	
	_supports_async_read: function () {
		return this.__store._supports_async_read();
	},
			
	_supports_async_write: function () {
		return this.__store._supports_async_read();
	},

	_query_capabilities: function () {
		return this.__store._query_capabilities();
	},

	_insert: function (data, callbacks) {
		return this.__store.insert(data, callbacks);
	},
	
	_remove: function (id, callbacks) {
		return this.__store.remove(id, callbacks);
	},
	
	_get: function (id) {
		return this.__store.get(id);
	},
	
	_update: function (id, data, callbacks) {
		return this.__store.update(id, data, callbacks);
	},
	
	_query: function (query, options) {
		return this.__store.query(query, options);
	},
	
	_ensure_index: function (key) {
		return this.__store.ensure_index(key);
	}	

});
BetaJS.Stores.PassthroughStore.extend("BetaJS.Stores.WriteQueueStore", {
	
	constructor: function (store, options) {		
		this._inherited(BetaJS.Stores.WriteQueueStore, "constructor", store, options);
		options = options || {};
		this.__update_queue = {};
		this.__revision_id = 1;
		this.__id_to_queue = {};
		this.__combine_updates = "combine_updates" in options ? options.combine_updates : true;
		this.__auto_clear_updates = "auto_clear_updates" in options ? options.auto_clear_updates : true;
		this.__cache = {};
		if (this.__auto_clear_updates)
			this.on("remove", function (id) {
				this.__remove_update(id);
			}, this);
	},
	
	update: function (id, data, callbacks) {
		this.__insert_update(id, data);
		if (callbacks && callbacks.success)
			callbacks.success(id, data, data);
		return data;
	},
	
	__remove_update: function (id) {
		var revs = this.__id_to_queue[id];
		delete this.__id_to_queue[id];
		for (var rev in rev)
			delete this.__update_queue[rev];
		delete this.__cache[id];
	},
	
	__insert_update: function (id, data) {
		if (this.__combine_updates && this.__id_to_queue[id]) {
			var comm = {};
			for (var rev in this.__id_to_queue[id]) {
				comm = BetaJS.Objs.extend(comm, this.__update_queue[rev].data);
				delete this.__update_queue[rev];
			}
			comm = BetaJS.Objs.extend(comm, data);				 
			this.__id_to_queue[id] = {};
		} 
		this.__id_to_queue[id] = this.__id_to_queue[id] || {};
		this.__id_to_queue[id][this.__revision_id] = true;
		this.__update_queue[this.__revision_id] = {
			id: id,
			data: data,
			revision_id: this.__revision_id
		};
		this.__cache[id] = BetaJS.Objs.extend(this.__cache[id] || {}, data);
		this.__revision_id++;
		this.trigger("queue", "update", id, data);
		this.trigger("queue:update", id, data);
	},
	
	flush: function (callbacks, revision_id) {
		if (!revision_id)
			revision_id = this.__revision_id;
		if (this.async_write()) {
			var first = null;
			var self = this;
			for (var key in this.__update_queue) {
				first = this.__update_queue[key];
				break;
			}
			if (first) {
				if (first.revision_id >= revision_id)
					return;
				this.__store.update(first.id, first.data, {
					exception: callbacks.exception,
					success: function () {
						delete this.__update_queue[first.revision_id];
						delete this.__id_to_queue[first.id][first.revision_id];
						self.flush(callbacks, revision_id);
					}
				});
			} else {
				if (callbacks)
					callbacks.success();
			}
		} else {
			try {
				BetaJS.Objs.iter(this.__update_queue, function (item) {
					if (item.revision_id >= revision_id)
						return false;
					this.__store.update(item.id, item.data);
					return true;
				}, this);
				if (callbacks && callbacks.success)
					callbacks.success();
			} catch (e) {
				if (callbacks && callbacks.exception)
					callbacks.exception(e);
				else
					throw e;
			}
		}
	},
	
	changed: function () {
		return !BetaJS.Types.is_empty(this.__update_queue);
	},
	
	get: function (id) {
		var obj = this.__store.get(id);
		if (obj && this.__cache[id])
			return BetaJS.Objs.extend(obj, this.__cache[id]);
		return obj;
	},
	
	query: function (query, options) {
		var self = this;
		return new BetaJS.Iterators.MappedIterator(this.__store.query(query, options), function (item) {
			if (self.__cache[item[self.id_key()]])
				return BetaJS.Objs.extend(item, self.__cache[item[self.id_key()]]);
			return item;
		});
	}
	
});



BetaJS.Class.extend("BetaJS.Stores.WriteQueueStoreManager", [
	BetaJS.Events.EventsMixin,
	{
	
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.WriteQueueStoreManager, "constructor");
		options = options || {};
		this.__stores = {};
		this.__changed = false;
		this.__min_delay = options.min_delay ? options.min_delay : null;
		this.__max_delay = options.max_delay ? options.max_delay : null;
		if (this.__min_delay || this.__max_delay)
			this.on("changed", function () {
				this.flush();
			}, this, {min_delay: this.__min_delay, max_delay: this.__max_delay});
	},
	
	destroy: function () {
		this.off(null, null, this);
		BetaJS.Objs.iter(this.__stores, function (store) {
			this.unregister(store);
		}, this);
		this._inherited(BetaJS.Stores.WriteQueueStoreManager, "destroy");
	},
	
	__get: function (store) {
//		return store.instance_of(BetaJS.Stores.WriteQueueCachedStore) ? store.second() : store;
		return store;
	},
	
	register: function (store) {
		store = this.__get(store);
		this.__stores[BetaJS.Ids.objectId(store)] = store;
		store.on("queue:update", function () {
			this.__changed = true;
			this.trigger("changed");
		}, this);
	},
	
	unregister: function (store) {
		store = this.__get(store);
		delete this.__stores[BetaJS.Ids.objectId(store)];
		store.off(null, null, this);
	},
	
	flush: function (callbacks) {
		this.trigger("flush_start");
		this.trigger("flush");
		var success_count = 0;
		var count = BetaJS.Objs.count(this.__stores);
		var self = this;
		BetaJS.Objs.iter(this.__stores, function (store) {
			store.flush({
				exception: function (e) {
					self.trigger("flush_error");
					if (callbacks && callbacks.exception)
						callbacks.exception(e);
					else
						throw e;
				},
				success: function () {
					success_count++;
					if (success_count == count) {
						self.trigger("flush_end");
						if (callbacks && callbacks.success)
							callbacks.success();
					}
				}
			});
		}, this);
		this.__changed = false;
		BetaJS.Objs.iter(this.__stores, function (store) {
			this.__changed = this.__changed || store.changed();
		}, this);
	}	
	
}]);
/*!
  betajs - v0.0.2 - 2014-03-10
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Net = BetaJS.Net || {};

BetaJS.Net.HttpHeader = {
	
	HTTP_STATUS_OK : 200,
	HTTP_STATUS_CREATED : 201,
	HTTP_STATUS_PAYMENT_REQUIRED : 402,
	HTTP_STATUS_FORBIDDEN : 403,
	HTTP_STATUS_NOT_FOUND : 404,
	HTTP_STATUS_PRECONDITION_FAILED : 412,
	HTTP_STATUS_INTERNAL_SERVER_ERROR : 500,
	
	format: function (code, prepend_code) {
		var ret = "";
		if (code == this.HTTP_STATUS_OK)
			ret = "OK";
		else if (code == this.HTTP_STATUS_CREATED)
			ret = "Created";
		else if (code == this.HTTP_STATUS_PAYMENT_REQUIRED)
			ret = "Payment Required";
		else if (code == this.HTTP_STATUS_FORBIDDEN)
			ret = "Forbidden";
		else if (code == this.HTTP_STATUS_NOT_FOUND)
			ret = "Not found";
		else if (code == this.HTTP_STATUS_PRECONDITION_FAILED)
			ret = "Precondition Failed";
		else if (code == this.HTTP_STATUS_INTERNAL_SERVER_ERROR)
			ret = "Internal Server Error";
		else
			ret = "Other Error";
		return prepend_code ? (code + " " + ret) : ret;
	}
	
};
BetaJS.Exceptions.Exception.extend("BetaJS.Modelling.ModelException", {
	
	constructor: function (model, message) {
		this._inherited(BetaJS.Modelling.ModelException, "constructor", message);
		this.__model = model;
	},
	
	model: function () {
		return this.__model;
	}
	
});


BetaJS.Modelling.ModelException.extend("BetaJS.Modelling.ModelMissingIdException", {
	
	constructor: function (model) {
		this._inherited(BetaJS.Modelling.ModelMissingIdException, "constructor", model, "No id given.");
	}

});


BetaJS.Modelling.ModelException.extend("BetaJS.Modelling.ModelInvalidException", {
	
	constructor: function (model) {
		var message = BetaJS.Objs.values(model.errors()).join("\n");
		this._inherited(BetaJS.Modelling.ModelInvalidException, "constructor", model, message);
	}

});

BetaJS.Properties.Properties.extend("BetaJS.Modelling.SchemedProperties", {
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.SchemedProperties, "constructor");
		var scheme = this.cls.scheme();
		this._properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
		for (var key in scheme) {
			if ("def" in scheme[key]) 
				this.set(key, scheme[key].def);
			else if (scheme[key].auto_create)
				this.set(key, scheme[key].auto_create(this));
			else
				this.set(key, null);
		}
		options = options || {};
		this._properties_changed = {};
		this.__errors = {};
		//this.__unvalidated = {};
		for (key in attributes)
			this.set(key, attributes[key]);
	},
	
	_unsetChanged: function (key) {
		delete this._properties_changed[key];
	},
	
	_beforeSet: function (key, value) {
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return value;
		var sch = scheme[key];
		if (sch.type == "boolean")
			return BetaJS.Types.parseBool(value);
		if (sch.transform)
			value = sch.transform.apply(this, [value]);
		return value;
	},
	
	_afterSet: function (key, value) {
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		this._properties_changed[key] = value;
		this.__unvalidated[key] = true;
		delete this.__errors[key];
		if (scheme[key].after_set) {
			var f = BetaJS.Types.is_string(scheme[key].after_set) ? this[scheme[key].after_set] : scheme[key].after_set;
			f.apply(this, [value]);
		}
	},

	properties_changed: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this._properties_changed;
		return BetaJS.Objs.filter(this._properties_changed, function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	get_all_properties: function () {
		var result = {};
		var scheme = this.cls.scheme();
		for (var key in scheme)
			result[key] = this.get(key);
		return result;
	},
	
	properties_by: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this.get_all_properties();
		return BetaJS.Objs.filter(this.get_all_properties(), function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	validate: function () {
		this.trigger("validate");
		for (var key in this.__unvalidated)
			this.validateAttr(key);
		this._customValidate();
		return BetaJS.Types.is_empty(this.__errors);
	},
	
	_customValidate: function () {},
	
	validateAttr: function (attr) {
		if (attr in this.__unvalidated) {
			delete this.__unvalidated[attr];
			delete this.__errors[attr];
			var scheme = this.cls.scheme();
			var entry = scheme[attr];
			if ("validate" in entry) {
				var validate = entry["validate"];
				if (!BetaJS.Types.is_array(validate))
					validate = [validate];
				var value = this.get(attr);
				BetaJS.Objs.iter(validate, function (validator) {
					var result = validator.validate(value, this);
					if (result)
						this.__errors[attr] = result;
					return result === null;
				}, this);
			}
			this.trigger("validate:" + attr, !(attr in this.__errors), this.__errors[attr]);
		}
		return !(attr in this.__errors);
	},
	
	setError: function (attr, error) {
		delete this.__unvalidated[attr];
		this.__errors[attr] = error;
		this.trigger("validate:" + attr, !(attr in this.__errors), this.__errors[attr]);
	},
	
	revalidate: function () {
		this.__errors = {};
		this.__unvalidated = this.keys(true);
		return this.validate();
	},
	
	errors: function () {
		return this.__errors;
	},
	
	getError: function (attr) {
		return this.__errors[attr];
	},
	
	asRecord: function (tags) {
		var rec = {};
		var scheme = this.cls.scheme();
		var props = this.get_all_properties();
		tags = tags || {};
		for (var key in props) {
			if (key in scheme) {
				var target = scheme[key]["tags"] || [];
				var tarobj = {};
				BetaJS.Objs.iter(target, function (value) {
					tarobj[value] = true;
				});
				var success = true;
				BetaJS.Objs.iter(tags, function (x) {
					success = success && x in tarobj;
				}, this);
				if (success)
					rec[key] = props[key];
			}
		}
		return rec;		
	},
	
	setByTags: function (data, tags) {
		var scheme = this.cls.scheme();
		tags = tags || {};
		for (var key in data)  {
			if (key in scheme) {
				var target = scheme[key]["tags"] || [];
				var tarobj = {};
				BetaJS.Objs.iter(target, function (value) {
					tarobj[value] = true;
				});
				var success = true;
				BetaJS.Objs.iter(tags, function (x) {
					success = success && x in tarobj;
				}, this);
				if (success)
					this.set(key, data[key]);
			}
		}
	},
	
	validation_exception_conversion: function (e) {
		var source = e;
		if (e.instance_of(BetaJS.Stores.RemoteStoreException))
			source = e.source();
		else if (!("status_code" in source && "data" in source))
			return e;
		if (source.status_code() == BetaJS.Net.HttpHeader.HTTP_STATUS_PRECONDITION_FAILED && source.data()) {
			BetaJS.Objs.iter(source.data(), function (value, key) {
				this.setError(key, value);
			}, this);
			e = new BetaJS.Modelling.ModelInvalidException(model);
		}
		return e;		
	}
	
}, {

	_initializeScheme: function () {
		return {};
	},
	
	asRecords: function (arr, tags) {
		return arr.map(function (item) {
			return item.asRecord(tags);
		});
	},
	
	filterPersistent: function (obj) {
		var result = {};
		var scheme = this.scheme();
		for (var key in obj) {
			if (!BetaJS.Types.is_defined(scheme[key].persistent) || scheme[key].persistent)
				result[key] = obj[key];
		}
		return result;
	}
	
}, {
	
	scheme: function () {
		this.__scheme = this.__scheme || this._initializeScheme();
		return this.__scheme;
	}
	
});



BetaJS.Modelling.SchemedProperties.extend("BetaJS.Modelling.AssociatedProperties", {
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.AssociatedProperties, "constructor", attributes, options);
		this.assocs = this._initializeAssociations();
		for (var key in this.assocs)
			this.__addAssoc(key, this.assocs[key]);
		this.on("change:" + this.cls.primary_key(), function (new_id, old_id) {
			this._change_id(new_id, old_id);
			this.trigger("change_id", new_id, old_id);
		}, this);
	},
	
	_change_id: function (new_id, old_id) {
	},

	__addAssoc: function (key, obj) {
		this[key] = function () {
			return obj.yield();
		};
	},
	
	_initializeAssociations: function () {
		return {};
	},
	
	destroy: function () {
		for (var key in this.assocs)
			this.assocs[key].destroy();
		this._inherited(BetaJS.Modelling.AssociatedProperties, "destroy");
	},

	id: function () {
		return this.get(this.cls.primary_key());
	},
	
	hasId: function () {
		return this.has(this.cls.primary_key());
	}
	
}, {

	primary_key: function () {
		return "id";
	},
	
	_initializeScheme: function () {
		var s = this._inherited(BetaJS.Modelling.AssociatedProperties, "_initializeScheme");
		s[this.primary_key()] = {
			type: "id"
		};
		return s;
	}

});
BetaJS.Modelling.AssociatedProperties.extend("BetaJS.Modelling.Model", {
	
	constructor: function (attributes, options) {
		options = options || {};
		this._inherited(BetaJS.Modelling.Model, "constructor", attributes, options);
		this.__saved = "saved" in options ? options["saved"] : false;
		this.__new = "new" in options ? options["new"] : true;
		this.__removed = false;
		if (this.__saved)
			this._properties_changed = {};
		this.__table = options["table"];
		this.__table._model_register(this);
		this.__destroying = false;
	},
	
	destroy: function () {
		if (this.__destroying)
			return;
		this.__destroying = true;
		this.__table._model_unregister(this);
		this.trigger("destroy");
		this._inherited(BetaJS.Modelling.Model, "destroy");
	},

	isSaved: function () {
		return this.__saved;
	},
	
	isNew: function () {
		return this.__new;
	},
	
	isRemoved: function () {
		return this.__removed;
	},

	update: function (data, options) {
		this.setAll(data, {silent: true});
		this.save(options);
	},

	_afterSet: function (key, value, old_value, options) {
		this._inherited(BetaJS.Modelling.Model, "_afterSet", key, value, old_value, options);
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		if (options && options.no_change)
			this._unsetChanged(key);
		else
			this.__saved = false;
		if (options && options.silent)
			return;
		if (this.__table)
			this.__table._model_set_value(this, key, value, options);
	},
	
	_after_create: function () {
	},
	
	_before_create: function () {
	},
	
	save: function (options) {
		var self = this;
		var opts = BetaJS.Objs.clone(options || {}, 1);
		if (this.__new)
			this._before_create();
		opts.success = function () {
			self.trigger("save");		
			self.__saved = true;
			var was_new = self.__new;
			self.__new = false;
			if (was_new)
				self._after_create();
			if (options && options.success)
				options.success();
		};
		return this.__table._model_save(this, opts);
	},
	
	remove: function (options) {
		var self = this;
		var opts = BetaJS.Objs.clone(options || {}, 1);
		opts.success = function () {
			self.trigger("remove");		
			self.__removed = true;
			if (options && options.success)
				options.success();
		};
		return this.__table._model_remove(this, opts);
	},
	
	table: function () {
		return this.__table;
	}
	
});
BetaJS.Class.extend("BetaJS.Modelling.Table", [
	BetaJS.Events.EventsMixin,
	{

	constructor: function (store, model_type, options) {
		this._inherited(BetaJS.Modelling.Table, "constructor");
		this.__store = store;
		this.__model_type = model_type;
		this.__models_by_id = {};
		this.__models_changed = {};
		this.__options = BetaJS.Objs.extend({
			// Cache Size
			model_cache_size: null,
			// Attribute that describes the type
			type_column: null,
			// Removing options
			remove_exception: true,
			// Creation options
			auto_create: false,
			create_exception: true,
			invalid_create_exception: true,
			invalid_create_save: false,
			greedy_create: false,
			// Validation options
			store_validation_conversion: true,
			// Update options
			auto_update: true,
			update_exception: true,
			invalid_update_exception: true,
			invalid_update_save: false,
			greedy_update: false
		}, options || {});
		this.__models_by_cid = new BetaJS.Classes.ObjectCache({ size: this.__options.model_cache_size });
		this._auto_destroy(this.__models_by_cid);
		this.__models_by_cid.on("release", function (model) {
			if (model.hasId())
				delete this.__models_by_id[model.id()];
		}, this);
	},
	
	async_read: function () {
		return this.__store.async_read();
	},
	
	async_write: function () {
		return this.__store.async_write();
	},

	_model_register: function (model) {
		if (this.hasModel(model))
			return;
		this.trigger("register", model);
		this.__models_by_cid.add(model);
		if (model.hasId())
			this.__models_by_id[model.id()] = model;
		if (model.isNew() && this.__options.auto_create)
			this._model_create(model);
	},
	
	_model_unregister: function (model) {
		if (!this.hasModel(model))
			return;
		model.save();
		this.__models_by_cid.remove(model);
		if (model.hasId())
			delete this.__models_by_id[model.id()];
		this.trigger("unregister", model);
	},
	
	hasModel: function (model) {
		return this.__models_by_cid.get(model) !== null;
	},

	_model_remove: function (model, options) {
		if (!this.hasModel(model))
			return false;
		var self = this;
		var callback = {
			success : function () {
				if (options && options.success)
					options.success();
				if (options && options.complete)
					options.complete();
				self.trigger("remove", model);
				model.destroy();
				return true;
			},
			exception : function (e) {
				if (options && options.exception)
					options.exception(e);
				if (options && options.complete)
					options.complete();
				if ((!options || !options.exception) && self.__options.remove_exception)
					throw e;
				return false;
			}
		};
		if (this.async_write())
			this.__store.remove(model.id(), callback);
		else try {
			this.__store.remove(model.id());
			return callback.success();
		} catch (e) {
			return callback.exception(e);
		}
		return false;
	},

	_model_save: function (model, options) {
		return model.isNew() ? this._model_create(model, options) : this._model_update(model, options);
	},
	
	__exception_conversion: function (model, e) {
		return this.__options.store_validation_conversion ? model.validation_exception_conversion(e) : e;
	},
	
	_model_create: function (model, options) {
		if (!this.hasModel(model) || !model.isNew())
			return false;
		var self = this;
		var is_valid = model.validate();
		if (!is_valid) {
		 	var e = new BetaJS.Modelling.ModelInvalidException(model);
			if (options && options.exception)
				options.exception(e);
			if (options && options.complete)
				options.complete();
			 if ((!options || !options.exception) && self.__options.invalid_create_exception)
				throw e;
			 if (!this.__options.invalid_create_save)
			 	return false;
		}
		var attrs = this.__options.greedy_create ? model.properties_by(true) : model.get_all_properties();
		attrs = BetaJS.Scopes.resolve(this.__model_type).filterPersistent(attrs);
		if (this.__options.type_column)
			attrs[this.__options.type_column] = model.cls.classname;
		var callback = {
			success : function (confirmed) {
				if (!(model.cls.primary_key() in confirmed))
					return callback.exception(new BetaJS.Modelling.ModelMissingIdException(model));
				self.__models_by_id[confirmed[model.cls.primary_key()]] = model;
				if (!self.__options.greedy_create) {
					for (var key in model.properties_by(false))
						delete confirmed[key];
				}
				model.setAll(confirmed, {no_change: true, silent: true});
				if (is_valid)
					delete self.__models_changed[model.cid()];
				self.trigger("create", model);
				self.trigger("save", model);
				if (options && options.success)
					options.success(confirmed);
				if (options && options.complete)
					options.complete();
				return true;		
			},
			exception : function (e) {
				e = BetaJS.Exceptions.ensure(e);
				e = self.__exception_conversion(model, e);
				if (options && options.exception)
					options.exception(e);
				if (options && options.complete)
					options.complete();
				if ((!options || !options.exception) && self.__options.create_exception)
					throw e;
				return false;
			}
		};
		if (this.async_write())
			this.__store.insert(attrs, callback);
		else try {
			var confirmed = this.__store.insert(attrs);
			return callback.success(confirmed);		
		} catch (e) {
			return callback.exception(e);
		}
		return true;
	},



	_model_update: function (model, options) {
		if (!this.hasModel(model) || model.isNew())
			return false;
		var self = this;
		var is_valid = model.validate();
		if (!is_valid) {
		 	var e = new BetaJS.Modelling.ModelInvalidException(model);
			if (options && options.exception)
				options.exception(e);
			if (options && options.complete)
				options.complete();
			 if ((!options || !options.exception) && self.__options.invalid_update_exception)
				throw e;
			 if (!this.__options.invalid_update_save)
			 	return false;
		}
		var attrs = this.__options.greedy_update ? model.properties_changed(true) : model.properties_changed();
		attrs = BetaJS.Scopes.resolve(this.__model_type).filterPersistent(attrs);
		var callback = {
			success : function (confirmed) {
				if (!self.__options.greedy_update) {
					for (var key in model.properties_changed(false))
						delete confirmed[key];
				}
				model.setAll(confirmed, {no_change: true, silent: true});
				if (is_valid)
					delete self.__models_changed[model.cid()];
				self.trigger("update", model);
				self.trigger("save", model);
				if (options && options.success)
					options.success(confirmed);
				if (options && options.complete)
					options.complete();
				return true;		
			},
			exception : function (e) {
				if (options && options.exception)
					options.exception(e);
				if (options && options.complete)
					options.complete();
				if ((!options || !options.exception) && self.__options.update_exception)
					throw e;
				return false;
			}
		};
		if (this.async_write() && !BetaJS.Types.is_empty(attrs))
			this.__store.update(model.id(), attrs, callback);
		else try {
			var confirmed = BetaJS.Types.is_empty(attrs) ? {} : this.__store.update(model.id(), attrs);
			return callback.success(confirmed);		
		} catch (e) {
			return callback.exception(e);
		}
		return true;
	},

	_model_set_value: function (model, key, value, options) {
		this.__models_changed[model.cid()] = model;
		this.trigger("change", model, key, value);
		this.trigger("change:" + key, model, value);
		if (this.__options.auto_update)
			return model.save(options);
	},
		
	save: function () {
		var result = true;
		BetaJS.Objs.iter(this.__models_changed, function (obj, id) {
			result = obj.save() && result;
		});
		return result;
	},
	
	primary_key: function () {
		return BetaJS.Scopes.resolve(this.__model_type).primary_key();
	},
	
	__materialize: function (obj) {
		if (!obj)
			return null;
		var type = this.__model_type;
		if (this.__options.type_column && obj[this.__options.type_column])
			type = obj[this.__options.type_column];
		var cls = BetaJS.Scopes.resolve(type);
		if (this.__models_by_id[obj[this.primary_key()]])
			return this.__models_by_id[obj[this.primary_key()]];
		var model = new cls(obj, {
			table: this,
			saved: true,
			"new": false
		});
		return model;
	},
	
	findById: function (id) {
		if (this.__models_by_id[id])
			return this.__models_by_id[id];
		else
			return this.__materialize(this.__store.get(id));
	},

	findBy: function (query) {
		return this.allBy(query, {limit: 1}).next();
	},

	all: function (options) {
		return this.allBy({}, options);
	},
	
	allBy: function (query, options) {
		var iterator = this.__store.query(query, options);
		var self = this;
		var mapped_iterator = new BetaJS.Iterators.MappedIterator(iterator, function (obj) {
			return self.__materialize(obj);
		});
		return mapped_iterator; 
	},
	
	active_query_engine: function () {
		if (!this._active_query_engine) {
			var self = this;
			this._active_query_engine = new BetaJS.Queries.ActiveQueryEngine();
			this._active_query_engine._query = function (query) {
				return self.allBy(query);
			};
			this.on("create", function (object) {
				this._active_query_engine.insert(object);
			});
			this.on("remove", function (object) {
				this._active_query_engine.remove(object);
			});
			this.on("change", function (object) {
				this._active_query_engine.update(object);
			});
		}
		return this._active_query_engine;
	},
	
	scheme: function () {
		return this.__model_type.scheme();
	},
	
	ensure_indices: function () {
		if (!("ensure_index" in this.__store))
			return false;
		var scheme = this.scheme();
		for (var key in scheme) {
			if (scheme[key].index)
				this.__store.ensure_index(key);
		}
		return true;
	}
	
}]);
BetaJS.Class.extend("BetaJS.Modelling.Associations.Association", {

	constructor: function (model, options) {
		this._inherited(BetaJS.Modelling.Associations.Association, "constructor");
		this._model = model;
		this._options = options || {};
		this.__cache = null;
		if (options["delete_cascade"])
			model.on("remove", function () {
				this.__delete_cascade();
			}, this);
		if (!options["ignore_change_id"])
			model.on("change_id", function (new_id, old_id) {
				this._change_id(new_id, old_id);
			}, this);
	},
	
	_change_id: function () {},
	
	__delete_cascade: function () {
		var iter = BetaJS.Iterators.ensure(this.yield());
		while (iter.hasNext())
			iter.next().remove();
	},
	
	yield: function () {
		if (this.__cache)
			return this.__cache;
		var obj = this._yield();
		if (this._options["cached"])
			this.__cache = obj;
		return obj;
	},
	
	invalidate: function () {
		delete this["__cache"];
	}

});
BetaJS.Modelling.Associations.Association.extend("BetaJS.Modelling.Associations.TableAssociation", {

	constructor: function (model, foreign_table, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.TableAssociation, "constructor", model, options);
		this._foreign_table = foreign_table;
		this._foreign_key = foreign_key;
		// TODO: Active Query would be better
		if (options["primary_key"])
			this._primary_key = options.primary_key;
		if (this._options["cached"]) 
			this._foreign_table.on("create update remove", function () {
				this.invalidate();
			}, this);
	},
	
	destroy: function () {
		this._foreign_table.off(null, null, this);
		this._inherited(BetaJS.Modelling.Associations.TableAssociation, "destroy");
	}
	
});
BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.HasManyAssociation", {

	_id: function () {
		return this._primary_key ? this._model.get(this._primary_key) : this._model.id();
	},

	_yield: function () {
		return this.allBy({});
	},

	yield: function () {
		if (!this._options["cached"])
			return this._yield();
		if (!this.__cache)
			this.__cache = this._yield().asArray();
		BetaJS.Objs.iter(this.__cache, function (model) {
			model.on("destroy", function () {
				this.invalidate();
			}, this);
		}, this);
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
	},
	
	invalidate: function () {
		BetaJS.Objs.iter(this.__cache, function (model) {
			model.off(null, null, this);
		}, this);
		this._inherited(BetaJS.Modelling.Associations.HasManyAssociation, "invalidate");
	},

	findBy: function (query) {
		query[this._foreign_key] = this._id();
		return this._foreign_table.findBy(query);
	},

	allBy: function (query) {
		query[this._foreign_key] = this._id();
		return this._foreign_table.allBy(query);
	},

	_change_id: function (new_id, old_id) {
		var objects = this._yield();
		while (objects.hasNext()) {
			var object = objects.next();
			object.set(this._foreign_key, new_id);
			object.save();
		}
	}

});
BetaJS.Modelling.Associations.HasManyAssociation.extend("BetaJS.Modelling.Associations.HasManyThroughArrayAssociation", {

	_yield: function () {
		var result = [];
		BetaJS.Objs.iter(this._model.get(this._foreign_key), function ($id) {
			var item = this._foreign_table.findById($id);
			if (item)
				result.push(item);
		}, this);
		return result;
	},

	yield: function () {
		if (!this._options["cached"])
			return new BetaJS.Iterators.ArrayIterator(this._yield());
		if (!this.__cache)
			this.__cache = this._yield();
		BetaJS.Objs.iter(this.__cache, function (model) {
			model.on("destroy", function () {
				this.invalidate();
			}, this);
		}, this);
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
	}

});
BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.HasOneAssociation", {

	_yield: function (id) {
		var query = {};
		if (id)
			query[this._foreign_key] = id;
		else if (this._primary_key) 
			query[this._foreign_key] = this._model.get(this._primary_key);
		else
			query[this._foreign_key] = this._model.id();
		var model = this._foreign_table.findBy(query);
		if (model)
			model.on("destroy", function () {
				this.invalidate();
			}, this);
		return model;
	},
	
	_change_id: function (new_id, old_id) {
		var object = this._yield(old_id);
		if (object) {
			object.set(this._foreign_key, new_id);
			object.save();
		}
	}

});
BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.BelongsToAssociation", {
	
	_yield: function () {
		var model = null;
		if (this._primary_key) {
			var obj = {};
			obj[this._primary_key] = this._model.get(this._foreign_key);
			model = this._foreign_table.findBy(obj);
		}
		else
			model = this._foreign_table.findById(this._model.get(this._foreign_key));
		if (model)
			model.on("destroy", function () {
				this.invalidate();
			}, this);
		return model;
	}
	
});
BetaJS.Modelling.Associations.Association.extend("BetaJS.Modelling.Associations.ConditionalAssociation", {

	constructor: function (model, options) {
		this._inherited(BetaJS.Modelling.Associations.ConditionalAssociation, "constructor");
		this._model = model;
		this._options = options || {};
		this.__cache = null;
		if (options["delete_cascade"])
			model.on("remove", function () {
				this.__delete_cascade();
			}, this);
		if (!options["ignore_change_id"])
			model.on("change_id", function (new_id, old_id) {
				this._change_id(new_id, old_id);
			}, this);
	},
	
	_yield: function () {
		return this._model.assocs[this._options.conditional(this._model)];
	}

});
BetaJS.Modelling.Associations.Association.extend("BetaJS.Modelling.Associations.PolymorphicHasOneAssociation", {

	constructor: function (model, foreign_table_key, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.PolymorphicHasOneAssociation, "constructor", model, options);
		this._foreign_table_key = foreign_table_key;
		this._foreign_key = foreign_key;
		if (options["primary_key"])
			this._primary_key = options.primary_key;
	},

	_yield: function (id) {
		var query = {};
		if (id)
			query[this._foreign_key] = id;
		else if (this._primary_key) 
			query[this._foreign_key] = this._model.get(this._primary_key);
		else
			query[this._foreign_key] = this._model.id();
		var foreign_table = BetaJS.Scopes.resolve(this._model.get(this._foreign_table_key));
		var model = foreign_table ? foreign_table.findBy(query) : null;
		if (model)
			model.on("destroy", function () {
				this.invalidate();
			}, this);
		return model;
	},
	
	_change_id: function (new_id, old_id) {
		var object = this._yield(old_id);
		if (object) {
			object.set(this._foreign_key, new_id);
			object.save();
		}
	}

});
BetaJS.Class.extend("BetaJS.Modelling.Validators.Validator", {
	
	validate: function (value, context) {
		return null;
	}

});
BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.PresentValidator", {
	
	constructor: function (error_string) {
		this._inherited(BetaJS.Modelling.Validators.PresentValidator, "constructor");
		this.__error_string = error_string ? error_string : "Field is required";
	},

	validate: function (value, context) {
		return BetaJS.Types.is_null(value) || value === "" ? this.__error_string : null;
	}

});
BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.EmailValidator", {
	
	constructor: function (error_string) {
		this._inherited(BetaJS.Modelling.Validators.EmailValidator, "constructor");
		this.__error_string = error_string ? error_string : "Not a valid email address";
	},

	validate: function (value, context) {
		return BetaJS.Strings.is_email_address(value) ? null : this.__error_string;
	}

});
BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.LengthValidator", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Modelling.Validators.LengthValidator, "constructor");
		this.__min_length = BetaJS.Types.is_defined(options.min_length) ? options.min_length : null;
		this.__max_length = BetaJS.Types.is_defined(options.max_length) ? options.max_length : null;
		this.__error_string = BetaJS.Types.is_defined(options.error_string) ? options.error_string : null;
		if (!this.__error_string) {
			if (this.__min_length !== null) {
				if (this.__max_length !== null)
					this.__error_string = "Between " + this.__min_length + " and " + this.__max_length + " characters";
				else
					this.__error_string = "At least " + this.__min_length + " characters";
			} else if (this.__max_length !== null)
				this.__error_string = "At most " + this.__max_length + " characters";
		}
	},

	validate: function (value, context) {
		if (this.__min_length !== null && (!value || value.length < this.__min_length))
			return this.__error_string;
		if (this.__max_length !== null && value.length > this.__max_length)
			return this.__error_string;
		return null;
	}

});
BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.UniqueValidator", {
	
	constructor: function (key, error_string) {
		this._inherited(BetaJS.Modelling.Validators.UniqueValidator, "constructor");
		this.__key = key;
		this.__error_string = error_string ? error_string : "Key already present";
	},

	validate: function (value, context) {
		var query = {};
		query[this.__key] = value;
		var item = context.table().findBy(query);
		return (!item || (!context.isNew() && context.id() == item.id())) ? null : this.__error_string;
	}

});
BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.ConditionalValidator", {
	
	constructor: function (condition, validator) {
		this._inherited(BetaJS.Modelling.Validators.ConditionalValidator, "constructor");
		this.__condition = condition;
		this.__validator = BetaJS.Types.is_array(validator) ? validator : [validator];
	},

	validate: function (value, context) {
		if (!this.__condition(value, context))
			return null;
		for (var i = 0; i < this.__validator.length; ++i) {
			var result = this.__validator[i].validate(value, context);
			if (result !== null)
				return result;
		}
		return null;
	}

});
BetaJS.Net.AbstractAjax.extend("BetaJS.Server.Net.HttpAjax", {

	_syncCall: function (options) {
		throw "Unsupported";
	},
	
	_asyncCall: function (options) {
		var parsed = BetaJS.Net.Uri.parse(options.uri);
		var opts = {
			method: options.method,
			host: parsed.host,
			port: parsed.port,
			path: parsed.path
		};		
		var post_data = null;
		if (options.data) {
			if (opts.method == "GET") {
				opts.path = opts.path + "?" + this.cls.querystring().stringify(options.data);
			} else {
				post_data = this.cls.querystring().stringify(options.data);
				if (post_data.length > 0)
					opts.headers = {
			          'Content-Type': 'application/x-www-form-urlencoded',
			          'Content-Length': post_data.length
				    };
			}			
		}
		var request = this.cls.http().request(opts, function (result) {
			var data = "";
			result.on("data", function (chunk) {
				data += chunk;
			}).on("end", function () {
				if (result.statusCode >= 200 && result.statusCode < 300) {
					if (options) {
						if (options.success)
							options.success(data);
						else
							callbacks(data);
					}
				} else {
					if (options.failure)
						options.failure(data);
				}
			});
		});
		if (post_data && post_data.length > 0)
			request.write(post_data);
		request.end();
	}

}, {
	
	__http: null,
	
	http: function () {
		if (!this.__http)
			this.__http = require("http");
		return this.__http;
	},	
	
	__querystring: null,
	
	querystring: function () {
		if (!this.__querystring)
			this.__querystring = require("querystring");
		return this.__querystring;
	}	

});

BetaJS.Class.extend("BetaJS.Databases.Database", [
	BetaJS.Classes.SyncAsyncMixin, {
	
	_tableClass: function () {
		return null;
	},
	
	getTable: function (table_name) {
		var cls = this._tableClass();		
		return new cls(this, table_name);
	}
		
}]);

BetaJS.Class.extend("BetaJS.Databases.DatabaseTable", [
	BetaJS.Classes.SyncAsyncMixin, {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Databases.DatabaseTable, "constructor");
		this._database = database;
		this._table_name = table_name;
		this._is_async = database.isAsync();
	},
	
	findOne: function (query, options, callbacks) {
		return this.then(this._findOne, [this._encode(query), options], callbacks, function (result, callbacks) {
			callbacks.success(!result ? null : this._decode(result));
		});
	},
	
	_findOne: function (query, options, callbacks) {
		options = options || {};
		options.limit = 1;
		return this.then(this._find, [query, options], callbacks, function (result, callbacks) {
			callbacks.success(result.next());
		});
	},
	
	_encode: function (data) {
		return data;	
	},
	
	_decode: function (data) {
		return data;
	},

	_find: function (query, options, callbacks) {
	},

	find: function (query, options, callbacks) {
		return this.then(this._find, [this._encode(query), options], callbacks, function (result, callbacks) {
			callbacks.success(new BetaJS.Iterators.MappedIterator(result, this._decode, this)); 
		});
	},
	
	findById: function (id, callbacks) {
		return this.findOne({id : id}, {}, callbacks);
	},
	
	_insertRow: function (row, callbacks) {		
	},
	
	_removeRow: function (query, callbacks) {		
	},
	
	_updateRow: function (query, row, callbacks) {
	},
	
	insertRow: function (row, callbacks) {
		return this.then(this._insertRow, [this._encode(row)], callbacks, function (result, callbacks) {
			callbacks.success(this._decode(result));
		});
	},
	
	removeRow: function (query, callbacks) {
		return this._removeRow(this._encode(query), callbacks);
	},
	
	updateRow: function (query, row, callbacks) {
		return this.then(this._decode, [this._encode(query), this._encode(row)], callbacks, function (result, callbacks) {
			callbacks.success(this._decode(result));
		});
	},
	
	removeById: function (id, callbacks) {
		return this.removeRow({id : id}, callbacks);
	},
	
	updateById: function (id, data, callbacks) {
		return this.updateRow({id: id}, data, callbacks);
	},
	
	ensureIndex: function (key) {}
	
}]);
BetaJS.Databases.Database.extend("BetaJS.Databases.MongoDatabase", {
	
	constructor: function (db, async) {
		if (BetaJS.Types.is_string(db)) {
			this.__dbUri = db;
			this.__dbObject = this.cls.uriToObject(db);
		} else {
			db = BetaJS.Objs.extend({
				database: "database",
				server: "localhost",
				port: 27017		
			}, db);
			this.__dbObject = db;
			this.__dbUri = this.cls.objectToUri(db);
		}
		this._inherited(BetaJS.Databases.MongoDatabase, "constructor");
		this.__mongodb = null;
		this.__mongo_module = null;
		this._is_async = !!async;
	},
	
	_tableClass: function () {
		return BetaJS.Databases.MongoDatabaseTable;
	},
	
	mongo_module: function () {
		if (!this.__mongo_module)
			this.__mongo_module = require(this.isSync() ? "mongo-sync" : "mongodb");
		return this.__mongo_module;
	},
	
	mongodb: function (callbacks) {
		return this.eitherFactory("__mongodb", callbacks, function () {
			var mod = this.mongo_module();
			this.__mongo_server = new mod.Server(this.__dbObject.server + ":" + this.__dbObject.port);
			var db = this.__mongo_server.db(this.__dbObject.database);
			if (this.__dbObject.username)
				db.auth(this.__dbObject.username, this.__dbObject.password);
			return db;
		}, function () {
			var MongoClient = this.mongo_module().MongoClient;
			MongoClient.connect('mongodb://' + this.__dbUri, function(err, db) {
				if (!err) 
					callbacks.success.call(callbacks.context || this, db);
				else
					callbacks.failure.call(callbacks.context || this, err);
			});
		});
	},
	
	destroy: function () {
		if (this.__mongo_server)
			this.__mongo_server.close();
		this._inherited(BetaJS.Databases.MongoDatabase, "destroy");
	}
	
}, {
	
	uriToObject: function (uri) {
		var parsed = BetaJS.Net.Uri.parse(uri);
		return {
			database: BetaJS.Strings.strip_start(parsed.path, "/"),
			server: parsed.host,
			port: parsed.port,
			username: parsed.user,
			password: parsed.password
		};
	},
	
	objectToUri: function (object) {
		object["path"] = object["database"];
		return BetaJS.Net.Uri.build(object);
	}
	
});
BetaJS.Databases.DatabaseTable.extend("BetaJS.Databases.MongoDatabaseTable", {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Databases.MongoDatabaseTable, "constructor", database, table_name);
		this.__table = null;
	},
	
	_syncType: function (defasync) {
		return this.isSync() ? BetaJS.SyncAsync.SYNC : (defasync ? BetaJS.SyncAsync.ASYNC : BetaJS.SyncAsync.ASYNCSINGLE);
	},
	
	table: function (callbacks) {
		return this.eitherFactory("__table", callbacks, function () {
			return this._database.mongodb().getCollection(this._table_name);
		}, function () {
			this._database.mongodb({
				context: this,
				success: function (db) {
					callbacks.success(db.collection(this._table_name));
				},
				failure: callbacks.failure
			});
		});
	},
	
	_encode: function (data) {
		var obj = BetaJS.Objs.clone(data, 1);
		if ("id" in data) {
			delete obj["id"];
			obj._id = data.id;
		}
		return obj;
	},
	
	_decode: function (data) {
		var obj = BetaJS.Objs.clone(data, 1);
		if ("_id" in data) {
			delete obj["_id"];
			obj.id = data._id;
		}
		return obj;
	},

	_find: function (query, options, callbacks) {
		return this.then(this.table, callbacks, function (table, callbacks) {
			this.thenSingle(table, table.find, [query], callbacks, function (result, callbacks) {
				options = options || {};
				if ("sort" in options)
					result = result.sort(options.sort);
				if ("skip" in options)
					result = result.skip(options.skip);
				if ("limit" in options)
					result = result.limit(options.limit);
				this.thenSingle(result, result.toArray, callbacks, function (cols, callbacks) {
					callbacks.success(new BetaJS.Iterators.ArrayIterator(cols));
				});
			});
		});
	},

	_insertRow: function (row, callbacks) {
		return this.then(this.table, callbacks, function (table, callbacks) {
			this.thenSingle(table, table.insert, [row], callbacks, function (result, callbacks) {
				callbacks.success(result[0] ? result[0] : result);
			});
		});
	},
	
	_removeRow: function (query, callbacks) {
		return this.then(this.table, callbacks, function (table, callbacks) {
			this.thenSingle(table, table.remove, [query], callbacks);
		});
	},
	
	_updateRow: function (query, row, callbacks) {
		return this.then(this.table, callbacks, function (table, callbacks) {
			this.thenSingle(table, table.update, [query, {"$set" : row}, true, false], callbacks, function (result, callbacks) {
				callbacks.success(row);
			});
		});
	},
		
	ensureIndex: function (key) {
		var obj = {};
		obj[key] = 1;
		return this.table().ensureIndex(obj);
	}	

});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.DatabaseStore", {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Stores.DatabaseStore, "constructor");
		this.__database = database;
		this.__table_name = table_name;
		this.__table = null;
	},
	
	table: function () {
		if (!this.__table)
			this.__table = this.__database.getTable(this.__table_name);
		return this.__table;
	},
	
	_insert: function (data) {
		return this.table().insertRow(data);
	},
	
	_remove: function (id) {
		return this.table().removeById(id);
	},
	
	_get: function (id) {
		return this.table().findById(id);
	},
	
	_update: function (id, data) {
		return this.table().updateById(id, data);
	},
	
	_query_capabilities: function () {
		return {
			"query": true,
			"sort": true,
			"skip": true,
			"limit": true
		};
	},
	
	_query: function (query, options) {
		return this.table().find(query, options);
	},
	
	_ensure_index: function (key) {
		this.table().ensureIndex(key);
	}

});

BetaJS.Stores.ConversionStore.extend("BetaJS.Stores.MongoDatabaseStore", {
	
	constructor: function (database, table_name, types) {
		var store = new BetaJS.Stores.DatabaseStore(database, table_name);
		var encoding = {};
		var decoding = {};
		types = types || {};
		types.id = "id";
		var ObjectId = database.mongo_module().ObjectId;
		for (var key in types) {
			if (types[key] == "id") {
				encoding[key] = function (value) {
					return value ? new ObjectId(value) : null;
				};
				decoding[key] = function (value) {
					return value ? value + "" : null;
				};
			}
		}
		this._inherited(BetaJS.Stores.MongoDatabaseStore, "constructor", store, {
			value_encoding: encoding,
			value_decoding: decoding
		});
	}

});

BetaJS.Class.extend("BetaJS.Stores.Migrator", {
	
	constructor: function () {
		this._inherited(BetaJS.Stores.Migrator, "constructor");
		this.__version = null;
		this.__migrations = [];
		this.__sorted = true;
	},
	
	version: function (offset) {
		if (!this.__version)
			this.__version = this._getVersion();
		return this.__version;
	},
	
	_getVersion: function () {
	},
	
	_setVersion: function (version) {
	},
	
	_log: function (s) {		
	},
	
	migrations: function () {
		if (!this.__sorted) {
			this.__migrations.sort(function (x, y) {
				return x.version - y.version;
			});
			this.__sorted = true;
		}
		return this.__migrations;
	},
	
	register: function (migration) {
		this.__migrations.push(migration);
		this.__sorted = false;
	},
	
	_indexByVersion: function (version) {
		for (var i = 0; i < this.__migrations.length; ++i) {
			if (version == this.__migrations[i].version)
				return i;
			else if (version < this.__migrations[i].version)
				return i-1;
		}
		return this.__migrations.length;				
	},
	
	migrate: function (version) {
		var current = this._indexByVersion(this.version());		
		var target = BetaJS.Types.is_defined(version) ? this._indexByVersion(version) : this.__migrations.length - 1;		
		while (current < target) {
			var migration = this.__migrations[current + 1];
			this._log("Migrate " + migration.version + ": " + migration.title + " - " + migration.description + "...\n");
			try {
				migration.migrate();
				this._setVersion(this.__migrations[current+1].version);
				current++;
				this._log("Successfully migrated " + migration.version + ".\n");
			} catch (e) {
				this._log("Failure! Rolling back " + migration.version + "...\n");
				try {
					migration.partial_rollback();
				} catch (e) {
					this._log("Failure! Couldn't roll back " + migration.version + "!\n");
					throw e;
				}
				this._log("Rolled back " + migration.version + "!\n");
				throw e;
			}
		}
	},
	
	rollback: function (version) {
		var current = this._indexByVersion(this.version());
		var target = BetaJS.Types.is_defined(version) ? this._indexByVersion(target) : -1;
		while (current > target) {
			var migration = this.__migrations[current];
			this._log("Rollback " + migration.version + ": " + migration.title + " - " + migration.description + "...\n");
			try {
				migration.rollback();
				this._setVersion(current >= 1 ? this.__migrations[current-1].version : 0);
				current--;
				this._log("Successfully rolled back " + migration.version + ".\n");
			} catch (e) {
				this._log("Failure! Couldn't roll back " + migration.version + "!\n");
				throw e;
			}
		}
	}
	
});
