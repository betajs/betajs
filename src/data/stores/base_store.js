BetaJS.Exceptions.Exception.extend("BetaJS.Stores.StoreException");


/** @class */
BetaJS.Stores.BaseStore = BetaJS.Class.extend("BetaJS.Stores.BaseStore", [
	BetaJS.Events.EventsMixin,
	/** @lends BetaJS.Stores.BaseStore.prototype */
	{
		
	constructor: function (options) {
		this._inherited(BetaJS.Stores.BaseStore, "constructor");
		options = options || {};
		this._id_key = options.id_key || "id";
		this._create_ids = options.create_ids || false;
		this._last_id = 1;
		this._async_write = "async_write" in options ? options.async_write : false;
		this._async_write = this._async_write && this._supports_async_write();
		this._async_read = "async_read" in options ? options.async_read : false;
		this._async_read = this._async_read && this._supports_async_read();
	},
	
	id_key: function () {
		return this._id_key;
	},
	
	_supports_async_read: function () {
		return false;
	},
	
	async_read: function () {
		return this._async_read;
	},
			
	_supports_async_write: function () {
		return false;
	},
	
	async_write: function () {
		return this._async_write;
	},

	/** Insert data to store. Return inserted data with id.
	 * 
 	 * @param data data to be inserted
 	 * @return data that has been inserted with id.
 	 * @exception if it fails
	 */
	_insert: function (data, callbacks) {
	},
	
	/** Remove data from store. Return removed data.
	 * 
 	 * @param id data id
 	 * @exception if it fails
	 */
	_remove: function (id, callbacks) {
	},
	
	/** Get data from store by id.
	 * 
	 * @param id data id
	 * @return data
	 * @exception if it fails
	 */
	_get: function (id, callbacks) {
	},
	
	/** Update data by id.
	 * 
	 * @param id data id
	 * @param data updated data
	 * @return data from store
	 * @exception if it fails
	 */
	_update: function (id, data, callbacks) {
	},
	
	_query_capabilities: function () {
		return {};
	},
	
	/*
	 * @exception if it fails
	 */
	_query: function (query, options, callbacks) {
	},
	
	_new_id: function (callbacks) {
	},

	insert: function (data, callbacks) {
		if (this._create_ids && !(this._id_key in data && data[this._id_key])) {
			if (this._async_write)
				throw new BetaJS.Stores.StoreException("Unsupported Creation of Ids");
			while (this.get(this._last_id))
				this._last_id++;
			data[this._id_key] = this._last_id;
		}
		var self = this;
		var success_call = function (row) {
			self.trigger("insert", row);
			if (callbacks && callbacks.success)
				callbacks.success(row);
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception(e);
			else
				throw e;
		};
		if (this._async_write)
			this._insert(data, {success: success_call, exception: exception_call});
		else
			try {
				var row = this._insert(data);
				success_call(row);
				return row;
			} catch (e) {
				exception_call(e);
			}
		return null;
	},
	
	insert_all: function (data) {
		if (this._async_write) {
			var i = -1;
			var self = this;
			var success = function () {
				i++;
				if (i < data.length)
					self.insert(data[i], {success: success});
			};
			success();
		} else {
			var result = true;
			BetaJS.Objs.iter(data, function (obj) {
				result = result && this.insert(obj);
			}, this);
			return result;
		}
		return null;
	},

	remove: function (id, callbacks) {
		var self = this;
		var success_call = function () {
			self.trigger("remove", id);
			if (callbacks && callbacks.success)
				callbacks.success(id);
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception(e);
			else
				throw e;
		};
		if (this._async_write)
			this._remove(id, {success: success_call, exception: exception_call});
		else
			try {
				this._remove(id);
				success_call();
			} catch (e) {
				exception_call(e);
			}
	},
	
	get: function (id, callbacks) {
		var self = this;
		var success_call = function (row) {
			if (callbacks && callbacks.success)
				callbacks.success(row);
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception(e);
			else
				throw e;
		};
		if (this._async_read)
			this._get(id, {success: success_call, exception: exception_call});
		else
			try {
				var row = this._get(id);
				success_call(row);
				return row;
			} catch (e) {
				exception_call(e);
			}
		return null;
	},
	
	update: function (id, data, callbacks) {
		var self = this;
		var success_call = function (row) {
			self.trigger("update", row, data);
			if (callbacks && callbacks.success)
				callbacks.success(row, data);
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception(e);
			else
				throw e;
		};
		if (this._async_write)
			this._update(id, data, {success: success_call, exception: exception_call});
		else
			try {
				var row = this._update(id, data);
				success_call(row);
				return row;
			} catch (e) {
				exception_call(e);
			}
		return null;
	},
	
	query: function (query, options, callbacks) {
		return BetaJS.Queries.Constrained.emulate(
			BetaJS.Queries.Constrained.make(query, options || {}),
			this._query_capabilities(),
			this._query,
			this,
			callbacks); 
	},
	
	_query_applies_to_id: function (query, id) {
		var row = this.get(id);
		return row && BetaJS.Queries.overloaded_evaluate(query, row);
	},
	
	clear: function () {
		var iter = this.query({});
		while (iter.hasNext())
			this.remove(iter.next().id);
	},
	
	_ensure_index: function (key) {
	},
	
	ensure_index: function (key) {
		this._ensure_index(key);
	}

}]);
