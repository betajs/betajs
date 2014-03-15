/*!
  betajs - v0.0.2 - 2014-03-14
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*!
  betajs - v0.0.2 - 2014-03-13
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*!
  betajs - v0.0.2 - 2014-03-13
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
/*!
  betajs - v0.0.2 - 2014-03-14
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Net.AbstractAjax.extend("BetaJS.Browser.JQueryAjax", {
	
	_syncCall: function (options) {
		var result;
		BetaJS.$.ajax({
			type: options.method,
			async: false,
			url: options.uri,
			dataType: options.decodeType ? options.decodeType : null, 
			data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
			success: function (response) {
				result = response;
			},
			error: function (jqXHR, textStatus, errorThrown) {
				throw new BetaJS.Net.AjaxException(jqXHR.status, errorThrown, JSON.parse(jqXHR.responseText));
			}
		});
		return result;
	},
	
	_asyncCall: function (options) {
		BetaJS.$.ajax({
			type: options.method,
			async: true,
			url: options.uri,
			dataType: options.decodeType ? options.decodeType : null, 
			data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
			success: function (response) {
				options.success(response);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				options.failure(jqXHR.status, errorThrown, JSON.parse(jqXHR.responseText));
			}
		});
	}

});

BetaJS.Browser.Cookies = {

	get : function(key) {
		var cookie = "; " + document.cookie;
		var parts = cookie.split("; " + key + "=");
		if (parts.length == 2)
			return parts.pop().split(";").shift();
		return null;
	},

	set : function(key, value) {
		var cookie = "; " + document.cookie;
		var parts = cookie.split("; " + key + "=");
		if (parts.length == 2)
			cookie = parts[0] + parts[1].substring(parts[1].indexOf(";"));
		document.cookie = key + "=" + value + cookie;
	}
};
BetaJS.Browser.Dom = {
	
	traverseNext: function (node, skip_children) {
		if ("get" in node)
			node = node.get(0);
		if (node.firstChild && !skip_children)
			return BetaJS.$(node.firstChild);
		if (!node.parentNode)
			return null;
		if (node.nextSibling)
			return BetaJS.$(node.nextSibling);
		return this.traverseNext(node.parentNode, true);
	},
	
	selectNode : function(node, offset) {
		node = BetaJS.$(node).get(0);
		var selection = null;
		var range = null;
		if (window.getSelection) {
			selection = window.getSelection();
			selection.removeAllRanges();
			range = document.createRange();
		} else if (document.selection) {
			selection = document.selection;
			range = selection.createRange();
		}
		if (offset) {
			range.setStart(node, offset);
			range.setEnd(node, offset);
			selection.addRange(range);
		} else {
			range.selectNode(node);
			selection.addRange(range);
		}
	},

	selectionStartNode : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).startContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().startContainer);
		return null;
	},
	
	selectedHtml : function() {
		if (window.getSelection)
			return window.getSelection().toString();
		else if (document.selection)
			return document.selection.createRange().htmlText;
		return "";
	},
	
	selectionAncestor : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).commonAncestorContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().parentElement());
		return null;
	},
	
	selectionStartOffset: function () {
		if (window.getSelection)
			return window.getSelection().getRangeAt(0).startOffset;
		else if (document.selection)
			return document.selection.createRange().startOffset;
		return null;
	},
	
	selectionEndOffset: function () {
		if (window.getSelection)
			return window.getSelection().getRangeAt(0).endOffset;
		else if (document.selection)
			return document.selection.createRange().endOffset;
		return null;
	},

	selectionStart : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).startContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().startContainer);
		return null;
	},

	selectionEnd : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).endContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().endContainer);
		return null;
	},
	
	selectionNonEmpty: function () {
		var start = this.selectionStart();
		var end = this.selectionEnd();
		return start && end && start.get(0) && end.get(0) && (start.get(0) != end.get(0) || this.selectionStartOffset() != this.selectionEndOffset());
	},
	
	selectionContained: function (node) {
		return node.has(this.selectionStart()).length > 0 && node.has(this.selectionEnd()).length > 0;
	},

	selectionNodes: function () {
		var result = [];
		var start = this.selectionStart();
		var end = this.selectionEnd();
		result.push(start);
		var current = start;
		while (current.get(0) != end.get(0)) {
			current = this.traverseNext(current);
			result.push(current);
		}
		return result;
	},
	
	selectionLeaves: function () {
		return BetaJS.Objs.filter(this.selectionNodes(), function (node) { return node.children().length === 0; });
	},
	
	contentSiblings: function (node) {
		return node.parent().contents().filter(function () {
			return this != node.get(0);
		});
	},
	
	remove_tag_from_parent_path: function (node, tag, context) {	
		tag = tag.toLowerCase();
		node = BetaJS.$(node);
		var parents = node.parents(context ? context + " " + tag : tag);
		for (var i = 0; i < parents.length; ++i) {
			var parent = parents.get(i);
			parent = BetaJS.$(parent);
			while (node.get(0) != parent.get(0)) {
				this.contentSiblings(node).wrap("<" + tag + "></" + tag + ">");
				node = node.parent();
			}
			parent.contents().unwrap();
		}
	},
	
	selectionSplitOffsets: function () {
		var startOffset = this.selectionStartOffset();
		var endOffset = this.selectionEndOffset();
		var start = this.selectionStart();
		var end = this.selectionEnd();
		var single = start.get(0) == end.get(0);
		if (endOffset < end.get(0).wholeText.length) {
			var endElem = end.get(0);
			endElem.splitText(endOffset);
			end = BetaJS.$(endElem);
			if (single)
				start = end;
		}
		if (startOffset > 0) {
			start = BetaJS.$(start.get(0).splitText(startOffset));
			if (single)
				end = start;
		}
		this.selectRange(start, end);
	},
	
	selectRange: function (start_node, end_node, start_offset, end_offset) {
		start_node = BetaJS.$(start_node);
		end_node = BetaJS.$(end_node);
		var selection = null;
		var range = null;
		if (window.getSelection) {
			selection = window.getSelection();
			selection.removeAllRanges();
			range = document.createRange();
		} else if (document.selection) {
			selection = document.selection;
			range = selection.createRange();
		}
		range.setStart(start_node.get(0), start_offset || 0);
		range.setEnd(end_node.get(0), end_offset || end_node.get(0).data.length);
		selection.addRange(range);
	},
	
	splitNode: function (node, start_offset, end_offset) {
		node = BetaJS.$(node);
		start_offset = start_offset || 0;
		end_offset = end_offset || node.get(0).data.length;
		if (end_offset < node.get(0).data.length) {
			var elem = node.get(0);
			elem.splitText(end_offset);
			node = BetaJS.$(elem);
		}
		if (start_offset > 0) 
			node = BetaJS.$(node.get(0).splitText(start_offset));
		return node;
	}
			
};

BetaJS.Browser = BetaJS.Browser || {};

/**
 * Uses modified portions of:
 * 
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */

BetaJS.Browser.Hotkeys = {
	
	SHIFT_NUMS: {
		"`":"~",
		"1":"!",
		"2":"@",
		"3":"#",
		"4":"$",
		"5":"%",
		"6":"^",
		"7":"&",
		"8":"*",
		"9":"(",
		"0":")",
		"-":"_",
		"=":"+",
		";":":",
		"'":"\"",
		",":"<",
		".":">",
		"/":"?",
		"\\":"|"
	},
	
	SPECIAL_KEYS: {
		'esc':27,
		'escape':27,
		'tab':9,
		'space':32,
		'return':13,
		'enter':13,
		'backspace':8,

		'scrolllock':145,
		'scroll_lock':145,
		'scroll':145,
		'capslock':20,
		'caps_lock':20,
		'caps':20,
		'numlock':144,
		'num_lock':144,
		'num':144,
		
		'pause':19,
		'break':19,
		
		'insert':45,
		'home':36,
		'delete':46,
		'end':35,
		
		'pageup':33,
		'page_up':33,
		'pu':33,

		'pagedown':34,
		'page_down':34,
		'pd':34,

		'left':37,
		'up':38,
		'right':39,
		'down':40,

		'f1':112,
		'f2':113,
		'f3':114,
		'f4':115,
		'f5':116,
		'f6':117,
		'f7':118,
		'f8':119,
		'f9':120,
		'f10':121,
		'f11':122,
		'f12':123
	},
	
	MODIFIERS: ["ctrl", "alt", "shift", "meta"],
	
	keyCodeToCharacter: function (code) {
		if (code == 188)
			return ",";
		else if (code == 190)
			return ".";
		return String.fromCharCode(code).toLowerCase();
	},
	
	register: function (hotkey, callback, context, options) {
		options = BetaJS.Objs.extend({
			"type": "keyup",
			"propagate": false,
			"disable_in_input": false,
			"target": document,
			"keycode": false
		}, options);
		options.target = BetaJS.$(options.target);
		var keys = hotkey.toLowerCase().split("+");
		var func = function (e) {
			if (options.disable_in_input) {
				var element = e.target || e.srcElement || null;
				if (element && element.nodeType == 3)
					element = element.parentNode;
				if (element && (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA'))
					return;
			}
			var code = e.keyCode || e.which || 0;
			var character = BetaJS.Browser.Hotkeys.keyCodeToCharacter(code);
			var kp = 0;
			var modifier_map = {};
			BetaJS.Objs.iter(BetaJS.Browser.Hotkeys.MODIFIERS, function (mod) {
				modifier_map[mod] = {
					pressed: e[mod + "Key"],
					wanted: false
				};
			}, this);
			BetaJS.Objs.iter(keys, function (key) {
				if (key in modifier_map) {
					modifier_map[key].wanted = true;
					kp++;
				} else if (key.length > 1) {
					if (BetaJS.Browser.Hotkeys.SPECIAL_KEYS[key] == code)
						kp++;
				} else if (options.keycode) {
					if (options.keycode == code)
						kp++;
				} else if (character == key || (e.shiftKey && BetaJS.Browser.Hotkeys.SHIFT_NUMS[character] == key)) {
					kp++;
				}
			}, this);
			if (kp == keys.length && BetaJS.Objs.all(modifier_map, function (data) { return data.wanted == data.pressed; })) {
				callback.apply(context || this);
				if (!options.propagate)
					e.preventDefault();
			}
		};
		options.target.on(options.type, func);
		return {
			target: options.target,
			type: options.type,
			func: func
		};
	},
	
	unregister: function (handle) {
		handle.target.off(handle.type, handle.func);
	} 
	
};

BetaJS.Browser = BetaJS.Browser || {};

BetaJS.Browser.Info = {
	
	getNavigator: function () {
		return {
			appCodeName: navigator.appCodeName,
			appName: navigator.appName,
			appVersion: navigator.appVersion,
			cookieEnabled: navigator.cookieEnabled,
			onLine: navigator.onLine,
			platform: navigator.platform,
			userAgent: navigator.userAgent
		};
	},
	
	__cache: {},
	
	__cached: function (key, value_func) {
		if (!(key in this.__cache))
			this.__cache[key] = value_func.apply(this);
		return this.__cache[key];
	},

	flash: function () {
		return this.__cached("flash", function () {
			return new BetaJS.Browser.FlashDetect();
		});
	},
	
	isiOS: function () {
		return this.__cached("isiOS", function () {
			var ua = navigator.userAgent;
			return ua.indexOf('iPhone') != -1 || ua.indexOf('iPod') != -1 || ua.indexOf('iPad') != -1;
		});
	},
	
	isChrome: function () {
		return this.__cached("isChrome", function () {
			return "chrome" in window;
		});
	},
	
	isAndroid: function () {
		return this.__cached("isAndroid", function () {
			return navigator.userAgent.toLowerCase().indexOf("android") != -1;
		});
	},
	
	isWebOS: function () {
		return this.__cached("isWebOS", function () {
			return navigator.userAgent.toLowerCase().indexOf("webos") != -1;
		});
	},

	isWindowsPhone: function () {
		return this.__cached("isWindowsPhone", function () {
			return navigator.userAgent.toLowerCase().indexOf("windows phone") != -1;
		});
	},

	isBlackberry: function () {
		return this.__cached("isBlackberry", function () {
			return navigator.userAgent.toLowerCase().indexOf("blackberry") != -1;
		});
	},

	iOSversion: function () {
		return this.__cached("iOSversion", function () {
			if (!this.isiOS())
				return false;
		    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		    return {
		    	major: parseInt(v[1], 10),
		    	minor: parseInt(v[2], 10),
		    	revision: parseInt(v[3] || 0, 10)
		    };
		});
	},
	
	isMobile: function () {
		return this.__cached("isMobile", function () {
			return this.isiOS() || this.isAndroid() || this.isWebOS() || this.isWindowsPhone() || this.isBlackberry();
		});
	},
	
	isInternetExplorer: function () {
		return this.__cached("isInternetExplorer", function () {
			//return navigator.appName == 'Microsoft Internet Explorer';
			return this.internetExplorerVersion() !== null;
		});
	},
	
	isFirefox: function () {
		return this.__cached("isFirefox", function () {
			return navigator.userAgent.toLowerCase().indexOf("firefox") != -1;
		});
	},
	
	isSafari: function () {
		return this.__cached("isSafari", function () {
			return !this.isChrome() && navigator.userAgent.toLowerCase().indexOf("safari") != -1;
		});
	},
	
	isWindows: function () {
		return this.__cached("isWindows", function () {
			return navigator.appVersion.toLowerCase().indexOf("win") != -1;
		});
	},
	
	isMacOS: function () {
		return this.__cached("isMacOS", function () {
			return navigator.appVersion.toLowerCase().indexOf("mac") != -1;
		});
	},
	
	isUnix: function () {
		return this.__cached("isUnix", function () {
			return navigator.appVersion.toLowerCase().indexOf("x11") != -1;
		});
	},
	
	isLinux: function () {
		return this.__cached("isLinux", function () {
			return navigator.appVersion.toLowerCase().indexOf("linux") != -1;
		});
	},
	
	internetExplorerVersion: function () {
		if (navigator.appName == 'Microsoft Internet Explorer') {
		    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		    if (re.exec(navigator.userAgent))
		    	return parseFloat(RegExp.$1);
		} else if (navigator.appName == 'Netscape') {
		    var re2 = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
		    if (re2.exec(navigator.userAgent))
		    	return parseFloat(RegExp.$1);
		}
		return null;
	}
	
};




/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/

BetaJS.Class.extend("BetaJS.Browser.FlashDetect", {
	
	constructor: function () {
		this._inherited(BetaJS.Browser.FlashDetect, "constructor");
		this.__version = null;
        if (navigator.plugins && navigator.plugins.length > 0) {
            var type = 'application/x-shockwave-flash';
            var mimeTypes = navigator.mimeTypes;
            if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description)
                this.__version = this.parseVersion(mimeTypes[type].enabledPlugin.description);
        } else if (navigator.appVersion.indexOf("Mac") == -1 && window.execScript) {
            for (var i = 0; i < this.__activeXDetectRules.length; i++) {
		        try {
		            var obj = new ActiveXObject(this.__activeXDetectRules[i].name);
		            var version = this.__activeXDetectRules[i].version(obj);
                    if (version) {
                    	this.__version = this.parseActiveXVersion(version);
                    	break;
                    }
		        } catch (err) { }
		    }
		}
	},
	
    parseVersion: function(str) {
        var descParts = str.split(/ +/);
        var majorMinor = descParts[2].split(/\./);
        var revisionStr = descParts[3];
        return {
            "raw": str,
            "major": parseInt(majorMinor[0], 10),
            "minor": parseInt(majorMinor[1], 10), 
            "revisionStr": revisionStr,
            "revision": parseInt(revisionStr.replace(/[a-zA-Z]/g, ""), 10)
        };
    },
	
    parseActiveXVersion : function(str) {
        var versionArray = str.split(",");
        return {
            "raw": str,
            "major": parseInt(versionArray[0].split(" ")[1], 10),
            "minor": parseInt(versionArray[1], 10),
            "revision": parseInt(versionArray[2], 10),
            "revisionStr": versionArray[2]
        };
    },
	
	version: function () {
		return this.__version;
	},
	
	installed: function () {
		return this.__version !== null;
	},
	
	supported: function () {
		return this.installed() || !BetaJS.Browser.Info.isiOS();
	},
	
    majorAtLeast : function (version) {
        return this.installed() && this.version().major >= version;
    },

    minorAtLeast : function (version) {
        return this.installed() && this.version().minor >= version;
    },

    revisionAtLeast : function (version) {
        return this.installed() && this.version().revision >= version;
    },

    versionAtLeast : function (major) {
    	if (!this.installed())
    		return false;
        var properties = [this.version().major, this.version().minor, this.version().revision];
        var len = Math.min(properties.length, arguments.length);
        for (i = 0; i < len; i++) {
            if (properties[i] != arguments[i]) 
            	return properties[i] > arguments[i];
        }
        return true;
    },
	
    __activeXDetectRules: [{
        name: "ShockwaveFlash.ShockwaveFlash.7",
        version: function(obj) {
	        try {
	            return obj.GetVariable("$version");
	        } catch(err) {
	        	return null;
	        }
	    }
	}, {
		name: "ShockwaveFlash.ShockwaveFlash.6",
        version: function(obj) {
            try {
                obj.AllowScriptAccess = "always";
		        try {
		            return obj.GetVariable("$version");
		        } catch(err) {
		        	return null;
		        }
            } catch(err) {
            	return "6,0,21";
            }
        }
	}, {
		name: "ShockwaveFlash.ShockwaveFlash",
		version: function(obj) {
	        try {
	            return obj.GetVariable("$version");
	        } catch(err) {
	        	return null;
	        }
        }
    }]

});
BetaJS.Browser = BetaJS.Browser || {};

BetaJS.Browser.Loader = {
	
	loadScript: function (url, callback, context) {
		var executed = false;
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.src = url;
		script.onload = script.onreadystatechange = function() {
			if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				executed = true;
				script.onload = script.onreadystatechange = null;
				if (callback)
					callback.apply(context || this, [url]);
				// Does not work properly if we remove the script for some reason if it is used the second time !?
				//head.removeChild(script);
			}
		};
		head.appendChild(script);
	},
	
	inlineStyles: function (styles) {
		BetaJS.$('<style>' + styles + "</style>").appendTo("head");
	}

};
BetaJS.Browser = BetaJS.Browser || {}; 

