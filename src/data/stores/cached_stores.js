BetaJS.Stores.StoreException.extend("BetaJS.Stores.StoreCacheException");

BetaJS.Stores.DualStore.extend("BetaJS.Stores.FullyCachedStore", {
	constructor: function (parent, options) {
		options = options || {};
		this._inherited(BetaJS.Stores.FullyCachedStore, "constructor",
			parent,
			new BetaJS.Stores.MemoryStore({id_key: parent.id_key()}),
			BetaJS.Objs.extend({
				get_options: {
					start: "second",
					strategy: "single"
				},
				query_options: {
					start: "second",
					strategy: "single"
				}
			}, options));
	},
	
	cache: function () {
		return this.second();
	},
	
	store: function () {
		return this.first();
	}
});


BetaJS.Stores.MemoryStore.extend("BetaJS.Stores.QueryCachedInnerStore", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.QueryCachedInnerStore, "constructor", options);
		this.__queries = {};
	},
	
	_query_capabilities: function () {
		return {
			"query": true,
			"sort": true,
			"limit": true,
			"skip": true
		};
	},

	_query: function (query, options) {
		var constrained = BetaJS.Queries.Constrained.make(query, options);
		var encoded = BetaJS.Queries.Constrained.format(constrained);
		if (encoded in this.__queries)
			return new BetaJS.Iterators.ArrayIterator(BetaJS.Objs.values(this.__queries[encoded]));
		throw new BetaJS.Stores.StoreCacheException();
	},
	
	cache_query: function (query, options, result) {
		var constrained = BetaJS.Queries.Constrained.make(query, options);
		var encoded = BetaJS.Queries.Constrained.format(constrained);
		this.__queries[encoded] = {};
		for (var i = 0; i < result.length; ++i) {
			var row = result[i];
			this.insert(row);
			this.__queries[encoded][row[this.id_key()]] = row;
		}
	},
	
	insert: function (row, callbacks) {
		this.trigger("cache", row);
		return this._inherited(BetaJS.Stores.QueryCachedInnerStore, "insert", row, callbacks);
	}
	
});


BetaJS.Stores.DualStore.extend("BetaJS.Stores.QueryCachedStore", {
	constructor: function (parent, options) {
		options = options || {};
		this._inherited(BetaJS.Stores.QueryCachedStore, "constructor",
			parent,
			new BetaJS.Stores.QueryCachedInnerStore({id_key: parent.id_key()}),
			BetaJS.Objs.extend({
				get_options: {
					start: "second",
					strategy: "or",
				},
				query_options: {
					start: "second",
					strategy: "or",
					clone: false,
					or_on_null: false
				}
			}, options));
	},
	
	cache: function () {
		return this.second();
	},
	
	store: function () {
		return this.first();
	}
});