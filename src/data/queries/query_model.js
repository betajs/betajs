BetaJS.Class.extend("BetaJS.Queries.AbstractQueryModel", {
	
	register: function (query) {
	},
	
	executable: function (query) {
	}
	
});


BetaJS.Queries.AbstractQueryModel.extend("BetaJS.Queries.DefaultQueryModel", {

	constructor: function () {
		this._inherited(BetaJS.Queries.DefaultQueryModel, "constructor");
        this.__queries = {};    
	},
	
	_insert: function (query) {
		this.__queries[BetaJS.Queries.Constrained.serialize(query)] = query;
	},
	
	_remove: function (query) {
		delete this.__queries[BetaJS.Queries.Constrained.serialize(query)];
	},
	
	exists: function (query) {
		return BetaJS.Queries.Constrained.serialize(query) in this.__queries;
	},
	
	subsumizer_of: function (query) {
        if (this.exists(query))
            return query;
        var result = null;
        BetaJS.Objs.iter(this.__queries, function (query2) {
            if (BetaJS.Queries.Constrained.subsumizes(query2, query))
                result = query2;
            return !result;
        }, this);
        return result;
	},
	
	executable: function (query) {
	    return !!this.subsumizer_of(query);
	},
	
	register: function (query) {
		var changed = true;
		while (changed) {
			changed = false;
			BetaJS.Objs.iter(this.__queries, function (query2) {
				if (BetaJS.Queries.Constrained.subsumizes(query, query2)) {
					this._remove(query2);
					changed = true;
				}/* else if (BetaJS.Queries.Constrained.mergable(query, query2)) {
					this._remove(query2);
					changed = true;
					query = BetaJS.Queries.Constrained.merge(query, query2);
				} */
			}, this);
		}
		this._insert(query);
	},
	
	invalidate: function (query) {
	    var subsumizer = this.subsumizer_of(query);
	    if (subsumizer)
	       this._remove(subsumizer);
	}
	
});


BetaJS.Queries.DefaultQueryModel.extend("BetaJS.Queries.StoreQueryModel", {
	
	constructor: function (store) {
        this.__store = store;
		this._inherited(BetaJS.Queries.StoreQueryModel, "constructor");
	},
	
	initialize: function (callbacks) {
		this.__store.query({}, {}, {
		    context: this,
			success: function (result) {
				while (result.hasNext()) {
					var query = result.next();
					delete query["id"];
                    this._insert(query);
				}
				BetaJS.SyncAsync.callback(callbacks, "success");
			}, exception: function (err) {
			    BetaJS.SyncAsync.callback(callbacks, "exception", err);
			}
		});
	},
	
	_insert: function (query) {
		this._inherited(BetaJS.Queries.StoreQueryModel, "_insert", query);
		this.__store.insert(query, {});
	},
	
	_remove: function (query) {
		delete this.__queries[BetaJS.Queries.Constrained.serialize(query)];
		this.__store.query({query: query}, {}, {
		    context: this,
			success: function (result) {
				while (result.hasNext())
					this.__store.remove(result.next().id, {});
			}
		});
	}

});
