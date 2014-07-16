BetaJS.Exceptions.Exception.extend("BetaJS.Stores.StoreException");

BetaJS.Class.extend("BetaJS.Stores.ListenerStore", [
	BetaJS.Events.EventsMixin,
	{
		
	constructor: function (options) {
		this._inherited(BetaJS.Stores.ListenerStore, "constructor");
		options = options || {};
		this._id_key = options.id_key || "id";
	},

	id_key: function () {
		return this._id_key;
	},
	
	_inserted: function (row, event_data) {
		this.trigger("insert", row, event_data);		
	},
	
	_removed: function (id, event_data) {
		this.trigger("remove", id, event_data);		
	},
	
	_updated: function (row, data, event_data) {
		this.trigger("update", row, data, event_data);		
	} 
		
}]);



/** @class */
BetaJS.Stores.BaseStore = BetaJS.Stores.ListenerStore.extend("BetaJS.Stores.BaseStore", [
	BetaJS.SyncAsync.SyncAsyncMixin,
	/** @lends BetaJS.Stores.BaseStore.prototype */
	{
		
	constructor: function (options) {
		this._inherited(BetaJS.Stores.BaseStore, "constructor", options);
		options = options || {};
		this._id_key = options.id_key || "id";
		this._create_ids = options.create_ids || false;
		this._last_id = 1;
		this._supportsSync = true;
		this._supportsAsync = true;
		this._query_model = "query_model" in options ? options.query_model : null;
	},
	
    query_model: function () {
        if (arguments.length > 0)
            this._query_model = arguments[0];
        return this._query_model;
    },
    
	/** Insert data to store. Return inserted data with id.
	 * 
 	 * @param data data to be inserted
 	 * @return data that has been inserted with id.
 	 * @exception if it fails
	 */
	_insert: function (data, callbacks) {
		throw new BetaJS.Stores.StoreException("unsupported: insert");
	},
	
	/** Remove data from store. Return removed data.
	 * 
 	 * @param id data id
 	 * @exception if it fails
	 */
	_remove: function (id, callbacks) {
		throw new BetaJS.Stores.StoreException("unsupported: remove");
	},
	
	/** Get data from store by id.
	 * 
	 * @param id data id
	 * @return data
	 * @exception if it fails
	 */
	_get: function (id, callbacks) {
		throw new BetaJS.Stores.StoreException("unsupported: get");
	},
	
	/** Update data by id.
	 * 
	 * @param id data id
	 * @param data updated data
	 * @return data from store
	 * @exception if it fails
	 */
	_update: function (id, data, callbacks) {
		throw new BetaJS.Stores.StoreException("unsupported: update");
	},
	
	_query_capabilities: function () {
		return {};
	},
	
	/*
	 * @exception if it fails
	 */
	_query: function (query, options, callbacks) {
		throw new BetaJS.Stores.StoreException("unsupported: query");
	},
	
	_new_id: function (callbacks) {
	},

	insert: function (data, callbacks) {
		var event_data = null;
		if (BetaJS.Types.is_array(data)) {
			event_data = data[1];
			data = data[0];
		}			
		if (this._create_ids && !(this._id_key in data && data[this._id_key])) {
			while (this.get(this._last_id))
				this._last_id++;
			data[this._id_key] = this._last_id;
		}
		return this.then(this._insert, [data], callbacks, function (row, callbacks) {
			this._inserted(row, event_data);
			BetaJS.SyncAsync.callback(callbacks, "success", row);
		});
	},
	
	insert_all: function (data, callbacks, query) {
		var event_data = null;
		if (arguments.length > 3)
			event_data = arguments[3];
		if (query && this._query_model) {
			this.trigger("query_register", query);
			this._query_model.register(query);
		}
		if (callbacks) {
			var self = this;
			var f = function (i) {
				if (i >= data.length) {
					BetaJS.SyncAsync.callback(callbacks, "success");
					return;
				}
				this.insert(event_data ? [data[i], event_data] : data[i], BetaJS.SyncAsync.mapSuccess(callbacks, function () {
					f.call(self, i + 1);
				}));
			};
			f.call(this, 0);
		} else {
			for (var i = 0; i < data.length; ++i)
				this.insert(event_data ? [data[i], event_data] : data[i]);
		}
	},

	remove: function (id, callbacks) {
		var event_data = null;
		if (BetaJS.Types.is_array(id)) {
			event_data = id[1];
			id = id[0];
		}			
		return this.then(this._remove, [id], callbacks, function (result, callbacks) {
			this._removed(id, event_data);
			BetaJS.SyncAsync.callback(callbacks, "success", id);
		});
	},
	
	get: function (id, callbacks) {
		return this.delegate(this._get, [id], callbacks);
	},
	
	update: function (id, data, callbacks) {
		var event_data = null;
		if (BetaJS.Types.is_array(data)) {
			event_data = data[1];
			data = data[0];
		}			
		return this.then(this._update, [id, data], callbacks, function (row, callbacks) {
			this._updated(row, data, event_data);
			BetaJS.SyncAsync.callback(callbacks, "success", row, data);
		});
	},
	
	query: function (query, options, callbacks) {
		if (options) {
			if (options.limit)
				options.limit = parseInt(options.limit, 10);
			if (options.skip)
				options.skip = parseInt(options.skip, 10);
		}
		if (this._query_model) {
		    var subsumizer = this._query_model.subsumizer_of({query: query, options: options});
    		if (!subsumizer) {
    			this.trigger("query_miss", {query: query, options: options});
    			var e = new BetaJS.Stores.StoreException("Cannot execute query");
    			if (callbacks)
    			    BetaJS.SyncAsync.callback(callbacks, "exception", e);
    			else
    				throw e;
    			return null;
    		} else
    		    this.trigger("query_hit", {query: query, options: options}, subsumizer);
		}
		var q = function (callbacks) {
			return BetaJS.Queries.Constrained.emulate(
				BetaJS.Queries.Constrained.make(query, options || {}),
				this._query_capabilities(),
				this._query,
				this,
				callbacks);			
		};
		return this.either(callbacks, q, q);
	},
	
	_query_applies_to_id: function (query, id) {
		var row = this.get(id);
		return row && BetaJS.Queries.overloaded_evaluate(query, row);
	},
	
	clear: function (callbacks) {
		return this.then(this.query, [{}, {}], callbacks, function (iter, callbacks) {
			var promises = [];
			while (iter.hasNext())
				promises.push(this.remove, [iter.next().id]);
			return this.join(promises, callbacks);
		});
	},
	
	_ensure_index: function (key) {
	},
	
	ensure_index: function (key) {
		this._ensure_index(key);
	},
	
	perform: function (commit, callbacks) {
		var action = BetaJS.Objs.keyByIndex(commit);
		var data = BetaJS.Objs.valueByIndex(commit);
		if (action == "insert")
			this.insert(data, callbacks);
		else if (action == "remove")
			this.remove(data, callbacks);
		else if (action == "update")
			this.update(BetaJS.Objs.keyByIndex(data), BetaJS.Objs.valueByIndex(data), callbacks);
		else
			throw new BetaJS.Stores.StoreException("unsupported: perform " + action);
	},
	
	bulk: function (commits, optimistic, callbacks) {
		var result = [];
		if (callbacks) {
			var helper = function () {
				if (result.length < commits.length) {
					this.perform(commits[result.length], {
						context: this,
						success: function () {
							result.push(true);
							helper.apply(this);
						},
						exception: function (e) {
							result.push(false);
							if (optimistic)
								helper.apply(this);
							else
								callbacks.exception.apply(callbacks.context || this, e);
						}
					});
				} else
					callbacks.success.call(callbacks.context || this, result);
			};
			helper.apply(this);
		} else {
			for (var i = 0; i < commits.length; ++i) {
				try {
					this.perform(commits[i]);
					result.push(true);
				} catch (e) {
					result.push(false);
					if (!optimistic)
						throw e;
				}
			}
		}
		return result;
	}	

}]);
