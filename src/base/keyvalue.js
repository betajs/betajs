BetaJS.Class.extend("BetaJS.KeyValue.KeyValueStore", [
	BetaJS.Events.EventsMixin,
	{
	
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


BetaJS.KeyValue.KeyValueStore.extend("BetaJS.KeyValue.PrefixKeyValueStore", {
	
	constructor: function (kv, prefix) {
		this._inherited(BetaJS.KeyValue.PrefixKeyValueStore, "constructor");
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
	
});


BetaJS.KeyValue.KeyValueStore.extend("BetaJS.KeyValue.MemoryKeyValueStore", {
	
	constructor: function (data, clone) {
		this._inherited(BetaJS.KeyValue.MemoryKeyValueStore, "constructor");
		this.__data = BetaJS.Objs.clone(data, clone ? 1 : 0);
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

});


BetaJS.KeyValue.MemoryKeyValueStore.extend("BetaJS.KeyValue.LocalKeyValueStore", {
	
	constructor: function () {
		this._inherited(BetaJS.KeyValue.LocalKeyValueStore, "constructor", localStorage, false);
	}
	
});


BetaJS.KeyValue.KeyValueStore.extend("BetaJS.KeyValue.DefaultKeyValueStore", {
	
	constructor: function (kv, def) {
		this._inherited(BetaJS.KeyValue.DefaultKeyValueStore, "constructor");
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

});