/** @class */
BetaJS.Browser.Router = BetaJS.Class.extend("BetaJS.Browser.Router", [
	BetaJS.Events.EventsMixin,
	/** @lends BetaJS.Browser.Router.prototype */
	{
		
	/** Specifies all routes. Can either be an associative array, an array of associative arrays or a function returning one of those.
	 * 
	 * <p>A route is a mapping from a regular expression to a route descriptor. A route descriptor is either a name of a callback function or a route descriptor associative array.</p>
	 * <p>The callback function should accept the parameters given by the capturing groups of the regular expression</p>
	 * The route descriptor object may contain the following options:
	 * <ul>
	 *   <li>
	 *     action: the callback function; either a string or a function (mandatory)
	 *   </li>
	 *   <li>
	 *     path: name of the route; can be used to look up route (optional)
	 *   </li>
	 *   <li>
	 *     applicable: array of strings or functions or string or function to determine whether the route is applicable; if it is not, it will be skipped (optional)
	 *   </li>
	 *   <li>
	 *     valid: array of strings or functions or string or function to determine whether an applicable route is valid; if it is not, the routing fails (optional)
	 *   </li>
	 * </ul>
	 * @return routes
	 * @example
	 * return {
	 * 	"users/(\d+)/post/(\d+)" : "users_post",
	 *  "users/(\d+)/account": {
	 * 	  action: "users_account",
	 *    path: "users_account_path",
	 *    applicable: "is_user",
	 *    valid: "is_admin"
	 *  }
	 * }
	 */	
	routes: [],
	
	/** Creates a new router with options
	 * <ul>
	 *  <li>routes: adds user defined routes</li> 
	 *  <li>actions: extends the object by user-defined actions</li>
	 * </ul>
	 * @param options options
	 */
	constructor: function (options) {
		this._inherited(BetaJS.Browser.Router, "constructor");
		var routes = BetaJS.Types.is_function(this.routes) ? this.routes() : this.routes;
		if (!BetaJS.Types.is_array(routes))
			routes = [routes];
		if ("routes" in options) {
			if (BetaJS.Types.is_array(options["routes"]))
				routes = routes.concat(options["routes"]);
			else
				routes.push(options["routes"]);
		}
		this.__routes = [];
		this.__paths = {};
		this.__current = null;
		BetaJS.Objs.iter(routes, function (assoc) {
			BetaJS.Objs.iter(assoc, function (obj, key) {
				if (BetaJS.Types.is_string(obj))
					obj = {action: obj};
				obj.key = key;
				obj.route = new RegExp("^" + key + "$");
				if (!("applicable" in obj))
					obj.applicable = [];
				else if (!BetaJS.Types.is_array(obj.applicable))
					obj.applicable = [obj.applicable];
				if (!("valid" in obj))
					obj.valid = [];
				else if (!BetaJS.Types.is_array(obj.valid))
					obj.valid = [obj.valid];
				if (!("path" in obj))
					obj.path = obj.key;
				this.__routes.push(obj);
				this.__paths[obj.path] = obj;
			}, this);
		}, this);
		if ("actions" in options)
			BetaJS.Objs.iter(options.actions, function (action, key) {
				this[key] = action;
			}, this);
	},
	
	destroy: function() {
		this.__leave();
		this._inherited(BetaJS.Browser.Router, "destroy");
	},
	
	/** Parse a given route and map it to the first applicable object that is valid
	 * @param route the route given as a strings
	 * @return either null if nothing applicable and valid could be matched or an associative array with params and routing object as attributes.
	 */
	parse: function (route) {
		for (var i = 0; i < this.__routes.length; ++i) {
			var obj = this.__routes[i];
			var result = obj.route.exec(route);
			if (result !== null) {
				result.shift(1);
				var applicable = true;
				BetaJS.Objs.iter(obj.applicable, function (s) {
					var f = BetaJS.Types.is_string(s) ? this[s] : s;
					applicable = applicable && f.apply(this, result);
				}, this);
				if (!applicable)
					continue;
				var valid = true;
				BetaJS.Objs.iter(obj.valid, function (s) {
					var f = BetaJS.Types.is_string(s) ? this[s] : s;
					valid = valid && f.apply(this, result);
				}, this);
				if (!valid)
					return null;
				return {
					object: obj,
					params: result
				};
			}
		}
		return null;
	},
	
	/** Looks up the routing object given a path descriptor
 	 * @param path the path descriptor
 	 * @return the routing object
	 */
	object: function (path) {
		return this.__paths[path];
	},
	
	/** Returns the route of a path description
	 * @param path the path descriptor
	 * @param parameters parameters that should be attached to the route (capturing groups)
	 */
	path: function (path) {
		var key = this.object(path).key;
		var args = Array.prototype.slice.apply(arguments, [1]);
		var regex = /\(.*?\)/;
		while (true) {
			var arg = args.shift();
			if (!arg)
				break;
			key = key.replace(regex, arg);
		}
		return key;
	},
	
	/** Navigate to a given route, invoking the matching action.
 	 * @param route the route
	 */
	navigate: function (route) {
		this.trigger("navigate", route);
		var result = this.parse(route);
		if (result === null) {
			this.trigger("navigate-fail", route);
			return false;
		}
		this.trigger("navigate-success", result.object, result.params);
		return this.invoke(result.object, result.params, route);
	},
	
	/** Invoke a routing object with parameters
	 * <p>
	 *   Invokes the protected method _invoke
	 * </p>
	 * @param object the routing object
	 * @param params (optional) the parameters that should be attached to the route
	 * @param route (optional) an associated route that should be saved
	 */
	invoke: function (object, params, route) {
		route = route || this.path(object.key, params);
		this.trigger("before_invoke", object, params, route);
		this.__enter(object, params, route);
		this.trigger("after_invoke", object, params, route);
		var result = this._invoke(object, params);
		return result;
	},
	
	/** Invokes a routing object with parameters.
	 * <p>
	 *   Can be overwritten and does the invoking.
	 * </p>
	 * @param object the routing object
	 * @param params (optional) the parameters that should be attached to the route
	 */
	_invoke: function (object, params) {
		var f = object.action;
		if (BetaJS.Types.is_string(f))
			f = this[f];
		return f.apply(this, params);
	},
	
	__leave: function () {
		if (this.__current !== null) {
			this.trigger("leave", this.__current);
			this.__current.destroy();
			this.__current = null;
		}
	},
	
	__enter: function (object, params, route) {
		this.__leave();
		this.__current = new BetaJS.Events.Events();
		this.__current.route = route;
		this.__current.object = object;
		this.__current.params = params;
		this.trigger("enter", this.__current);
	},
	
	/** Returns the current route object.
	 * <ul>
	 *  <li>route: the route as string</li>
	 *  <li>object: the routing object</li>
	 *  <li>params: the params</li>
	 * </ul>
	 */
	current: function () {
		return this.__current;
	}
		
}]);


BetaJS.Class.extend("BetaJS.Browser.RouterHistory", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (router) {
		this._inherited(BetaJS.Browser.RouterHistory, "constructor");
		this.__router = router;
		this.__history = [];
		router.on("after_invoke", this.__after_invoke, this);
	},
	
	destroy: function () {
		this.__router.off(null, null, this);
		this._inherited(BetaJS.Browser.RouterHistory, "destroy");
	},
	
	__after_invoke: function (object, params) {
		this.__history.push({
			object: object,
			params: params
		});
		this.trigger("change");
	},
	
	last: function (index) {
		index = index || 0;
		return this.get(this.count() - 1 - index);
	},
	
	count: function () {
		return this.__history.length;
	},
	
	get: function (index) {
		index = index || 0;
		return this.__history[index];
	},
	
	getRoute: function (index) {
		var item = this.get(index);
		return this.__router.path(item.object.path, item.params);
	},
	
	back: function (index) {
		if (this.count() < 2)
			return null;
		index = index || 0;
		while (index >= 0 && this.count() > 1) {
			this.__history.pop();
			--index;
		}
		var item = this.__history.pop();
		this.trigger("change");
		return this.__router.invoke(item.object, item.params);
	}
	
}]);


