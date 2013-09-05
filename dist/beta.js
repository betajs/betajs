/*!
  betajs - v0.0.1 - 2013-09-05
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*!
  betajs - v0.0.1 - 2013-09-05
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*!
  betajs - v0.0.1 - 2013-09-05
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
var BetaJS = BetaJS || {};
/*
 * Export for NodeJS
 */
if (typeof module != "undefined" && "exports" in module)
	module.exports = BetaJS;

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

BetaJS.Strings = {
	
	nl2br: function (s) {
		return (s + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
	},
	
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
	
	js_escape: function (s) {
		var self = this;
		return s.replace(this.JS_ESCAPER_REGEX(), function(match) {
			return '\\' + self.JS_ESCAPES[match];
		});
	},
	
	starts_with: function (s, needle) {
		return s.substring(0, needle.length) == needle;
	},
	
	ends_with: function(s, needle) {
    	return s.indexOf(needle, s.length - needle.length) !== -1;
	},
	
	strip_start: function (s, needle) {
		return this.starts_with(s, needle) ? s.substring(needle.length) : s;
	},
	
	last_after: function (s, needle) {
		return s.substring(s.lastIndexOf(needle) + needle.length, s.length);
	}

};

BetaJS.Functions = {
	
	as_method: function (func, instance) {
		return function() {
			return func.apply(instance, arguments);
		};
	},
	
	once: function (func) {
		var result;
		var executed = false;
		return function () {
			if (executed)
				return result;
			executed = true;
			result = func.apply(this, arguments);
			func = null;
			return result;
		}
	}

};

BetaJS.Scopes = {
	
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
	
	resolve: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var a = s.split(".");			
		var object = this.base(a[0], base);
		for (var i = 1; i < a.length; ++i)
			object = object[a[i]];
		return object;
	},
	
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
	},
	
};

BetaJS.Objs = {
	
	count: function (obj) {
		if (BetaJS.Types.is_array(obj))
			return obj.length
		else {
			var c = 0;
			for (var key in obj)
				++c;
			return c;
		}
	},
	
	clone: function (item, depth) {
		if (!depth || depth <= 0)
			return item;
		if (BetaJS.Types.is_array(item))
			return item.slice(0);
		else if (BetaJS.Types.is_object(item))
			return this.extend({}, item, depth-1)
		else
			return item;
	},
	
	extend: function (target, source, depth) {
		for (var key in source)
			target[key] = this.clone(source[key], depth);
		return target;
	},
	
	keys: function(obj, mapped) {
		if (BetaJS.Types.is_undefined(mapped)) {
			var result = [];
			for (var key in obj)
				result.push(key);
			return result;
		} else {
			var result = {};
			for (var key in obj)
				result[key] = mapped;
			return result;
		}
	},
	
	map: function (obj, f, context) {
		if (BetaJS.Types.is_array(obj)) {
			var result = [];
			for (var i = 0; i < obj.length; ++i)
				result.push(context ? f.apply(context, obj[i], i) : f(obj[i], i));
			return result;
		} else {
			var result = {};
			for (var key in obj)
				result[key] = context ? f.apply(context, obj[key], key) : f(obj[key], key);
		}
	},
	
	values: function (obj) {
		var result = [];
		for (var key in obj)
			result.push(obj[key]);
		return result;
	},
	
	filter: function (obj, f, context) {
		if (BetaJS.Types.is_array(obj)) {
			var ret = [];
			for (var i = 0; i < obj.length; ++i) {
				if (context ? f.apply(context, [obj[i], i]) : f(obj[i], i))
					ret.push(obj[i]);
			}
			return ret;
		} else {
			var ret = {};
			for (var key in obj) {
				if (context ? f.apply(context, [obj[key], key]) : f(obj[key], key))
					ret[key] = obj[key];
			}
			return ret;
		}
	},
	
	equals: function (obj1, obj2, depth) {
		if (depth && depth > 0) {
			for (var key in obj1)
				if (!key in obj2 || !this.equals(obj1[key], obj2[key], depth-1))
					return false;
			for (var key in obj2)
				if (!key in obj1)
					return false;
			return true;
		} else
			return obj1 == obj2;
	},
	
	iter: function (obj, f, context) {
		if (BetaJS.Types.is_array(obj))
			for (var i = 0; i < obj.length; ++i) {
				var result = context ? f.apply(context, [obj[i], i]) : f(obj[i], i)
				if (BetaJS.Types.is_defined(result) && !result)
					return false;
			}
		else
			for (var key in obj) {
				var result = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
				if (BetaJS.Types.is_defined(result) && !result)
					return false;
			}
		return true;
	},
	
	intersect: function (a, b) {
		var c = {};
		for (var key in a)
			if (key in b)
				c[key] = a[key];
		return c;
	},
	
	contains_key: function (obj, key) {
		if (BetaJS.Types.is_array(obj))
			return BetaJS.Types.is_defined(obj[key])
		else
			return key in obj;
	},
	
	contains_value: function (obj, value) {
		if (BetaJS.Types.is_array(obj)) {
			for (var i = 0; i < obj.length; ++i)
				if (obj[i] === value)
					return true
		} else {
			for (var key in obj)
				if (obj[key] === value)
					return true;
		}
		return false;
	}
	
};

BetaJS.Ids = {
	
	__uniqueId: 0,
	
	uniqueId: function (prefix) {
		return (prefix || "") + (this.__uniqueId++);
	},
	
	objectId: function (object) {
		if (!object.__cid)
			object.__cid = this.uniqueId("cid_");
		return object.__cid;
	}
	
}

BetaJS.Ids.ClientIdMixin = {
	
	cid: function () {
		return BetaJS.Ids.objectId(this);
	}
	
}
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
	if (parent.__class_statics_keys)
		for (var key in parent.__class_statics_keys) 
			result[key] = BetaJS.Objs.clone(parent[key], 1);
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
		if (object._notifications) {
			for (var key in object._notifications) {
				if (!result.__notifications[key])
					result.__notifications[key] = [];
				result.__notifications[key].push(object._notifications[key]);
			}
		}
	});	
	delete result.prototype._notifications;
	
	return result; 
};



BetaJS.Class.prototype.constructor = function () {
	this._notify("construct");
}

BetaJS.Class.prototype.as_method = function (s) {
	return BetaJS.Functions.as_method(this[s], this);
}

BetaJS.Class.prototype._auto_destroy = function (obj) {
	if (!this.__auto_destroy_list)
		this.__auto_destroy_list = [];
	this.__auto_destroy_list.push(obj);
	return obj;
}

BetaJS.Class.prototype._notify = function (name) {
	if (!this.cls.__notifications)
		return;
	var rest = Array.prototype.slice.call(arguments, 1);
	var table = this.cls.__notifications[name];
	if (table)
		for (var i in table)
			this[table[i]].apply(this, rest);
}

BetaJS.Class.prototype.destroy = function () {
	this._notify("destroy");
	if (this.__auto_destroy_list)
		for (var i = 0; i < this.__auto_destroy_list.length; ++i)
			if ("destroy" in this.__auto_destroy_list[i])
				this.__auto_destroy_list[i].destroy();
	for (var key in this)
		delete this[key];
}

