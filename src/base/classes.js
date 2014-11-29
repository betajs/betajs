BetaJS.Classes = {};

BetaJS.Classes.InvokerMixin = {

	invoke_delegate : function(invoker, members) {
		if (!BetaJS.Types.is_array(members))
			members = [members];
		invoker = this[invoker];
		var self = this;
		for (var i = 0; i < members.length; ++i) {
			var member = members[i];
			this[member] = function(member) {
				return function() {
					var args = BetaJS.Functions.getArguments(arguments);
					args.unshift(member);
					return invoker.apply(self, args);
				};
			}.call(self, member);
		}
	}
};

BetaJS.Classes.AutoDestroyMixin = {

	_notifications : {
		construct : "__initialize_auto_destroy",
		destroy : "__finalize_auto_destroy"
	},

	__initialize_auto_destroy : function() {
		this.__auto_destroy = {};
	},

	__finalize_auto_destroy : function() {
		var copy = this.__auto_destroy;
		this.__auto_destroy = {};
		BetaJS.Objs.iter(copy, function(object) {
			object.unregister(this);
		}, this);
	},

	register_auto_destroy : function(object) {
		if (object.cid() in this.__auto_destroy)
			return;
		this.__auto_destroy[object.cid()] = object;
		object.register(this);
		this._notify("register_auto_destroy", object);
	},

	unregister_auto_destroy : function(object) {
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

	constructor : function() {
		this._inherited(BetaJS.Classes.AutoDestroyObject, "constructor");
		this.__objects = {};
	},

	register : function(object) {
		var id = BetaJS.Ids.objectId(object);
		if ( id in this.__objects)
			return;
		this.__objects[id] = object;
		object.register_auto_destroy(this);
	},

	unregister : function(object) {
		var id = BetaJS.Ids.objectId(object);
		if (!( id in this.__objects))
			return;
		delete this.__objects[id];
		object.unregister_auto_destroy(this);
	},

	clear : function() {
		BetaJS.Objs.iter(this.__objects, function(object) {
			this.unregister(object);
		}, this);
	}
});