BetaJS.Class.extend("BetaJS.Browser.RouteBinder", {

	constructor: function (router) {
		this._inherited(BetaJS.Browser.RouteBinder, "constructor");
		this.__router = router;
		this.__router.on("after_invoke", function (object, params, route) {
			if (this._getExternalRoute() != route)
				this._setExternalRoute(route);
		}, this);
	},
	
	destroy: function () {
		this.__router.off(null, null, this);
		this._inherited(BetaJS.Browser.RouteBinder, "destroy");
	},
	
	current: function () {
		return this._getExternalRoute();
	},
	
	_setRoute: function (route) {
		var current = this.__router.current();
		if (current && current.route == route)
			return;
		this.__router.navigate(route);
	},
	
	_getExternalRoute: function () { return ""; },
	_setExternalRoute: function (route) { }
	
});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.HashRouteBinder", {
	
	constructor: function (router) {
		this._inherited(BetaJS.Browser.HashRouteBinder, "constructor", router);
		var self = this;
		BetaJS.$(window).on("hashchange.events" + this.cid(), function () {
			self._setRoute(self._getExternalRoute());
		});
	},
	
	destroy: function () {
		BetaJS.$(window).off("hashchange.events" + this.cid());
		this._inherited(BetaJS.Browser.HashRouteBinder, "destroy");
	},
	
	_getExternalRoute: function () {
		var hash = window.location.hash;
		return (hash.length && hash[0] == '#') ? hash.slice(1) : hash;
	},
	
	_setExternalRoute: function (route) {
		window.location.hash = "#" + route;
	}

});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.HistoryRouteBinder", {
		
	constructor: function (router) {
		this._inherited(BetaJS.Browser.HistoryRouteBinder, "constructor", router);
		var self = this;
		this.__used = false;
		BetaJS.$(window).on("popstate.events" + this.cid(), function () {
			if (self.__used)
				self._setRoute(self._getExternalRoute());
		});
	},
	
	destroy: function () {
		BetaJS.$(window).off("popstate.events" + this.cid());
		this._inherited(BetaJS.Browser.HistoryRouteBinder, "destroy");
	},

	_getExternalRoute: function () {
		return window.location.pathname;
	},
	
	_setExternalRoute: function (route) {
		window.history.pushState({}, document.title, route);
		this.__used = true;
	}
}, {
	supported: function () {
		return window.history && window.history.pushState;
	}
});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.LocationRouteBinder", {
	_getExternalRoute: function () {
		return window.location.pathname;
	},
	
	_setExternalRoute: function (route) {
		window.location.pathname = route;
	}
});
BetaJS.Stores.StoreException.extend("BetaJS.Stores.RemoteStoreException", {
	
	constructor: function (source) {
		source = BetaJS.Browser.AjaxException.ensure(source);
		this._inherited(BetaJS.Stores.RemoteStoreException, "constructor", source.toString());
		this.__source = source;
	},
	
	source: function () {
		return this.__source;
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.RemoteStore", {

	constructor : function(uri, ajax, options) {
		this._inherited(BetaJS.Stores.RemoteStore, "constructor", options);
		this._uri = uri;
		this.__ajax = ajax;
		this.__options = BetaJS.Objs.extend({
			"update_method": "PUT",
			"uri_mappings": {}
		}, options || {});
	},
	
	_supports_async_write: function () {
		return true;
	},

	_supports_async_read: function () {
		return false;
	},

	getUri: function () {
		return this._uri;
	},
	
	prepare_uri: function (action, data) {
		if (this.__options["uri_mappings"][action])
			return this.__options["uri_mappings"][action](data);
		if (action == "remove" || action == "get" || action == "update")
			return this.getUri() + "/" + data[this._id_key];
		return this.getUri();
	},

	_include_callbacks: function (opts, error_callback, success_callback) {
		opts.failure = function (status_code, status_text, data) {
			error_callback(new BetaJS.Stores.RemoteStoreException(new BetaJS.Browser.AjaxException(status_code, status_text, data)));
		};
		opts.success = success_callback;
		return opts;
	},

	_insert : function(data, callbacks) {
		try {
			var opts = {method: "POST", uri: this.prepare_uri("insert", data), data: data};
			if (this._async_write) 
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success));
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
		return true;
	},

	_remove : function(id, callbacks) {
		try {
			var data = {};
			data[this._id_key] = id;
			var opts = {method: "DELETE", uri: this.prepare_uri("remove", data)};
			if (this._async_write) {
				var self = this;
				opts = this._include_callbacks(opts, callbacks.exception, function (response) {
					if (!response) {
						response = {};
						response[self._id_key] = id;
					}
					callbacks.success(response);
				});
				this.__ajax.asyncCall(opts);
			} else {
				var response = this.__ajax.syncCall(opts);
				if (!response) {
					response = {};
					response[this._id_key] = id;
				}
				return response;
			}
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
		return true;
	},

	_get : function(id, callbacks) {
		var data = {};
		data[this._id_key] = id;
		try {
			var opts = {uri: this.prepare_uri("get", data)};
			if (this._async_read)
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success));
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
		return true;
	},

	_update : function(id, data, callbacks) {
		var copy = BetaJS.Objs.clone(data, 1);
		copy[this._id_key] = id;
		try {
			var opts = {method: this.__options.update_method, uri: this.prepare_uri("update", copy), data: data};
			if (this._async_write)
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success));
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
		return true;
	},
	
	_query : function(query, options, callbacks) {
		try {		
			var opts = this._encode_query(query, options);
			if (this._async_read) {
				var self = this;
				opts = this._include_callbacks(opts, callbacks.exception, function (response) {
					callbacks.success(BetaJS.Types.is_string(raw) ? JSON.parse(raw) : raw);
				});
				this.__ajax.asyncCall(opts);
				return true;
			} else {
				var raw = this.__ajax.syncCall(opts);
				return BetaJS.Types.is_string(raw) ? JSON.parse(raw) : raw;
			}
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
	},
	
	_encode_query: function (query, options) {
		return {
			uri: this.prepare_uri("query")
		};		
	}
	
});


BetaJS.Stores.RemoteStore.extend("BetaJS.Stores.QueryGetParamsRemoteStore", {

	constructor : function(uri, ajax, capability_params, options) {
		this._inherited(BetaJS.Stores.QueryGetParamsRemoteStore, "constructor", uri, ajax, options);
		this.__capability_params = capability_params;
	},
	
	_query_capabilities: function () {
		var caps = {};
		if ("skip" in this.__capability_params)
			caps.skip = true;
		if ("limit" in this.__capability_params)
			caps.limit = true;
		return caps;
	},

	_encode_query: function (query, options) {
		options = options || {};
		var uri = this.getUri() + "?"; 
		if (options["skip"] && "skip" in this.__capability_params)
			uri += this.__capability_params["skip"] + "=" + options["skip"] + "&";
		if (options["limit"] && "limit" in this.__capability_params)
			uri += this.__capability_params["limit"] + "=" + options["limit"] + "&";
		return {
			uri: uri
		};		
	}

});
BetaJS.$ = jQuery || null;

BetaJS.Exceptions.Exception.extend("BetaJS.Views.ViewException");

