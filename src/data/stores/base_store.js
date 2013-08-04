BetaJS.Stores = BetaJS.Stores || {};


BetaJS.Stores.StoreException = BetaJS.Exceptions.Exception.extend("StoreException");


/** @class */
BetaJS.Stores.BaseStore = BetaJS.Class.extend("BaseStore", [
	BetaJS.Events.EventsMixin,
	/** @lends BetaJS.Stores.BaseStore.prototype */
	{
		
	constructor: function (options) {
		this._inherited(BetaJS.Stores.BaseStore, "constructor");
		options = options || {};
		this._id_key = options.id_key || "id";
		this._create_ids = options.create_ids || false;
		this._last_id = 1;
	},
			
	/** Insert data to store. Return inserted data with id.
	 * 
 	 * @param data data to be inserted
 	 * @return data that has been inserted with id.
	 */
	_insert: function (data) {
	},
	
	/** Remove data from store. Return removed data.
	 * 
 	 * @param id data id
 	 * @return data
	 */
	_remove: function (id) {
	},
	
	/** Get data from store by id.
	 * 
	 * @param id data id
	 * @return data
	 */
	_get: function (id) {
	},
	
	/** Update data by id.
	 * 
	 * @param id data id
	 * @param data updated data
	 * @return data from store
	 */
	_update: function (id, data) {
	},
	
	_query_capabilities: function () {
		return {};
	},
	
	_query: function (query, options) {
	},	
	
	insert: function (data) {
		if (this._create_ids) {
			if (this._id_key in data) {
				if (this.get(data[this._id_key]))
					return null;
			} else {
				while (this.get(this._last_id))
					this._last_id++;
				data[this._id_key] = this._last_id;
			}
		}
		var row = this._insert(data);
		if (row)
			this.trigger("insert", row)
		return row;
	},
	
	remove: function (id) {
		var row = this._remove(id);
		if (row)
			this.trigger("remove", id);
		return row;
	},
	
	get: function (id) {
		return this._get(id);
	},
	
	update: function (id, data) {
		var row = this._update(id, data);
		if (row)
			this.trigger("update", row, data);
		return row;
	},
	
	query: function (query, options) {
		return BetaJS.Queries.Constrained.emulate(
			BetaJS.Queries.Constrained.make(query || {}, options || {}),
			this._query_capabilities(),
			this._query,
			this
		); 
	},
	
	_query_applies_to_id: function (query, id) {
		var row = this.get(id);
		return row && BetaJS.Queries.overloaded_evaluate(query, row);
	},
	
	clear: function () {
		var iter = this.query({});
		while (iter.hasNext())
			this.remove(iter.next().id);
	}

}]);
