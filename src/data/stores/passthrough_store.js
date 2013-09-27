BetaJS.Stores.BaseStore.extend("BetaJS.Stores.PassthroughStore", {
	
	constructor: function (store, options) {
		this.__store = store;
		options = options || {};
		options.id_key = store.id_key();
		options.async_read = store.async_read;
		options.async_write = store.async_write;
		this._inherited(BetaJS.Stores.PassthroughStore, "constructor", options);
	},
	
	_supports_async_read: function () {
		return this.__store._supports_async_read();
	},
			
	_supports_async_write: function () {
		return this.__store._supports_async_read();
	},

	_query_capabilities: function () {
		return this.__store._query_capabilities();
	},

	_insert: function (data, callbacks) {
		return this.__store.insert(data, callbacks);
	},
	
	_remove: function (id, callbacks) {
		return this.__store.remove(id, callbacks);
	},
	
	_get: function (id) {
		return this.__store.get(id);
	},
	
	_update: function (id, data, callbacks) {
		return this.__store.update(id, data, callbacks);
	},
	
	_query: function (query, options) {
		return this.__store.query(query, options)
	}

});