/** @class */
BetaJS.Views.View = BetaJS.Class.extend("BetaJS.Views.View", [
    BetaJS.Events.EventsMixin,                                            
	BetaJS.Events.ListenMixin,
	BetaJS.Properties.PropertiesMixin,
	BetaJS.Classes.ModuleMixin,
	/** @lends BetaJS.Views.View.prototype */
	{
		
    /** Container html element of the view as jquery object
     */
	$el: null,
	
    
    /** Returns all templates to be pre-loaded.
     * <p>It should return an associative array of templates. The keys are user-defined identifiers, the values are either the template strings or a jquery object containing the template.</p>
     * @return associative array of templates
     * @example
     * return {
     * 	"default": BetaJS.Templates.Cached["my-view-template"],
     *  "inner": $("#inner-template"),
     *  "item": '< p >{%= item.get("text") %}< /p >'
     * }
     */
	_templates: function () {
		return {};
	},
	
    /** Returns all dynamics to be pre-loaded.
     * <p>It should return an associative array of dynamics. The keys are user-defined identifiers, the values are either the template strings or a jquery object containing the template.</p>
     * @return associative array of dynamics
     */
	_dynamics: function () {
		// {"name": "string" or jquery selector}
		return {};
	},
	
	/** Returns all events that the view is listening to.
	 * <p>It should return an associative array of event bindings. The keys are strings composed of the event name and the jquery selector that specifies to which elements the event should be bound to. The value is the name of the method that should be called when the event is fired.</p>
	 * <p>Note: It is also possible to return an array of associative arrays. You should do that if you want to bind more than one method to a single key.</p> 
	 * @return associative array of events
	 * @example
	 * return {
	 * 	"click #button": "_clickButton",
	 *  "change #input": "_inputChanged",
	 *  "blur": "_containerElementBlur"
	 * }  
	 */
	_events: function () {
		// [{"event selector": "function"}]
		return [];
	},
	
	_global_events: function () {
		// [{"event selector": "function"}]
		return [];
	},

	/** Returns all default css classes that should be used for this view. 
	 * <p>They can be overwritten by the parent view or by options.
	 * The keys are internal identifiers that the view uses to lookup the css classed that are to be used.
	 * The values are the actual names of the css classes.</p>
	 * @return associative array of css classes
	 * @example
	 * return {
	 * 	"main-class": "default-main-class",
	 *  "item-class": "default-item-class"
	 * }
	 */
	_css: function () {
		// {"identifier": "css-class"}
		return {};
	},
	
	/** Returns css class by identifier.
	 * <p>The return strategy has the following priorities: options, parent, defaults.</p>
	 * @param ident identifier of class
	 * @example
	 * this.css("main_class")
	 */
	css: function (ident) {
		if (this.__css[ident])
			return this.__css[ident];
		var css = null;
		if (this.__parent) {
			css = this.__parent.css(ident);
			if (css && css != ident)
				return css;
		}
		css = this._css();
		if (css[ident])
			return css[ident];
		return ident;
	},
	
	/** Is called by the view when the view needs to be rendered.
	 * <p>By default, the function renders the template or dynamic named "default" and passes the default arguments to it.</p>
	 * 
	 */
	_render: function () {
		if (this.__html)
			this.$el.html(this.__html);
		else if (this.__templates["default"])
			this.$el.html(this.evaluateTemplate("default", {}));
		else if (this.__dynamics["default"])
			this.evaluateDynamics("default", this.$el, {}, {name: "default"});
	},
	
	/** Returns a template associated with the view
	 * @param key identifier of template
	 * @return template object
	 */
	templates: function (key) {
		return key in this.__templates ? this.__templates[key] : null;
	},
	
	/** Returns a dynamic associated with the view
	 * @param key identifier of dynamic
	 * @return template object
	 */
	dynamics: function (key) {
		return key in this.__dynamics ? this.__dynamics[key] : null;
	},

	/** Support Routines for Templates and Dynamics
	 * <ul>
	 *  <li>supp.css(key): Returns css class associated with key</li>
	 *  <li>supp.attrs(obj): Returns html code for all html attributes specified by obj</li>
	 *  <li>supp.styles(obj): Returns html code for all styles specified by obj</li>
	 *  <li>supp.selector(name): Returns html code for data-selector='name'</li>
	 * </ul>
	 * @example
	 * < label class="{%= supp.css("main-class") %}" {%= supp.attrs({id: "test", title: "foo"}) %} {%= supp.selector("bar") %} > < /label >
	 * results in
	 * < label class="default-main-class" id="test" title="foo" data-selector="bar" > < /label >
	 */
	_supp: function () {
		return {
			__context: this,
			css: function (key) {
				return this.__context.css(key);
			},
			attrs: function (obj) {
				var s = "";
				for (var key in obj)
					s += (!obj[key] ? key : (key + "='" + obj[key] + "'")) + " ";
				return s;
			},
			styles: function (obj) {
				var s = "";
				for (var key in obj)
					s += (key + ":" + obj[key] + "") + ";";
				return s;
			},
			selector: function (name) {
				return "data-selector='" + name + "' ";
			},
			view_id: this.cid()
		};
	},
	
	/** Returns all arguments that are passed to every template by default.
	 * <p>By default, this function returns the support routines supp and all properties that have been set via this.set or that have been set via this._setOptionProperty</p>
	 * @return associative array of template arguments  
	 */
	templateArguments: function () {
		var args = this.getAll();
		args.supp = this._supp();
		return args;
	},
	
	/** Evaluates a template with used-defined arguments.
	 * 
	 * @param key identifier of template 
	 * @param args arguments to be given to the template (optional)
	 * @return html string of evaluated template
	 */
	evaluateTemplate: function (key, args) {
		args = args || {};
		return this.__templates[key].evaluate(BetaJS.Objs.extend(args, this.templateArguments()));
	},
	
	/** Evaluates a dynamic and binds it to a given element with used-defined arguments and options.
	 * 
	 * @param key identifier of dynamic
	 * @param element jquery element to which the dynamic should be bound to 
	 * @param args arguments to be given to the dynamic (optional)
	 * @param options options to be passed to the dynamic (name is the most important one, see documentation)
	 * @return dynamic instance
	 */
	evaluateDynamics: function (key, element, args, options) {
		return this.__dynamics[key].renderInstance(element, BetaJS.Objs.extend(options || {}, {args: args || {}}));
	},

	/** Sets a private variable from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 * @param prefix (optional) per default is "__"
	 */
	_setOption: function (options, key, value, prefix) {
		prefix = prefix ? prefix : "__";
		this[prefix + key] = (options && key in options) && (BetaJS.Types.is_defined(options[key])) ? options[key] : value;
	},
	
	/** Sets a private typed variable from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 * @param type param type
	 * @param prefix (optional) per default is "__"
	 */
	_setOptionTyped: function (options, key, value, type, prefix) {
		this._setOption(options, key, this.cls._parseType(value, type), prefix);
	},

	/** Sets property variable (that will be passed to templates and dynamics by default) from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 */
	_setOptionProperty: function (options, key, value) {
		this.set(key, (options && key in options) && (BetaJS.Types.is_defined(options[key])) ? options[key] : value);
	},
	
	/** Sets typed property variable (that will be passed to templates and dynamics by default) from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 * @param type param type
	 */
	_setOptionPropertyTyped: function (options, key, value, typed) {
		this._setOptionProperty(options, key, this.cls._parseType(value, type));
	},
	
	/** Creates a new view with options
	 * <ul>
	 *  <li>el: the element to which the view should bind to; either a jquery selector or a jquery element</li> 
	 *  <li>visible: (default true) should the view be visible initially</li>
	 *  <li>html: (default null) string that should be used as default rendering</li>
	 *  <li>events: (default []) events that should be used additionally</li>
	 *  <li>attributes: (default {}) attributes that should be attached to container</li>
	 *  <li>el_classes: (default []) css classes that should be attached to container</li>
	 *  <li>el_styles: (default {}) styles that should be attached to container</li>
	 *  <li>children_classes: (default []) css classes that should be attached to all direct children</li>
	 *  <li>children_styles: (default {}) styles that should be attached to all direct children</li>
	 *  <li>css: (default {}) css classes that should be overwritten</li>
	 *  <li>templates: (default {}) templates that should be overwritten</li>
	 *  <li>dynamics: (default: {}) dynamics that should be overwritten</li>
	 *  <li>properties: (default: {}) properties that should be added (and passed to templates and dynamics)</li>
	 *  <li>invalidate_on_change: (default: false) rerender view on property change</li>
	 *  <li>invalidate_on_show: (default: false) invalidate view on show</li>
	 *  <li>append_to_el: (default: false) append to el instead of replacing content</li>
	 * </ul>
	 * @param options options
	 */
	constructor: function (options) {
		options = options || {};
		this._inherited(BetaJS.Views.View, "constructor");
		this._setOption(options, "el", null);
		this._setOption(options, "visible", true);
		this._setOption(options, "html", null);
		this._setOption(options, "events", []);
		this._setOption(options, "attributes", {});
		this._setOption(options, "invalidate_on_show", false);
		this._setOption(options, "append_to_el", false);
		this.__old_attributes = {};
		this._setOption(options, "el_classes", []);
		if (BetaJS.Types.is_string(this.__el_classes))
			this.__el_classes = this.__el_classes.split(" ");
		this.__added_el_classes = [];
		this._setOption(options, "el_styles", {});
		this._setOption(options, "children_styles", {});
		this._setOption(options, "children_classes", []);
		if (BetaJS.Types.is_string(this.__children_classes))
			this.__children_classes = this.__children_classes.split(" ");
		this._setOption(options, "invalidate_on_change", false);
		this.__old_el_styles = {};
		this._setOption(options, "css", {});
		this.__parent = null;
		this.__children = {};
		this.__active = false;
		this.$el = null;
		var events = BetaJS.Types.is_function(this._events) ? this._events() : this._events;
		if (!BetaJS.Types.is_array(events))
			events = [events]; 
		this.__events = events.concat(this.__events);

		var global_events = BetaJS.Types.is_function(this._global_events) ? this._global_events() : this._global_events;
		if (!BetaJS.Types.is_array(global_events))
			global_events = [global_events]; 
		this.__global_events = global_events;

		var templates = BetaJS.Objs.extend(BetaJS.Types.is_function(this._templates) ? this._templates() : this._templates, options["templates"] || {});
		if ("template" in options)
			templates["default"] = options["template"];
		this.__templates = {};
		var key = null;
		for (key in templates) {
			if (!templates[key])
				throw new BetaJS.Views.ViewException("Could not find template '" + key + "' in View '" + this.cls.classname + "'");
			this.__templates[key] = new BetaJS.Templates.Template(BetaJS.Types.is_string(templates[key]) ? templates[key] : templates[key].html());
		}

		var dynamics = BetaJS.Objs.extend(BetaJS.Types.is_function(this._dynamics) ? this._dynamics() : this._dynamics, options["dynamics"] || {});
		if ("dynamic" in options)
			dynamics["default"] = options["dynamic"];
		this.__dynamics = {};
		for (key in dynamics)
			this.__dynamics[key] = new BetaJS.Views.DynamicTemplate(this, BetaJS.Types.is_string(dynamics[key]) ? dynamics[key] : dynamics[key].html());

		this.setAll(options["properties"] || {});
		if (this.__invalidate_on_change)
			this.on("change", function () {
				this.invalidate();
			}, this);

		this.__modules = {};
		BetaJS.Objs.iter(options.modules || [], this.add_module, this);

		this._notify("created", options);
		this.ns = {};
		var domain = this._domain();
		var domain_defaults = this._domain_defaults();
		var view_name = null;
		if (!BetaJS.Types.is_empty(domain)) {
			var viewlist = [];
			for (view_name in domain)
				viewlist.push({
					name: view_name,
					data: domain[view_name]
				});
			viewlist = BetaJS.Sort.dependency_sort(viewlist, function (data) {
				return data.name;
			}, function (data) {
				return data.data.before || [];
			}, function (data) {
				var after = data.data.after || [];
				if (data.data.parent)
					after.push(data.data.parent);
				return after;
			});
			for (var i = 0; i < viewlist.length; ++i) {
				view_name = viewlist[i].name;
				var record = viewlist[i].data;
				var record_options = record.options || {};
				if (BetaJS.Types.is_function(record_options))
					record_options = record_options.apply(this, [this]);
				var default_options = domain_defaults[record.type] || {};
				if (BetaJS.Types.is_function(default_options))
					default_options = default_options.apply(this, [this]);
				record_options = BetaJS.Objs.tree_merge(default_options, record_options);
				if (record.type in BetaJS.Views)
					record.type = BetaJS.Views[record.type];
				if (BetaJS.Types.is_string(record.type))
					record.type = BetaJS.Scopes.resolve(record.type);
				var view = new record.type(record_options);
				this.ns[view_name] = view;
				var parent_options = record.parent_options || {};
				var parent = this;
				if (record.parent)
					parent = BetaJS.Scopes.resolve(record.parent, this.ns);
				if (record.method)
					record.method(parent, view);
				else
					parent.addChild(view, parent_options);
				view.domain = this;
				var event = null;
				for (event in record.events || {})
					view.on(event, record.events[event], view);
				for (event in record.listeners || {})
					this.on(event, record.listeners[event], view);
			}		
		}
	},
	
	_domain: function () {
		return {};
	},
	
	_domain_defaults: function () {
		return {};
	},

	/** Returns whether this view is active (i.e. bound and rendered) 
	 * @return active  
	 */
	isActive: function () {
		return this.__active;
	},
	
	/** Activates view and all added sub views
	 *  
	 */
	activate: function () {
		if (this.isActive())
			return this;
		if (this.__parent && !this.__parent.isActive())
			return null;
		if (this.__parent)
			this.$el = !this.__el ? this.__parent.$el : this.__parent.$(this.__el);
		else
			this.$el = BetaJS.$(this.__el);
		if (this.$el.size() === 0)
			this.$el = null;
		if (!this.$el)
			return null;
		if (this.__append_to_el) {
			this.$el.append("<div data-view-id='" + this.cid() + "'></div>");
			this.$el = this.$el.find("[data-view-id='" + this.cid() + "']");
		}
		this.__old_attributes = {};
		var key = null;
		var old_value = null;
		for (key in this.__attributes) {
			old_value = this.$el.attr(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_attributes[key] = old_value;
			else
				this.__old_attributes[key] = null;
			this.$el.attr(key, this.__attributes[key]);
		}
		this.__added_el_classes = [];
		var new_el_classes = this._el_classes().concat(this.__el_classes);
		for (var i = 0; i < new_el_classes.length; ++i) {
			if (!this.$el.hasClass(new_el_classes[i])) {
				this.$el.addClass(new_el_classes[i]);
				this.__added_el_classes.push(new_el_classes[i]);
			}
		}
		this.__old_el_styles = {};
		var new_el_styles = BetaJS.Objs.extend(this._el_styles(), this.__el_styles);
		for (key in new_el_styles)  {
			old_value = this.$el.css(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_el_styles[key] = old_value;
			else
				this.__old_el_styles[key] = null;
			this.$el.css(key, new_el_styles[key]);
		}
		this.__bind();
		if (!this.__visible)
			this.$el.css("display", this.__visible ? "" : "none");
		this.__active = true;
		this.__render();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.activate();
		});
		this._notify("activate");
		this.trigger("activate");
		if (this.__visible)
			this.trigger("show");
		this.trigger("visibility", this.__visible);
		this.trigger("resize");
		return this;
	},
	
	/** Deactivates view and all added sub views
	 * 
	 */
	deactivate: function () {
		if (!this.isActive())
			return false;
		if (this.__visible)
			this.trigger("hide");
		this.trigger("visibility", false);
		this._notify("deactivate");
		this.trigger("deactivate");
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.deactivate();
		});
		this.__active = false;
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
		this.__unbind();
		this.$el.html("");
		var key = null;
		for (key in this.__old_attributes) 
			this.$el.attr(key, this.__old_attributes[key]);
		for (var i = 0; i < this.__added_el_classes.length; ++i)
			this.$el.removeClass(this.__added_el_classes[i]);
		for (key in this.__old_el_styles) 
			this.$el.css(key, this.__old_el_styles[key]);
		if (this.__append_to_el)
			this.$el.remove();
		this.$el = null;
		return true;
	},
	
	/** Returns an associate array of styles that should be attached to the element
	 * @return styles
	 * @example
	 * return {"color": "red"};
	 * or
	 * var styles = {};
	 * styles.color = "red";
	 * return styles; 
	 */
	_el_styles: function () {
		return {};
	},
	
	/** Returns an array of classes that should be attached to the element
	 * @return classes
	 * @example
	 * return ["test-css-class"]
	 */
	_el_classes: function () {
		return [];
	},
	
	/** Finds an element within the container of the view
	 * @param selector a jquery selector
	 * @return the jquery element(s) it matched 
	 */
	$: function(selector) {
		return this.$el.find(selector);
	},
	
	/** Finds an element within a subelement that matches a set of data attributes
	 * 
	 * @param selectors associative array, e.g. {"selector": "container", "view-id": this.cid()}
	 * @param elem (optional, default is $el) the element we search in
	 * @return the jquery element(s) it matched
	 */
	$data: function(selectors, elem) {
		if (!elem)
			elem = this.$el;
		var s = "";
		for (var key in selectors)
			s += "[data-" + key + "='" + selectors[key] + "']";
		return elem.find(s);
	},
	
	/** Destroys the view
	 * 
	 */
	destroy: function () {
		this.deactivate();
		this.setParent(null);
		var c = this.__children;
		this.__children = {};		
		BetaJS.Objs.iter(c, function (child) {
			child.view.destroy();
		});
		this.__children = {};
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.destroy();
		}, this);
		BetaJS.Objs.iter(this.__templates, function (template) {
			template.destroy();
		}, this);
		this.trigger("destroy");
		this._inherited(BetaJS.Views.View, "destroy");
	},
	
	/** Makes the view visible
	 * 
	 */
	show: function () {
		this.setVisibility(true);
	},
	
	/** Makes the view invisible
	 * 
	 */
	hide: function () {
		this.setVisibility(false);
	},
	
	isVisible: function () {
		return this.__visible;
	},
	
	/** Sets the visibility of the view
	 * @param visible visibility
	 */
	setVisibility: function (visible) {
		if (visible == this.__visible)
			return;
		this.__visible = visible;
		if (this.isActive()) {
			this.$el.css("display", this.__visible ? "" : "none");
			if (this.__visible) {
				this.trigger("resize");
				if (this.__invalidate_on_show)
					this.invalidate();	
			}
			this.trigger(visible ? "show" : "hide");
			this.trigger("visibility", visible);		
		}
		if (this.__parent)
			this.__parent.updateChildVisibility(this);	
	},
	
	updateChildVisibility: function (child) {		
	},
	
	toggle: function () {
		this.setVisibility(!this.isVisible());
	},
	
	__bind: function () {
		var self = this;
		this.__unbind();
		BetaJS.Objs.iter(this.__events, function (obj) {
			BetaJS.Objs.iter(obj, function (value, key) {
				var func = BetaJS.Types.is_function(value) ? value : self[value];
		        var match = key.match(BetaJS.Views.BIND_EVENT_SPLITTER);
		        var event = match[1];
		        var selector = match[2];
		        event = event + ".events" + self.cid();
		        var method = BetaJS.Functions.as_method(func, self);
		        if (selector === '')
		        	self.$el.on(event, method);
		        else
		        	self.$el.on(event, selector, method);
			});
		});
		BetaJS.Objs.iter(this.__global_events, function (obj) {
			BetaJS.Objs.iter(obj, function (value, key) {
				var func = BetaJS.Types.is_function(value) ? value : self[value];
		        var match = key.match(BetaJS.Views.BIND_EVENT_SPLITTER);
		        var event = match[1];
		        var selector = match[2];
		        event = event + ".events" + self.cid();
		        var method = BetaJS.Functions.as_method(func, self);
		        if (selector === '')
		        	BetaJS.$(document).on(event, method);
		        else
		        	BetaJS.$(document).on(event, selector, method);
			});
		});
	},
	
	__unbind: function () {
		this.$el.off('.events' + this.cid());
		BetaJS.$(document).off('.events' + this.cid());
	},
	
	__render: function () {
		if (!this.isActive())
			return;
		this._render();
		var q = this.$el.children();
		if (!BetaJS.Types.is_empty(this.__children_styles)) {
			for (var key in this.__children_styles)
				q.css(key, this.__children_styles[key]);
		}
		BetaJS.Objs.iter(this.__children_classes, function (cls) {
			q.addClass(cls);	
		});
		this.trigger("render");
	},
	
	/** Manually triggers rerendering of the view
	 * 
	 */
	invalidate: function () {
		if (!this.isActive())
			return;
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.deactivate();
		});
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
		this.__render();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.activate();
		});
	},
	
	/** Sets the container element of the view
	 * @param el new container element
 	 */
	setEl: function (el) {
		if (this.isActive()) {
			this.deactivate();
			this.__el = el;
			this.activate();
		}
		else
			this.__el = el;
	},
	
	/** Returns the parent view
	 * @return parent view
	 */
	getParent: function () {
		return this.__parent;
	},
	
	/** Checks whether a view has been added as a child
	 * 
 	 * @param child view in question
 	 * @return true if view has been added
	 */
	hasChild: function (child) {
		return child && child.cid() in this.__children;
	},
	
	/** Changes the parent view
	 * @param parent the new parent
	 */
	setParent: function (parent) {
		if (parent == this.__parent)
			return;
		this.deactivate();
		if (this.__parent) {
			this._unbindParent(this.__parent);
			var old_parent = this.__parent;
			this.__parent.off(null, null, this);
			this.__parent = null;
			old_parent.removeChild(this);
		}
		if (parent) {
			this.__parent = parent;
			parent.addChild(this);
			this._bindParent(parent);
			if (parent.isActive())
				this.activate();
		}
	},
	
	_bindParent: function () {		
	},

	_unbindParent: function () {		
	},
	
	/** Returns all child views
	 * @return array of child views 
	 */
	children: function () {
		var children = {};
		BetaJS.Objs.iter(this.__children, function (child, key) {
			children[key] = child.view;
		}, this);
		return children;
	},
	
	childOptions: function (child) {
		return this.__children[child.cid()].options;
	},
	
	/** Adds an array of child views
	 * 
 	 * @param children array of views
	 */
	addChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.addChild(child);
		}, this);
	},

	/** Adds a child view
	 * 
 	 * @param child view
	 */	
	addChild: function (child, options) {
		if (!this.hasChild(child)) {
			options = options || {};
			this.__children[child.cid()] = {
				view: child,
				options: options
			};
			this._notify("addChild", child, options);
			child.setParent(this);
			if (this.isActive() && this.isVisible())
				this.trigger("resize");
			return child;
		}
		return null;
	},
	
	/** Removes an array of child views
	 * 
 	 * @param children array of views
	 */
	removeChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.removeChild(child);
		}, this);
	},
	
	/** Removes a child view
	 * 
 	 * @param child view
	 */	
	removeChild: function (child) {
		if (this.hasChild(child)) {
			delete this.__children[child.cid()];
			child.setParent(null);
			child.off(null, null, this);
			this._notify("removeChild", child);
			if (this.isActive() && this.isVisible())
				this.trigger("resize");
		}
	},
	
	/** Returns the width (excluding margin, border, and padding) of the view
	 * @return width
	 */
	width: function () {
		return this.$el.width();
	},
	
	/** Returns the inner width (excluding margin, border, but including padding) of the view
	 * @return inner width
	 */
	innerWidth: function () {
		return this.$el.innerWidth();
	},

	/** Returns the outer width (including margin, border, and padding) of the view
	 * @return outer width
	 */
	outerWidth: function () {
		return this.$el.outerWidth();
	},

	/** Returns the height (excluding margin, border, and padding) of the view
	 * @return height
	 */
	height: function () {
		return this.$el.height();
	},
	
	/** Returns the inner height (excluding margin, border, but including padding) of the view
	 * @return inner height
	 */
	innerHeight: function () {
		return this.$el.innerHeight();
	},

	/** Returns the outer height (including margin, border, and padding) of the view
	 * @return outer height
	 */
	outerHeight: function () {
		return this.$el.outerHeight();
	}
	
}], {
	
	parseType: function (value, type) {
		if (BetaJS.Types.is_defined(value) && BetaJS.Types.is_string(value)) {
			value = value.replace(/\s+/g, '');
			if (type == "int")
				return parseInt(value, 10);
			else if (type == "array")
				return value.split(",");
			else if (type == "bool")
				return value === "" || BetaJS.Strings.parseBool(value);
			else if (type == "object" || type == "function")
				return BetaJS.Scopes.resolve(value);
		}
		return value;
	}

});

