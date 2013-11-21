BetaJS.Class.extend("BetaJS.Databases.DatabaseTable", {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Databases.DatabaseTable, "constructor");
		this._database = database;
		this._table_name = table_name;
	},
	
	_encode: function (data) {
		return data;	
	},
	
	_decode: function (data) {
		return data;
	},

	_insertRow: function (row) {		
	},
	
	_removeRow: function (query) {		
	},
	
	_findOne: function (query, options) {
	},
	
	_updateRow: function (query, row) {
	},
	
	_find: function (query, options) {
	},

	insertRow: function (row) {
		return this._decode(this._insertRow(this._encode(row)));
	},
	
	removeRow: function (query) {
		return this._removeRow(this._encode(query));
	},
	
	findOne: function (query, options) {
		var result = this._findOne(this._encode(query), options);
		return !result ? null : this._decode(result);
	},
	
	updateRow: function (query, row) {
		return this._decode(this._updateRow(this._encode(query), this._encode(row)));
	},
	
	find: function (query, options) {
		var self = this;
		return new BetaJS.Iterators.MappedIterator(this._find(this._encode(query), options), function (row) {
			return self._decode(row);
		});
	},
	
	removeById: function (id) {
		return this.removeRow({id : id});
	},
	
	findById: function (id) {
		return this.findOne({id : id});
	},
	
	updateById: function (id, data) {
		return this.updateRow({id: id}, data);
	},
	
	ensureIndex: function (key) {}
	
});