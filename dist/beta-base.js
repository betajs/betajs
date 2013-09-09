/*!
  betajs - v0.0.1 - 2013-09-09
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
	
	generate_token: function (length) {
		length = length || 16;
		var s = "";
		while (s.length < length)
			s += Math.random().toString(36).substr(2); 
		return s.substr(0, length);
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
	
	encodeUriParams: function (arr, prefix) {
		prefix = prefix || "";
		var res = [];
		BetaJS.Objs.iter(arr, function (value, key) {
			if (BetaJS.Types.is_object(value))
				res = res.concat(this.encodeUriParams(value, prefix + key + "_"))
			else
				res.push(prefix + key + "=" + encodeURI(value));
		}, this);
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