BetaJS.Views.BIND_EVENT_SPLITTER = /^(\S+)\s*(.*)$/;

BetaJS.Class.extend("BetaJS.Views.DynamicTemplate", {
	
	constructor: function (parent, template_string) {
		this._inherited(BetaJS.Views.DynamicTemplate, "constructor");
		this.__parent = parent;
		this.__template = new BetaJS.Templates.Template(template_string);
		this.__instances = {};
		this.__instances_by_name = {};
	},
	
	reset: function () {
		BetaJS.Objs.iter(this.__instances, function (instance) {
			this.removeInstance(instance);
		}, this);
	},
	
	destroy: function () {
		this.reset();
		this._inherited(BetaJS.Views.DynamicTemplate, "destroy");
	},
	
	renderInstance: function (binder, options) {
		options = options || {};
		if (options["name"])
			this.removeInstanceByName(options["name"]);
		var instance = new BetaJS.Views.DynamicTemplateInstance(this, binder, options);
		this.__instances[instance.cid()] = instance;
		if (options["name"])
			this.__instances_by_name[name] = instance;
	},
	
	removeInstanceByName: function (name) {
		if (name in this.__instances_by_name)
			this.removeInstance(this.__instances_by_name[name]);
	},
	
	removeInstance: function (instance) {
		delete this.__instances[instance.cid()];
		delete this.__instances_by_name[instance.name()];
		instance.destroy();
	},
	
	view: function () {
		return this.__parent;
	},
	
	template: function () {
		return this.__template;
	}
	
});

BetaJS.Class.extend("BetaJS.Views.DynamicTemplateInstance", [
	BetaJS.Events.ListenMixin, {
		
	__bind: {
		attr: function (attribute, variable) {
			return this.__context.__bind_attribute(attribute, variable);
		},
		attrs: function (attributes) {
			var s = "";
			for (attribute in attributes)
				s += this.attr(attribute, attributes[attribute]) + " ";
			return s;
		},
		value: function (variable) {
			return this.__context.__bind_value(variable);
		},
		inner: function (variable) {
			return this.__context.__bind_inner(variable);
		},
		css_if: function (css, variable) {
			return this.__context.__bind_css_if(css, variable, true);
		},
		css_if_not: function (css, variable) {
			return this.__context.__bind_css_if(css, variable, false);
		}
	},
	
	__new_element: function (base) {
		var id = BetaJS.Ids.uniqueId();
		this.__elements[id] = BetaJS.Objs.extend({
			id: id,
			$el: null
		}, base);
		return this.__elements[id];
	},
	
	__decompose_variable: function (variable) {
		var parts = variable.split(".");
		return {
			object: parts.length == 1 ? this.__parent.view() : this.__args[parts[0]],
			key: parts.length == 1 ? variable : parts[1]
		};
	},
	
	__get_variable: function (variable) {
		var dec = this.__decompose_variable(variable);
		return dec.object.get(dec.key);
	},
	
	__set_variable: function (variable, value) {
		var dec = this.__decompose_variable(variable);
		return dec.object.set(dec.key, value);
	},

	__update_element: function (element) {
		var value = this.__get_variable(element.variable);
		if (element.type == "inner")
			element.$el.html(value);
		else if (element.type == "value") {
			if (element.$el.val() != value)
				element.$el.val(value);
		} else if (element.type == "attribute")
			element.$el.attr(element.attribute, value);
		else if (element.type == "css") {
			if (!element.positive)
				value = !value;
			if (value)
				element.$el.addClass(this.__parent.view().css(element.css));
			else
				element.$el.removeClass(this.__parent.view().css(element.css));
		}
	},
	
	__prepare_element: function (element) {
		var self = this;
		element.$el = this.$el.find(element.selector);
		if (element.type == "inner" || element.type == "css")
			this.__update_element(element);
		else if (element.type == "value")
			element.$el.on("change input keyup paste", function () {
				self.__set_variable(element.variable, element.$el.val());
			});
	},
	
	__bind_attribute: function (attribute, variable) {
		var element = this.__new_element({
			type: "attribute",
			attribute: attribute,
			variable: variable
		});
		var selector = "data-bind-" + attribute + "='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector + " " + attribute + "='" + dec.object.get(dec.key) + "'";
	},
	
	__bind_css_if: function (css, variable, positive) {
		var element = this.__new_element({
			type: "css",
			css: css,
			variable: variable,
			positive: positive
		});
		var selector = "data-bind-css-" + css + "='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector;
	},
	
	__bind_value: function (variable) {
		var element = this.__new_element({
			type: "value",
			variable: variable
		});
		var selector = "data-bind-value='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector + " value='" + dec.object.get(dec.key) + "'";
	},

	__bind_inner: function (variable) {
		var element = this.__new_element({
			type: "inner",
			variable: variable
		});
		var selector = "data-bind-inner='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector;
	},

	constructor: function (parent, binder, options) {
		this._inherited(BetaJS.Views.DynamicTemplateInstance, "constructor");
		this.__elements = {};
		this.__inners = {};
		options = options || {};
		if (options["name"])
			this.__name = name;
		this.__parent = parent;
		this.$el = binder;
		this.__args = BetaJS.Objs.extend(options["args"] || {}, this.__parent.view().templateArguments());
		this.__args.bind = BetaJS.Objs.extend({__context: this}, this.__bind);
		this.$el.html(parent.template().evaluate(this.__args));
		BetaJS.Objs.iter(this.__elements, function (element) { this.__prepare_element(element); }, this);
	},
	
	destroy: function () {
		BetaJS.Objs.iter(this.__elements, function (element) {
			element.$el.off();
		}, this);
		this._inherited(BetaJS.Views.DynamicTemplateInstance, "destroy");
	},
	
	name: function () {
		return this.__name;
	}
	
}]);

BetaJS.Views.ActiveDom = {
	
	__prefix_alias: ["bjs", "betajs"],
	
	__view_alias: {},
	
	__views: {},
	
	__active: false,
	
	__on_add_element: function (event) {
		var element = BetaJS.$(event.target);
		if (!element)
			return;
		var done = false;
		if (element.prop("tagName")) {
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
				if (element.prop("tagName").toLowerCase() == alias + "view") {
					BetaJS.Views.ActiveDom.__attach(element);
					done = true;
				}
			});
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__view_alias, function (data, alias) {
				if (element.prop("tagName").toLowerCase() == alias) {
					BetaJS.Views.ActiveDom.__attach(element, data);
					done = true;
				}
			});
		}
		if (!done) {
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
				element.find(alias + "view").each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this));
				});
			});
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__view_alias, function (data, alias) {
				element.find(alias).each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this), data);
				});
			});
		}
	},
	
	__on_remove_element: function (event) {
		var element = BetaJS.$(event.target); 
		if (element.attr("data-active-dom-id") in BetaJS.Views.ActiveDom.__views)
			BetaJS.Views.ActiveDom.__views[element.attr("data-active-dom-id")].destroy();
		else {
			element.find("[data-active-dom-id]").each(function () {
				var el = BetaJS.$(this);
				if (el.attr("data-active-dom-id") in BetaJS.Views.ActiveDom.__views)
					BetaJS.Views.ActiveDom.__views[el.attr("data-active-dom-id")].destroy();
			});
		}
	},
	
	__attach: function (element, meta_attrs) {
		// Prevent double attachment
		if (element.attr("data-active-dom-element"))
			return;
		var process = function (key, value) {
			var i = 0;
			while (i < BetaJS.Views.ActiveDom.__prefix_alias.length) {
				var alias = BetaJS.Views.ActiveDom.__prefix_alias[i];
				if (BetaJS.Strings.starts_with(key, alias + "-")) {
					key = BetaJS.Strings.strip_start(key, alias + "-");
					if (BetaJS.Strings.starts_with(key, "child-")) {
						key = BetaJS.Strings.strip_start(key, "child-");
						dom_child_attrs[key] = value;
					} else if (key in meta_attrs_scheme)
						meta_attrs[key] = value;
					else
						option_attrs[key] = value;
					return;
				} else
				++i;
			}
			dom_attrs[key] = value;			
		};
		var element_data = function (element) {
			var query = element.find("script[type='text/param']");
			return BetaJS.Strings.nltrim(query.length > 0 ? query.html() : element.html());
		};
		var dom_attrs = {};
		var dom_child_attrs = {};
		var option_attrs = {};
		var meta_attrs_scheme = {type: "View", "default": null, name: null, "keep-tag": true};
		meta_attrs = BetaJS.Objs.extend(BetaJS.Objs.clone(meta_attrs_scheme, 1), meta_attrs || {});
		var attrs = element.get(0).attributes;
		for (var i = 0; i < attrs.length; ++i) 
			process(attrs.item(i).nodeName, attrs.item(i).nodeValue);
		BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
			element.children(alias + "param").each(function () {
				var child = BetaJS.$(this);
				process(alias + "-" + child.attr(alias + "-key"), element_data(child));
			});
		});
		if (meta_attrs["default"])
			option_attrs[meta_attrs["default"]] = element_data(element);
		if (meta_attrs.type in BetaJS.Views)
			meta_attrs.type = BetaJS.Views[meta_attrs.type];
		if (BetaJS.Types.is_string(meta_attrs.type))
			meta_attrs.type = BetaJS.Scopes.resolve(meta_attrs.type);
		var view = new meta_attrs.type(option_attrs);
		view.setEl("[data-active-dom-id='" + view.cid() + "']");
		var replacement = "<div data-active-dom-id='" + view.cid() + "'></div>";
		if (meta_attrs["keep-tag"])
			replacement = "<" + element.prop("tagName") + " data-active-dom-element='" + view.cid() + "'>" + replacement + "</" + element.prop("tagName") + ">";
		element.replaceWith(replacement);
		element = BetaJS.$("[data-active-dom-id='" + view.cid() + "']");
		var key = null;
		for (key in dom_attrs)
			element.attr(key, dom_attrs[key]);
		view.on("destroy", function () {
			delete BetaJS.Views.ActiveDom.__views[view.cid()];
		});
		BetaJS.Views.ActiveDom.__views[view.cid()] = view;
		view.activate();
		for (key in dom_child_attrs)
			element.children().attr(key, dom_child_attrs[key]);
		if (meta_attrs["name"])
			BetaJS.Scopes.set(view, meta_attrs["name"]);
	},
	
	activate: function () {
		BetaJS.$(document).ready(function () {
			if (BetaJS.Views.ActiveDom.__active)
				return;
			if (document.addEventListener) {
				document.addEventListener("DOMNodeInserted", BetaJS.Views.ActiveDom.__on_add_element);
				document.addEventListener("DOMNodeRemoved", BetaJS.Views.ActiveDom.__on_remove_element);
			} else {
				document.attachEvent("DOMNodeInserted", BetaJS.Views.ActiveDom.__on_add_element);
				document.attachEvent("DOMNodeRemoved", BetaJS.Views.ActiveDom.__on_remove_element);
			}
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
				BetaJS.$(alias + "view").each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this));
				});
			});
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__view_alias, function (data, alias) {
				BetaJS.$(alias).each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this), data);
				});
			});
			BetaJS.Views.ActiveDom.__active = true;
		});
	},
	
	deactivate: function () {
		BetaJS.$(document).ready(function () {
			if (!BetaJS.Views.ActiveDom.__active)
				return;
			document.removeEventListener("DOMNodeInserted", BetaJS.Views.ActiveDom.__on_add_element);
			document.removeEventListener("DOMNodeRemoved", BetaJS.Views.ActiveDom.__on_remove_element);
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__views, function (view) {
				view.destroy();
			});
			BetaJS.Views.ActiveDom.__active = false;
		});
	},
	
	registerPrefixAlias: function (alias) {
		this.__prefix_alias.push(alias);
	},
	
	registerViewAlias: function (alias, type, def) {
		this.__view_alias[alias] = { type: type };
		this.__view_alias[alias]["default"] = def;
	}
	
};
BetaJS.Classes.Module.extend("BetaJS.Views.Modules.Centering", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.Modules.Centering, "constructor", options);
		this.__vertical = "vertical" in options ? options.vertical : false;
		this.__horizontal = "horizontal" in options ? options.horizontal : false;
	},
	
	_register: function (object, data) {
		object.on("resize", function () {
			if (object.isVisible())
				this.__update(object);
		}, this);
		if (object.isActive() && object.isVisible())
			this.__update(object);
	},
	
	__update: function (object) {
		if (this.__vertical) {
			object.$el.css("top", "50%");
			object.$el.css("margin-top", Math.round(-object.$el.height() / 2) + "px");
		}
		if (this.__horizontal) {
			object.$el.css("left", "50%");
			object.$el.css("margin-left", Math.round(-object.$el.width() / 2) + "px");
		}
	}
	
}, {
	
	__vertical: null,
	
	vertical: function () {
		if (!this.__vertical)
			this.__vertical = new this({auto_destroy: false, vertical: true, horizontal: false});
		return this.__vertical;
	},
	
	__horizontal: null,
	
	horizontal: function () {
		if (!this.__horizontal)
			this.__horizontal = new this({auto_destroy: false, horizontal: true, vertical: false});
		return this.__horizontal;
	},
	
	__both: null,
	
	both: function () {
		if (!this.__both)
			this.__both = new this({auto_destroy: false, vertical: true, horizontal: true});
		return this.__both;
	}
	
});

BetaJS.Classes.Module.extend("BetaJS.Views.Modules.BindOnActivate", {
	
	_register: function (object, data) {
		data.bound = false;
		object.on("activate", function () { this.__bind(object); }, this);
		object.on("deactivate", function () { this.__unbind(object); }, this);
		if (object.isActive())
			this.__bind(object);
	},
	
	_unregister: function (object, data) {
		this.__unbind(object);
	},
	
	__bind: function (object) {
		var data = this._data(object);
		if (data.bound)
			return;
		this._bind(object, data);
		data.bound = true;
	},
	
	__unbind: function (object) {
		var data = this._data(object);
		if (!data.bound)
			return;
		this._unbind(object, data);
		data.bound = false;
	},
	
	_bind: function (object, data) {},
	
	_unbind: function (object, data) {}
	
});

