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

