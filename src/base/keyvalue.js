Scoped.define("module:KeyValue.KeyValueStore", ["module:Class", "module:Events.EventsMixin"], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, {

		mem: function (key) {
			return this._mem(key);
		},
		
		get: function (key) {
			return this._get(key);
		},
		
		set: function (key, value) {
			this._set(key, value);
			this.trigger("change:" + key, value);
		},
		
		remove: function (key) {
			this._remove(key);
		}
	
	}]);
});


Scoped.define("module:KeyValue.PrefixKeyValueStore", ["module:KeyValue.KeyValueStore"], function (KeyValueStore, scoped) {
	return KeyValueStore.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (kv, prefix) {
				inherited.constructor.call(this);
				this.__kv = kv;
				this.__prefix = prefix;
			},
			
			_mem: function (key) {
				return this.__kv.mem(this.__prefix + key);
			},
			
			_get: function (key) {
				return this.__kv.get(this.__prefix + key);
			},
			
			_set: function (key, value) {
				this.__kv.set(this.__prefix + key, value);
			},
			
			_remove: function (key) {
				this.__kv.remove(this.__prefix + key);
			}
	
		};
	});
});


Scoped.define("module:KeyValue.MemoryKeyValueStore", ["module:KeyValue.KeyValueStore", "module:Objs"], function (KeyValueStore, Objs, scoped) {
	return KeyValueStore.extend({scoped: scoped}, function (inherited) {
		return {
	
			constructor: function (data, clone) {
				inherited.constructor.call(this);
				this.__data = Objs.clone(data, clone ? 1 : 0);
			},
			
			_mem: function (key) {
				return key in this.__data;
			},
			
			_get: function (key) {
				return this.__data[key];
			},
			
			_set: function (key, value) {
				this.__data[key] = value;
			},
			
			_remove: function (key) {
				delete this.__data[key];
			}

		};
	});
});


Scoped.define("module:KeyValue.LocalKeyValueStore", ["module:KeyValue.MemoryKeyValueStore"], function (MemoryKeyValueStore, scoped) {
	return MemoryKeyValueStore.extend({scoped: scoped}, function (inherited) {
		return {
	
			constructor: function () {
				inherited.constructor.call(this, localStorage, false);
			}
	
		};
	});
});


Scoped.define("module:KeyValue.DefaultKeyValueStore", ["module:KeyValue.KeyValueStore"], function (KeyValueStore, scoped) {
	return KeyValueStore.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (kv, def) {
				inherited.constructor.call(this);
				this.__kv = kv;
				this.__def = def;
			},
			
			_mem: function (key) {
				return this.__kv.mem(key) || this.__def.mem(key);
			},
			
			_get: function (key) {
				return this.__kv.mem(key) ? this.__kv.get(key) : this.__def.get(key);
			},
			
			_set: function (key, value) {
				this.__kv.set(key, value);
			},
			
			_remove: function (key) {
				this.__kv.remove(key);
			}

		};
	});
});