BetaJS.Classes.Module.extend("BetaJS.Views.Modules.BindOnVisible", {
	
	_register: function (object, data) {
		data.bound = false;
		object.on("visibility", function (visible) {
			if (visible)
				this.__bind(object);
			else
				this.__unbind(object);
		}, this);
		if (object.isActive() && object.isVisible())
			this.__bind(object);
	},
	
	_unregister: function (object, data) {
		this.__unbind(object);
	},
	
	__bind: function (object) {
		var data = this._data(object);
		if (data.bound)
			return;
		this._bind(object, data);
		data.bound = true;
	},
	
	__unbind: function (object) {
		var data = this._data(object);
		if (!data.bound)
			return;
		this._unbind(object, data);
		data.bound = false;
	},
	
	_bind: function (object, data) {},
	
	_unbind: function (object, data) {}
	
});

BetaJS.Views.Modules.BindOnVisible.extend("BetaJS.Views.Modules.HideOnLeave", {
		
	_bind: function (object, data) {
		var el = object.$el.get(0);
		data.hide_on_leave_func = function (e) {
			if (data.hide_on_leave_skip) {
				data.hide_on_leave_skip = false;
				return;
			}
			if (document.contains(e.target) && e.target !== el && !BetaJS.$.contains(el, e.target))
				object.hide();
		};
		data.hide_on_leave_skip = true;
		BetaJS.$(document.body).on("click", data.hide_on_leave_func);
	},
	
	_unbind: function (object, data) {
		BetaJS.$(document.body).unbind("click", data.hide_on_leave_func);
	}
	
});

BetaJS.Views.Modules.BindOnActivate.extend("BetaJS.Views.Modules.Hotkeys", {
		
	constructor: function (options) {
		this._inherited(BetaJS.Views.Modules.Hotkeys, "constructor", options);
		this.__hotkeys = options.hotkeys;
	},

	_bind: function (object, data) {
		data.hotkeys = {};
		BetaJS.Objs.iter(this.__hotkeys, function (f, hotkey) {
			data.hotkeys[hotkey] = BetaJS.Browser.Hotkeys.register(hotkey, BetaJS.Types.is_function(f) ? f : object[f], object); 
		}, this);
	},
	
	_unbind: function (object, data) {
		BetaJS.Objs.iter(data.hotkeys, function (handle) {
			BetaJS.Browser.Hotkeys.unregister(handle);
		}, this);
		data.hotkeys = {};
	}
	
});
BetaJS.Templates.Cached = BetaJS.Templates.Cached || {};
BetaJS.Templates.Cached['holygrail-view-template'] = '  <div data-selector="right" class=\'holygrail-view-right-container\'></div>  <div data-selector="left" class=\'holygrail-view-left-container\'></div>  <div data-selector="center" class=\'holygrail-view-center-container\'></div> ';

BetaJS.Templates.Cached['list-container-view-item-template'] = '  <{%= container_element %} data-view-id="{%= cid %}"></{%= container_element %}> ';

BetaJS.Templates.Cached['switch-container-view-item-template'] = '  <div data-view-id="{%= cid %}" data-selector="switch-container-item"></div> ';

BetaJS.Templates.Cached['button-view-template'] = '   <{%= button_container_element %} data-selector="button-inner" class="{%= supp.css("default") %}"    {%= bind.css_if("disabled", "disabled") %}    {%= bind.css_if("selected", "selected") %}    {%= bind.inner("label") %}>   </{%= button_container_element %}>  ';

BetaJS.Templates.Cached['check-box-view-template'] = '  <input type="checkbox" {%= checked ? "checked" : "" %} id="check-{%= supp.view_id %}" />  <label for="check-{%= supp.view_id %}">{%= label %}</label> ';

BetaJS.Templates.Cached['input-view-template'] = '  <input class="input-view" type="{%= input_type %}" {%= bind.value("value") %} {%= bind.attr("placeholder", "placeholder") %} {%= bind.css_if("input-horizontal-fill", "horizontal_fill") %} /> ';

BetaJS.Templates.Cached['label-view-template'] = '  <{%= element %} class="{%= supp.css(\'label\') %}" {%= bind.inner("label") %}></{%= element %}> ';

BetaJS.Templates.Cached['link-view-template'] = '  <a href="javascript:{}" {%= bind.inner("label") %}></a> ';

BetaJS.Templates.Cached['text-area-template'] = '   <textarea {%= bind.value("value") %} {%= bind.attr("placeholder", "placeholder") %}             {%= bind.css_if_not("text-area-no-resize", "resizable") %}             {%= readonly ? \'readonly\' : \'\' %}             style="resize: {%= horizontal_resize ? (vertical_resize ? \'both\' : \'horizontal\') : (vertical_resize ? \'vertical\' : \'none\') %}"             {%= bind.css_if("text-area-horizontal-fill", "horizontal_fill") %}></textarea>  ';

BetaJS.Templates.Cached['progress-template'] = '  <div class="{%= supp.css(\'outer\') %}">   <div data-selector="inner" class="{%= supp.css(\'inner\') %}" style="{%= horizontal ? \'width\': \'height\' %}:{%= value*100 %}%">   </div>   <div class="progress-view-overlay" data-selector="label">    {%= label %}   </div>  </div> ';

BetaJS.Templates.Cached['list-view-template'] = '   <{%= list_container_element %}    {%= supp.attrs(list_container_attrs) %}    class="{%= list_container_classes %}"    data-selector="list">   </{%= list_container_element %}>  ';
BetaJS.Templates.Cached['list-view-item-container-template'] = '   <{%= item_container_element %}    {%= supp.attrs(item_container_attrs) %}    class="{%= item_container_classes %}"    {%= supp.list_item_attr(item) %}>   </{%= item_container_element %}>  ';

BetaJS.Templates.Cached['overlay-view-template'] = '  <div data-selector="container"></div> ';

BetaJS.Templates.Cached['fullscreen-overlay-view-template'] = '  <div class="fullscreen-overlay-background" data-selector="outer"></div>  <div class="fullscreen-overlay" data-selector="inner"></div> ';

BetaJS.Views.View.extend("BetaJS.Views.HolygrailView", {
	_templates: {
		"default": BetaJS.Templates.Cached["holygrail-view-template"]
	},
	constructor: function (options) {
		this._inherited(BetaJS.Views.HolygrailView, "constructor", options);
		this.__left = null;
		this.__center = null;
		this.__right = null;
	},
	getLeft: function () {
		return this.__left;
	},
	setLeft: function (view) {
		return this.__setView("left", view);
	},
	getCenter: function () {
		return this.__center;
	},
	setCenter: function (view) {
		return this.__setView("center", view);
	},
	getRight: function () {
		return this.__right;
	},
	setRight: function (view) {
		return this.__setView("right", view);
	},
	__setView: function(key, view) {
		// Remove old child in case we had one
		this.removeChild(this["__" + key]);
		// Set old child attribute to null
		this["__" + key] = null;
		// If we have a new view (i.e. set view was not called with null)
		if (view) {
			// bind new view to selector
			view.setEl('[data-selector="' + key + '"]');
			// store new view as child attribute and add the view
			this["__" + key] = this.addChild(view);
		}
		return view;
	}
});
BetaJS.Views.View.extend("BetaJS.Views.ListContainerView", {
	
	_templates: {
		"item": BetaJS.Templates.Cached["list-container-view-item-template"]
	},
	
	_notifications: {
		"addChild": "__addChildContainer",
		"removeChild": "__removeChildContainer"
	},
	
	constructor: function (options) {
		options = options || {};
		this._inherited(BetaJS.Views.ListContainerView, "constructor", options);
		this._setOption(options, "alignment", "horizontal");
		this._setOption(options, "positioning", "float"); // float, computed, none
		this._setOption(options, "clear_float", false);
		this._setOption(options, "container_element", "div");
		this.on("show", function () {
			if (this.__positioning == "computed")
				this.__updatePositioning();
		}, this);
	},
	
	isHorizontal: function () {
		return this.__alignment == "horizontal";
	},
	
	_render: function () {
		if (this.__clear_float)
			this.$el.html("<div data-selector='clearboth' style='clear:both'></div>");
		else
			this.$el.html("");
		BetaJS.Objs.iter(this.children(), function (child) {
			this.__addChildContainer(child);
		}, this);
	},
	
	__addChildContainer: function (child) {
		var options = this.childOptions(child);
		if (this.isActive()) {
			var rendered = this.evaluateTemplate("item", {cid: child.cid(), container_element: this.__container_element});
			if (this.__clear_float)
				this.$("[data-selector='clearboth']").before(rendered);
			else
				this.$el.append(rendered);
		}
		child.setEl("[data-view-id='" + child.cid() + "']");
		if (this.isHorizontal() && !("float" in options) && this.__positioning == "float")
			options["float"] = "left";
		if (this.isActive() && "float" in options && this.__positioning == "float") {
			var container = this.$("[data-view-id='" + child.cid() + "']");
			container.css("float", options["float"]);
		}			
	},
	
	__removeChildContainer: function (child) {
		this.$data({"view-id": child.cid()}).remove();
	},
	
	__updatePositioningHelper: function (arr, pos_string, size_string) {
		var pos = 0;
		BetaJS.Objs.iter(arr, function (child) {
			var opts = this.childOptions(child);
			if (!(opts['type'] && opts['type'] == 'ignore')) {
				child.$el.css(pos_string, pos + 'px');
				if (child.isVisible())
					pos += parseInt(child.$el.css(size_string), 10);
				if (opts['type'] && opts['type'] == 'dynamic')
					return false;
			}
		}, this);
	},
	
	__updatePositioning: function () {
		var ltr = BetaJS.Objs.values(this.children());
		var rtl = BetaJS.Objs.clone(ltr, 1).reverse();
		var left_string = this.isHorizontal() ? "left" : "top";
		var right_string = this.isHorizontal() ? "right" : "bottom";
		var width_string = this.isHorizontal() ? "width" : "height";
		this.__updatePositioningHelper(rtl, right_string, width_string);
		this.__updatePositioningHelper(ltr, left_string, width_string);
	},

	updateChildVisibility: function (child) {
		this._inherited(BetaJS.Views.ListContainerView, "updateChildVisibility", child);
		if (this.__positioning == "computed")
			this.__updatePositioning();
	}
	
	
});
BetaJS.Views.View.extend("BetaJS.Views.SingleContainerView", {
	constructor: function (options) {
		this._inherited(BetaJS.Views.SingleContainerView, "constructor", options);
		this.__view = null;
	},
	getView: function () {
		return this.__view;
	},
	setView: function(view) {
		this.removeChild(this.__view);
		if (view) {
			view.setEl("");
			this.__view = this.addChild(view);
		}
		return view;
	}
});
BetaJS.Views.View.extend("BetaJS.Views.SwitchContainerView", {
	
	_templates: {
		"item": BetaJS.Templates.Cached["switch-container-view-item-template"]
	},
	
	_notifications: {
		"addChild": "__addChildContainer",
		"removeChild": "__removeChildContainer"
	},
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.SwitchContainerView, "constructor", options);
		this.__selected = null;
	},

	_render: function () {
		this.$el.html("");
		BetaJS.Objs.iter(this.children(), function (child) {
			this.__addChildContainer(child);
		}, this);
	
	},
	
	__addChildContainer: function (child) {
		if (this.isActive())
			this.$el.append(this.evaluateTemplate("item", {cid: child.cid()}));
		child.setEl("[data-view-id='" + child.cid() + "']");
		this.__selected = this.__selected || child;
		child.setVisibility(this.__selected == child);
	},
	
	__removeChildContainer: function (child) {
		this.$data({"view-id": child.cid()}).remove();
		if (this.__selected == child)
			this.__selected = null;
	},
	
	select: function (child) {
		this.__selected = child;
		BetaJS.Objs.iter(this.children(), function (child) {
			child.setVisibility(this.__selected == child);
		}, this);
	},
	
	selected: function () {
		return this.__selected;
	}
	
});
BetaJS.Views.ListContainerView.extend("BetaJS.Views.TabbedView", {
	
	constructor: function (options) {
		options = BetaJS.Objs.extend(options || {}, {
			"alignment": "vertical",
			"positioning": "none"
		});
		this._inherited(BetaJS.Views.TabbedView, "constructor", options);
		this.toolbar = this.addChild(new BetaJS.Views.ToolBarView());
		this.container = this.addChild(new BetaJS.Views.SwitchContainerView());
		this.toolbar.on("item:click", function (view) {
			this.select(view);
		}, this);
		if (options.tabs) {
			BetaJS.Objs.iter(options.tabs, function (tab) {
				this.addTab(tab);
			}, this);
		}
	},
	
	addTab: function (options) {
		options = BetaJS.Objs.extend(options, {
			selectable: true,
			deselect_all: true						
		});
		var button = this.toolbar.addItem(options);
		button.__tabView = this.container.addChild(options.view);
		options.view.__tabButton = button;
		if (options.selected)
			this.select(button);
		return button.__tabView;
	},
	
	select: function (item_ident_or_view) {
		var tab_view = null;
		if (BetaJS.Types.is_string(item_ident_or_view))
			tab_view = this.toolbar.itemByIdent(item_ident_or_view).__tabView;
		else if (item_ident_or_view.__tabButton)
			tab_view = item_ident_or_view;
		else
			tab_view = item_ident_or_view.__tabView;
		this.container.select(tab_view);
		tab_view.__tabButton.select();
		this.trigger("select", tab_view);
		return tab_view;
	}
	
});
BetaJS.Views.View.extend("BetaJS.Views.ButtonView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["button-view-template"]
	},
	_css: function () {
		return {
			"disabled": "",
			"default": "",
			"selected": ""
		};
	},
	constructor: function(options) {
		options = options || {};
		this._inherited(BetaJS.Views.ButtonView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "button_container_element", "button");
		this._setOptionProperty(options, "disabled", false);
		this._setOptionProperty(options, "selected", false);
		this._setOption(options, "selectable", false);
		this._setOption(options, "deselect_all", false);
		if (options.hotkey) {
			var hotkeys = {};
			hotkeys[options.hotkey] = function () {
				this.click();
			};
			this.add_module(new BetaJS.Views.Modules.Hotkeys({hotkeys: hotkeys}));
		}
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click [data-selector='button-inner']": "click"
		}]);
	},
	click: function () {
		if (!this.get("disabled")) {
			if (this.__selectable)
				this.select();
			this.trigger("click");
		}
	},
	_bindParent: function (parent) {
		parent.on("deselect", function () {
			this.unselect();
		}, this);
	},
	
	_unbindParent: function (parent) {
		parent.off("deselect", this);
	},
	
	select: function () {
		if (!this.__selectable)
			return;
		if (this.__deselect_all)
			this.getParent().trigger("deselect");
		this.getParent().trigger("select", this);
		this.set("selected", true);
	},
	
	unselect: function () {
		if (!this.__selectable)
			return;
		this.set("selected", false);
	},
	
	isSelected: function () {
		return this.get("selected");
	}
});
BetaJS.Views.View.extend("BetaJS.Views.CheckBoxView", {
	_templates: {
		"default": BetaJS.Templates.Cached["check-box-view-template"]
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click input": "__click"
		}]);
	},
	constructor: function(options) {
		options = options || {};
		options["invalidate_on_change"] = true;
		this._inherited(BetaJS.Views.CheckBoxView, "constructor", options);
		this._setOptionProperty(options, "checked", false);
		this._setOptionProperty(options, "label", "");
	},
	__click: function () {
		this.set("checked", this.$("input").is(":checked"));
		this.trigger("check", this.get("checked"));
	}
});
BetaJS.Views.SwitchContainerView.extend("BetaJS.Views.InputLabelView", {

	constructor: function(options) {
		this._inherited(BetaJS.Views.InputLabelView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
		this._setOption(options, "edit_on_click", true);
		this._setOption(options, "label_mode", true);
		this._setOption(options, "read_only", false);
		this.label = this.addChild(new BetaJS.Views.LabelView({
			label: this.binding("value"),
			el_classes: options["label_el_classes"],
			children_classes: options["label_children_classes"]
		}));
		this.input = this.addChild(new BetaJS.Views.InputView({
			value: this.binding("value"),
			placeholder: this.binding("placeholder")
		}));
		if (!this.__label_mode)
			this.select(this.input);
		this.input.on("leave enter_key", function () {
			this.label_mode();
		}, this);
		if (this.__edit_on_click)
			this.label.on("click", function () {
				this.edit_mode();
			}, this);
	},
	
	is_label_mode: function () {
		return this.__label_mode;
	},
	
	is_edit_mode: function () {
		return !this.__label_mode;
	},

	label_mode: function () {
		if (this.is_label_mode())
			return;
		this.__label_mode = true;
		this.select(this.label);		
	},
	
	edit_mode: function () {
		if (this.is_edit_mode() || this.__read_only)
			return;
		this.__label_mode = false;
		this.select(this.input);
		this.input.focus(true);
	}

});
BetaJS.Views.View.extend("BetaJS.Views.InputView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["input-view-template"]
	},
	_events: function () {
		return [{
			"blur input": "__leaveEvent",
			"keyup input": "__changeEvent",
			"change input": "__changeEvent",
			"input input": "__changeEvent",
			"paste input": "__changeEvent"
		}, {
			"keyup input": "__keyupEvent"
		}];
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.InputView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");	
		this._setOptionProperty(options, "clear_after_enter", false);	
		this._setOptionProperty(options, "horizontal_fill", false);
		this._setOptionProperty(options, "input_type", "text");
	},
	__keyupEvent: function (e) {
		var key = e.keyCode || e.which;
        if (key == 13) {
			this.trigger("enter_key", this.get("value"));
			if (this.get("clear_after_enter"))
				this.set("value", "");
		}
    },
	__leaveEvent: function () {
		this.trigger("leave");
	},
	__changeEvent: function () {
		this.trigger("change", this.get("value"));
	},
	focus: function (select_all) {
		this.$("input").focus();
		this.$("input").focus();
		if (select_all)
			this.$("input").select();
	}
});
BetaJS.Views.View.extend("BetaJS.Views.LabelView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["label-view-template"]
	},
	_css: function () {
		return {"label": "label-view-class"};
	},
	_events: function () {
		return [{
			"click": "__clickEvent"	
		}];
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.LabelView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "element", "span");
	},
	__clickEvent: function () {
		this.trigger("click");
	}
});
BetaJS.Views.View.extend("BetaJS.Views.LinkView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["link-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.LinkView, "constructor", options);
		this._setOptionProperty(options, "label", "");
	},
	_events: function () {
		return this._inherited(BetaJS.Views.LinkView, "_events").concat([{
			"click a": "__click"
		}]);
	},
	__click: function () {
		this.trigger("click");
	}
});
BetaJS.Views.View.extend("BetaJS.Views.ProgressView", {
	_templates: {
		"default": BetaJS.Templates.Cached["progress-template"]
	},
	
	_css: function () {
		return {
			outer: "",
			inner: ""
		};
	},
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ProgressView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "horizontal", true);
		this._setOptionProperty(options, "value", 1);
		this.on("change:value", function (value) {
			if (this.isActive())
				this.$("[data-selector='inner']").css(this.get("horizontal") ? 'width' : 'height', (value * 100) + "%");
		}, this);
		this.on("change:label", function (label) {
			if (this.isActive())
				this.$("[data-selector='label']").html(label);
		}, this);
	}
	
});

