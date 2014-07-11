BetaJS.Databases.DatabaseTable.extend("BetaJS.Databases.MongoDatabaseTable", {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Databases.MongoDatabaseTable, "constructor", database, table_name);
	},
	
	table_sync: function (callbacks) {
		return this.eitherSyncFactory("__table_sync", callbacks, function () {
			return this._database.mongodb_sync().getCollection(this._table_name);
		});		
	},
	
	table_async: function (callbacks) {
		var self = this;
		return this.eitherAsyncFactory("__table_async", callbacks, function () {
			this._database.mongodb_async(BetaJS.SyncAsync.mapSuccess(callbacks, function (db) {
				BetaJS.SyncAsync.callback(callbacks, "success", db.collection(self._table_name));
			}));
		});
	},
	
	table: function (callbacks) {
		return this.either(callbacks, this.table_sync, this.table_async);
	},
	
	_encode: function (data) {
		var obj = BetaJS.Objs.clone(data, 1);
		if ("id" in data) {
			delete obj["id"];
            var objid = this._database.mongo_object_id();
            obj._id = new objid(data.id);
		}
		return obj;
	},
	
	_decode: function (data) {
		var obj = BetaJS.Objs.clone(data, 1);
		if ("_id" in data) {
			delete obj["_id"];
			obj.id = data._id;
		}
		return obj;
	},

	_find: function (query, options, callbacks) {
		return this.then(this.table, callbacks, function (table, callbacks) {
			this.thenSingle(table, table.find, [query], callbacks, function (result, callbacks) {
				options = options || {};
				if ("sort" in options)
					result = result.sort(options.sort);
				if ("skip" in options)
					result = result.skip(options.skip);
				if ("limit" in options)
					result = result.limit(options.limit);
				this.thenSingle(result, result.toArray, callbacks, function (cols, callbacks) {
					BetaJS.SyncAsync.callback(callbacks, "success", new BetaJS.Iterators.ArrayIterator(cols));
				});
			});
		});
	},

	_insertRow: function (row, callbacks) {
		return this.then(this.table, callbacks, function (table, callbacks) {
			this.thenSingle(table, table.insert, [row], callbacks, function (result, callbacks) {
				callbacks.success(result[0] ? result[0] : result);
			});
		});
	},
	
	_removeRow: function (query, callbacks) {
		return this.then(this.table, callbacks, function (table, callbacks) {
			this.thenSingle(table, table.remove, [query], callbacks);
		});
	},
	
	_updateRow: function (query, row, callbacks) {
		return this.then(this.table, callbacks, function (table, callbacks) {
			this.thenSingle(table, table.update, [query, {"$set" : row}], callbacks, function (result, callbacks) {
				callbacks.success(row);
			});
		});
	},
		
	ensureIndex: function (key) {
		var obj = {};
		obj[key] = 1;
		this.table({
			success: function (table) {
				table.ensureIndex(obj, function () {
				});
			}
		});
	}	

});
