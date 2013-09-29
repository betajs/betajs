BetaJS.Databases.DatabaseTable.extend("BetaJS.Databases.MongoDatabaseTable", {
	
	constructor: function (database, table_name) {
		this._inherited(BetaJS.Databases.MongoDatabaseTable, "constructor", database, table_name);
		this.__table = null;
	},
	
	table: function () {
		if (!this.__table)
			this.__table = this._database.mongodb().getCollection(this._table_name);
		return this.__table;
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

	_insertRow: function (row) {
		return this.table().insert(row);
	},
	
	_removeRow: function (query) {
		return this.table().remove(query);	
	},
	
	_findOne: function (query, options) {
		options = options || {};
		options.limit = 1;
		var result = this._find(query, options);
		return result.next();
	},
	
	_updateRow: function (query, row) {
		var result = this.table().update(query, {"$set" : row}, true, false);
		return row;
	},
	
	_find: function (query, options) {
		options = options || {};
		var result = this.table().find(query);
		if ("sort" in options)
			result = result.sort(options.sort);
		if ("skip" in options)
			result = result.skip(options.skip);
		if ("limit" in options)
			result = result.limit(options.limit);
		return new BetaJS.Iterators.ArrayIterator(result.toArray());
	},
	
	ensureIndex: function (key) {
		var obj = {};
		obj[key] = 1;
		return this.table().ensureIndex(obj);
	}	

});