BetaJS.Views.View.extend("BetaJS.Views.TextAreaView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["text-area-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.TextAreaView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
		this._setOptionProperty(options, "horizontal_resize", false);
		this._setOptionProperty(options, "vertical_resize", true);
		this._setOptionProperty(options, "horizontal_fill", false);
		this._setOptionProperty(options, "readonly", false);
		this.on("change:readonly", function () {
			if (this.get("readonly"))
				this.$("textarea").attr("readonly", "readonly");
			else
				this.$("textarea").removeAttr("readonly");
		}, this);
	},
	
	addLine: function (s) {
		if (this.get("value"))
			this.set("value", this.get("value") + "\n" + s);
		else
			this.set("value", s);
		this.scrollToEnd();
	},
	
	scrollToEnd: function () {
		var t = this.$("textarea").get(0);
		t.scrollTop = t.scrollHeight;		
	}
});
BetaJS.Views.View.extend("BetaJS.Views.CustomListView", {
	
	_templates: function () {
		return {
			"default": BetaJS.Templates.Cached["list-view-template"],
			"item-container": BetaJS.Templates.Cached["list-view-item-container-template"]
		};
	},
	
	_supp: function () {
		return BetaJS.Objs.extend(this._inherited(BetaJS.Views.CustomListView, "_supp"), {
			list_item_attr: function (item) {
				return this.attrs({
					"data-view-id": this.__context.cid(),
					"data-cid": BetaJS.Ids.objectId(item),
					"data-index": this.__context.__collection.getIndex(item)
				});
			}
		});
	},
	
	_notifications: {
		activate: "__activateItems",
		deactivate: "__deactivateItems"
	},
	
	_events: function () {
		return [{
			"click": "__click"
		}];
	},	
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.CustomListView, "constructor", options);
		this._setOption(options, "list_container_element", "ul");
		this._setOption(options, "list_container_attrs", {});
		this._setOption(options, "list_container_classes", "");
		this._setOption(options, "item_container_element", "li");
		this._setOption(options, "item_container_classes", "");
		this._setOption(options, "selectable", true);
		this._setOption(options, "multi_select", false);
		this._setOption(options, "click_select", false);
		this.__itemData = {};
		if ("table" in options) {
			var table = this.cls.parseType(options.table, "object");
			this.active_query = new BetaJS.Queries.ActiveQuery(table.active_query_engine(), {});
			options.collection = this.active_query.collection();
			options.destroy_collection = true;
		}
		if ("compare" in options)
			options.compare = this.cls.parseType(options.compare, "function");
		if ("collection" in options) {
			this.__collection = options.collection;
			this.__destroy_collection = "destroy_collection" in options ? options.destroy_collection : false;
			if ("compare" in options)
				this.__collection.set_compare(options["compare"]);
		} else {
			var col_options = {};
			if ("objects" in options) 
				col_options["objects"] = options["objects"];
			if ("compare" in options) 
				col_options["compare"] = options["compare"];
			this.__collection = new BetaJS.Collections.Collection(col_options);
			this.__destroy_collection = true;
		}
		this.__collection.on("add", function (item) {
			this._addItem(item);
		}, this);
		this.__collection.on("remove", function (item) {
			this._removeItem(item);
		}, this);
		this.__collection.on("change", function (item) {
			this._changeItem(item);
		}, this);
		this.__collection.on("index", function (item, index) {
			this.__updateItemIndex(item, index);
		}, this);
		this.__collection.on("reindexed", function (item) {
			this.__reIndexItem(item);
		}, this);
		this.__collection.on("sorted", function () {
			this.__sort();
		}, this);
		this.__collection.iterate(function (item) {
			this._registerItem(item);
		}, this);
	},
	
	destroy: function () {
		this.__collection.iterate(function (item) {
			this._unregisterItem(item);
		}, this);
		this.__collection.off(null, null, this);
		if (this.__destroy_collection)
			this.__collection.destroy();
		this._inherited(BetaJS.Views.CustomListView, "destroy");
	},
	
	_itemBySubElement: function (element) {
		var container = element.closest("[data-view-id='" + this.cid() + "']");
		return container.length === 0 ? null : this.__collection.getById(container.attr("data-cid"));
	},
	
	__click: function (e) {
		if (this.__click_select && this.__selectable) {
			var item = this._itemBySubElement(BetaJS.$(e.target));
			if (item)
				this.select(item);
		}
	},
	
	collection: function () {
		return this.__collection;
	},
	
	add: function (item) {
		this.__collection.add(item);						
	},
	
	remove: function (item) {
		this.__collection.remove(item);
	},
	
	_render: function () {
		this.$selector_list = this._renderListContainer();
	},
	
	_renderListContainer: function () {
		this.$el.html(this.evaluateTemplate("default", {
			list_container_element: this.__list_container_element,
			list_container_attrs: this.__list_container_attrs,
			list_container_classes: this.__list_container_classes
		}));
		return this.$data({"selector": "list"});
	},
	
	invalidate: function () {
		if (this.isActive())
			this.__deactivateItems();
		this._inherited(BetaJS.Views.CustomListView, "invalidate");
		if (this.isActive())
			this.__activateItems();
	},
	
	__activateItems: function () {
		this.__collection.iterate(function (item) {
			this._activateItem(item);
		}, this);
	},
	
	__deactivateItems: function () {
		this.__collection.iterate(function (item) {
			this._deactivateItem(item);
		}, this);
	},

	itemElement: function (item) {
		return this.$data({
			"view-id": this.cid(),
			"cid": BetaJS.Ids.objectId(item)
		}, this.$selector_list);
	},
	
	_findIndexElement: function (index) {
		return this.$data({
			"view-id": this.cid(),
			"index": index
		}, this.$selector_list);
	},

	_changeItem: function (item) {},

	__updateItemIndex: function (item, index) {
		var element = this.itemElement(item);
		element.attr("data-index", index);
		this._updateItemIndex(item, element);
	},

	__reIndexItem: function (item) {
		var element = this.itemElement(item);
		var index = this.collection().getIndex(item);
		if (index === 0)
			this.$selector_list.prepend(element);
		else {
			var before = this._findIndexElement(index - 1);
			before.after(element);
		}
	},
	
	_updateItemIndex: function (item, index) {},
	
	__sort: function () {
		for (var index = this.collection().count() - 1; index >= 0; index--)
			this.$selector_list.prepend(this._findIndexElement(index));
	},
	
	itemData: function (item) {
		return this.__itemData[item.cid()];
	},

	_registerItem: function (item) {
		this.__itemData[item.cid()] = {
			properties: new BetaJS.Properties.Properties({
				selected: false,
				new_element: false
			})
		};
	},
	
	_unregisterItem: function (item) {
		if (!this.__itemData[item.cid()])
			return;
		this.__itemData[item.cid()].properties.destroy();
		delete this.__itemData[item.cid()];
	},
	
	_activateItem: function (item) {
		var container = this.evaluateTemplate("item-container", {
			item: item,
			item_container_element: this.__item_container_element, 
			item_container_attrs: this.__item_container_attrs,
			item_container_classes: this.__item_container_classes			
		});
		var index = this.__collection.getIndex(item);
		if (index === 0)
			this.$selector_list.prepend(container);
		else {
			var before = this._findIndexElement(index - 1);
			if (before.length > 0) 
				before.after(container);
			else {
				var after = this._findIndexElement(index + 1);
				if (after.length > 0)
					after.before(container);
				else
					this.$selector_list.append(container);
			}
		}
		this.trigger("activate_item", item);
	},
	
	_deactivateItem: function (item) {
		this.itemData(item).new_element = false;
		var element = this.itemElement(item);
		element.remove();
	},
	
	_addItem: function (item) {
		this._registerItem(item);
		if (this.isActive()) {
			this.itemData(item).new_element = true;
			this._activateItem(item);
		}
	},
	
	_removeItem: function (item) {
		if (this.isActive())
			this._deactivateItem(item);
		this._unregisterItem(item);
	},
	
	isSelected: function (item) {
		return this.itemData(item).properties.get("selected");
	},
	
	select: function (item) {
		var data = this.itemData(item);
		if (this.__selectable && !this.isSelected(item)) {
			if (!this.__multi_select)
				this.collection().iterate(function (object) {
					this.unselect(object);
				}, this);
			data.properties.set("selected", true);
			this.trigger("select", item);
		}
		return data;
	},
	
	unselect: function (item) {
		var data = this.itemData(item);
		if (this.__selectable && this.isSelected(item)) {
			data.properties.set("selected", false);
			this.trigger("unselect", item);
		}
		return data;
	}	
	
});



