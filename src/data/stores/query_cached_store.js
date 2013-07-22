BetaJS.Stores.QueryCachedStore = BetaJS.Stores.BaseStore.extend("QueryCachedStore", {

	constructor: function (parent, options) {
		options = options || {};
		options.id_key = parent._id_key;
		this._inherited(BetaJS.Stores.QueryCachedStore, "constructor", options);
		this.__parent = parent;
		this.__cache = {};
		this.__queries = {};
	},
	
	invalidate: function () {
		this.__cache = {};
		this.__queries = {};
	},

	_insert: function (data) {
		var result = this.__parent.insert(data);
		if (result)
			this.__cache[data[this._id_key]] = data;
		return result;
	},
	
	_remove: function (id) {
		var result = this.__parent.remove(id);
		if (result)
			delete this.__cache[id];
		return result;
	},
	
	_update: function (id, data) {
		var result = this.__parent.update(id, data);
		if (result)
			this.__cache[id] = BetaJS.Objs.extend(this.__cache[id], data);
		return result;
	},
	
	_get: function (id) {
		if (!(id in this.__cache))
			this.__cache[id] = this.__parent.get(id);
		return this.__cache[id];
	},
	
	_query_capabilities: function () {
		return this.__parent._query_capabilities();
	},

	_query: function (query, options) {
		var constrained = BetaJS.Queries.Constrained.make(query, options);
		var encoded = BetaJS.Queries.Constrained.format(constrained);
		if (encoded in this.__queries)
			return new BetaJS.Iterators.ArrayIterator(BetaJS.Objs.values(this.__queries[encoded]));
		var result = this.__parent.query(query, options).asArray();
		this.__queries[encoded] = {};
		for (var i = 0; i < result.length; ++i) {
			this.__cache[result[i][this._id_key]] = result[i];
			this.__queries[encoded][result[i][this._id_key]] = result[i];
		}
		return new BetaJS.Iterators.ArrayIterator(result);
	},
	
	cache: function (query, options, result) {
		var constrained = BetaJS.Queries.Constrained.make(query, options);
		var encoded = BetaJS.Queries.Constrained.format(constrained);
		this.__queries[encoded] = {};
		for (var i = 0; i < result.length; ++i) {
			this.__cache[result[i][this._id_key]] = result[i];
			this.__queries[encoded][result[i][this._id_key]] = result[i];
		}
	}
	
});
