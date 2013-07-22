BetaJS.Stores.FullyCachedStore = BetaJS.Stores.BaseStore.extend("FullyCachedStore", {

	constructor: function (parent, full_data, options) {
		options = options || {};
		options.id_key = parent._id_key;
		this._inherited(BetaJS.Stores.FullyCachedStore, "constructor", options);
		this.__parent = parent;
		this.__cache = {};
		this.__cached = false;
		if (full_data)
			this.invalidate(full_data);
	},
	
	invalidate: function (full_data) {
		this.__cache = {};
		if (!full_data)
			full_data = this.__parent.query({});
		if (BetaJS.Types.is_array(full_data))
			full_data = new BetaJS.Iterators.ArrayIterator(full_data);
		while (full_data.hasNext()) {
			var row = full_data.next();
			this.__cache[row[this._id_key]] = row;
		}
		this.__cached = true;
	},

	_insert: function (data) {
		if (!this.__cached)
			this.invalidate({});
		var result = this.__parent.insert(data);
		if (result)
			this.__cache[data[this._id_key]] = data;
		return result;
	},
	
	_remove: function (id) {
		if (!this.__cached)
			this.invalidate({});
		var result = this.__parent.remove(id);
		if (result)
			delete this.__cache[id];
		return result;
	},
	
	_get: function (id) {
		if (!this.__cached)
			this.invalidate({});
		return this.__cache[id];
	},
	
	_update: function (id, data) {
		if (!this.__cached)
			this.invalidate({});
		var result = this.__parent.update(id, data);
		if (result)
			this.__cache[id] = BetaJS.Objs.extend(this.__cache[id], data);
		return result;
	},
	
	_query: function (query, options) {
		if (!this.__cached)
			this.invalidate({});
		return new BetaJS.Iterators.ArrayIterator(BetaJS.Objs.values(this.__cache));
	},	
	
});