BetaJS.Class.prototype._inherited = function (cls, func) {
	return cls.parent.prototype[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
}

BetaJS.Class._inherited = function (cls, func) {
	return cls.parent[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
}

BetaJS.Class.prototype.instance_of = function (cls) {
	return this.cls.ancestor_of(cls);
}

BetaJS.Class.ancestor_of = function (cls) {
	return (this == cls) || (this != BetaJS.Class && this.parent.ancestor_of(cls));
}



BetaJS.Class.prototype.cls = BetaJS.Class;

BetaJS.Class.__notifications = {};

BetaJS.Class.is_class_instance = function (object) {
	return object != null && BetaJS.Types.is_object(object) && ("_inherited" in object) && ("cls" in object);
};


BetaJS.Exceptions = {
	
	ensure: function (e) {
		if (e != null && BetaJS.Types.is_object(e) && ("instance_of" in e) && (e.instance_of(BetaJS.Exceptions.Exception)))
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
	}
	
}, {
	
	ensure: function (e) {
		var e = BetaJS.Exceptions.ensure(e);
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
	_iterate: function (callback) {},
	
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
		return this.get_ident(object) != null;
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
		var self = this;
		this._iterate(function (object, ident) {
			self.remove_by_ident(ident);
			return true;
		});
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
		var self = this;
		this._iterate(function (object, ident) {
			if (filter(object))
				self.remove_by_ident(ident);
			return true;
		});
	},
	
	get: function (ident) {
		return this._get(ident);
	},
	
	iterate: function (cb) {
		this._iterate(function (object, ident) {
			var ret = cb(object, ident);
			return BetaJS.Types.is_defined(ret) ? ret : true;
		});
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
			this.__last.prev.next = this.__last
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
	
	_iterate: function (cb) {
		var current = this.__first;
		while (current != null) {
			var prev = current;
			current = current.next;
			if (!cb(prev.obj, prev))
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
	
	_iterate: function (callback) {
		for (var key in this.__map)
			callback(this.__map[key], key);
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
		if (!("_compare" in this))
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
		if (i == index)
			while (i > 0 && this._compare(this.__items[i], this.__items[i - 1]) < 0) {
				this.__items[i] = this.__items[i - 1];
				this.__ident_changed(this.__items[i], i);
				this.__items[i - 1] = object;
				--i;
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
	
	_iterate: function (callback) {
		var items = BetaJS.Objs.clone(this.__items, 1);
		for (var i = 0; i < items.length; ++i)
			callback(items[i], this.get_ident(items[i]));
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
		if (mixed == null)
			return new BetaJS.Iterators.ArrayIterator([]);
		if (mixed.instance_of(BetaJS.Iterators.Iterator))
			return mixed;
		if (BetaJS.Types.is_array(mixed))
			return new BetaJS.Iterators.ArrayIterator(mixed);
		return new BetaJS.Iterators.ArrayIterator([mixed]);
	},
	
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
		return this.__array[this.__i++];
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
	
	constructor: function (iterator, map) {
		this._inherited(BetaJS.Iterators.MappedIterator, "constructor");
		this.__iterator = iterator;
		this.__map = map;
	},
	
	hasNext: function () {
		return this.__iterator.hasNext();
	},
	
	next: function () {
		return this.hasNext() ? this.__map(this.__iterator.next()) : null;
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
		return this.__next != null;
	},
	
	next: function () {
		this.__crawl();
		var item = this.__next;
		this.__next = null;
		return item;
	},
	
	__crawl: function () {
		while (this.__next == null && this.__iterator.hasNext()) {
			var item = this.__iterator.next();;
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
	},

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
	},

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
		return this.__array[this.__i++];
	}
	
});

BetaJS.Events = {};

BetaJS.Events.EVENT_SPLITTER = /\s+/;

BetaJS.Events.EventsMixin = {
	
	__create_event_object: function (callback, context, options) {
		options = options || {};
		var obj = {
			callback: callback,
			context: context,
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
			object.callback.apply(object.context || this, params)
		else
			object.params = params;
	},
	
	on: function(events, callback, context, options) {
		this.__events_mixin_events = this.__events_mixin_events || {};
		events = events.split(BetaJS.Events.EVENT_SPLITTER);
		var event;
		while (event = events.shift()) {
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
			while (event = events.shift())
				if (this.__events_mixin_events[event]) {
					this.__events_mixin_events[event].remove_by_filter(function (object) {
						var result = (!callback || object.callback == callback) && (!context || object.context == context);
						if (result && this.__destroy_event_object)
							this.__destroy_event_object(object);
						return result;
					});
					if (this.__events_mixin_events[event].count() == 0) {
						this.__events_mixin_events[event].destroy();
						delete this.__events_mixin_events[event];
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
				if (this.__events_mixin_events[event].count() == 0) {
					this.__events_mixin_events[event].destroy();
					delete this.__events_mixin_events[event];
				}
			}
		}
		return this;
	},

    trigger: function(events) {
    	var self = this;
    	events = events.split(BetaJS.Events.EVENT_SPLITTER);
    	var rest = Array.prototype.slice.call(arguments, 1);
		var event;
		if (!this.__events_mixin_events)
			return;
    	while (event = events.shift()) {
    		if (this.__events_mixin_events && this.__events_mixin_events[event])
    			this.__events_mixin_events[event].iterate(function (object) {
    				self.__call_event_object(object, rest);
    			});
			if (this.__events_mixin_events && "all" in this.__events_mixin_events)
				this.__events_mixin_events["all"].iterate(function (object) {
					self.__call_event_object(object, rest);
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
    
    delegateEvents: function (events, source) {
    	if (!BetaJS.Types.is_array(events))
    		events = [events];
   		BetaJS.Objs.iter(events, function (event) {
			source.on(event, function () {
				var rest = Array.prototype.slice.call(arguments, 0);
				this.trigger.apply(this, [event].concat(rest));
			}, this);
		}, this);
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
	
}

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


BetaJS.Class.extend("BetaJS.Classes.AutoDestroyObject", [
	BetaJS.Ids.ClientIdMixin,
	{
		
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
	},
	
}]);



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
		if (this.__size != null && this.__count >= this.__size && this.__first)
			this.remove(this.__first.object);
		var container = {
			object: object,
			prev: this.__last,
			next: null,
		};
		this.__id_to_container[BetaJS.Ids.objectId(object)] = container;
		if (this.__first)
			this.__last.next = container
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
						dep.bindee.off("change:" + dep.property, null, this.__properties[key])
					else if (this._isTimer(dep))
						entry.timers[dep].destroy
					else
						self.off("change:" + dep, null, this.__properties[key]);
				}, this);
			}
			delete this.__properties[key];
		};
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
		return parseInt(BetaJS.Strings.strip_start("timer:"));
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
	},
	
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
	BetaJS.Ids.ClientIdMixin,
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
		});
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
		if (this.exists(object))
			return null;
		var ident = this.__data.add(object);
		if (ident != null) {
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
		if ("off" in object)
			object.off(null, null, this);
		var result = this.__data.remove(object);
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
	
	iterate: function (cb) {
		this.__data.iterate(cb);
	},
	
	clear: function () {
		var self = this;
		this.iterate(function (obj) {
			self.remove(obj);
		});
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
		var self = this;
		this.__parent.iterate(function (object) {
			self.add(object);
			return true;
		});
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
		if (result == null)
			return null;
		return this.__parent.remove(object);
	}
	
});

BetaJS.Comparators = {
	
	byObject: function (object) {
		return function (left, right) {
			for (key in object) {
				var l = left[key] || null;
				var r = right[key] || null;
				var c = BetaJS.Comparators.byValue(l, r);
				if (c != 0)
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
		for (var i = 0; i < n; ++i) {
			todo[i] = true;
			var ident = identifierf(items[i], i);
			identifier_to_index[ident] = i;
			data.push({
				before: {},
				after: {}
			});		
		}
		for (var i = 0; i < n; ++i) {
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
		while (!BetaJS.Types.is_empty(todo))
			for (var i in todo)
				if (BetaJS.Types.is_empty(data[i].after)) {
					delete todo[i];
					result.push(items[i]);
					for (var before in data[i].before)
						delete data[before].after[i];
				}
		return result;
	}
	
};

BetaJS.Tokens = {
	
	generate_token: function () {
		return Math.random().toString(36).substr(2); 
	}
	
}
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
			"s": seconds, 
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
			return this.format(t, {time: false})
		else
			return this.format_period(this.ago(t)) + " ago";
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
			if (options.date)
				if (options.time)
					return d.toLocaleString()
				else
					return d.toLocaleDateString()
			else
				return d.toLocaleTimeString();
		} else {
			if (options.date)
				if (options.time)
					return d.toString()
				else
					return d.toDateString()
			else
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
			destroy_on_fire: false,
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
			clearTimeout(this.__timer)
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
			}, this.__delay)
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
BetaJS.Net = BetaJS.Net || {};

BetaJS.Net.Uri = {
	
	encodeUriParams: function (arr) {
		var res = [];
		BetaJS.Objs.iter(arr, function (value, key) {
			res.push(key + "=" + encodeURI(value));
		});
		return res.join("&");
	},
	
	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License

	parse: function (str, strict) {
		var parser = strict ? this.__parse_strict_regex : this.__parse_loose_regex;
		var m = parser.exec(str);
		var uri = {},
		i = 14;
		while (i--)
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
  betajs - v0.0.1 - 2013-09-05
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
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
				failure_callback(e.status_code(), e.status_text(), e.data())
			else
				throw e;
		}
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
						failure_callback(status_code, status_text, data)
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
				failure_callback(e.status_code(), e.status_text(), e.data())
			else
				throw e;
		}
	},
	
	call: function (options) {
		if (!("async" in options))
			return false;
		var async = options["async"];
		delete options["async"];
		return async ? this.asyncCall(options) : this.syncCall(options);
	},
	
	_syncCall: function (options) {},
	
	_asyncCall: function (options) {},
	
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
	}
	
});


