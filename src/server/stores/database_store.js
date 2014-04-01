BetaJS.Stores.BaseStore.extend("BetaJS.Stores.DatabaseStore", {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Stores.DatabaseStore, "constructor");
		this.__database = database;
		this.__table_name = table_name;
		this.__table = null;
	},
	
	table: function () {
		if (!this.__table)
			this.__table = this.__database.getTable(this.__table_name);
		return this.__table;
	},
	
	_insert: function (data, callbacks) {
		return this.table().insertRow(data, callbacks);
	},
	
	_remove: function (id, callbacks) {
		return this.table().removeById(id, callbacks);
	},
	
	_get: function (id, callbacks) {
		return this.table().findById(id, callbacks);
	},
	
	_update: function (id, data, callbacks) {
		return this.table().updateById(id, data, callbacks);
	},
	
	_query_capabilities: function () {
		return {
			"query": true,
			"sort": true,
			"skip": true,
			"limit": true
		};
	},
	
	_query: function (query, options, callbacks) {
		return this.table().find(query, options, callbacks);
	},
	
	_ensure_index: function (key) {
		this.table().ensureIndex(key);
	}

});
