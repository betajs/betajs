/*!
  betajs - v0.0.1 - 2013-04-08
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
var BetaJS = BetaJS || {};
BetaJS.Types = {
	
	is_object: function (x) {
		return typeof x == "object";
	},
	
	is_array: function (x) {
		return toString.call(x) == '[object Array]';
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

BetaJS.Objs = {
	
	clone: function (item, depth) {
		if (BetaJS.Types.is_object(item) && depth && depth > 0)
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



BetaJS.Class.prototype.cls = BetaJS.Class;

BetaJS.Class.__notifications = {};

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

BetaJS.Lists = {};

BetaJS.Lists.AbstractList = BetaJS.Class.extend("AbstractList", {
	
	_add: function (object) {},
	_remove: function (ident) {},
	_get: function (ident) {},
	_iterate: function (callback) {},
	
	constructor: function () {
		this._inherited(BetaJS.Lists.AbstractList, "constructor");
		this.__count = 0;
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
	
	getIdent: function (object) {
		var id = null;
		this._iterate(function (obj, id) {
			if (obj == object) {
				ident = id;
				return false;
			}
			return true;	
		});
		return id;
	},
	
	remove: function (object) {
		return this.remove_by_ident(this.getIdent(object));
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

BetaJS.Lists.IdObjectList = BetaJS.Lists.AbstractList.extend("IdObjectList", {
	
	constructor: function () {
		this._inherited(BetaJS.Lists.IdObjectList, "constructor");
		this.__objects = {};
		this.__last_id = 0;
	},
	
	_add: function (object) {
		var id = this.__last_id++;
		this.__objects[id] = object;
		return id;
	},
	
	_get: function (id) {
		return this.__objects[id];
	},
	
	_remove: function (id) {
		var obj = this.__objects[id];
		delete this.__objects[id];
		return obj;
	},
	
	_iterate: function (cb) {
		for (var key in this.__objects) 
			if (!cb(this.__objects[key], key))
				return;
	}
	
});

BetaJS.Lists.LinkedList = BetaJS.Lists.AbstractList.extend("LinkedList", {
	
	constructor: function () {
		this._inherited(BetaJS.Lists.LinkedList, "constructor");
		this.__first = null;
		this.__last = null;
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

BetaJS.Iterators = {};

BetaJS.Iterators.Iterator = BetaJS.Class.extend("Iterator");

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
		return this.__map(this.__iterator.next());
	}
	
});
BetaJS.Events = {};

BetaJS.Events.EVENT_SPLITTER = /\s+/;

BetaJS.Events.EventsMixin = {
	
	on: function(events, callback, context) {
		this.__events = this.__events || {};
		events = events.split(BetaJS.Events.EVENT_SPLITTER);
		var event;
		while (event = events.shift()) {
			this.__events[event] = this.__events[event] || new BetaJS.Lists.LinkedList();
			this.__events[event].add({
				callback: callback,
				context: context
			});
		}
		return this;
	},
	
	off: function(events, callback, context) {
		this.__events = this.__events || {};
		events = events.split(BetaJS.Events.EVENT_SPLITTER);
		var event;
		while (event = events.shift())
			if (this.__events[event]) {
				this.__events[event].remove_by_filter(function (object) {
					return (!callback || object.callback == callback) && (!context || object.context == context);
				});
				if (this.__events[event].count() == 0) {
					this.__events[event].destroy();
					delete this.__events[event];
				}
			}
		return this;
	},

    trigger: function(events) {
    	var self = this;
    	events = events.split(BetaJS.Events.EVENT_SPLITTER);
    	var rest = Array.prototype.slice.call(arguments, 1);
		var event;
		if (!this.__events)
			return;
    	while (event = events.shift()) {
    		if (this.__events[event])
    			this.__events[event].iterate(function (object) {
    				object.callback.apply(object.context || self, rest);
    			});
    		if (this.__events["all"])
    			this.__events["all"].iterate(function (object) {
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
		if (!this.__listen) this.__listen = {};
		this.__listen[BetaJS.Ids.objectId(target)] = target;
		target.on(events, callback, this);
	},
	
	listenOnce: function (target, events, callback) {
		if (!this.__listen) this.__listen = {};
		this.__listen[BetaJS.Ids.objectId(target)] = target;
		target.once(events, callback, this);
	},
	
	listenOff: function (target, events, callback) {
		if (!this.__listen)
			return;
		if (target) {
			target.off(events, callback, this);
			if (!events && !callback)
				delete this.__listen[BetaJS.Ids.objectId(target)];
		}
		else
			BetaJS.Objs.iter(this.__listen, function (obj) {
				obj.off(events, callback, this);
				if (!events && !callback)
					delete this.__listen[BetaJS.Ids.objectId(obj)];
			}, this);
	}
	
}

BetaJS.Events.Listen = BetaJS.Class.extend("Listen", BetaJS.Events.ListenMixin)

BetaJS.Properties = {};


BetaJS.Properties.PropertiesMixin = {
	
	get: function (key) {
		return this.__properties ? this.__properties[key] : null;
	},
	
	set: function (key, value) {
		if (!this.__properties) 
			this.__properties = {};
		if ((! key in this.__properties) || (this.__properties[key] != value)) {
			this.__properties[key] = value;
			this.trigger("change");
			this.trigger("change:" + key);
		}
	},
	
	getAll: function () {
		return BetaJS.Objs.clone(this.__properties || {}, 1);
	},
	
	setAll: function (obj) {
		for (var key in obj)
			this.set(key, obj[key]);
	}
	
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


BetaJS.Properties.BindablePropertiesMixin = {
	
	_notifications: {
		"construct": "__bindable_properties_construct",
		"destroy": "__bindable_properties_destroy"
	},
	
	__bindable_properties_construct: function () {
		this.__properties = {};
	},
	
	__bindable_properties_destroy: function () {
		for (var key in this.__properties) 
			this.__bindable_remove(key);
	},
	
	__bindable_remove: function (key) {
		var entry = this.__properties[key];
		if (entry.bindee)
			entry.bindee.off("change:" + entry.property, null, this);
		delete this.__properties[key];
	},
	
	get: function (key) {
		var entry = this.__properties[key];
		if (entry == null)
			return null;
		if (entry.bindee)
			return entry.bindee.get(entry.property);
		return entry.value;
	},
	
	set: function (key, value) {
		if (this.get(key) != value) {
			var entry = this.__properties[key];
			if (value.bindee && value.property) {
				if (entry)
					this.__bindable_remove(key);
				this.__properties[key] = value;
				value.bindee.on("change:" + value.property, function () {
					this.trigger("change");
					this.trigger("change:" + key);
				}, this);
			} else if (entry && entry.bindee) 
				entry.bindee.set(entry.property, value);
			else 
				this.__properties[key] = { value: value };
			this.trigger("change");
			this.trigger("change:" + key);
		}
	},
	
	binding: function (key) {
		return {
			bindee: this,
			property: key
		};
	},
	
	getAll: function () {
		var result = {};
		for (var key in this.__properties)
			result[key] = this.get(key);
		return result;
	},
	
	setAll: function (obj) {
		for (var key in obj)
			this.set(key, obj[key]);
	}
	
};

BetaJS.Properties.BindableProperties = BetaJS.Class.extend("BindableProperties", [
  	BetaJS.Events.EventsMixin,
	BetaJS.Properties.BindablePropertiesMixin, {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Properties.BindableProperties, "constructor");
		if (obj)
			this.setAll(obj);
	}
	
}]);