BetaJS.Net.AbstractAjax.extend("BetaJS.Net.JQueryAjax", {
	
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
	},

});

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
			dep[key]++
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
			return this.__dependencies_queries(value, dep)
		else
			return this.__increase_dependency(key, dep);
	},

	dependencies : function(query) {
		return this.__dependencies_query(query, {});
	},
	
	
	__evaluate_query: function (query, object) {
		for (var key in query)
			if (!this.__evaluate_pair(key, query[key], object))
				return false;
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
					result = result && object_value.indexOf(tar) == 0;
				if (op == "$swic")
					result = result && object_value.toLowerCase().indexOf(tar.toLowerCase()) == 0;
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
		if (raw == null)
			iter = BetaJS.Iterators.ArrayIterator([])
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
			if (raw == null)
				iter = new BetaJS.Iterators.ArrayIterator([])
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
				callbacks.exception(e)
			else
				throw e;
		};
		if (callbacks)
			query_function.apply(query_context || this,[execute_query, execute_options, {success: success_call, exception: exception_call}])
		else
			try {
				var raw = query_function.apply(query_context || this, [execute_query, execute_options]);
				return success_call(raw);
			} catch (e) {
				exception_call(e);
			}		
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
		if (this.__query.sort != null && !BetaJS.Types.is_empty(this.__query.sort))
			q.sort = this.__query.sort;
		if (clear_before) {
			if (skip > 0)
				q.skip = skip;
			if (limit != null)
				q.limit = limit;
			var iter = this.__query.func(this.__query.select, q);
			var objs = iter.asArray();
			this.__query.skip = skip;
			this.__query.limit = limit;
			this.__query.count = limit == null || objs.length < limit ? skip + objs.length : null;
			this.clear();
			this.add_objects(objs);
		} else if (skip < this.__query.skip) {
			limit = this.__query.skip - skip;
			if (skip > 0)
				q.skip = skip;
			q.limit = limit;
			var iter = this.__query.func(this.__query.select, q);
			var objs = iter.asArray();
			this.__query.skip = skip;
			this.__query.limit = this.__query.limit == null ? null : this.__query.limit + objs.length;
			this.add_objects(objs);
		} else if (skip >= this.__query.skip) {
			if (this.__query.limit != null && (limit == null || skip + limit > this.__query.skip + this.__query.limit)) {
				limit = (skip + limit) - (this.__query.skip + this.__query.limit);
				skip = this.__query.skip + this.__query.limit;
				if (skip > 0)
					q.skip = skip;
				if (limit != null)
					q.limit = limit;
				var iter = this.__query.func(this.__query.select, q);
				var objs = iter.asArray();
				this.__query.limit = this.__query.limit + objs.length;
				if (limit > objs.length)
					this.__query.count = skip + objs.length;
				this.add_objects(objs);
			}
		}
	},
	
	increase_forwards: function (steps) {
		steps = steps == null ? this.__query.forward_steps : steps;
		if (steps == null || this.__query.limit == null)
			return;
		this.__execute_query(this.__query.skip + this.__query.limit, steps, false);
	},
	
	increase_backwards: function (steps) {
		steps = steps == null ? this.__query.backward_steps : steps;
		if (steps != null && this.__query.skip > 0) {
			var steps = Math.min(steps, this.__query.skip)
			this.__execute_query(this.__query.skip - steps, steps, false);
		}
	},
	
	paginate: function (index) {
		this.__execute_query(this.__query.range * index, this.__query.range, true);
	},
	
	paginate_index: function () {
		return this.__query.range == null ? null : Math.floor(this.__query.skip / this.__query.range);
	},
	
	paginate_count: function () {
		return this.__query.count == null || this.__query.range == null ? null : Math.ceil(this.__query.count / this.__query.range);
	},
	
	next: function () {
		var paginate_index = this.paginate_index();
		if (paginate_index == null)
			return;
		var paginate_count = this.paginate_count();
		if (paginate_count == null || paginate_index < this.paginate_count() - 1)
			this.paginate(paginate_index + 1);
	},
	
	prev: function () {
		var paginate_index = this.paginate_index();
		if (paginate_index == null)
			return;
		if (paginate_index > 0)
			this.paginate(paginate_index - 1);
	},
	
	isComplete: function () {
		return this.__query.count != null;
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
	},	
	
});

BetaJS.Class.extend("BetaJS.Queries.ActiveQuery", [

	BetaJS.Ids.ClientIdMixin,
	{
	
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
	
}]);

BetaJS.Exceptions.Exception.extend("BetaJS.Stores.StoreException");


/** @class */
BetaJS.Class.extend("BetaJS.Stores.BaseStore", [
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
		if (this._create_ids && !(this._id_key in data)) {
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
				callbacks.exception(e)
			else
				throw e;
		};
		if (this._async_write)
			this._insert(data, {success: success_call, exception: exception_call})
		else
			try {
				var row = this._insert(data);
				success_call(row);
				return row;
			} catch (e) {
				exception_call(e);
			}
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
				callbacks.exception(e)
			else
				throw e;
		};
		if (this._async_write)
			this._remove(id, {success: success_call, exception: exception_call})
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
				callbacks.exception(e)
			else
				throw e;
		};
		if (this._async_read)
			this._get(id, {success: success_call, exception: exception_call})
		else
			try {
				var row = this._get(id);
				success_call(row);
				return row;
			} catch (e) {
				exception_call(e);
			}
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
				callbacks.exception(e)
			else
				throw e;
		};
		if (this._async_write)
			this._update(id, data, {success: success_call, exception: exception_call})
		else
			try {
				var row = this._update(id, data);
				success_call(row);
				return row;
			} catch (e) {
				exception_call(e);
			}
	},
	
	query: function (query, options, callbacks) {
		return BetaJS.Queries.Constrained.emulate(
			BetaJS.Queries.Constrained.make(query, options || {}),
			this._query_capabilities(),
			this._query,
			this,
			callbacks
		); 
	},
	
	_query_applies_to_id: function (query, id) {
		var row = this.get(id);
		return row && BetaJS.Queries.overloaded_evaluate(query, row);
	},
	
	clear: function () {
		var iter = this.query({});
		while (iter.hasNext())
			this.remove(iter.next().id);
	}

}]);

BetaJS.Class.extend("BetaJS.Stores.StoresMonitor", [
	BetaJS.Events.EventsMixin,
{
	attach: function (ident, store) {
		store.on("insert", function (row) {
			this.trigger("insert", ident, store, row);
			this.trigger("write", "insert", ident, store, row)
		}, this);
		store.on("remove", function (id) {
			this.trigger("remove", ident, store, id);
			this.trigger("write", "remove", ident, store, id);
		}, this);
		store.on("update", function (row, data) {
			this.trigger("update", ident, store, row, data);
			this.trigger("write", "update", ident, store, row, data);
		}, this);
	},	
		
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
	},	

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
		if (last_id != null) {
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
			if (next_id != null) {
				this._remove_next_id(id);
				if (prev_id != null) {
					this._remove_prev_id(id);
					this._write_next_id(prev_id, next_id);
					this._write_prev_id(next_id, prev_id);
				} else {
					this._remove_prev_id(next_id);
					this._write_first_id(next_id);
				}
			} else if (prev_id != null) {
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
			__id: fid == null ? 1 : fid,
			__store: store,
			__query: query,
			
			hasNext: function () {
				var last_id = this.__store._read_last_id();
				if (last_id == null)
					return false;
				while (this.__id < last_id && !this.__store._read_item(this.__id))
					this.__id++;
				while (this.__id <= last_id) {
					if (this.__store._query_applies_to_id(query, this.__id))
						return true;
					if (this.__id < last_id)
						this.__id = this.__store._read_next_id(this.__id)
					else
						this.__id++;
				}
				return false;
			},
			
			next: function () {
				if (this.hasNext()) {
					var item = this.__store.get(this.__id);
					if (this.__id == this.__store._read_last_id())
						this.__id++
					else
						this.__id = this.__store._read_next_id(this.__id);
					return item;
				}
				return null;
			}
		});
		return iter;
	},	
	
	
});

BetaJS.Stores.DumbStore.extend("BetaJS.Stores.AssocDumbStore", {
	
	_read_key: function (key) {},
	_write_key: function (key, value) {},
	_remove_key: function (key) {},
	
	__read_id: function (key) {
		var raw = this._read_key(key);
		return raw ? parseInt(raw) : null;
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
	},
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.DualStore", {
	
	constructor: function (first, second, options) {
		options = BetaJS.Objs.extend({
			create_options: {},
			update_options: {},
			delete_options: {},
			get_options: {},
			query_options: {},
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
				})
			else if (strategy == "or")
				return first.insert(data, {
					success: callbacks.success,
					exception: function () {
						second.insert(data, callbacks);
					}
				})
			else
				first.insert(data, callbacks);
		} else {
			if (strategy == "then")
				return second.insert(first.insert(data))
			else if (strategy == "or")
				try {
					return first.insert(data);
				} catch (e) {
					return second.insert(data);
				}
			else
				return first.insert(data);
		}
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
				})
			else if (strategy == "or")
				return first.update(id, data, {
					success: callbacks.success,
					exception: function () {
						second.update(id, data, callbacks);
					}
				})
			else
				first.update(id, data, callbacks);
		} else {
			if (strategy == "then")
				return second.update(id, first.update(id, data))
			else if (strategy == "or")
				try {
					return first.update(id, data);
				} catch (e) {
					return second.update(id, data);
				}
			else
				return first.update(id, data);
		}
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
				})
			else if (strategy == "or")
				return first.remove(id, {
					success: callbacks.success,
					exception: function () {
						second.remove(id, callbacks);
					}
				})
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
		if (strategy == "or")
			try {
				var result = first.get(id);
				if (result == null && or_on_null)
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
				var result = second.get(id);
				if (result != null && clone)
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
		if (strategy == "or")
			try {
				var result = first.query(query, options);
				if (result == null && or_on_null)
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
							second.cache_query(query, options, result)
						else
							second.insert_all(result);
						result = new BetaJS.Iterators.ArrayIterator(result);
					}
				}
				return result;
			} catch (e) {
				var result = second.query(query, options);
				if (result != null && clone) {
					result = result.asArray();
					if ("cache_query" in first)
						first.cache_query(query, options, result)
					else
						first.insert_all(result);
					result = new BetaJS.Iterators.ArrayIterator(result);
				}
				return result;
			}
		else
			return first.query(query, options);
	},

});

