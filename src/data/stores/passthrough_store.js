BetaJS.Stores.BaseStore.extend("BetaJS.Stores.PassthroughStore", {
	
	constructor: function (store, options) {
		this.__store = store;
		options = options || {};
		options.id_key = store.id_key();
		this._projection = options.projection || {};
		this._inherited(BetaJS.Stores.PassthroughStore, "constructor", options);
		this._supportsAsync = store.supportsAsync();
		this._supportsSync = store.supportsSync();
        if (options.destroy_store)
            this._auto_destroy(store);
	},
	
	_query_capabilities: function () {
		return this.__store._query_capabilities();
	},

	_insert: function (data, callbacks) {
		return this.__store.insert(BetaJS.Objs.extend(data, this._projection), callbacks);
	},
	
	_remove: function (id, callbacks) {
		return this.__store.remove(id, callbacks);
	},
	
	_get: function (id, callbacks) {
		return this.__store.get(id, callbacks);
	},
	
	_update: function (id, data, callbacks) {
		return this.__store.update(id, data, callbacks);
	},
	
	_query: function (query, options, callbacks) {
		return this.__store.query(BetaJS.Objs.extend(query, this._projection), options, callbacks);
	},
	
	_ensure_index: function (key) {
		return this.__store.ensure_index(key);
	},
	
	_store: function () {
		return this.__store;
	}

});



BetaJS.Stores.PassthroughStore.extend("BetaJS.Stores.ActiveStore", {
	
	constructor: function (store, listener, options) {
		this._inherited(BetaJS.Stores.ActiveStore, "constructor", store, options);
		this.__listener = listener;
		this.delegateEvents(null, listener);
	}
	
});
