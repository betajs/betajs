BetaJS.Class.extend("BetaJS.Queries.AbstractQueryModel", {
	
	register: function (query) {
	},
	
	executable: function (query) {
	}
	
});


BetaJS.Queries.AbstractQueryModel.extend("BetaJS.Queries.DefaultQueryModel", {

	__queries: {},
	
	constructor: function () {
		this._inherited(BetaJS.Queries.DefaultQueryModel, "constructor");
		this._initialize(this.__queries);
	},
	
	_initialize: function (queries) {},
	
	_insert: function (query) {
		this.__queries[BetaJS.Queries.Constrained.serialize(query)] = query;
	},
	
	_remove: function (query) {
		delete this.__queries[BetaJS.Queries.Constrained.serialize(query)];
	},
	
	exists: function (query) {
		return BetaJS.Queries.Constrained.serialize(query) in this.__queries;
	},
	
	executable: function (query) {
		if (this.exists(query))
			return true;
		var result = false;
		BetaJS.Objs.iter(this.__queries, function (query2) {
			result = BetaJS.Queries.Constrained.subsumizes(query2, query);
			return !result;
		}, this);
		return result;
	},
	
	register: function (query) {
		var changed = true;
		while (changed) {
			changed = false;
			BetaJS.Objs.iter(this.__queries, function (query2) {
				if (BetaJS.Queries.Constrained.subsumizes(query, query2)) {
					this._remove(query2);
					changed = true;
				} else if (BetaJS.Queries.Constrained.mergable(query, query2)) {
					this._remove(query2);
					changed = true;
					query = BetaJS.Queries.Constrained.merge(query, query2);
				}
			}, this);
		}
		this._insert(query);
	}	
	
});


BetaJS.Queries.DefaultQueryModel.extend("BetaJS.Queries.StoreQueryModel", {
	
	constructor: function (store) {
		this._inherited(BetaJS.Queries.StoreQueryModel, "constructor");
		this.__store = store;
	},
	
	_initialize: function (queries) {
		this.__store.query({}, {}, {
			success: function (result) {
				while (result.hasNext()) {
					var query = result.next();
					queries[BetaJS.Queries.Constrained.serialize(query)] = query;
				}
			}
		});
	},
	
	_insert: function (query) {
		this._inherited("_insert", query);
		this.__store.insert(query, {});
	},
	
	_remove: function (query) {
		delete this.__queries[BetaJS.Queries.Constrained.serialize(query)];
		this.__store.query({query: query}, {}, {
			success: function (result) {
				while (result.hasNext())
					this.__store.remove(result.next().id, {});
			}
		});
	}

});
