Scoped.define("module:Classes.InvokerMixin", ["module:Objs", "module:Types", "module:Functions"], function (Objs, Types, Functions) {
	return {
		
		invoke_delegate : function(invoker, members) {
			if (!Types.is_array(members))
				members = [members];
			invoker = this[invoker];
			var self = this;
			Objs.iter(members, function (member) {
				this[member] = function(member) {
					return function() {
						var args = Functions.getArguments(arguments);
						args.unshift(member);
						return invoker.apply(self, args);
					};
				}.call(self, member);
			}, this);
		}
	};
});


Scoped.define("module:Classes.ModuleMixin", ["module:Objs"], function (Objs) {
	return {
	
		_notifications : {
			construct : function() {
				this.__modules = {};
			},
			destroy : function() {
				Objs.iter(this.__modules, this.remove_module, this);
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
});


Scoped.define("module:Classes.Module", ["module:Class", "module:Objs", "module:Ids", "module:Types"], function (Class, Objs, Ids, Types, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor : function(options) {
				inherited.constructor.call(this);
				this._objects = {};
				this.__auto_destroy = "auto_destroy" in options ? options.auto_destroy : true;
			},
		
			destroy : function() {
				Objs.iter(this._objects, this.unregister, this);
				inherited.destroy.call(this);
			},
		
			register : function(object) {
				var id = Ids.objectId(object);
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
				var id = Ids.objectId(object);
				if (!( id in this._objects))
					return;
				var data = this._objects[id].data;
				this._unregister(object, data);
				delete this._objects[id];
				object.remove_module(this);
				if ("off" in object)
					object.off(null, null, this);
				if (this.__auto_destroy && Types.is_empty(this._objects))
					this.destroy();
			},
		
			_unregister : function(object) {
			},
		
			_data : function(object) {
				return this._objects[Ids.objectId(object)].data;
			}
			
		};
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
});


Scoped.define("module:Classes.HelperClassMixin", ["module:Objs", "module:Types", "module:Functions", "module:Promise"], function (Objs, Types, Functions, Promise) {
	return {
	
		addHelper: function (helper_class, options) {
			var helper = new helper_class(this, options);
			this.__helpers = this.__helpers || [];
			this.__helpers.push(this._auto_destroy(helper));
			return helper;
		},
		
		_helper: function (options) {
			this.__helpers = this.__helpers || [];
			if (Types.is_string(options)) {
				options = {
					method: options
				};
			}
			options = Objs.extend({
				fold_start: null,
				fold: function (acc, result) {
					return acc || result;
				}
			}, options);
			var args = Functions.getArguments(arguments, 1);
			var acc = options.async ? Promise.create(options.fold_start) : options.fold_start;
			for (var i = 0; i < this.__helpers.length; ++i) {
				var helper = this.__helpers[i];
				if (options.method in helper) {
					if (options.async)
						acc = Promise.func(options.fold, acc, Promise.methodArgs(helper, helper[options.method], args));
					else
						acc = options.fold(acc, helper[options.method].apply(helper, args));
				}
			}
			return acc;
		}
		
	};
});


Scoped.define("module:Classes.IdGenerator", ["module:Class"], function (Class, scoped) {
	return Class.extend({scoped: scoped}, {
	
		generate: function () {}
	
	});
});	


Scoped.define("module:Classes.PrefixedIdGenerator", ["module:Classes.IdGenerator"], function (IdGenerator, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (prefix, generator) {
				inherited.constructor.call(this);
				this.__prefix = prefix;
				this.__generator = generator;
			},
			
			generate: function () {
				return this.__prefix + this.__generator.generate();
			}
			
		};
	});
});


Scoped.define("module:Classes.RandomIdGenerator", ["module:Classes.IdGenerator", "module:Tokens"], function (IdGenerator, Tokens, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (length) {
				inherited.constructor.call(this);
				this.__length = length || 16;
			},
			
			generate: function () {
				return Tokens.generate_token(this.__length);
			}

		};
	});
});


Scoped.define("module:Classes.ConsecutiveIdGenerator", ["module:Classes.IdGenerator"], function (IdGenerator, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (initial) {
				inherited.constructor.call(this);
				this.__current = initial || 0;
			},
			
			generate: function () {
				this.__current++;
				return this.__current;
			}

		};
	});
});

	
Scoped.define("module:Classes.TimedIdGenerator", ["module:Classes.IdGenerator", "module:Time"], function (IdGenerator, Time, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function () {
				inherited.constructor.call(this);
				this.__current = Time.now() - 1;
			},
			
			generate: function () {
				var now = Time.now();
				this.__current = now > this.__current ? now : (this.__current + 1); 
				return this.__current;
			}

		};
	});
});