BetaJS.Class.extend("BetaJS.Classes.ObjectCache", [BetaJS.Events.EventsMixin, {

	constructor : function(options) {
		this._inherited(BetaJS.Classes.ObjectCache, "constructor");
		this.__size = "size" in options ? options.size : null;
		this.__destroy_on_remove = "destroy_on_remove" in options ? options.destroy_on_remove : true;
		this.__id_to_container = {};
		this.__first = null;
		this.__last = null;
		this.__count = 0;
	},

	destroy : function() {
		this.clear();
		this._inherited(BetaJS.Classes.ObjectCache, "destroy");
	},

	add : function(object) {
		if (this.get(object))
			return;
		if (this.__size !== null && this.__count >= this.__size && this.__first)
			this.remove(this.__first.object);
		var container = {
			object : object,
			prev : this.__last,
			next : null
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

	remove : function(id) {
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

	get : function(id) {
		if (BetaJS.Class.is_class_instance(id))
			id = BetaJS.Ids.objectId(id);
		return this.__id_to_container[id] ? this.__id_to_container[id].object : null;
	},

	clear : function() {
		BetaJS.Objs.iter(this.__id_to_container, function(container) {
			this.remove(container.object);
		}, this);
	}
}]);

BetaJS.Classes.ModuleMixin = {

	_notifications : {
		construct : function() {
			this.__modules = {};
		},
		destroy : function() {
			BetaJS.Objs.iter(this.__modules, this.remove_module, this);
		}
	},

	add_module : function(module) {
		if (module.cid() in this.__modules)
			return;
		this.__modules[module.cid()] = module;
		module.register(this);
		this._notify("add_module", module);
	},

	remove_module : function(module) {
		if (!(module.cid() in this.__modules))
			return;
		delete this.__modules[module.cid()];
		module.unregister(this);
		this._notify("remove_module", module);
	}
};

BetaJS.Class.extend("BetaJS.Classes.Module", {

	constructor : function(options) {
		this._inherited(BetaJS.Classes.Module, "constructor");
		this._objects = {};
		this.__auto_destroy = "auto_destroy" in options ? options.auto_destroy : true;
	},

	destroy : function() {
		BetaJS.Objs.iter(this._objects, this.unregister, this);
		this._inherited(BetaJS.Classes.Module, "destroy");
	},

	register : function(object) {
		var id = BetaJS.Ids.objectId(object);
		if ( id in this._objects)
			return;
		var data = {};
		this._objects[id] = {
			object : object,
			data : data
		};
		object.add_module(this);
		this._register(object, data);
	},

	_register : function(object) {
	},

	unregister : function(object) {
		var id = BetaJS.Ids.objectId(object);
		if (!( id in this._objects))
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

	_unregister : function(object) {
	},

	_data : function(object) {
		return this._objects[BetaJS.Ids.objectId(object)].data;
	}
}, {

	__instance : null,

	singleton : function() {
		if (!this.__instance)
			this.__instance = new this({
				auto_destroy : false
			});
		return this.__instance;
	}
});


BetaJS.Classes.ObjectIdMixin = {

    _notifications: {
        construct: "__register_object_id",
        destroy: "__unregister_object_id"
    },

    __object_id_scope: function () {
        if (this.object_id_scope)
            return this.object_id_scope;
        if (!BetaJS.Classes.ObjectIdScope)
            BetaJS.Classes.ObjectIdScope = BetaJS.Objs.clone(BetaJS.Classes.ObjectIdScopeMixin, 1);
        return BetaJS.Classes.ObjectIdScope;
    },

    __register_object_id: function () {
        var scope = this.__object_id_scope();
        scope.__objects[BetaJS.Ids.objectId(this)] = this;
    },

    __unregister_object_id: function () {
        var scope = this.__object_id_scope();
        delete scope.__objects[BetaJS.Ids.objectId(this)];
    }

};

BetaJS.Classes.ObjectIdScopeMixin = {

    __objects: {},

    get: function (id) {
        return this.__objects[id];
    }

};


BetaJS.Classes.HelperClassMixin = {
	
	addHelper: function (helper_class, options) {
		var helper = new helper_class(this, options);
		this.__helpers = this.__helpers || [];
		this.__helpers.push(this._auto_destroy(helper));
		return helper;
	},
	
	_helper: function (options) {
		this.__helpers = this.__helpers || [];
		if (BetaJS.Types.is_string(options)) {
			options = {
				method: options
			};
		}
		options = BetaJS.Objs.extend({
			fold_start: null,
			fold: function (acc, result) {
				return acc || result;
			}
		}, options);
		var args = BetaJS.Functions.getArguments(arguments, 1);
		var acc = options.fold_start;
		if (options.callbacks) {
			var self = this;
			var callback_index = -1;
			for (j = 0; j < args.length; ++j) {
				if (args[j] == options.callbacks)
					callback_index = j;
			}
			function helper_fold(idx) {
				if (idx >= self.__helpers.length) {
					BetaJS.SyncAsync.callback(options.callbacks, "success", acc);
					return;
				} else if (options.method in self.__helpers[idx]) {
					var helper = self.__helpers[idx];
					if (callback_index == -1) {
						helper[options.method].apply(helper, args);
						helper_fold(idx + 1);
					} else {
						args[callback_index] = {
							context: options.callbacks.context,
							success: function (result) {
								acc = options.fold(acc, result);
								helper_fold(idx + 1);
							},
							failure: options.callbacks.failure
						};
						helper[options.method].apply(helper, args);
					}
				} else
					helper_fold(idx + 1);
			}
			helper_fold(0);
		} else {
			for (var i = 0; i < this.__helpers.length; ++i) {
				var helper = this.__helpers[i];
				if (options.method in helper) {
					var result = helper[options.method].apply(helper, args);
					acc = options.fold(acc, result);
				}
			}
		}
		return acc;
	}
	
};


BetaJS.Class.extend("BetaJS.Classes.IdGenerator", {
	
	generate: function () {}
	
});

BetaJS.Classes.IdGenerator.extend("BetaJS.Classes.PrefixedIdGenerator", {

	constructor: function (prefix, generator) {
		this._inherited(BetaJS.Classes.PrefixedIdGenerator, "constructor");
		this.__prefix = prefix;
		this.__generator = generator;
	},
	
	generate: function () {
		return this.__prefix + this.__generator.generate();
	}
	
});

BetaJS.Classes.IdGenerator.extend("BetaJS.Classes.RandomIdGenerator", {

	constructor: function (length) {
		this._inherited(BetaJS.Classes.PrefixedIdGenerator, "constructor");
		this.__length = length || 16;
	},
	
	generate: function () {
		return BetaJS.Tokens.generate_token(this.__length);
	}

});

BetaJS.Classes.IdGenerator.extend("BetaJS.Classes.ConsecutiveIdGenerator", {

	constructor: function (initial) {
		this._inherited(BetaJS.Classes.ConsecutiveIdGenerator, "constructor");
		this.__current = initial || 0;
	},
	
	generate: function () {
		this.__current++;
		return this.__current;
	}

});

BetaJS.Classes.IdGenerator.extend("BetaJS.Classes.TimedIdGenerator", {

	constructor: function () {
		this._inherited(BetaJS.Classes.TimedIdGenerator, "constructor");
		this.__current = BetaJS.Time.now() - 1;
	},
	
	generate: function () {
		var now = BetaJS.Time.now();
		this.__current = now > this.__current ? now : (this.__current + 1); 
		return this.__current;
	}

});


BetaJS.Class.extend("BetaJS.Classes.PathResolver", {
	
	constructor: function (bindings) {
		this._inherited(BetaJS.Classes.PathResolver, "constructor");
		this._bindings = bindings || {};
	},
	
	extend: function (bindings, namespace) {
		if (namespace) {
			for (var key in bindings) {
				var value = bindings[key];
				var regExp = /\{([^}]+)\}/;
				while (true) {
					var matches = regExp.exec(value);
					if (!matches)
						break;
					value = value.replace(regExp, namespace + "." + matches[1]);
				}
				this._bindings[namespace + "." + key] = value;
			}
		} else
			this._bindings = BetaJS.Objs.extend(this._bindings, bindings);
	},
	
	map: function (arr) {
		var result = [];
		for (var i = 0; i < arr.length; ++i) {
			if (arr[i])
				result.push(this.resolve(arr[i]));
		}
		return result;
	},
	
	resolve : function(path) {
		var regExp = /\{([^}]+)\}/;
		while (true) {
			var matches = regExp.exec(path);
			if (!matches)
				return this.simplify(path);
			path = path.replace(regExp, this._bindings[matches[1]]);
		}
		return path;
	},
	
	simplify: function (path) {
		return path.replace(/[^\/]+\/\.\.\//, "").replace(/\/[^\/]+\/\.\./, "");
	}
	
});