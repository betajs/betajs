BetaJS.Classes = {};


BetaJS.Classes.InvokerMixin = {
	
	invoke_delegate: function (invoker, members) {
		if (!BetaJS.Types.is_array(members))
			members = [members];
		invoker = this[invoker];
		var self = this;
		for (var i = 0; i < members.length; ++i) {
			var member = members[i];
			this[member] = function () {
				var args = BetaJS.Functions.getArguments(arguments);
				args.unshift(member);
				return invoker.apply(self, args);
			};
		}
	}
	
};



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