BetaJS.Stores.StoreException.extend("BetaJS.Stores.StoreCacheException");

BetaJS.Stores.DualStore.extend("BetaJS.Stores.FullyCachedStore", {
	constructor: function (parent, options) {
		options = options || {};
		this._inherited(BetaJS.Stores.FullyCachedStore, "constructor",
			parent,
			new BetaJS.Stores.MemoryStore({id_key: parent.id_key()}),
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


BetaJS.Stores.DualStore.extend("BetaJS.Stores.QueryCachedStore", {
	constructor: function (parent, options) {
		options = options || {};
		this._inherited(BetaJS.Stores.QueryCachedStore, "constructor",
			parent,
			new BetaJS.Stores.QueryCachedStore.InnerStore({id_key: parent.id_key()}),
			BetaJS.Objs.extend({
				get_options: {
					start: "second",
					strategy: "or",
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

BetaJS.Stores.StoreException.extend("BetaJS.Stores.RemoteStoreException", {
	
	constructor: function (source) {
		source = BetaJS.Net.AjaxException.ensure(source);
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
			error_callback(new BetaJS.Stores.RemoteStoreException(new BetaJS.Net.AjaxException(status_code, status_text, data)));
		};
		opts.success = success_callback;
		return opts;
	},

	_insert : function(data, callbacks) {
		try {
			var opts = {method: "POST", uri: this.prepare_uri("insert", data), data: data};
			if (this._async_write) 
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success))
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
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
	},

	_get : function(id, callbacks) {
		var data = {};
		data[this._id_key] = id;
		try {
			var opts = {uri: this.prepare_uri("get", data)};
			if (this._async_read)
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success))
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
	},

	_update : function(id, data, callbacks) {
		var copy = BetaJS.Objs.clone(data, 1);
		copy[this._id_key] = id;
		try {
			var opts = {method: this.__options.update_method, uri: this.prepare_uri("update", copy), data: data};
			if (this._async_write)
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success))
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
	},
	
	_query : function(query, options, callbacks) {
		try {		
			var opts = this._encode_query(query, options);
			if (this._async_read) {
				var self = this;
				opts = this._include_callbacks(opts, callbacks.exception, function (response) {
					callbacks.success(BetaJS.Types.is_string(raw) ? JSON.parse(raw) : raw)
				});
				this.__ajax.asyncCall(opts);
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
		return this.__store.query(query, options)
	},	

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
				return true;
			}
		} else {
			try {
				BetaJS.Objs.iter(this.__update_queue, function (item) {
					if (item.revision_id >= revision_id)
						return false;
					this.__store.update(item.id, item.data);
				}, this);
			if (callbacks && callbacks.success)
				callbacks.success();
			} catch (e) {
				if (callbacks && callbacks.exception)
					callbacks.exception(e)
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
						callbacks.exception(e)
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
  betajs - v0.0.1 - 2013-09-05
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
			ret = "OK"
		else if (code == this.HTTP.STATUS_CREATED)
			ret = "Created"
		else if (code == this.HTTP_STATUS_PAYMENT_REQUIRED)
			ret = "Payment Required"
		else if (code == this.HTTP_STATUS_FORBIDDEN)
			ret = "Forbidden"
		else if (code == this.HTTP_STATUS_NOT_FOUND)
			ret = "Not found"
		else if (code == this.HTTP_STATUS_PRECONDITION_FAILED)
			ret = "Precondition Failed"
		else if (code == this.HTTP_STATUS_INTERNAL_SERVER_ERROR)
			ret = "Internal Server Error"
		else
			ret = "Other Error";
		return prepend_code ? code + " " + ret : ret;
	}
	
}
BetaJS.Properties.Properties.extend("BetaJS.Modelling.SchemedProperties", {
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.SchemedProperties, "constructor");
		var scheme = this.cls.scheme();
		this._properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
		for (var key in scheme)
			if ("def" in scheme[key]) 
				this.set(key, scheme[key].def);
			else if (scheme[key].auto_create)
				this.set(key, scheme[key].auto_create(this))
			else
				this.set(key, null);
		options = options || {};
		this._properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
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
		return value;
	},
	
	_afterSet: function (key, value) {
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		this._properties_changed[key] = value;
		this.__unvalidated[key] = true;
		delete this.__errors[key];
	},

	properties_changed: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this._properties_changed;
		return BetaJS.Objs.filter(this._properties_changed, function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	properties_by: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this.getAll();
		return BetaJS.Objs.filter(this.getAll(), function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	validate: function () {
		this.trigger("validate");
		for (var key in this.__unvalidated)
			this.validateAttr(key);
		return BetaJS.Types.is_empty(this.__errors);
	},
	
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
					if (result != null)
						this.__errors[attr] = result;
					return result == null;
				}, this);
			}
			this.trigger("validate:" + attr, !(attr in this.__errors), this.__errors[attr]);
		}
		return !(attr in this.__errors);
	},
	
	setError: function (attr, error) {
		delete this.__unvalidated[attr];
		this.__errors[attr] = error;
	},
	
	revalidate: function () {
		this.__errors = {};
		this.__unvalidated = this.keys(true);
		return this.validate();
	},
	
	errors: function () {
		return this.__errors;
	},
	
	asRecord: function (tags) {
		var rec = {};
		var scheme = this.cls.scheme();
		var props = this.getAll();
		tags = tags || {};
		for (var key in props) 
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
		return rec;		
	},
	
	setByTags: function (data, tags) {
		var scheme = this.cls.scheme();
		tags = tags || {};
		for (var key in data) 
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
	},
	
}, {

	_initializeScheme: function () {
		var s = {};
		s[this.primary_key()] = {
			type: "id"
		};
		return s;
	},
	
	asRecords: function (arr, tags) {
		return arr.map(function (item) {
			return item.asRecord(tags);
		});
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
		}
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

});
BetaJS.Modelling.AssociatedProperties.extend("BetaJS.Modelling.Model", [
	BetaJS.Ids.ClientIdMixin,
	{
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.Model, "constructor", attributes, options);
		this.__saved = "saved" in options ? options["saved"] : false;
		this.__new = "new" in options ? options["new"] : true;
		this.__removed = false;
		if (this.__saved)
			this._properties_changed = {};
		this.__table = options["table"];
		this.__table._model_register(this);
	},
	
	destroy: function () {
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
			this._unsetChanged(key)
		else
			this.__saved = false;
		if (options && options.silent)
			return;
		if (this.__table)
			this.__table._model_set_value(this, key, value, options);
	},
	
	_after_create: function () {
	},
	
	save: function (options) {
		var self = this;
		var opts = BetaJS.Objs.clone(options || {}, 1);
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
	
}]);
BetaJS.Exceptions.Exception.extend("BetaJS.Modelling.ModelException", {
	
	constructor: function (model, message) {
		this._inherited(BetaJS.Modelling.ModelException, "constructor", message);
		this.__model = model;
	},
	
	model: function () {
		return this.__model;
	}
	
});


BetaJS.Modelling.ModelException.extend("BetaJS.Modelling.ModelInvalidException", {
	
	constructor: function (model) {
		var message = BetaJS.Objs.values(model.errors()).join("\n");
		this._inherited(BetaJS.Modelling.ModelInvalidException, "constructor", model, message);
	},

});


BetaJS.Modelling.ModelException.extend("BetaJS.Modelling.ModelMissingIdException", {
	
	constructor: function (model) {
		this._inherited(BetaJS.Modelling.ModelMissingIdException, "constructor", model, "No id given.");
	},

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
		return this.__models_by_cid.get(model) != null;
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
			this.__store.remove(model.id(), callback)
		else try {
			this.__store.remove(model.id());
			return callback.success();
		} catch (e) {
			return callback.exception(e);
		}
	},

	_model_save: function (model, options) {
		return model.isNew() ? this._model_create(model, options) : this._model_update(model, options);
	},
	
	__exception_conversion: function (model, e) {
		if (this.__options.store_validation_conversion && e.instance_of(BetaJS.Stores.RemoteStoreException)) {
			var source = e.source();
			if (source.status_code() == BetaJS.Net.HttpHeader.HTTP_STATUS_PRECONDITION_FAILED && source.data()) {
				BetaJS.Objs.iter(source.data(), function (value, key) {
					model.setError(key, value);
				}, this);
				e = new BetaJS.Modelling.ModelInvalidException(model);
			}
		}
		return e;
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
		var attrs = this.__options.greedy_create ? model.properties_by(true) : model.getAll();
		if (this.__options.type_column)
			attrs[this.__options.type_column] = model.cls.classname;
		var callback = {
			success : function (confirmed) {
				if (!(model.cls.primary_key() in confirmed))
					return callback.exception(new BetaJS.Modelling.ModelMissingIdException(model));
				self.__models_by_id[confirmed[model.cls.primary_key()]] = model;
				if (!self.__options.greedy_create)
					for (var key in model.properties_by(false))
						delete confirmed[key];
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
			this.__store.insert(attrs, callback)
		else try {
			var confirmed = this.__store.insert(attrs);
			return callback.success(confirmed);		
		} catch (e) {
			return callback.exception(e);
		}
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
		var callback = {
			success : function (confirmed) {
				if (!self.__options.greedy_update)
					for (var key in model.properties_changed(false))
						delete confirmed[key];
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
			this.__store.update(model.id(), attrs, callback)
		else try {
			var confirmed = BetaJS.Types.is_empty(attrs) ? {} : this.__store.update(model.id(), attrs);
			return callback.success(confirmed);		
		} catch (e) {
			return callback.exception(e);
		}
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
	
	__materialize: function (obj) {
		if (!obj)
			return null;
		var type = this.__model_type;
		if (this.__options.type_column && obj[this.__options.type_column])
			type = obj[this.__options.type_column];
		var cls = BetaJS.Scopes.resolve(type);
		if (this.__models_by_id[obj[cls.primary_key()]])
			return this.__models_by_id[obj[cls.primary_key()]];
		var model = new cls(obj, {
			table: this,
			saved: true,
			"new": false
		});
		return model;
	},
	
	findById: function (id) {
		if (this.__models_by_id[id])
			return this.__models_by_id[id]
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
		var query = {};
		query[this._foreign_key] = this._id();
		return this._foreign_table.allBy(query);
	},

	yield: function () {
		if (!this._options["cached"])
			return this._yield();
		if (!this.__cache)
			this.__cache = this._yield().asArray();
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
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
	},

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
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
	},

});
BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.HasOneAssociation", {

	_yield: function (id) {
		var query = {};
		if (id)
			query[this._foreign_key] = id
		else if (this._primary_key) 
			query[this._foreign_key] = this._model.get(this._primary_key)
		else
			query[this._foreign_key] = this._model.id();
		return this._foreign_table.findBy(query);
	},
	
	_change_id: function (new_id, old_id) {
		var object = this._yield(old_id);
		if (object) {
			object.set(this._foreign_key, new_id);
			object.save();
		}
	},

});
BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.BelongsToAssociation", {
	
	_yield: function () {
		if (this._primary_key) {
			var obj = {};
			obj[this._primary_key] = this._model.get(this._foreign_key);
			return this._foreign_table.findBy(obj);
		}
		else
			return this._foreign_table.findById(this._model.get(this._foreign_key));
	},
	
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
		return BetaJS.Types.is_null(value) ? this.__error_string : null;
	}

});
/*!
  betajs - v0.0.1 - 2013-09-05
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Net.Browser = {
	
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
	
	__flash: null,
	__isiOS: null,
	__isAndroid: null,
	__iOSversion: null,
	__isWebOS: null,
	__isWindowsPhone: null,
	__isBlackberry: null,
	__isMobile: null,
	__isInternetExplorer: null,

	flash: function () {
		if (!this.__flash)
			this.__flash = new BetaJS.Net.FlashDetect();
		return this.__flash;
	},
	
	isiOS: function () {
		if (this.__isiOS == null)
			this.__isiOS = (navigator.userAgent.indexOf('iPhone') != -1) || (navigator.userAgent.indexOf('iPod') != -1) || (navigator.userAgent.indexOf('iPad') != -1);
		return this.__isiOS;
	},
	
	isChrome: function () {
		return "chrome" in window;
	},
	
	isAndroid: function () {
		if (this.__isAndroid == null)
			this.__isAndroid = navigator.userAgent.toLowerCase().indexOf("android") != -1;
		return this.__isAndroid;
	},
	
	isWebOS: function () {
		if (this.__isWebOS == null)
			this.__isWebOS = navigator.userAgent.toLowerCase().indexOf("webos") != -1;
		return this.__isWebOS;
	},

	isWindowsPhone: function () {
		if (this.__isWindowsPhone == null)
			this.__isWindowsPhone = navigator.userAgent.toLowerCase().indexOf("windows phone") != -1;
		return this.__isWindowsPhone;
	},

	isBlackberry: function () {
		if (this.__isBlackberry == null)
			this.__isBlackberry = navigator.userAgent.toLowerCase().indexOf("blackberry") != -1;
		return this.__isBlackberry;
	},

	iOSversion: function () {
		if (this.__iOSversion == null && this.isiOS()) {
		    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		    this.__iOSversion = {
		    	major: parseInt(v[1], 10),
		    	minor: parseInt(v[2], 10),
		    	revision: parseInt(v[3] || 0, 10)
		    };
		}
		return this.__iOSversion;
	},
	
	isMobile: function () {
		if (this.__isMobile == null)
			this.__isMobile = this.isiOS() || this.isAndroid() || this.isWebOS() || this.isWindowsPhone() || this.isBlackberry();
		return this.__isMobile;
	},
	
	isInternetExplorer: function () {
		if (this.__isInternetExplorer == null)
			this.__isInternetExplorer = navigator.appName == 'Microsoft Internet Explorer';
		return this.__isInternetExplorer;
	}
	
}


/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/

BetaJS.Class.extend("BetaJS.Net.FlashDetect", {
	
	constructor: function () {
		this._inherited(BetaJS.Net.FlashDetect, "constructor");
		this.__version = null;
        if (navigator.plugins && navigator.plugins.length > 0) {
            var type = 'application/x-shockwave-flash';
            var mimeTypes = navigator.mimeTypes;
            if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description)
                this.__version = this.parseVersion(mimeTypes[type].enabledPlugin.description);
        } else if (navigator.appVersion.indexOf("Mac") == -1 && window.execScript)
            for (var i = 0; i < this.__activeXDetectRules.length; i++)
		        try {
		            var obj = new ActiveXObject(this.__activeXDetectRules[i].name);
		            var version = this.__activeXDetectRules[i].version(obj);
                    if (version) {
                    	this.__version = this.parseActiveXVersion(version);
                    	break;
                    }
		        } catch (err) { }
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
		return this.__version != null;
	},
	
	supported: function () {
		return this.installed() && !BetaJS.Net.Browser.is_iOS();
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
        for (i = 0; i < len; i++)
            if (properties[i] != arguments[i]) 
            	return properties[i] > arguments[i];
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
    }],

});



BetaJS.Net.Browser.Loader = {
	
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
	}

}
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
}

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
	},
	
}, {
	
	bySelector: function (selector) {
		return new this(BetaJS.$(selector).html());
	}
	
});
BetaJS.$ = jQuery || null;

/** @class */
BetaJS.Class.extend("BetaJS.Views.View", [
    BetaJS.Events.EventsMixin,                                            
	BetaJS.Events.ListenMixin,
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Properties.PropertiesMixin,
	/** @lends BetaJS.Views.View.prototype */
	{
    
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
		if (this.__parent) {
			var css = this.__parent.css(ident);
			if (css && css != ident)
				return css;
		}
		var css = this._css();
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
			this.$el.html(this.__html)
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
					s += (obj[key] == null ? key : (key + "='" + obj[key] + "'")) + " ";
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
			}
		}
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
		args = args || {}
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

	/** Sets private variable from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 * @param prefix (optional) per default is "__"
	 */
	_setOption: function (options, key, value, prefix) {
		var prefix = prefix ? prefix : "__";
		this[prefix + key] = (key in options) && (BetaJS.Types.is_defined(options[key])) ? options[key] : value;
	},
	
	/** Sets property variable (that will be passed to templates and dynamics by default) from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 */
	_setOptionProperty: function (options, key, value) {
		this.set(key, (key in options) && (BetaJS.Types.is_defined(options[key])) ? options[key] : value);
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
	 *  <li>hide_on_leave: (default: false) hide view if focus leaves</li>
	 *  <li>invalidate_on_show: (default: false) invalidate view on show</li>
	 *  <li>append_to_el: (default: false) append to el instead of replacing content</li>
	 *  <li>vertical_center: (default: false) top:50% + margin-correction</li>
	 *  <li>horizontal_center: (default: false) left:50% + margin-correction</li>
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
		this._setOption(options, "hide_on_leave", false);
		this._setOption(options, "vertical_center", false);
		this._setOption(options, "horizontal_center", false);
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
		this.__events = this._events().concat(this.__events);

		var templates = BetaJS.Objs.extend(BetaJS.Types.is_function(this._templates) ? this._templates() : this._templates, options["templates"] || {});
		if ("template" in options)
			templates["default"] = options["template"];
		this.__templates = {};
		for (var key in templates)
			this.__templates[key] = new BetaJS.Templates.Template(BetaJS.Types.is_string(templates[key]) ? templates[key] : templates[key].html())

		var dynamics = BetaJS.Objs.extend(BetaJS.Types.is_function(this._dynamics) ? this._dynamics() : this._dynamics, options["dynamics"] || {});
		if ("dynamic" in options)
			dynamics["default"] = options["dynamic"];
		this.__dynamics = {};
		for (var key in dynamics)
			this.__dynamics[key] = new BetaJS.Views.DynamicTemplate(this, BetaJS.Types.is_string(dynamics[key]) ? dynamics[key] : dynamics[key].html())

		this.setAll(options["properties"] || {});
		if (this.__invalidate_on_change)
			this.on("change", function () {
				this.invalidate();
			}, this);
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
		if (this.__el == null) 
			return null;
		if (this.__parent && !this.__parent.isActive())
			return null;
		if (this.__parent)
			this.$el = this.__el == "" ? this.__parent.$el : this.__parent.$(this.__el)
		else
			this.$el = BetaJS.$(this.__el);
		if (this.$el.size() == 0)
			this.$el = null;
		if (!this.$el)
			return null;
		if (this.__append_to_el) {
			this.$el.append("<div data-view-id='" + this.cid() + "'></div>");
			this.$el = this.$el.find("[data-view-id='" + this.cid() + "']");
		}
		this.__old_attributes = {};
		for (var key in this.__attributes) {
			var old_value = this.$el.attr(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_attributes[key] = old_value
			else
				this.__old_attributes[key] = null;
			this.$el.attr(key, this.__attributes[key]);
		}
		this.__added_el_classes = [];
		var new_el_classes = BetaJS.Objs.extend(this._el_classes(), this.__el_classes);
		for (var i = 0; i < new_el_classes.length; ++i)
			if (!this.$el.hasClass(new_el_classes[i])) {
				this.$el.addClass(new_el_classes[i]);
				this.__added_el_classes.push(new_el_classes[i]);
			}
		this.__old_el_styles = {};
		var new_el_styles = BetaJS.Objs.extend(this._el_styles(), this.__el_styles);
		for (var key in new_el_styles)  {
			var old_value = this.$el.css(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_el_styles[key] = old_value
			else
				this.__old_el_styles[key] = null;
			this.$el.css(key, new_el_styles[key]);
		}
		this.__bind();
		if (!this.__visible)
			this.$el.css("display", this.__visible ? "" : "none");
		this.__active = true;
		this.__render();
		if (this.__visible)
			this.__bind_hide_on_leave();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.activate();
		});
		if (this.__visible)
			this._after_show();
		if (this.__vertical_center) {
			this.$el.css("top", "50%");
			this.$el.css("margin-top", Math.round(-this.$el.height() / 2) + "px");
		}
		if (this.__horizontal_center) {
			this.$el.css("left", "50%");
			this.$el.css("margin-left", Math.round(-this.$el.width() / 2) + "px");
		}
		this._notify("activate");
		return this;
	},
	
	/** Deactivates view and all added sub views
	 * 
	 */
	deactivate: function () {
		if (!this.isActive())
			return false;
		this._notify("deactivate");
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.deactivate();
		});
		this.__active = false;
		if (this.__visible)
			this.__unbind_hide_on_leave();
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
		this.__unbind();
		this.$el.html("");
		for (var key in this.__old_attributes) 
			this.$el.attr(key, this.__old_attributes[key]);
		for (var i = 0; i < this.__added_el_classes.length; ++i)
			this.$el.removeClass(this.__added_el_classes[i]);
		for (var key in this.__old_el_styles) 
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
			elem = this.$el
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
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.destroy();
		});
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
				this.__bind_hide_on_leave();
				this._after_show();
			}
			else
				this.__unbind_hide_on_leave()
		}
		if (this.__parent)
			this.__parent.updateChildVisibility(this);	
	},
	
	updateChildVisibility: function (child) {		
	},
	
	_after_show: function () {	
		if (this.__invalidate_on_show)
			this.invalidate();	
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
		        	self.$el.on(event, method)
		        else
		        	self.$el.on(event, selector, method);
			});
		});
	},
	
	__unbind: function () {
		this.$el.off('.events' + this.cid());
	},
	
	__render: function () {
		if (!this.isActive())
			return;
		this._render();
		var q = this.$el.children();
		if (!BetaJS.Types.is_empty(this.__children_styles))
			for (var key in this.__children_styles)
				q.css(key, this.__children_styles[key]);
		BetaJS.Objs.iter(this.__children_classes, function (cls) {
			q.addClass(cls);	
		});
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
	},
	
	__bind_hide_on_leave: function () {
		if (!this.__hide_on_leave || this.__hide_on_leave_func)
			return;
		var el = this.$el.get(0);
		var self = this;
		this.__hide_on_leave_func = function (e) {
			if (self.__hide_on_leave_skip) {
				self.__hide_on_leave_skip = false;
				return;
			}
			if (document.contains(e.target) && e.target !== el && !$.contains(el, e.target))
				self.hide();
		};
		this.__hide_on_leave_skip = true;
		BetaJS.$(document.body).on("click", this.__hide_on_leave_func);
	},
	
	__unbind_hide_on_leave: function () {
		if (!this.__hide_on_leave || !this.__hide_on_leave_func)
			return;
		$(document.body).unbind("click", this.__hide_on_leave_func);
		delete this.__hide_on_leave_func;
	}

}]);

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
	BetaJS.Ids.ClientIdMixin,
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
			element.$el.html(value)
		else if (element.type == "value") {
			if (element.$el.val() != value)
				element.$el.val(value);
		} else if (element.type == "attribute")
			element.$el.attr(element.attribute, value)
		else if (element.type == "css") {
			if (!element.positive)
				value = !value;
			if (value)
				element.$el.addClass(this.__parent.view().css(element.css))
			else
				element.$el.removeClass(this.__parent.view().css(element.css));
		};
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

