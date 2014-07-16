BetaJS.Stores.DualStore.extend("BetaJS.Stores.CachedStore", {
	constructor: function (parent, options) {
		options = options || {};
		var cache_store = options.cache_store;
		if (!("cache_store" in options)) {
		    cache_store = this._auto_destroy(new BetaJS.Stores.MemoryStore({
                id_key: parent.id_key()
            }));
        }
        if (!cache_store.query_model())
            cache_store.query_model(options.cache_query_model ? options.cache_query_model : this._auto_destroy(new BetaJS.Queries.DefaultQueryModel()));
        this.__invalidation_options = options.invalidation || {};
		this._inherited(BetaJS.Stores.CachedStore, "constructor",
			parent,
			cache_store,
			BetaJS.Objs.extend({
				get_options: {
					start: "second",
					strategy: "or"
				},
				query_options: {
					start: "second",
					strategy: "or",
					clone: true,
					or_on_null: false
				}
			}, options));
	   if (this.__invalidation_options.reload_after_first_hit) {
	       this.__queries = {};
	       this.cache().on("query_hit", function (query, subsumizer) {
	           var s = BetaJS.Queries.Constrained.serialize(subsumizer);
	           if (!this.__queries[s]) {
	               this.__queries[s] = true;
	               BetaJS.SyncAsync.eventually(function () {
	                   this.invalidate_query(subsumizer, true);	                   
	               }, [], this);
	           }
	       }, this);
           this.cache().on("query_miss", function (query) {
               var s = BetaJS.Queries.Constrained.serialize(query);
               this.__queries[s] = true;
           }, this);
	   }
	},
	
	destroy: function () {
	    this.cache().off(null, null, this);
	    this._inherited(BetaJS.Stores.CachedStore, "destroy");    
	},
	
	invalidate_query: function (query, reload) {
	    this.cache().query_model().invalidate(query);
	    if (reload) {
	        if (this.supportsAsync())
	           this.query(query.query, query.options, {});
	        else
	           this.query(query.query, query.options);
	    }
        this.trigger("invalidate_query", query, reload);
	},
	
	cache: function () {
		return this.second();
	},
	
	store: function () {
		return this.first();
	}
});