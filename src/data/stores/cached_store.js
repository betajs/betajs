BetaJS.Stores.CachedStore = BetaJS.Stores.BaseStore.extend("CachedStore", {
	
	constructor: function (parent) {
		this._inherited(BetaJS.Stores.CachedStore, "constructor");
		this.__parent = parent;
		this.__cache = [];
	},

	_insert: function (data) {
		var row = this.__parent._insert(data);
		if (row)
			this.__cache[row.id] = {
				data: row,
				exists: true
			}
		return row;
	},
	
	_remove: function (id) {
		if (!(id in this._cache))
			this.__cache[id] = {};		
		this.__cache[id].exists = false;
		return this.__parent._remove(id);
	},
	
	_get: function (id) {
		if (id in this.__cache)
			return this.__cache[id].exists;
		var data = this.__parent.get(id);
		if (data)
			this.__cache[id] = {
				exists: true,
				data: data
			}
		else
			this.__cache[id] = {
				exists: false
			};
		return data; 
	},
	
	_update: function (id, data) {
		var row = this.__parent.update(id, data);
		if (row)
			this.__cache[id] = {
				exists: true,
				data: data
			};
		return row;
	},
	
	invalidate: function (id) {
		delete this.__cache[id];
	},
	
	_query: function (query, options) {
		return this.__parent.query(query, options);
	}
	
});
