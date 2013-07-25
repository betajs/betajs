/*!
  betajs - v0.0.1 - 2013-07-25
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*!
  betajs - v0.0.1 - 2013-07-25
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*!
  betajs - v0.0.1 - 2013-07-25
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
	
	resolve: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var object = base || window || global;
		var a = s.split(".");
		for (var i = 0; i < a.length; ++i)
			object = object[a[i]];
		return object;
	}
	
};

BetaJS.Objs = {
	
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
					return;
			}
		else
			for (var key in obj) {
				var result = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
				if (BetaJS.Types.is_defined(result) && !result)
					return;
			}
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
	
	// Setup Prototype
	result.__notifications = {};
	if (parent.__notifications)
		BetaJS.Objs.extend(result.__notifications, parent.__notifications);
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


BetaJS.Classes = {};

BetaJS.Classes.AutoDestroyMixin = {
	
	enter: function () {
		if (!this.__enter_count)
			this.__enter_count = 0;
		this.__enter_count++;
	},
	
	leave: function () {
		if (!this.__enter_count)
			this.__enter_count = 0;
		this.__enter_count--;
		if (this.__enter_count < 1)
			this.destroy();
	}
		
};

BetaJS.Exceptions = {
	
	ensure: function (e) {
		if (e != null && BetaJS.Types.is_object(e) && ("instance_of" in e) && (e.instance_of(BetaJS.Exceptions.Exception)))
			return e;
		return new BetaJS.Exceptions.NativeException(e);
	}
	
};


BetaJS.Exceptions.Exception = BetaJS.Class.extend("Exception", {
	
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


BetaJS.Exceptions.NativeException = BetaJS.Exceptions.Exception.extend("NativeException", {
	
	constructor: function (object) {
		this._inherited(BetaJS.Exceptions.NativeException, "constructor", object.toString());
		this.__object = object;
	},
	
	object: function () {
		return this.__object;
	}
	
});

BetaJS.Lists = {};

BetaJS.Lists.AbstractList = BetaJS.Class.extend("AbstractList", {
	
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

BetaJS.Lists.LinkedList = BetaJS.Lists.AbstractList.extend("LinkedList", {
	
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

BetaJS.Lists.ObjectIdList = BetaJS.Lists.AbstractList.extend("ObjectIdList",  {
	
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



BetaJS.Lists.ArrayList = BetaJS.Lists.AbstractList.extend("ArrayList", {
	
	constructor: function (objects, options) {
		this.__idToIndex = {};
		this.__items = [];
		options = options || {};
		if ("compare" in options)
			this._compare = options["compare"];
		this._inherited(BetaJS.Lists.ArrayList, "constructor", objects);
	},
	
	set_sompare: function (compare) {
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

BetaJS.Iterators.Iterator = BetaJS.Class.extend("Iterator", {
	
	asArray: function () {
		var arr = [];
		while (this.hasNext())
			arr.push(this.next());
		return arr;
	}
	
});

BetaJS.Iterators.ArrayIterator = BetaJS.Iterators.Iterator.extend("ArrayIterator", {
	
	constructor: function (arr) {
		this._inherited(BetaJS.Iterators.ArrayIterator, "constructor");
		this.__arr = arr;
		this.__i = 0;
	},
	
	hasNext: function () {
		return this.__i < this.__arr.length;
	},
	
	next: function () {
		return this.__arr[this.__i++];
	}
	
});

BetaJS.Iterators.MappedIterator = BetaJS.Iterators.Iterator.extend("MappedIterator", {
	
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

BetaJS.Iterators.FilteredIterator = BetaJS.Iterators.Iterator.extend("FilteredIterator", {
	
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
			this.__next = this.__iterator.next();
			if (this.__filter_func(this.__next))
				return;
			this.__next == null;
		}
	},
	
	__filter_func: function (item) {
		return this.__filter.apply(this.__context, item);
	}

});


BetaJS.Iterators.SkipIterator = BetaJS.Iterators.Iterator.extend("SkipIterator", {
	
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


BetaJS.Iterators.LimitIterator = BetaJS.Iterators.Iterator.extend("LimitIterator", {
	
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


BetaJS.Iterators.SortedIterator = BetaJS.Iterators.Iterator.extend("SortedIterator", {
	
	constructor: function (iterator, compare) {
		this._inherited(BetaJS.Iterators.SortedIterator, "constructor");
		this.__arr = iterator.asArray();
		this.__arr.sort(compare);
		this.__i = 0;
	},
	
	hasNext: function () {
		return this.__i < this.__arr.length;
	},
	
	next: function () {
		return this.__arr[this.__i++];
	}
	
});

BetaJS.Events = {};

BetaJS.Events.EVENT_SPLITTER = /\s+/;

BetaJS.Events.EventsMixin = {
	
	on: function(events, callback, context) {
		this.__events_mixin_events = this.__events_mixin_events || {};
		events = events.split(BetaJS.Events.EVENT_SPLITTER);
		var event;
		while (event = events.shift()) {
			this.__events_mixin_events[event] = this.__events_mixin_events[event] || new BetaJS.Lists.LinkedList();
			this.__events_mixin_events[event].add({
				callback: callback,
				context: context
			});
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
						return (!callback || object.callback == callback) && (!context || object.context == context);
					});
					if (this.__events_mixin_events[event].count() == 0) {
						this.__events_mixin_events[event].destroy();
						delete this.__events_mixin_events[event];
					}
				}
		} else {
			for (event in this.__events_mixin_events) {
				this.__events_mixin_events[event].remove_by_filter(function (object) {
					return (!callback || object.callback == callback) && (!context || object.context == context);
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
    		if (this.__events_mixin_events[event])
    			this.__events_mixin_events[event].iterate(function (object) {
    				object.callback.apply(object.context || self, rest);
    			});
    		if (this.__events_mixin_events["all"])
    			this.__events_mixin_events["all"].iterate(function (object) {
    				object.callback.apply(object.context || self, rest);
    			});
    	};
    	return this;
    },
    
    once: function (events, callback, context) {
        var self = this;
        var once = BetaJS.Functions.once(function() {
          self.off(events, once);
          callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    }    
	
};

BetaJS.Events.Events = BetaJS.Class.extend("Events", BetaJS.Events.EventsMixin);



BetaJS.Events.ListenMixin = {
		
	_notifications: {
		"destroy": "listenOff" 
	},
		
	listenOn: function (target, events, callback) {
		if (!this.__listen_mixin_listen) this.__listen_mixin_listen = {};
		this.__listen_mixin_listen[BetaJS.Ids.objectId(target)] = target;
		target.on(events, callback, this);
	},
	
	listenOnce: function (target, events, callback) {
		if (!this.__listen_mixin_listen) this.__listen_mixin_listen = {};
		this.__listen_mixin_listen[BetaJS.Ids.objectId(target)] = target;
		target.once(events, callback, this);
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

BetaJS.Events.Listen = BetaJS.Class.extend("Listen", BetaJS.Events.ListenMixin);

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
	
	_afterSet: function (key, value) {
	},
	
	has: function (key) {
		return key in this.__properties;
	},
	
	setAll: function (obj) {
		for (var key in obj)
			this.set(key, obj[key]);
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
					self.off("change:" + dep, null, this.__properties[key]);
				});
			}
			delete this.__properties[key];
		};
	},
	
	set: function (key, value) {
		if (this.get(key) != value) {
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
					self.__properties[key].value = value.bindee.get(value.property);
					self.trigger("change");
					self.trigger("change:" + key);
				}, this.__properties[key]);
				this._afterSet(key, this.__properties[key].value);
				this.trigger("change");
				this.trigger("change:" + key);
			} else if (this._isComputed(value)) {
				this.unset(key);
				this.__properties[key] = {
					type: BetaJS.Properties.TYPE_COMPUTED,
					func: value.func,
					dependencies: value.dependencies,
					value: value.func.apply(self)
				};
				BetaJS.Objs.iter(value.dependencies, function (dep) {
					self.on("change:" + dep, function () {
						self.__properties[key].value = value.func.apply(self);
						self.trigger("change");
						self.trigger("change:" + key);
					}, this.__properties[key]);
				}, this);
				this._afterSet(key, this.__properties[key].value);
				this.trigger("change");
				this.trigger("change:" + key);
			} else if (this._canSet(key, value)) {
				if (this.__properties[key] && this.__properties[key].type == BetaJS.Properties.TYPE_BINDING) {
					this.__properties[key].bindee.set(this.__properties[key].property, value);
				} else {
					this.unset(key);
					this.__properties[key] = {
						type: BetaJS.Properties.TYPE_VALUE,
						value: value
					};
					this._afterSet(key, value);
					this.trigger("change");
					this.trigger("change:" + key);
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

BetaJS.Properties.Properties = BetaJS.Class.extend("Properties", [
	BetaJS.Events.EventsMixin,
	BetaJS.Properties.PropertiesMixin, {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Properties.Properties, "constructor");
		if (obj)
			this.setAll(obj);
	}
	
}]);

BetaJS.Collections = {};


BetaJS.Collections.Collection = BetaJS.Class.extend("Collection", [
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
		return this.__data.remove(object);
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



BetaJS.Collections.FilteredCollection = BetaJS.Collections.Collection.extend("FilteredCollection", {
	
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
				if (l < r)
					return object[key]
				else if (l > r)
					return -object[key];
			}
			return 0;
		};
	}
	
};

BetaJS.Tokens = {
	
	generate_token: function () {
		return Math.random().toString(36).substr(2); 
	}
	
}
/*!
  betajs - v0.0.1 - 2013-07-25
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Net = {};


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
BetaJS.Net.AbstractAjax = BetaJS.Class.extend("AbstractAjax", {
	
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


BetaJS.Net.AjaxException = BetaJS.Exceptions.Exception.extend("AjaxException", {
	
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


BetaJS.Net.JQueryAjax = BetaJS.Net.AbstractAjax.extend("JQueryAjax", {
	
	_syncCall: function (options) {
		var result;
		BetaJS.$.ajax({
			type: options.method,
			async: false,
			url: options.uri,
			data: JSON.stringify(options.data),
			success: function (response) {
				result = response;
			},
			error: function (jqXHR, textStatus, errorThrown) {
				throw new BetaJS.Net.AjaxException(errorThrown, textStatus, jqXHR);
			}
		});
		return result;
	},
	
	_asyncCall: function (options) {
		BetaJS.$.ajax({
			type: options.method,
			async: true,
			url: options.uri,
			data: JSON.stringify(options.data),
			success: function (response) {
				options.success(response);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				options.failure(errorThrown, textStatus, jqXHR);
			}
		});
	},

});

BetaJS.Queries = {

	/*
	 * Syntax:
	 *
	 * query :== Object | ["Or", query, query, ...] | ["And", query, query, ...] |
	 *           [("=="|"!="|>"|">="|"<"|"<="), key, value]
	 *
	 */

	__dependencies : function(query, dep) {
		if (BetaJS.Types.is_array(query)) {
			if (query.length == 0)
				throw "Malformed Query";
			var op = query[0];
			if (op == "Or" || op == "And") {
				for (var i = 1; i < query.length; ++i)
					dep = this.__dependencies(query[i], dep);
				return dep;
			} else {
				if (query.length != 3)
					throw "Malformed Query";
				var key = query[1];
				if ( key in dep)
					dep[key]++
				else
					dep[key] = 1;
				return dep;
			}
		} else if (BetaJS.Types.is_object(query)) {
			for (key in query)
			if ( key in dep)
				dep[key]++
			else
				dep[key] = 1;
			return dep;
		} else
			throw "Malformed Query";
	},

	dependencies : function(query) {
		return this.__dependencies(query, {});
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
		if (object == null)
			return false;
		if (BetaJS.Types.is_array(query)) {
			if (query.length == 0)
				throw "Malformed Query";
			var op = query[0];
			if (op == "Or") {
				for (var i = 1; i < query.length; ++i)
					if (this.evaluate(query[i], object))
						return true;
				return false;
			} else if (op == "And") {
				for (var i = 1; i < query.length; ++i)
					if (!this.evaluate(query[i], object))
						return false;
				return true;
			} else {
				if (query.length != 3)
					throw "Malformed Query";
				var key = query[1];
				var obj_value = object[key];
				var value = query[2];
				if (op == "==")
					return obj_value == value
				else if (op == "!=")
					return obj_value != value
				else if (op == ">")
					return obj_value > value
				else if (op == ">=")
					return obj_value >= value
				else if (op == "<")
					return obj_value < value
				else if (op == "<=")
					return obj_value <= value
				else
					throw "Malformed Query";
			}
		} else if (BetaJS.Types.is_object(query)) {
			for (key in query)
				if (query[key] != object[key])
					return false;
			return true;
		} else
			throw "Malformed Query";
	},

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
BetaJS.Queries.CompiledQuery = BetaJS.Class.extend("CompiledQuery", {
	
	constructor: function (query) {
		this.__query = query;
		this.__dependencies = BetaJS.Query.dependencies(query);
		this.__compiled = BetaJS.Query.compile(query);
	},
	
	query: function () {
		return this.__query;
	},
	
	dependencies: function () {
		return this.__dependencies;
	},
	
	compiled: function () {
		return this.__compiled;
	},
	
	evaluate: function (object) {
		return this.__compiled(object);
	},
	
	format: function () {
		return BetaJS.Query.format(this.__query);
	}
	
});

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
	
	emulate: function (constrained_query, query_capabilities, query_function, query_context) {
		var query = constrained_query.query;
		var options = constrained_query.options;
		var execute_query = {};
		var execute_options = {};
		if ("sort" in options && "sort" in query_capabilities)
			execute_options.sort = options.sort;
		if ("query" in query_capabilities || BetaJS.Types.is_empty(query)) {
			execute_query = query;
			if (!("sort" in options) || "sort" in query_capabilities) {
				if ("skip" in options && "skip" in query_capabilities)
					execute_options.skip = options.skip;
				if ("limit" in options && "limit" in query_capabilities)
					execute_options.limit = options.limit;
			}
		}
		var raw = query_function.apply(query_context || this, [execute_query, execute_options]);
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
		return iter;
	}
	
	

}; 

