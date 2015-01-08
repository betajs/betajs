BetaJS.Properties = {};

BetaJS.Properties.PropertiesMixin = {

	_notifications: {
		"construct": function () {
			this.__properties = {
				// hierarchical organization
				data: {},
				// hierarchical organization
				watchers: {
					children: {},
					eventCount: 0,
					parent: null,
					key: null
				},
				// flat organization
				computed: {},
				// flat organization
				bindings: {}
			};
		},
		"destroy": function () {
			BetaJS.Objs.iter(this.__properties.bindings, function (value, key) {
				this.unbind(key);
			}, this);
			this.trigger("destroy");
		},
		"register_event": function (event) {
			BetaJS.Objs.iter(["change", "unset", "deepchange", "deepunset", "strongdeepchange", "strongchange"], function (eventType) {
				if (BetaJS.Strings.starts_with(event, eventType + ":"))
					this.__registerWatcher(BetaJS.Strings.strip_start(event, eventType + ":"), eventType);
			}, this);
		},
		"unregister_event": function (event) {
			BetaJS.Objs.iter(["change", "unset", "deepchange", "deepunset", "strongdeepchange", "strongchange"], function (eventType) {
				if (BetaJS.Strings.starts_with(event, eventType + ":"))
					this.__unregisterWatcher(BetaJS.Strings.strip_start(event, eventType + ":"), eventType);
			}, this);
		}
	},
	
	get: function (key) {
		return BetaJS.Properties.Scopes.get(key, this.__properties.data);
	},
	
	_canSet: function (key, value) {
		return true;
	},
	
	_beforeSet: function (key, value) {
		return value;
	},
	
	_afterSet: function (key, value, options) {},
	
	has: function (key) {
		return BetaJS.Properties.Scopes.has(key, this.__properties.data);
	},
	
	setAll: function (obj) {
		for (var key in obj)
			this.set(key, obj[key]);
		return this;
	},
	
	keys: function (mapped) {
		return BetaJS.Objs.keys(this.__properties.data, mapped);
	},
	
	data: function () {
		return this.__properties.data;
	},
	
	getAll: function () {
		return BetaJS.Objs.clone(this.__properties.data, 1);
	},
	
	__registerWatcher: function (key, event) {
		var keys = key ? key.split(".") : [];
		var current = this.__properties.watchers;
		for (var i = 0; i < keys.length; ++i) {
			if (!(keys[i] in current.children)) {
				current.children[keys[i]] = {
					parent: current,
					eventCount: 0,
					children: {},
					key: keys[i]
				};
			}
			current = current.children[keys[i]];
		}
		current.eventCount++;
	},
	
	__unregisterWatcher: function (key, event) {
		var keys = key ? key.split(".") : [];
		var current = this.__properties.watchers;
		for (var i = 0; i < keys.length; ++i) {
			if (current)
				current = current.children[keys[i]];
		}
		if (!current)
			return;
		current.eventCount--;
		while (current.eventCount <= 0 && BetaJS.Types.is_empty(current.children) && current.parent) {
			var parent = current.parent;
			delete parent.children[current.key];
			current = parent;
		}
	},
	
	uncompute: function (key) {
		if (key in this.__properties.computed) {
			BetaJS.Objs.iter(this.__properties.computed[key].dependencies, function (dependency) {
				dependency.properties.off("change:" + dependency.key, null, dependency);
			}, this);
			delete this.__properties.computed[key];
		}
		return this;
	},
	
	compute: function (key, func) {
		var args = BetaJS.Functions.matchArgs(arguments, 2, {
			setter: "function",
			context: {
				type: "object",
				def: this
			},
			dependencies: true
		});
		this.uncompute(key);
		var deps = [];
		BetaJS.Objs.iter(args.dependencies, function (dep) {
			if (BetaJS.Types.is_string(dep))
				deps.push({properties: this, key: dep});
			else
				deps.push({properties: dep[0], key: dep[1]});
		}, this);
		var computed = {
			ignore: 0,
			func: func,
			context: args.context,
			setter: args.setter,
			dependencies: deps
		};
		this.__properties.computed[key] = computed;
		var self = this;
		function recompute() {
			if (computed.ignore > 0)
				return;
			var values = BetaJS.Objs.map(deps, function (dep) {
				return dep.properties.get(dep.key);
			});
			self.set(key, func.apply(args.context, values));
		}
		for (var i = 0; i < deps.length; ++i) {
			deps[i].properties.on("change:" + deps[i].key, function () {
				recompute();
			}, deps[i]);
		}
		recompute();
		return this;
	},
	
	unbind: function (key, props) {
		if (key in this.__properties.bindings) {
			for (i = this.__properties.bindings[key].length - 1; i >= 0; --i) {
				var binding = this.__properties.bindings[key][i];
				if (!props || props == binding) {
					if (binding.left) 
						binding.properties.off(null, null, binding);
					if (binding.right)
						this.off(null, null, binding);
					this.__properties.bindings[key].splice(i, 1);
					i--;
				}
			}
			if (this.__properties.bindings[key].length === 0)
				delete this.__properties.bindings[key];
		}
		return this;
	},
	
	bind: function (key, properties, options) {
		options = BetaJS.Objs.extend({
			secondKey: key,
			left: true,
			right: true,
			deep: false
		}, options);
		var binding = {
			key: options.secondKey,
			left: options.left,
			right: options.right,
			deep: options.deep,
			properties: properties
		};
		this.__properties.bindings[key] = this.__properties.bindings[key] || [];
		this.__properties.bindings[key].push(binding);
		if (binding.left) {
			var self = this;
			binding.properties.on("strongchange:" + binding.key, function (value) {
				self.set(key, value);
			}, binding);
			binding.properties.on("unset:" + binding.key, function (value) {
				self.unset(key);
			}, binding);
			if (binding.deep) {
				binding.properties.on("strongdeepchange:" + binding.key, function (value, oldValue, subKey) {
					if (self.get(key ? key + "." + subKey : subKey) === value)
						self.__setChanged(key ? key + "." + subKey : subKey, value, oldValue, true);
					else
						self.set(key ? key + "." + subKey : subKey, value);					
				}, binding);
				binding.properties.on("deepunset:" + binding.key, function (oldValue, subKey) {
					if (!self.has(key ? key + "." + subKey : subKey))
						self.__unsetChanged(key ? key + "." + subKey : subKey, oldValue);
					else
						self.unset(key ? key + "." + subKey : subKey);					
				}, binding);
			}
			if (!binding.right || !this.has(key))
				this.set(key, binding.properties.get(binding.key));
		}
		if (binding.right) {
			this.on("strongchange:" + key, function (value) {
				binding.properties.set(binding.key, value);
			}, binding);
			this.on("unset:" + key, function (value) {
				binding.properties.unset(binding.key);
			}, binding);
			if (binding.deep) {
				this.on("strongdeepchange:" + key, function (value, oldValue, subKey) {
					if (binding.properties.get(binding.key ? binding.key + "." + subKey : subKey) === value)
						binding.properties.__setChanged(binding.key ? binding.key + "." + subKey : subKey, value, oldValue, true);
					else
						binding.properties.set(binding.key ? binding.key + "." + subKey : subKey, value);
				}, binding);
				this.on("deepunset:" + key, function (oldValue, subKey) {
					if (!binding.properties.has(binding.key ? binding.key + "." + subKey : subKey))
						binding.properties.__unsetChanged(binding.key ? binding.key + "." + subKey : subKey, oldValue);
					else
						binding.properties.unset(binding.key ? binding.key + "." + subKey : subKey);
				}, binding);
			}
			if (!binding.left || this.has(key))
				binding.properties.set(binding.key, this.get(key));
		}
		binding.properties.on("destroy", function () {
			this.unbind();
		}, this);
		return this;
	},
	
	__unsetChanged: function (key, oldValue) {
		this.trigger("unset", key, oldValue);
		var keys = key ? key.split(".") : [];
		var current = this.__properties.watchers;
		var head = "";
		var tail = key;
		for (var i = 0; i < keys.length; ++i) {
			if (current.eventCount > 0)
				this.trigger("deepunset:" + head, oldValue, tail);
			if (!(keys[i] in current.children))
				return this;
			current = current.children[keys[i]];
			head = head ? (head + "." + keys[i]) : keys[i];
			tail = BetaJS.Strings.first_after(tail, ".");
		}
		function process_unset(current, key, oldValue) {
			if (BetaJS.Types.is_undefined(oldValue))
				return;
			if (current.eventCount > 0)
				this.trigger("unset:" + key, oldValue);
			BetaJS.Objs.iter(current.children, function (child, subkey) {
				process_unset.call(this, child, key ? (key + "." + subkey) : subkey, oldValue[subkey]);
			}, this);
		}
		process_unset.call(this, current, key, oldValue);
		return this;
	},
	
	__setChanged: function (key, value, oldValue, notStrong) {
		this.trigger("change", key, value, oldValue);
		var keys = key ? key.split(".") : [];
		var current = this.__properties.watchers;
		var head = "";
		var tail = key;
		for (var i = 0; i < keys.length; ++i) {
			if (current.eventCount > 0) {
				if (!notStrong)
					this.trigger("strongdeepchange:" + head, value, oldValue, tail);
				this.trigger("deepchange:" + head, value, oldValue, tail);
			}
			if (!(keys[i] in current.children))
				return;
			current = current.children[keys[i]];
			head = head ? (head + "." + keys[i]) : keys[i];
			tail = BetaJS.Strings.first_after(tail, ".");
		}
		function process_set(current, key, value, oldValue) {
			if (value == oldValue)
				return;
			if (current.eventCount > 0) {
				if (!notStrong)
					this.trigger("strongchange:" + key, value, oldValue);
				this.trigger("change:" + key, value, oldValue);
			}
			BetaJS.Objs.iter(current.children, function (child, subkey) {
				process_set.call(this, child, key ? (key + "." + subkey) : subkey, value[subkey], oldValue[subkey]);
			}, this);
		}
		process_set.call(this, current, key, value, oldValue);
	},
	
	unset: function (key) {
		if (this.has(key)) {
			var oldValue = this.get(key);
			BetaJS.Properties.Scopes.unset(key, this.__properties.data);
			this.__unsetChanged(key, oldValue);
		}
		return this;
	},
	
	__properties_guid: "ec816b66-7284-43b1-a945-0600c6abfde3",
	
	set: function (key, value) {
		if (BetaJS.Types.is_object(value) && value.guid == this.__properties_guid) {
			if (value.properties)
				this.bind(key, value.properties, {secondKey: value.key});
			if (value.func)
				this.compute(key, value.func, value.dependencies);
			return this;
		}
		var oldValue = this.get(key);
		if (oldValue !== value) {
			BetaJS.Properties.Scopes.set(key, value, this.__properties.data);
			this.__setChanged(key, value, oldValue);
		}
		return this;
	},
	
	binding: function (key) {
		return {
			guid: this.__properties_guid,
			properties: this,
			key: key
		};
	},
	
	computed : function (f, dependencies) {
		return {
			guid: this.__properties_guid,
			func: f,
			dependencies: dependencies
		};
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


BetaJS.Properties.Scopes = {

	has: function (key, scope) {
		var keys = key ? key.split(".") : [];
		for (var i = 0; i < keys.length; ++i) {
	       if (!scope || !BetaJS.Types.is_object(scope))
	    	   return false;
	       scope = scope[keys[i]];
	    }
		return BetaJS.Types.is_defined(scope);
	},
	
	get: function (key, scope) {
		var keys = key ? key.split(".") : [];
		for (var i = 0; i < keys.length; ++i) {
	       if (!scope || !BetaJS.Types.is_object(scope))
	    	   return null;
	       scope = scope[keys[i]];
	    }
		return scope;
	},
	
	set: function (key, value, scope) {
		if (!key)
			return;
		var keys = key.split(".");
		for (var i = 0; i < keys.length - 1; ++i) {
			if (!(keys[i] in scope) || !BetaJS.Types.is_object(scope[keys[i]]))
				scope[keys[i]] = {};
	       scope = scope[keys[i]];
	    }
		scope[keys[keys.length - 1]] = value;
	},
	
	unset: function (key, scope) {
		if (!key)
			return;
		var keys = key.split(".");
		for (var i = 0; i < keys.length - 1; ++i) {
	       if (!scope || !BetaJS.Types.is_object(scope))
	    	   return;
	       scope = scope[keys[i]];
	    }
		delete scope[keys[keys.length - 1]];
	},
	
	touch: function (key, scope) {
		if (!key)
			return scope;
		var keys = key.split(".");
		for (var i = 0; i < keys.length; ++i) {
			if (!(keys[i] in scope) || !BetaJS.Types.is_object(scope))
				scope[keys[i]] = {};
	       scope = scope[keys[i]];
	    }
		return scope[keys[keys.length - 1]];
	}
	
};