/** @class */
BetaJS.Class.extend("BetaJS.Routers.Router", [
	BetaJS.Events.EventsMixin,
	/** @lends BetaJS.Routers.Router.prototype */
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
		this._inherited(BetaJS.Routers.Router, "constructor");
		var routes = BetaJS.Types.is_function(this.routes) ? this.routes() : this.routes;
		if (!BetaJS.Types.is_array(routes))
			routes = [routes];
		if ("routes" in options) {
			if (BetaJS.Types.is_array(options["routes"]))
				routes = routes.concat(options["routes"])
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
					obj.applicable = []
				else if (!BetaJS.Types.is_array(obj.applicable))
					obj.applicable = [obj.applicable];
				if (!("valid" in obj))
					obj.valid = []
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
		this._inherited(BetaJS.Routers.Router, "destroy");
	},
	
	/** Parse a given route and map it to the first applicable object that is valid
	 * @param route the route given as a strings
	 * @return either null if nothing applicable and valid could be matched or an associative array with params and routing object as attributes.
	 */
	parse: function (route) {
		for (var i = 0; i < this.__routes.length; ++i) {
			var obj = this.__routes[i];
			var result = obj.route.exec(route);
			if (result != null) {
				result.shift(1);
				var applicable = true;
				BetaJS.Objs.iter(obj.applicable, function (s) {
					var f = BetaJS.Types.is_string(s) ? this[s] : s;
					applicable = applicable && f.apply(this, result)
				}, this);
				if (!applicable)
					continue;
				var valid = true
				BetaJS.Objs.iter(obj.valid, function (s) {
					var f = BetaJS.Types.is_string(s) ? this[s] : s;
					valid = valid && f.apply(this, result)
				}, this);
				if (!valid)
					return null;
				return {
					object: obj,
					params: result
				}
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
		while (arg = args.shift())
			key = key.replace(regex, arg);
		return key;
	},
	
	/** Navigate to a given route, invoking the matching action.
 	 * @param route the route
	 */
	navigate: function (route) {
		this.trigger("navigate", route);
		var result = this.parse(route);
		if (result == null) {
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
		var result = this._invoke(object, params);
		this.trigger("after_invoke", object, params, route);
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
		if (this.__current != null) {
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


BetaJS.Class.extend("BetaJS.Routers.RouterHistory", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (router) {
		this._inherited(BetaJS.Routers.RouterHistory, "constructor");
		this.__router = router;
		this.__history = [];
		router.on("after_invoke", this.__after_invoke, this);
	},
	
	destroy: function () {
		this.__router.off(null, null, this);
		this._inherited(BetaJS.Routers.RouterHistory, "destroy");
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
			return;
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


BetaJS.Class.extend("BetaJS.Routers.RouteBinder", {

	constructor: function (router) {
		this._inherited(BetaJS.Routers.RouteBinder, "constructor");
		this.__router = router;
		this.__router.on("after_invoke", function (object, params, route) {
			if (this._getExternalRoute() != route)
				this._setExternalRoute(route);
		}, this);
	},
	
	destroy: function () {
		this.__router.off(null, null, this);
		this._inherited(BetaJS.Routers.RouteBinder, "destroy");
	},
	
	_setRoute: function (route) {
		var current = this.__router.current();
		if (current && current.route == route)
			return;
		this.__router.navigate(route);
	},
	
	_getExternalRoute: function () { return "" },
	_setExternalRoute: function (route) { }
	
});


BetaJS.Routers.RouteBinder.extend("BetaJS.Routers.HashRouteBinder", [
	BetaJS.Ids.ClientIdMixin,
	{
	
	constructor: function (router) {
		this._inherited(BetaJS.Routers.HashRouteBinder, "constructor", router);
		var self = this;
		BetaJS.$(window).on("hashchange.events" + this.cid(), function () {
			self._setRoute(self._getExternalRoute());
		});
	},
	
	destroy: function () {
		BetaJS.$(window).off("hashchange.events" + this.cid());
		this._inherited(BetaJS.Routers.HashRouteBinder, "destroy");
	},
	
	_getExternalRoute: function () {
		var hash = window.location.hash;
		return (hash.length && hash[0] == '#') ? hash.slice(1) : hash;
	},
	
	_setExternalRoute: function (route) {
		window.location.hash = "#" + route;
	}

}]);

BetaJS.Templates.Cached = BetaJS.Templates.Cached || {};
BetaJS.Templates.Cached['holygrail-view-template'] = '  <div data-selector="right" class=\'holygrail-view-right-container\'></div>  <div data-selector="left" class=\'holygrail-view-left-container\'></div>  <div data-selector="center" class=\'holygrail-view-center-container\'></div> ';

BetaJS.Templates.Cached['list-container-view-item-template'] = '  <div data-view-id="{%= cid %}"></div> ';

BetaJS.Templates.Cached['switch-container-view-item-template'] = '  <div data-view-id="{%= cid %}" class="switch-container" data-selector="switch-container-item"></div> ';

BetaJS.Templates.Cached['button-view-template'] = '   <{%= button_container_element %} data-selector="button-inner"    {%= bind.inner("label") %}>   </{%= button_container_element %}>  ';

BetaJS.Templates.Cached['check-box-view-template'] = '  <input type="checkbox" {%= checked ? "checked" : "" %} />  {%= label %} ';

BetaJS.Templates.Cached['input-view-template'] = '  <input class="input-view" {%= bind.value("value") %} {%= bind.attr("placeholder", "placeholder") %} /> ';

BetaJS.Templates.Cached['label-view-template'] = '  <{%= element %} class="{%= supp.css(\'label\') %}" {%= bind.inner("label") %}></{%= element %}> ';

BetaJS.Templates.Cached['link-view-template'] = '  <a href="javascript:{}" {%= bind.inner("label") %}></a> ';

BetaJS.Templates.Cached['text-area-template'] = '   <textarea {%= bind.value("value") %} {%= bind.attr("placeholder", "placeholder") %}             {%= bind.css_if_not("text-area-no-resize", "resizable") %}             {%= readonly ? \'readonly\' : \'\' %}             style="resize: {%= horizontal_resize ? (vertical_resize ? \'both\' : \'horizontal\') : (vertical_resize ? \'vertical\' : \'none\') %}"             {%= bind.css_if("text-area-horizontal-fill", "horizontal_fill") %}></textarea>  ';

BetaJS.Templates.Cached['progress-template'] = '  <div class="{%= supp.css(\'outer\') %}">   <div data-selector="inner" class="{%= supp.css(\'inner\') %}" style="{%= horizontal ? \'width\': \'height\' %}:{%= value*100 %}%">    {%= label %}   </div>  </div> ';

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
	},
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
	},
	
	isHorizontal: function () {
		return this.__alignment == "horizontal";
	},
	
	_render: function () {
		this.$el.html("");
		BetaJS.Objs.iter(this.children(), function (child) {
			this.__addChildContainer(child);
		}, this);
	},
	
	__addChildContainer: function (child) {
		var options = this.childOptions(child);
		if (this.isActive())
			this.$el.append(this.evaluateTemplate("item", {cid: child.cid()}));
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
					pos += parseInt(child.$el.css(size_string));
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
	},
	
	_after_show: function () {
		this._inherited(BetaJS.Views.ListContainerView, "_after_show");
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
	},
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
BetaJS.Views.View.extend("BetaJS.Views.ButtonView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["button-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.ButtonView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "button_container_element", "button");
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click [data-selector='button-inner']": "__clickButton"
		}]);
	},
	__clickButton: function () {
		this.trigger("click");
	},
});
BetaJS.Views.View.extend("BetaJS.Views.InputView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["input-view-template"]
	},
	_events: function () {
		return [{
			"keyup input": "__keyupEvent",
			"blur input": "__leaveEvent",
		}, {
			"keyup input": "__changeEvent",
			"change input": "__changeEvent",
			"input input": "__changeEvent",
			"paste input": "__changeEvent",
		}];
	},
	constructor: function(options) {
		options = options || {};
		this._inherited(BetaJS.Views.InputView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");	
	},
	__keyupEvent: function (e) {
		 var key = e.keyCode || e.which;
         if (key == 13)
         	this.trigger("enter_key", this.get("value"));
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
BetaJS.Views.SwitchContainerView.extend("BetaJS.Views.InputLabelView", {

	constructor: function(options) {
		this._inherited(BetaJS.Views.InputLabelView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
		this._setOption(options, "edit_on_click", true);
		this._setOption(options, "label_mode", true);
		this.label = this.addChild(new BetaJS.Views.LabelView({
			label: this.binding("value"),
			el_classes: options["label_el_classes"],
			children_classes: options["label_children_classes"],
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
		if (this.is_edit_mode())
			return;
		this.__label_mode = false;
		this.select(this.input);
		this.input.focus(true);
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
	}
});
BetaJS.Views.View.extend("BetaJS.Views.ProgressView", {
	_templates: {
		"default": BetaJS.Templates.Cached["progress-template"]
	},
	
	_css: {
		outer: "",
		inner: ""
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
	},
	
});

BetaJS.Views.View.extend("BetaJS.Views.CustomListView", {
	
	_templates: function () {
		return {
			"default": BetaJS.Templates.Cached["list-view-template"],
			"item-container": BetaJS.Templates.Cached["list-view-item-container-template"],
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
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.CustomListView, "constructor", options);
		this._setOption(options, "list_container_element", "ul");
		this._setOption(options, "list_container_attrs", {});
		this._setOption(options, "list_container_classes", "");
		this._setOption(options, "item_container_element", "li");
		this._setOption(options, "item_container_classes", "");
		this.__itemData = {};
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
			this.__addItem(item, true);
		}, this);
		this.__collection.on("remove", function (item) {
			this.__removeItem(item);
		}, this);
		this.__collection.on("change", function (item) {
			this.__changeItem(item);
		}, this);
		this.__collection.on("index", function (item, index) {
			this.__updateItemIndex(item, index);
		}, this);
		this.__collection.on("reindexed", function (item) {
			this.__reIndexItem(item);
		}, this);
		this.__collection.on("sorted", function () {
			this.__sorted();
		}, this);
	},
	
	destroy: function () {
		for (var key in this.__itemData)
			this._destroyItemData(this.__itemData[key]);
		this.__itemData = null;
		this.__collection.off(null, null, this);
		if (this.__destroy_collection)
			this.__collection.destroy();
		this._inherited(BetaJS.Views.CustomListView, "destroy");
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
		var self = this;
		this.__collection.iterate(function (item) {
			self.__addItem(item, false);
		});
	},
	
	_renderListContainer: function () {
		this.$el.html(this.evaluateTemplate("default", {
			list_container_element: this.__list_container_element,
			list_container_attrs: this.__list_container_attrs,
			list_container_classes: this.__list_container_classes
		}));
		return this.$data({"selector": "list"});
	},

	_findItemElement: function (item) {
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

	__changeItem: function (item) {
		if (!this.isActive())
			return;
		this._changeItem(item);
	},
	
	_newItemData: function (item) {
		return {};
	},
	
	_destroyItemData: function (data) {
	},
	
	itemData: function (item) {
		return this.__itemData[BetaJS.Ids.objectId(item)];
	},

	_changeItem: function (item) {},

	__addItem: function (item, is_new_item) {
		if (!this.isActive())
			return;
		var container = this.evaluateTemplate("item-container", {
			item: item,
			item_container_element: this.__item_container_element, 
			item_container_attrs: this.__item_container_attrs,
			item_container_classes: this.__item_container_classes			
		});
		var index = this.__collection.getIndex(item);
		if (index == 0)
			this.$selector_list.prepend(container)
		else {
			var before = this._findIndexElement(index - 1);
			if (before.length > 0) 
				before.after(container)
			else {
				var after = this._findIndexElement(index + 1);
				if (after.length > 0)
					after.before(container)
				else
					this.$selector_list.append(container);
			}
		}
		var element = this._findItemElement(item);
		if (this.__itemData[BetaJS.Ids.objectId(item)])
			this._destroyItemData(this.__itemData[BetaJS.Ids.objectId(item)]);
		this.__itemData[BetaJS.Ids.objectId(item)] = this._newItemData(item);
		this._addItem(item, element, is_new_item);
		this._addElement(element, is_new_item);
	},
	
	_addElement: function (element, is_new_item) {},
	
	_addItem: function (item, element, is_new_item) {},
	
	__removeItem: function (item) {
		if (!this.isActive())
			return;
		var element = this._findItemElement(item);
		this._removeItem(item, element);
		this._destroyItemData(this.__itemData[BetaJS.Ids.objectId(item)]);
		delete this.__itemData[BetaJS.Ids.objectId(item)];
		this._removeElement(element);
	},
	
	_removeElement: function (element) {
		element.remove();
	},
	
	_removeItem: function (item, element) {},

	__updateItemIndex: function (item, index) {
		var element = this._findItemElement(item);
		element.attr("data-index", index);
		this._updateItemIndex(item, element);
	},

	__reIndexItem: function (item) {
		var element = this._findItemElement(item);
		var index = this.collection().getIndex(item);
		if (index == 0)
			this.$selector_list.prepend(element)
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
	
});



BetaJS.Views.CustomListView.extend("BetaJS.Views.ListView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ListView, "constructor", options);
		this._setOption(options, "item_label", "label");
		this._setOption(options, "render_item_on_change", this.dynamics("item") == null);
	},
	
	_changeItem: function (item) {
		if (this.__render_item_on_change) {
			var element = this._findItemElement(item);
			this._renderItem(item, element, false);
		}
	},
	
	_addItem: function (item, element, is_new_item) {
		this._renderItem(item, element, is_new_item);
	},
	
	_renderItem: function (item, element, is_new_item) {
		if (this.templates("item") != null)
			element.html(this.evaluateTemplate("item", {item: item}))
		else if (this.dynamics("item") != null)
			this.evaluateDynamics("item", element, {item: item}, {name: "item-" + BetaJS.Ids.objectId(item)})
		else
			element.html(item.get(this.__item_label)); 
	},
	
	_removeItem: function (item, element) {
		if (this.dynamics("item") != null)
			this.dynamics("item").removeInstanceByName("item-" + BetaJS.Ids.objectId(item));
	},
	
});


BetaJS.Views.CustomListView.extend("BetaJS.Views.SubViewListView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.SubViewListView, "constructor", options);
		if ("create_view" in options)
			this._create_view = options["create_view"];
		this._setOption(options, "sub_view", BetaJS.Views.LabelView);
		this._setOption(options, "item_label", "label");
		var self = this;
		this._setOption(options, "sub_view_options", function (item) {
			return {
				label: item.binding(self.__item_label)
			};
		});
	},
	
	_create_view: function (item, element) {
		var options = this.__sub_view_options(item);
		options.el = element;
		return new this.__sub_view(options);
	},
	
	_addItem: function (item, element, is_new_item) {
		var view = this._create_view(item, element); 
		this.itemData(item).view = view;
		this.addChild(view);
	},
	
	_destroyItemData: function (data) {
		this.removeChild(data.view);
		data.view.destroy();
	},
	
});
BetaJS.Views.View.extend("BetaJS.Views.ItemListItemView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ItemListItemView, "constructor", options);
		this._setOptionProperty(options, "item", null);
		this._setOptionProperty(options, "_selected", false);
	},
	
	_events: function () {
		return [{
			"click": "__click"
		}];
	},
	
	isSelected: function () {
		return this.get("_selected");
	},
	
	__click: function () {
		if (this.getParent().__click_select)
			this.select();
	},
	
	select: function () {
		this.getParent().select(this.get("item"));
	},
	
	unselect: function () {
		this.getParent().unselect(this.get("item"));
	}

});

BetaJS.Views.CustomListView.extend("BetaJS.Views.ItemListView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ItemListView, "constructor", options);
		this._setOption(options, "sub_view", BetaJS.Views.ItemListItemView);
		if (!this._sub_view_options)
			this._sub_view_options = {};
		if (this._sub_view_options) {
			if (!BetaJS.Types.is_function(this._sub_view_options)) {
				var svo = this._sub_view_options;
				this._sub_view_options = function (item) {
					return svo;
				};
			}
		};
		if (options.sub_view_options) {
			if (!BetaJS.Types.is_function(options.sub_view_options)) {
				var svo = options.sub_view_options;
				options.sub_view_options = function (item) {
					return svo;
				};
			}
			this.__sub_view_options = options.sub_view_options;
			var self = this;
			if (this._sub_view_options)
				this.__sub_view_options = function (item) {
					return BetaJS.Objs.extend(self._sub_view_options(item), options.sub_view_options(item));
				};
		}
		else
			this.__sub_view_options = this._sub_view_options;
		this._setOption(options, "selectable", true);
		this._setOption(options, "multi_select", false);
		this._setOption(options, "click_select", true);
	},
	
	_addItem: function (item, element, is_new_item) {
		var view = new this.__sub_view(BetaJS.Objs.extend({
			el: element,
			item: item
		}, this.__sub_view_options(item)));
		this.itemData(item).view = view;
		this.addChild(view);
	},
	
	_destroyItemData: function (data) {
		this.removeChild(data.view);
		data.view.destroy();
	},
	
	isSelected: function (item) {
		return this.itemData(item).view.get("_selected");
	},
	
	select: function (item) {
		if (!this.itemData(item))
			return;
		var self = this;
		if (this.__selectable && !this.isSelected(item)) {
			if (!this.__multi_select)
				this.collection().iterate(function (object) {
					self.unselect(object);
				});
			this.itemData(item).view.set("_selected", true);
			this.trigger("select", item);
		}
		return this.itemData(item).view;
	},
	
	unselect: function (item) {
		if (this.__selectable && this.isSelected(item)) {
			this.itemData(item).view.set("_selected", false);
			this.trigger("unselect", item);
		}
		return this.itemData(item).view;
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
		options.hide_on_leave = "hide_on_leave" in options ? options.hide_on_leave : true;
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
			top -= height
		else if (this.__overlay_align_vertical == "center")
			top -= Math.round(height/2);

		if (this.__overlay_align_horizontal == "right")
			left -= width
		else if (this.__overlay_align_horizontal == "center")
			left -= Math.round(width/2);
			
		var element = this.$el;
		if (this.__anchor == "element" && this.__element) {
			element = this.__element;
			if (BetaJS.Types.is_string(element))
				element = BetaJS.$(element)
			else if (BetaJS.Class.is_class_instance(element))
				element = element.$el;
		}
		if (this.__anchor == "relative" || this.__anchor == "element") {
			element_width = element.outerWidth();
			element_height = element.outerHeight();
			left += element.offset().left - $(window).scrollLeft();
			top += element.offset().top - $(window).scrollTop();
			if (this.__element_align_vertical == "bottom")
				top += element_height
			else if (this.__element_align_vertical == "center")
				top += Math.round(element_height/2);
			if (this.__element_align_horizontal == "right")
				left += element_width
			else if (this.__element_align_horizontal == "center")
				left += Math.round(element_width/2);
		}
		overlay.css("left", left + "px");
		overlay.css("top", top + "px");
	},

});
BetaJS.Views.View.extend("BetaJS.Views.FullscreenOverlayView", {
	
	_templates: {
		"default": BetaJS.Templates.Cached["fullscreen-overlay-view-template"]
	},
	
	_events: function () {
		return [{
			'click [data-selector="outer"]': function () {
				if (this.__destroy_on_unfocus)
					this.destroy()
				else if (this.__hide_on_unfocus)
					this.hide();
			}
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
	},

});