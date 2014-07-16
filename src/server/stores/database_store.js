BetaJS.Stores.BaseStore.extend("BetaJS.Stores.DatabaseStore", {
	
	constructor: function (database, table_name, foreign_id) {
		this._inherited(BetaJS.Stores.DatabaseStore, "constructor");
		this.__database = database;
		this.__table_name = table_name;
		this.__table = null;
		this.__foreign_id = foreign_id;
	},
	
	table: function () {
		if (!this.__table)
			this.__table = this.__database.getTable(this.__table_name);
		return this.__table;
	},
	
	_insert: function (data, callbacks) {
	    if (!this.__foreign_id || !data[this.__foreign_id])
	        return this.table().insertRow(data, callbacks);
        var query = {};
        query[this.__foreign_id] = data[this.__foreign_id];
	    return this.table().findOne(query, {}, {
	        context: this,
	        success: function (result) {
	            if (result)
	                return BetaJS.SyncAsync.callback(callbacks, "success", result);
                return this.table().insertRow(data, callbacks);
	        }, exception: function (e) {
	            BetaJS.SyncAsync.callback(callbacks, "exception", e);    
	        }
	    });
	},
	
	_remove: function (id, callbacks) {
	    if (!this.__foreign_id)
		    return this.table().removeById(id, callbacks);
		var query = {};
		query[this.__foreign_id] = id;
		return this.table().removeRow(query, callbacks);
	},
	
	_get: function (id, callbacks) {
        if (!this.__foreign_id)
    		return this.table().findById(id, callbacks);
        var query = {};
        query[this.__foreign_id] = id;
	    return this.table().findOne(query, {}, callbacks);
	},
	
	_update: function (id, data, callbacks) {
        if (!this.__foreign_id)
    		return this.table().updateById(id, data, callbacks);
        var query = {};
        query[this.__foreign_id] = id;
        return this.updateRow(query, data, callbacks);
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
