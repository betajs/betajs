BetaJS.Class.extend("BetaJS.Databases.DatabaseTable", [
	BetaJS.SyncAsync.SyncAsyncMixin, {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Databases.DatabaseTable, "constructor");
		this._database = database;
		this._table_name = table_name;
	},
	
	supportsSync: function () {
		return this._database.supportsSync();
	},
	
	supportsAsync: function () {
		return this._database.supportsAsync();
	},
	
	findOne: function (query, options, callbacks) {
		return this.then(this._findOne, [this._encode(query), options], callbacks, function (result, callbacks) {
			callbacks.success(!result ? null : this._decode(result));
		});
	},
	
	_findOne: function (query, options, callbacks) {
		options = options || {};
		options.limit = 1;
		return this.then(this._find, [query, options], callbacks, function (result, callbacks) {
			callbacks.success(result.next());
		});
	},
	
	_encode: function (data) {
		return data;	
	},
	
	_decode: function (data) {
		return data;
	},

	_find: function (query, options, callbacks) {
	},

	find: function (query, options, callbacks) {
		return this.then(this._find, [this._encode(query), options], callbacks, function (result, callbacks) {
			callbacks.success(new BetaJS.Iterators.MappedIterator(result, this._decode, this)); 
		});
	},
	
	findById: function (id, callbacks) {
		return this.findOne({id : id}, {}, callbacks);
	},
	
	_insertRow: function (row, callbacks) {		
	},
	
	_removeRow: function (query, callbacks) {		
	},
	
	_updateRow: function (query, row, callbacks) {
	},
	
	insertRow: function (row, callbacks) {
		return this.then(this._insertRow, [this._encode(row)], callbacks, function (result, callbacks) {
			callbacks.success(this._decode(result));
		});
	},
	
	removeRow: function (query, callbacks) {
		return this._removeRow(this._encode(query), callbacks);
	},
	
	updateRow: function (query, row, callbacks) {
		return this.then(this._decode, [this._encode(query), this._encode(row)], callbacks, function (result, callbacks) {
			callbacks.success(this._decode(result));
		});
	},
	
	removeById: function (id, callbacks) {
		return this.removeRow({id : id}, callbacks);
	},
	
	updateById: function (id, data, callbacks) {
		return this.updateRow({id: id}, data, callbacks);
	},
	
	ensureIndex: function (key) {}
	
}]);