Scoped.define("module:Classes.PathResolver", ["module:Class", "module:Objs"], function (Class, Objs, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (bindings) {
				inherited.constructor.call(this);
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
					this._bindings = Objs.extend(this._bindings, bindings);
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
						break;
					path = path.replace(regExp, this._bindings[matches[1]]);
				}
				return this.simplify(path);
			},
			
			simplify: function (path) {
				return path.replace(/[^\/]+\/\.\.\//, "").replace(/\/[^\/]+\/\.\./, "");
			}
	
		};
	});
});


Scoped.define("module:Classes.MultiDelegatable", ["module:Class", "module:Objs"], function (Class, Objs, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (objects, methods) {
				inherited.constructor.call(this);
				Objs.iter(methods, function (method) {
					this[method] = function () {
						var args = arguments;
						Objs.iter(objects, function (object) {
							object[method].apply(object, args);
						}, this);
						return this;
					};
				}, this);
			}
			
		};
	});
});


Scoped.define("module:Classes.ClassRegistry", ["module:Class", "module:Types", "module:Functions"], function (Class, Types, Functions, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (classes) {
				inherited.constructor.call(this);
				this._classes = classes || {};
			},
			
			register: function (key, cls) {
				this._classes[key] = cls;
			},
			
			get: function (key) {
				return Types.is_object(key) ? key : this._classes[key];
			},
			
			create: function (key) {
				var cons = Functions.newClassFunc(this.get(key));
				return cons.apply(this, Functions.getArguments(arguments, 1));
			},
			
			classes: function () {
				return this._classes;
			}
			
		};
	});
});


Scoped.define("module:Classes.ObjectIdScopeMixin", function () {
	return {

		__objects: {},

	    get: function (id) {
	        return this.__objects[id];
	    }

	};
});	
	
		
Scoped.define("module:Classes.ObjectIdScope", ["module:Class", "module:Classes.ObjectIdScopeMixin"], function (Class, Mixin, scoped) {
	return Class.extend({scoped: scoped}, Mixin, {
		singleton: function () {
			if (!this.__singleton)
				this.__singleton = new this();
			return this.__singleton;
		}
	});
});


Scoped.define("module:Classes.ObjectIdMixin", ["module:Classes.ObjectIdScope", "module:Objs", "module:Ids"], function (ObjectIdScope, Objs, Ids) {
	return {
	
	    _notifications: {
	        construct: "__register_object_id",
	        destroy: "__unregister_object_id"
	    },
	
	    __object_id_scope: function () {
	        if (this.object_id_scope)
	            return this.object_id_scope;
	        return ObjectIdScope.singleton();
	    },
	
	    __register_object_id: function () {
	        var scope = this.__object_id_scope();
	        scope.__objects[Ids.objectId(this)] = this;
	    },
	
	    __unregister_object_id: function () {
	        var scope = this.__object_id_scope();
	        delete scope.__objects[Ids.objectId(this)];
	    }
	
	};
});



Scoped.define("module:Classes.ContextRegistry", [
    "module:Class",
    "module:Ids",
    "module:Types",
    "module:Iterators.MappedIterator",
    "module:Iterators.ObjectValuesIterator"
], function (Class, Ids, Types, MappedIterator, ObjectValuesIterator, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (serializer, serializerContext) {
				inherited.constructor.apply(this);
				this.__data = {};
				this.__contexts = {};
				this.__serializer = serializer || this.__defaultSerializer;
				this.__serializerContext = serializerContext || this;
			},
			
			__defaultSerializer: function (data) {
				return Types.is_object(data) ? Ids.objectId(data) : data;
			},
			
			_serializeContext: function (ctx) {
				return ctx ? Ids.objectId(ctx) : null;
			},
			
			_serializeData: function (data) {
				return this.__serializer.call(this.__serializerContext, data);
			},
			
			register: function (data, context) {
				var serializedData = this._serializeData(data);
				var serializedCtx = this._serializeContext(context);
				var result = false;
				if (!(serializedData in this.__data)) {
					this.__data[serializedData] = {
						data: data,
						contexts: {}
					};
					result = true;
				}
				this.__data[serializedData].contexts[serializedCtx] = true;
				return result;
			},
			
			unregister: function (data, context) {
				var serializedData = this.__serializer.call(this.__serializerContext, data);
				if (!this.__data[serializedData])
					return false;
				if (context) {
					var serializedCtx = this._serializeContext(context);
					delete this.__data[serializedData].contexts[serializedCtx];
				}
				if (!context || Types.is_empty(this.__data[serializedData].contexts)) {
					delete this.__data[serializedData];
					return true;
				}
				return false;
			},
			
			iterator: function () {
				return new MappedIterator(new ObjectValuesIterator(this.__data), function (item) {
					return item.data;
				});
			}

		};
	});
});
