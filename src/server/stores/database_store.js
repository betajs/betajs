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
	
	_insert: function (data) {
		return this.table().insertRow(data);
	},
	
	_remove: function (id) {
		return this.table().removeById(id);
	},
	
	_get: function (id) {
		return this.table().findById(id);
	},
	
	_update: function (id, data) {
		return this.table().updateById(id, data);
	},
	
	_query_capabilities: function () {
		return {
			"query": true,
			"sort": true,
			"skip": true,
			"limit": true
		};
	},
	
	_query: function (query, options) {
		return this.table().find(query, options);
	},	

});