BetaJS.Views.CustomListView.extend("BetaJS.Views.ListView", {
	
	constructor: function(options) {
		options = options || {};
		if ("item_template" in options)
			options.templates = {item: options.item_template};
		if ("item_dynamic" in options)
			options.dynamics = {item: options.item_dynamic};
		this._inherited(BetaJS.Views.ListView, "constructor", options);
		this._setOption(options, "item_label", "label");
		this._setOption(options, "render_item_on_change", BetaJS.Types.is_defined(this.dynamics("item")));
	},
	
	_changeItem: function (item) {
		this._inherited(BetaJS.Views.ListView, "_changeItem", item);
		if (this.__render_item_on_change && this.isActive())
			this._renderItem(item);
	},
	
	_activateItem: function (item) {
		this._inherited(BetaJS.Views.ListView, "_activateItem", item);
		this._renderItem(item);
	},
	
	_renderItem: function (item) {
		var element = this.itemElement(item);
		var properties = this.itemData(item).properties;
		if (this.templates("item"))
			element.html(this.evaluateTemplate("item", {item: item, properties: properties}));
		else if (this.dynamics("item"))
			this.evaluateDynamics("item", element, {item: item, properties: properties}, {name: "item-" + BetaJS.Ids.objectId(item)});
		else
			element.html(item.get(this.__item_label)); 
	},
	
	_deactivateItem: function (item) {
		if (this.dynamics("item"))
			this.dynamics("item").removeInstanceByName("item-" + BetaJS.Ids.objectId(item));
		this._inherited(BetaJS.Views.ListView, "_deactivateItem", item);
	}
	
});


BetaJS.Views.CustomListView.extend("BetaJS.Views.SubViewListView", {
	
	_sub_view: BetaJS.Views.View,
	
	_sub_view_options: function (item) {
		return {
			item: item,
			item_properties: this.itemData(item).properties
		};
	},
	
	_property_map: function (item) {},
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.SubViewListView, "constructor", options);
		if ("create_view" in options)
			this._create_view = options.create_view;
		if ("sub_view" in options)
			this._sub_view = this.cls.parseType(options.sub_view, "object");
		if ("sub_view_options" in options)
			this._sub_view_options_param = options.sub_view_options;
		if ("property_map" in options)
			this._property_map_param = options.property_map;
	},
	
	_create_view: function (item, element) {
		var properties = BetaJS.Objs.extend(
			BetaJS.Types.is_function(this._property_map) ? this._property_map.apply(this, [item]) : this._property_map,
			BetaJS.Types.is_function(this._property_map_param) ? this._property_map_param.apply(this, [item]) : this._property_map_param);
		var options = BetaJS.Objs.extend(
			BetaJS.Types.is_function(this._sub_view_options) ? this._sub_view_options.apply(this, [item]) : this._sub_view_options,
			BetaJS.Objs.extend(
				BetaJS.Types.is_function(this._sub_view_options_param) ? this._sub_view_options_param.apply(this, [item]) : this._sub_view_options_param || {},
				BetaJS.Objs.map(properties, item.get, item)));
		options.el = this.itemElement(item);
		return new this._sub_view(options);
	},
	
	_activateItem: function (item) {
		this._inherited(BetaJS.Views.SubViewListView, "_activateItem", item);
		var view = this._create_view(item); 
		this.delegateEvents(null, view, "item", [view, item]);
		this.itemData(item).view = view;
		this.addChild(view);
	},
	
	_deactivateItem: function (item) {
		var view = this.itemData(item).view;
		this.removeChild(view);
		view.destroy();
		this._inherited(BetaJS.Views.SubViewListView, "_deactivateItem", item);
	}
	
});


BetaJS.Classes.Module.extend("BetaJS.Views.Modules.ListViewAnimation", {

	_register: function (object, data) {
		object.on("activate_item", function (item) {
			if (object.itemData(item).new_element) {
				var element = object.itemElement(item);
				element.css("display", "none");
				element.fadeIn();
			}
		}, this);
	}
	
}, {
	
	__singleton: null,
	
	singleton: function () {
		if (!this.__singleton)
			this.__singleton = new this({auto_destroy: false});
		return this.__singleton;
	}
	
});

BetaJS.Views.View.extend("BetaJS.Views.OverlayView", {
	
	_templates: {
		"default": BetaJS.Templates.Cached["overlay-view-template"]
	},

	/*
	 * overlay_inner (optional) : sub view to be bound to the overlay
	 * 
	 * anchor: "none" | "absolute" | "element" | "relative"
     *
	 * overlay_left
	 * overlay_top
     *
	 * overlay_align_vertical: "top" | "center" | "bottom"
	 * overlay_align_horizontal: "left" | "center" | "right"
	 *
	 * element-align-vertical: "top" | "center" | "bottom"
	 * element-align-horizontal: "left" | "center" | "right"
     *
	 * element
	 */
	constructor: function (options) {
		options = options || {};
		options.anchor = options.anchor || "absolute";
		//options.hide_on_leave = "hide_on_leave" in options ? options.hide_on_leave : true;
		options.visible = "visible" in options ? options.visible : false;
		options.children_classes = options.children_classes || [];
		if (BetaJS.Types.is_string(options.children_classes))
			options.children_classes = options.children_classes.split(" ");
		options.children_classes.push("overlay-container-class");
		this._inherited(BetaJS.Views.OverlayView, "constructor", options);
		this._setOption(options, "anchor", "none");
		this._setOption(options, "element", "");
		this._setOption(options, "overlay_left", 0);
		this._setOption(options, "overlay_top", 0);
		this._setOption(options, "overlay_align_vertical", "top");
		this._setOption(options, "overlay_align_horizontal", "left");
		this._setOption(options, "element_align_vertical", "bottom");
		this._setOption(options, "element_align_horizontal", "left");
		if (options.overlay_inner) {
			options.overlay_inner.setEl('[data-selector="container"]');
			this.overlay_inner = this.addChild(options.overlay_inner);
		}
		if (!("hide_on_leave" in options) || options.hide_on_leave)
			this.add_module(BetaJS.Views.Modules.HideOnLeave.singleton());
		this.on("show", this._after_show, this);
	},
	
	_after_show: function () {	
		if (this.__anchor == "none")
			return;
		var overlay = this.$(".overlay-container-class");
		var width = overlay.outerWidth();
		var height = overlay.outerHeight();

		var left = this.__overlay_left;
		var top = this.__overlay_top;
		
		if (this.__overlay_align_vertical == "bottom")
			top -= height;
		else if (this.__overlay_align_vertical == "center")
			top -= Math.round(height/2);

		if (this.__overlay_align_horizontal == "right")
			left -= width;
		else if (this.__overlay_align_horizontal == "center")
			left -= Math.round(width/2);
			
		var element = this.$el;
		if (this.__anchor == "element" && this.__element) {
			element = this.__element;
			if (BetaJS.Types.is_string(element))
				element = BetaJS.$(element);
			else if (BetaJS.Class.is_class_instance(element))
				element = element.$el;
		}
		if (this.__anchor == "relative" || this.__anchor == "element") {
			element_width = element.outerWidth();
			element_height = element.outerHeight();
			left += element.offset().left - $(window).scrollLeft();
			top += element.offset().top - $(window).scrollTop();
			if (this.__element_align_vertical == "bottom")
				top += element_height;
			else if (this.__element_align_vertical == "center")
				top += Math.round(element_height/2);
			if (this.__element_align_horizontal == "right")
				left += element_width;
			else if (this.__element_align_horizontal == "center")
				left += Math.round(element_width/2);
		}
		overlay.css("left", left + "px");
		overlay.css("top", top + "px");
	}

});
BetaJS.Views.View.extend("BetaJS.Views.FullscreenOverlayView", {
	
	_templates: {
		"default": BetaJS.Templates.Cached["fullscreen-overlay-view-template"]
	},
	
	_events: function () {
		return [{
			'click [data-selector="outer"]': "__unfocus",
			'touchstart [data-selector="outer"]': "__unfocus"
		}];
	},

	constructor: function (options) {
		options = options || {};
		options.el = options.el || "body";
		options.append_to_el = "append_to_el" in options ? options.append_to_el : true;
		options.visible = "visible" in options ? options.visible : false;
		this._inherited(BetaJS.Views.FullscreenOverlayView, "constructor", options);
		options.overlay_inner.setEl('[data-selector="inner"]');
		this.overlay_inner = this.addChild(options.overlay_inner);
		this._setOption(options, "hide_on_unfocus", true);
		this._setOption(options, "destroy_on_unfocus", false);
		this.on("show", this._after_show, this);
		this.on("hide", this._after_hide, this);
	},
	
	_after_show: function () {	
		var outer = this.$('[data-selector="outer"]');
		var inner = this.$('[data-selector="inner"]');
		inner.removeClass("fullscreen-overlay-float");
		inner.removeClass("fullscreen-overlay-fit");
		var outer_width = outer.outerWidth();
		var outer_height = outer.outerHeight();
		var inner_width = inner.outerWidth();
		var inner_height = inner.outerHeight();
		var left = Math.floor((outer_width - inner_width) / 2);
		var top = Math.floor((outer_height - inner_height) / 2);
		if (left >= 0 && top >= 0) {
			inner.css("left", left + "px");
			inner.css("top", top + "px");
			inner.addClass("fullscreen-overlay-float");
		} else {
			inner.css("left", "0px");
			inner.css("top", "0px");
			inner.addClass("fullscreen-overlay-fit");
		}
		BetaJS.$("body").addClass("fullscreen-overlay-body");
	},
	
	_after_hide: function () {
		BetaJS.$("body").removeClass("fullscreen-overlay-body");
	},
	
	__unfocus: function () {
		if (this.__destroy_on_unfocus)
			this.destroy();
		else if (this.__hide_on_unfocus)
			this.hide();
	}

});
BetaJS.Views.ListContainerView.extend("BetaJS.Views.FormControlView", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.FormControlView, "constructor", options);
		this._model = options.model;
		this._property = options.property;
		this._setOption(options, "validate_on_change", false);
		this._setOption(options, "validate_on_show", false);
		this._setOption(options, "error_classes", "");
		this.control_view = this.addChild(this._createControl(this._model, this._property, options.control_options || {}));
		this.label_view = this.addChild(new BetaJS.Views.LabelView(BetaJS.Objs.extend(options.label_options || {}, {visible: false})));
		if (this.__validate_on_change)
			this._model.on("change:" + this._property, this.validate, this);
		if (this.__validate_on_show)
			this.on("show", this.validate, this);
		this._model.on("validate:" + this._property, this.validate, this);
	},
	
	validate: function () {
		if (this.isActive()) {
			var result = this._model.validateAttr(this._property);
			this.label_view.setVisibility(!result);
			if (result) {
				this.$el.removeClass(this.__error_classes);
			} else {
				this.$el.addClass(this.__error_classes);
				this.label_view.set("label", this._model.getError(this._property));
			}
		}			
	},
	
	_createControl: function (model, property, options) {}
	
});

BetaJS.Views.FormControlView.extend("BetaJS.Views.FormInputView", {
	
	_createControl: function (model, property, options) {
		return new BetaJS.Views.InputView(BetaJS.Objs.extend(options, {
			value: model.binding(property)
		}));
	}
	
});

BetaJS.Views.FormControlView.extend("BetaJS.Views.FormCheckBoxView", {
	
	_createControl: function (model, property, options) {
		return new BetaJS.Views.CheckBoxView(BetaJS.Objs.extend(options, {
			checked: model.binding(property)
		}));
	}
	
});

BetaJS.Views.ListContainerView.extend("BetaJS.Views.ToolBarView", {
	
	_css: function () {
		return {
			"divider": "divider",
			"group": "group"
		};
	},

	constructor: function (options) {
		options = BetaJS.Objs.extend({
			clear_float: true
		}, options || {});
		this._inherited(BetaJS.Views.ToolBarView, "constructor", options);
		this.__group_by_ident = {};
		this.__item_by_ident = {};
		if (options.groups) {
			BetaJS.Objs.iter(options.groups, function (group) {
				this.addGroup(group);
			}, this);
		}
		if (options.items) {
			BetaJS.Objs.iter(options.items, function (item) {
				this.addItem(item);
			}, this);
		}
	},
	
	__group_parent_options: BetaJS.Objs.objectify([
		"group_ident", "group_type", "group_options"
	]),

	addGroup: function (options) {
		var parent_options = {
			group_type: "container"
		};
		var group_options = {};
		BetaJS.Objs.iter(options || {}, function (value, key) {
			if (key in this.__group_parent_options)
				parent_options[key] = value;
			else
				group_options[key] = value;
		}, this);
		var view = null;
		if (parent_options.group_type == "container") {
			group_options.el_classes = this.css("group");
			view = this.addChild(new BetaJS.Views.ListContainerView(group_options), parent_options);
			if (parent_options.group_ident) {
				if (parent_options.group_ident in this.__group_by_ident)
					throw ("Group identifier already registered: " + parent_options.group_ident);
				this.__group_by_ident[parent_options.group_ident] = view;
			}
			return view;			
		} else if (parent_options.group_type == "divider") {
			group_options.el_classes = this.css("divider");
			view = this.addChild(new BetaJS.Views.View(group_options), parent_options);
		} else throw ("Unknown group type: " + parent_options.group_type);
		return view;			
	},
	
	__item_parent_options: BetaJS.Objs.objectify([
		"item_ident", "item_type", "item_group"
	]),
	
	addItem: function (options) {
		var parent_options = {
			item_type: "ButtonView"
		};
		var item_options = {};
		BetaJS.Objs.iter(options || {}, function (value, key) {
			if (key in this.__item_parent_options)
				parent_options[key] = value;
			else
				item_options[key] = value;
		}, this);
		if (parent_options.item_type in BetaJS.Views)
			parent_options.item_type = BetaJS.Views[parent_options.item_type];
		if (BetaJS.Types.is_string(parent_options.item_type))
			parent_options.item_type = BetaJS.Scopes.resolve(parent_options.item_type);
		var parent = this;
		if (parent_options.item_group) {
			if (parent_options.item_group in this.__group_by_ident) {
				parent = this.__group_by_ident[parent_options.item_group];
				var group_options = this.childOptions(parent);
				item_options = BetaJS.Objs.extend(group_options.group_options || {}, item_options);
			} else
				throw ("Unknown group identifier: " + parent_options.item_group);
		}
		var view = parent.addChild(new parent_options.item_type(item_options), parent_options);
		this.delegateEvents(null, view, "item", [view, parent_options]);
		if (parent_options.item_ident)
			this.delegateEvents(null, view, "item-" + parent_options.item_ident, [view, parent_options]);
		if (parent_options.item_ident) {
			if (parent_options.item_ident in this.__item_by_ident)
				throw ("Item identifier already registered: " + parent_options.item_ident);
			this.__item_by_ident[parent_options.item_ident] = view;
		}
		return view;
	},
	
	itemByIdent: function (ident) {
		return this.__item_by_ident[ident];
	}
		
});