BetaJS.Collections.QueryCollection = BetaJS.Collections.Collection.extend("QueryCollection", {
	
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
BetaJS.Stores = BetaJS.Stores || {};


BetaJS.Stores.StoreException = BetaJS.Exceptions.Exception.extend("StoreException");


/** @class */
BetaJS.Stores.BaseStore = BetaJS.Class.extend("BaseStore", [
	BetaJS.Events.EventsMixin,
	/** @lends BetaJS.Stores.BaseStore.prototype */
	{
		
	constructor: function (options) {
		this._inherited(BetaJS.Stores.BaseStore, "constructor");
		options = options || {};
		this._id_key = options.id_key || "id";
	},
		
	/** Insert data to store. Return inserted data with id.
	 * 
 	 * @param data data to be inserted
 	 * @return data that has been inserted with id.
	 */
	_insert: function (data) {
	},
	
	/** Remove data from store. Return removed data.
	 * 
 	 * @param id data id
 	 * @return data
	 */
	_remove: function (id) {
	},
	
	/** Get data from store by id.
	 * 
	 * @param id data id
	 * @return data
	 */
	_get: function (id) {
	},
	
	/** Update data by id.
	 * 
	 * @param id data id
	 * @param data updated data
	 * @return data from store
	 */
	_update: function (id, data) {
	},
	
	_query_capabilities: function () {
		return {};
	},
	
	_query: function (query, options) {
	},	
	
	insert: function (data) {
		var row = this._insert(data);
		if (row)
			this.trigger("insert", row)
		return row;
	},
	
	remove: function (id) {
		var row = this._remove(id);
		if (row)
			this.trigger("remove", row);
		return row;
	},
	
	get: function (id) {
		return this._get(id);
	},
	
	update: function (id, data) {
		var row = this._update(id, data);
		if (row)
			this.trigger("update", row, data);
		return row;
	},
	
	query: function (query, options) {
		return BetaJS.Queries.Constrained.emulate(
			BetaJS.Queries.Constrained.make(query, options || {}),
			this._query_capabilities(),
			this._query,
			this
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

BetaJS.Stores.DumbStore = BetaJS.Stores.BaseStore.extend("DumbStore", {
	
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
	
	_insert: function (data) {
		var last_id = this._read_last_id();
		var id = 1;
		if (last_id != null) {
			id = last_id + 1;
			this._write_next_id(last_id, id);
			this._write_prev_id(id, last_id);
		} else
			this._write_first_id(id);
		data[this._id_key] = id;
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

BetaJS.Stores.AssocStore = BetaJS.Stores.DumbStore.extend("AssocStore", {
	
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

BetaJS.Stores.LocalStore = BetaJS.Stores.AssocStore.extend("LocalStore", {
	
	constructor: function (prefix) {
		this._inherited(BetaJS.Stores.LocalStore, "constructor");
		this.__prefix = prefix;
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

BetaJS.Stores.MemoryStore = BetaJS.Stores.AssocStore.extend("MemoryStore", {
	
	_read_key: function (key) {
		return this[key];
	},
	
	_write_key: function (key, value) {
		this[key] = value;
	},
	
	_remove_key: function (key) {
		delete this[key];
	}
	
});

BetaJS.Stores.QueryCachedStore = BetaJS.Stores.BaseStore.extend("QueryCachedStore", {

	constructor: function (parent, options) {
		options = options || {};
		options.id_key = parent._id_key;
		this._inherited(BetaJS.Stores.QueryCachedStore, "constructor", options);
		this.__parent = parent;
		this.__cache = {};
		this.__queries = {};
	},
	
	invalidate: function () {
		this.__cache = {};
		this.__queries = {};
	},

	_insert: function (data) {
		var result = this.__parent.insert(data);
		if (result)
			this.__cache[data[this._id_key]] = data;
		return result;
	},
	
	_remove: function (id) {
		var result = this.__parent.remove(id);
		if (result)
			delete this.__cache[id];
		return result;
	},
	
	_update: function (id, data) {
		var result = this.__parent.update(id, data);
		if (result)
			this.__cache[id] = BetaJS.Objs.extend(this.__cache[id], data);
		return result;
	},
	
	_get: function (id) {
		if (!(id in this.__cache))
			this.__cache[id] = this.__parent.get(id);
		return this.__cache[id];
	},
	
	_query_capabilities: function () {
		return this.__parent._query_capabilities();
	},

	_query: function (query, options) {
		var constrained = BetaJS.Queries.Constrained.make(query, options);
		var encoded = BetaJS.Queries.Constrained.format(constrained);
		if (encoded in this.__queries)
			return new BetaJS.Iterators.ArrayIterator(BetaJS.Objs.values(this.__queries[encoded]));
		var result = this.__parent.query(query, options).asArray();
		this.__queries[encoded] = {};
		for (var i = 0; i < result.length; ++i) {
			this.__cache[result[i][this._id_key]] = result[i];
			this.__queries[encoded][result[i][this._id_key]] = result[i];
		}
		return new BetaJS.Iterators.ArrayIterator(result);
	},
	
	cache: function (query, options, result) {
		var constrained = BetaJS.Queries.Constrained.make(query, options);
		var encoded = BetaJS.Queries.Constrained.format(constrained);
		this.__queries[encoded] = {};
		for (var i = 0; i < result.length; ++i) {
			this.__cache[result[i][this._id_key]] = result[i];
			this.__queries[encoded][result[i][this._id_key]] = result[i];
		}
	}
	
});

BetaJS.Stores.FullyCachedStore = BetaJS.Stores.BaseStore.extend("FullyCachedStore", {

	constructor: function (parent, full_data, options) {
		options = options || {};
		options.id_key = parent._id_key;
		this._inherited(BetaJS.Stores.FullyCachedStore, "constructor", options);
		this.__parent = parent;
		this.__cache = {};
		this.__cached = false;
		if (full_data)
			this.invalidate(full_data);
	},
	
	invalidate: function (full_data) {
		this.__cache = {};
		if (!full_data)
			full_data = this.__parent.query({});
		if (BetaJS.Types.is_array(full_data))
			full_data = new BetaJS.Iterators.ArrayIterator(full_data);
		while (full_data.hasNext()) {
			var row = full_data.next();
			this.__cache[row[this._id_key]] = row;
		}
		this.__cached = true;
	},

	_insert: function (data) {
		if (!this.__cached)
			this.invalidate({});
		var result = this.__parent.insert(data);
		if (result)
			this.__cache[data[this._id_key]] = data;
		return result;
	},
	
	_remove: function (id) {
		if (!this.__cached)
			this.invalidate({});
		var result = this.__parent.remove(id);
		if (result)
			delete this.__cache[id];
		return result;
	},
	
	_get: function (id) {
		if (!this.__cached)
			this.invalidate({});
		return this.__cache[id];
	},
	
	_update: function (id, data) {
		if (!this.__cached)
			this.invalidate({});
		var result = this.__parent.update(id, data);
		if (result)
			this.__cache[id] = BetaJS.Objs.extend(this.__cache[id], data);
		return result;
	},
	
	_query: function (query, options) {
		if (!this.__cached)
			this.invalidate({});
		return new BetaJS.Iterators.ArrayIterator(BetaJS.Objs.values(this.__cache));
	},	
	
});

BetaJS.Stores.RemoteStore = BetaJS.Stores.BaseStore.extend("RemoteStore", {

	constructor : function(uri, ajax, options) {
		this._inherited(BetaJS.Stores.RemoteStore, "constructor", options);
		this.__uri = uri;
		this.__ajax = ajax;
		this.__options = BetaJS.Objs.extend({
			"update_method": "PUT"
		}, options || {});
	},
	
	getUri: function () {
		return this.__uri;
	},

	_insert : function(data) {
		try {
			return this.__ajax.syncCall({method: "POST", uri: this.__uri, data: data});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},

	_remove : function(id) {
		try {
			var response = this.__ajax.syncCall({method: "DELETE", uri: this.__uri + "/" + id});
			if (response)
				return response;
			response = {};
			response[this._id_key] = id;
			return response;
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},

	_get : function(id) {
		try {
			return this.__ajax.syncCall({uri: this.__uri + "/" + id});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},

	_update : function(id, data) {
		try {
			return this.__ajax.syncCall({method: this.__options.update_method, uri: this.__uri + "/" + id, data: data});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},
	
	_query : function(query, options) {
		try {			
			return this.__ajax.syncCall(this._encode_query(query, options));
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},
	
	_encode_query: function (query, options) {
		return {
			uri: this.getUri()
		};		
	}
	
});


BetaJS.Stores.QueryGetParamsRemoteStore = BetaJS.Stores.RemoteStore.extend("QueryGetParamsRemoteStore", {

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
BetaJS.Stores.ConversionStore = BetaJS.Stores.BaseStore.extend("ConversionStore", {
	
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

/*!
  betajs - v0.0.1 - 2013-07-25
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Modelling = BetaJS.Modelling || {};

BetaJS.Modelling.Model = BetaJS.Properties.Properties.extend("Model", [
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Classes.AutoDestroyMixin,
	{
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.Model, "constructor");
		var scheme = this.cls.scheme();
		this.__properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
		for (var key in scheme)
			if (scheme[key].def) 
				this.set(key, scheme[key].def)
			else if (scheme[key].auto_create)
				this.set(key, scheme[key].auto_create(this))
			else
				this.set(key, null);
		options = options || {};
		this.__properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
		this.__enter_table_count = 0;
		for (key in attributes)
			this.set(key, attributes[key]);
		this.__saved = "saved" in options ? options["saved"] : false;
		this.__new = "new" in options ? options["new"] : true;
		if (this.__saved)
			this.__properties_changed = {};
		if ("table" in options)
			this.__table = options["table"];
		if (this.__canCallTable())
			this.__table.__modelCreate(this);
		this.assocs = this._initializeAssociations();
		for (var key in this.assocs)
			this.__addAssoc(key, this.assocs[key]);
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
		if (this.__canCallTable() && !this.__table.__modelDestroy(this))
			return false;
		this.trigger("destroy");
		for (var key in this.assocs)
			this.assocs[key].destroy();
		this._inherited(BetaJS.Modelling.Model, "destroy");
	},
	
	__canCallTable: function () {
		return this.__table && this.__enter_table_count >= 0;
	},
	
	__enterTable: function () {
		this.__enter_table_count = this.__enter_table_count + 1;
	},
	
	__leaveTable: function () {
		this.__enter_table_count = this.__enter_table_count - 1;
	},

	__unsetChanged: function (key) {
		delete this.__properties_changed[key];
	},
	
	_afterSet: function (key, value) {
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		this.__properties_changed[key] = true;
		this.__unvalidated[key] = true;
		this.__saved = false;
		delete this.__errors[key];
		if (this.__canCallTable())
			this.__table.__modelSetAttr(this, key, value);
	},
	
	update: function (data) {
		this.setAll(data);
		if (this.__canCallTable())
			this.__table.__modelUpdate(this);
	},
	
	properties_changed: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this.__properties_changed;
		return BetaJS.Objs.filter(this.__properties_changed, function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	validate: function () {
		for (key in this.__unvalidated)
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
		}
		return !(attr in this.__errors);
	},
	
	revalidate: function () {
		this.__errors = {};
		this.__unvalidated = this.keys(true);
		return this.validate();
	},
	
	errors: function () {
		return this.__errors;
	},
	
	save: function () {
		if (this.__saved)
			return true;
		if (this.__canCallTable() && !this.__table.__modelSave(this))
			return false;
		this.trigger("save");
		this.__saved = true;
		var was_new = this.__new;
		this.__new = false;
		if (was_new)
			this._after_create();
		return true;
	},
	
	_after_create: function () {
	},
	
	isSaved: function () {
		return this.__saved;
	},
	
	isNew: function () {
		return this.__new;
	},
	
	remove: function () {
		if (this.__canCallTable() && !this.__table.__modelRemove(this))
			return false;
		this.trigger("remove");
		this.destroy();
		return true;
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
	
	id: function () {
		return this.get(this.cls.primary_key());
	},
	
	hasId: function () {
		return this.has(this.cls.primary_key());
	}
	
}], {

	primary_key: function () {
		return "id";
	},

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
BetaJS.Modelling.Table = BetaJS.Class.extend("Table", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (store, model_type, options) {
		this._inherited(BetaJS.Modelling.Table, "constructor");
		this.__store = store;
		this.__model_type = model_type;
		this.__models_by_id = {};
		this.__models_by_cid = {};
		this.__models_changed = {};
		this.__options = BetaJS.Objs.extend({
			"type_column": null,
			"auto_update": true,
			"auto_update_attr": false,
			"auto_create": false,
			"save_invalid": false,
			"greedy_save": true
		}, options || {});
	},
	
	__enterModel: function (model) {
		this.trigger("enter", model);
		this.__models_by_cid[model.cid()] = model;
		if (model.hasId())
			this.__models_by_id[model.id()] = model;
	},
	
	__leaveModel: function (model) {
		this.trigger("leave", model);
		delete this.__models_by_cid[model.cid()];
		if (model.hasId())
			delete this.__models_by_id[model.id()];
	},
	
	__hasModel: function (model) {
		return model.cid() in this.__models_by_cid;
	},
	
	__modelCreate: function (model) {
		if (this.__hasModel(model))
			return false;
		return this.__enterModel(model) && (!this.__options["auto_create"] || model.save());
	},
	
	__modelDestroy: function (model) {
		if (!this.__hasModel(model))
			return true;
		var result = model.save();
		return this.__leaveModel(model) && result;
	},
	
	__modelRemove: function (model) {
		if (!this.__hasModel(model))
			return false;
		var result = this.__store.remove(model.id());
		if (result)
			this.trigger("remove", model);
		return this.__leaveModel(model) && result;
	},
	
	__modelSetAttr: function (model, key, value) {
		this.__models_changed[model.cid()] = model;
		this.trigger("change", model, key, value);
		this.trigger("change:" + key, model, value);
		return !this.__options["auto_update_attr"] || model.save();
	},
	
	__modelUpdate: function (model) {
		this.trigger("update", model);
		return !this.__options["auto_update"] || model.save();
	},
	
	__modelSave: function (model) {
		if (model.isSaved())
			return true;
		var is_valid = model.validate();
		if (!is_valid && !this.__options["save_invalid"] && !this.__options["greedy_save"])
			return false;
		var attrs = {};
		var new_model = model.isNew();
		if (new_model)
			attrs = model.getAll()
		else if (this.__options["save_invalid"])
			attrs = model.properties_changed()
		else
			attrs = model.properties_changed(true);
		var confirmed = {};
		if (new_model) {
			if (this.__options["type_column"])
				attrs[this.__options["type_column"]] = model.cls.classname;
			confirmed = this.__store.insert(attrs);
			if (!(model.cls.primary_key() in confirmed))
				return false;
			this.__models_by_id[confirmed[model.cls.primary_key()]] = model;
		} else if (!BetaJS.Types.is_empty(attrs)){
			confirmed = this.__store.update(model.id(), attrs);
			if (BetaJS.Types.is_empty(confirmed))
				return false;			
		}
		if (!this.__options["save_invalid"])
			for (var key in model.properties_changed(false))
				delete confirmed[key];
		model.__leaveTable();
		model.setAll(confirmed);
		model.__enterTable();
		for (var key in confirmed)
			model.__unsetChanged(key);
		if (is_valid)
			delete this.__models_changed[model.cid()];
		if (new_model)
			this.trigger("create", model);
		this.trigger("save", model);
		return this.__options["save_invalid"] || is_valid;
	},
	
	save: function () {
		var result = true;
		BetaJS.Objs.iter(this.__models_changed, function (obj, id) {
			result = obj.save() && result;
		});
		return result;
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
		this.__enterModel(model);
		return model;
	},
	
}]);
BetaJS.Modelling.Associations = {};

BetaJS.Modelling.Associations.Association = BetaJS.Class.extend("Assocation", {

	constructor: function (model, foreign_table, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.Association, "constructor");
		this._model = model;
		this._foreign_table = foreign_table;
		this._foreign_key = foreign_key;
		this._options = options || {};
		this.__cache = null;
		if (options["delete_cascade"])
			model.on("remove", function () {
				this.__delete_cascade();
			}, this);
	},
	
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
BetaJS.Modelling.Associations.HasManyAssociation = BetaJS.Modelling.Associations.Association.extend("HasManyAssocation", {

	_yield: function () {
		var query = {};
		query[this._foreign_key] = this._model.id();
		return this._foreign_table.allBy(query);
	},

	yield: function () {
		if (!this._options["cached"])
			return this._yield();
		if (!this.__cache)
			this.__cache = this._yield().asArray();
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
	},

});
BetaJS.Modelling.Associations.HasOneAssociation = BetaJS.Modelling.Associations.Association.extend("HasOneAssocation", {

	_yield: function () {
		var query = {};
		query[this._foreign_key] = this._model.id();
		return this._foreign_table.findBy(query);
	}

});
BetaJS.Modelling.Associations.BelongsToAssociation = BetaJS.Modelling.Associations.Association.extend("BelongsToAssocation", {
	
	_yield: function () {
		return this._foreign_table.findById(this._model.get(this._foreign_key));
	}
	
});
BetaJS.Modelling.Validators = {};

BetaJS.Modelling.Validators.Validator = BetaJS.Class.extend("Validator", {
	
	validate: function (value, context) {
		return null;
	}

});
BetaJS.Modelling.Validators.PresentValidator = BetaJS.Modelling.Validators.Validator.extend("PresentValidator", {
	
	constructor: function (error_string) {
		this._inherited(BetaJS.Modelling.Validators.PresentValidator, "constructor");
		this.__error_string = error_string ? error_string : "Field is required";
	},

	validate: function (value, context) {
		return BetaJS.Types.is_null(value) ? this.__error_string : null;
	}

});
BetaJS.Databases = {};

BetaJS.Databases.Database = BetaJS.Class.extend("Database", {
	
	_tableClass: function () {
		return null;
	},
	
	getTable: function (table_name) {
		var cls = this._tableClass();		
		return new cls(this, table_name);
	}
	
});

BetaJS.Databases.DatabaseTable = BetaJS.Class.extend("DatabaseTable", {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Databases.DatabaseTable, "constructor");
		this._database = database;
		this._table_name = table_name;
	},
	
	_encode: function (data) {
		return data;	
	},
	
	_decode: function (data) {
		return data;
	},

	_insertRow: function (row) {		
	},
	
	_removeRow: function (query) {		
	},
	
	_findOne: function (query, options) {
	},
	
	_updateRow: function (query, row) {
	},
	
	_find: function (query, options) {
	},

	insertRow: function (row) {
		return this._decode(this._insertRow(this._encode(row)));
	},
	
	removeRow: function (query) {
		return this._removeRow(this._encode(query));
	},
	
	findOne: function (query, options) {
		var result = this._findOne(this._encode(query), options);
		return result == null ? null : this._decode(result);
	},
	
	updateRow: function (query, row) {
		return this._decode(this._updateRow(this._encode(query), this._encode(row)));
	},
	
	find: function (query, options) {
		var self = this;
		return new BetaJS.Iterators.MappedIterator(this._find(this._encode(query), options), function (row) {
			return self._decode(row);
		});
	},
	
	removeById: function (id) {
		return this.removeRow({id : id});
	},
	
	findById: function (id) {
		return this.findOne({id : id});
	},
	
	updateById: function (id, data) {
		return this.updateRow({id: id}, data);
	}
	
});
/* Needs to be executed within Fiber; requires Mongo-Sync. */

BetaJS.Databases.MongoDatabase = BetaJS.Databases.Database.extend("MongoDatabase", {
	
	constructor: function (mongo_sync, database_name, server, port) {
		this._inherited(BetaJS.Databases.MongoDatabase, "constructor");
		this.__server = server || "localhost";
		this.__port = port || 27017;
		this.__database_name = database_name;
		this.__mongodb = null;
		this.__mongo_sync = mongo_sync;
	},

	_tableClass: function () {
		return BetaJS.Databases.MongoDatabaseTable;
	},
	
	mongo_sync: function () {
		return this.__mongo_sync;
	},
	
	mongodb: function () {
		if (!this.__mongodb) {
			this.__mongo_server = new this.__mongo_sync.Server(this.__server, this.__port);
			this.__mongodb = this.__mongo_server.db(this.__database_name);
		}
		return this.__mongodb;
	},
	
	destroy: function () {
		if (this.__mongo_server)
			this.__mongo_server.close();
		this._inherited(BetaJS.Databases.MongoDatabase, "destroy");
	}
	
});
BetaJS.Databases.MongoDatabaseTable = BetaJS.Databases.DatabaseTable.extend("MongoDatabaseTable", {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Databases.MongoDatabaseTable, "constructor", database, table_name);
		this.__table = null;
	},
	
	table: function () {
		if (!this.__table)
			this.__table = this._database.mongodb().getCollection(this._table_name);
		return this.__table;
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

	_insertRow: function (row) {
		return this.table().insert(row);
	},
	
	_removeRow: function (query) {
		return this.table().remove(query);	
	},
	
	_findOne: function (query, options) {
		options = options || {};
		options.limit = 1;
		var result = this._find(query, options);
		return result.next();
	},
	
	_updateRow: function (query, row) {
		return this.table().update(query, row, true, false);
	},
	
	_find: function (query, options) {
		options = options || {};
		var result = this.table().find(query);
		if ("sort" in options)
			result = result.sort(options.sort);
		if ("skip" in options)
			result = result.skip(options.skip);
		if ("limit" in options)
			result = result.limit(options.limit);
		return new BetaJS.Iterators.ArrayIterator(result.toArray());
	},

});

BetaJS.Stores.DatabaseStore = BetaJS.Stores.BaseStore.extend("DatabaseStore", {
	
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

});

BetaJS.Stores.MongoDatabaseStore = BetaJS.Stores.ConversionStore.extend("MongoDatabaseStore", {
	
	constructor: function (database, table_name, types) {
		var store = new BetaJS.Stores.DatabaseStore(database, table_name);
		var encoding = {};
		var decoding = {};
		types = types || {};
		types.id = "id";
		var ObjectId = database.mongo_sync().ObjectId;
		for (var key in types) {
			if (types[key] == "id") {
				encoding[key] = function (value) {
					return new ObjectId(value);
				};
				decoding[key] = function (value) {
					return value + "";
				};
			}
		}
		this._inherited(BetaJS.Stores.MongoDatabaseStore, "constructor", store, {
			value_encoding: encoding,
			value_decoding: decoding
		});
	}

});

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