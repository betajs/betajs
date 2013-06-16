/*!
  betajs - v0.0.1 - 2013-06-15
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Profiling = {};

BetaJS.Profiling.Profiler = BetaJS.Class.extend("Profiler", [
    BetaJS.Events.EventsMixin, {
	
	constructor: function (cls) {
		this._inherited(BetaJS.Profiling.Profiler, "constructor");
		if (!cls)
			cls = BetaJS.Class;
		this.__cls = cls;
		var self = this;
		this.__old_constructor = cls.prototype.constructor;
		cls.prototype.constructor = function () {
			self.__old_constructor.apply(this, arguments);
			self.__on_construct(this);
		};
		this.__old_destroy = cls.prototype.destroy;
		cls.prototype.destroy = function () {
			self.__on_destroy(this);
			self.__old_destroy.apply(this, arguments);
		};
		this.__objects = {};
	},
	
	destroy: function () {
		this.__cls.prototype.constructor = this.__old_constructor;
		this.__cls.prototype.destroy = this.__old_destroy;
		this._inherited(BetaJS.Profiling.Profiler, "destroy");
	},
	
	__on_construct_helper: function (instance, cls) {
		if (cls != this.__cls)
			this.__on_construct_helper(instance, cls.parent);
		if (!this.__objects[cls.classname]) {
			this.__objects[cls.classname] = {
				cls: cls,
				count: 0,
				instances: {},
				strict_count: 0,
				strict_instances: {}
			};
		}
		var field = this.__objects[cls.classname];
		var id = BetaJS.Ids.objectId(instance);
		field.count += 1;
		field.instances[id] = instance;
		if (instance.cls == cls) {
			field.strict_count += 1;
			field.strict_instances[id] = instance;
		}
		this.trigger("update", cls);
	},
	
	__on_destroy_helper: function (instance, cls) {
		var field = this.__objects[cls.classname];
		if (!field)
			return;
		var id = BetaJS.Ids.objectId(instance);
		if (!field.instances[id])
			return;
		field.count -= 1;		
		delete field.instances[id];
		if (field.strict_instances[id]) {
			field.strict_count -= 1;
			delete field.strict_instances[id];
		}
		if (cls != this.__cls)
			this.__on_destroy_helper(instance, cls.parent);
		this.trigger("update", cls);
	},

	__on_construct: function (instance) {
		this.__on_construct_helper(instance, instance.cls);
		this.trigger("construct", instance);
	},
	
	__on_destroy: function (instance) {
		this.__on_destroy_helper(instance, instance.cls);
		this.trigger("destroy", instance);
	},
	
	format_text: function () {
		var s = "";
		BetaJS.Objs.iter(this.__objects, function (field, classname) {
			s += classname + ": " + field.count + " instance(s), " + field.strict_count + " strict instance(s)." + "\n";
		});
		return s;
	},
	
	objects: function () {
		return this.__objects;
	},
	
	get: function (cls) {
		return this.__objects[cls.classname];
	}
	
}]);


BetaJS.Profiling.ProfilerHtmlViewer = BetaJS.Class.extend("ProfilerHtmlViewer", {
                                                                                       
    constructor: function (profiler) {
    	this._inherited(BetaJS.Profiling.ProfilerHtmlViewer, "constructor");
    	this.__profiler = profiler;
    	this.__rendered = false;
    	profiler.on("update", function (cls) {
    		this.__update(cls);
    	}, this);
    },
    
    destroy: function () {
    	this.__profiler.off(null, null, this);
    	this._inherited(BetaJS.Profiling.ProfilerHtmlViewer, "destroy");
    },
    
    render: function ($el) {
    	this.__$el = $el;
    	$el.html("<table><thead><tr><th>Classname</th><th>Instances</th><th>Strict Instances</th></tr></thead><tbody></tbody></table>");
    	this.__$tbody = $el.find("tbody");
    	this.__rendered = true;
    	BetaJS.Objs.iter(this.__profiler.objects(), function (field) {
    		this.__update(field.cls);
    	}, this);
    },
    
    __update: function (cls) {
    	if (!this.__rendered)
    		return;
    	var field = this.__profiler.get(cls);
    	var s = "<td>" + cls.classname + "</td><td>" + field.count + "</td><td>" + field.strict_count + "</td>";
    	var elem = this.__$tbody.find("[data-class='" + cls.classname + "']");
    	if (elem.length == 0)
    		this.__$tbody.append("<tr data-class='" + cls.classname + "'>" + s + "</tr>")
    	else
    		elem.html(s);
    },

});