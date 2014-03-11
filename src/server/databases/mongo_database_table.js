BetaJS.Databases.DatabaseTable.extend("BetaJS.Databases.MongoDatabaseTable", {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Databases.MongoDatabaseTable, "constructor", database, table_name);
		this.__table = null;
	},
	
	_syncType: function (defasync) {
		return this.isSync() ? BetaJS.SyncAsync.SYNC : (defasync ? BetaJS.SyncAsync.ASYNC : BetaJS.SyncAsync.ASYNCSINGLE);
	},
	
	table: function (callbacks) {
		return this.eitherFactory("__table", callbacks, function () {
			return this._database.mongodb().getCollection(this._table_name);
		}, function () {
			this._database.mongodb({
				context: this,
				success: function (db) {
					callbacks.success(db.collection(this._table_name));
				},
				failure: callbacks.failure
			});
		});
	},
	
	_encode: function (data) {
		var obj = BetaJS.Objs.clone(data, 1);
		if ("id" in data) {
			delete obj["id"];
			obj._id = data.id;
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
					callbacks.success(new BetaJS.Iterators.ArrayIterator(cols));
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
			this.thenSingle(table, table.update, [query, {"$set" : row}, true, false], callbacks, function (result, callbacks) {
				callbacks.success(row);
			});
		});
	},
		
	ensureIndex: function (key) {
		var obj = {};
		obj[key] = 1;
		return this.table().ensureIndex(obj);
	}	

});
