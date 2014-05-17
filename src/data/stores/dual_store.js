BetaJS.Stores.BaseStore.extend("BetaJS.Stores.DualStore", {
	
	constructor: function (first, second, options) {
		options = BetaJS.Objs.extend({
			create_options: {},
			update_options: {},
			delete_options: {},
			get_options: {},
			query_options: {}
		}, options || {});
		options.id_key = first._id_key;
		this.__first = first;
		this.__second = second;
		this._inherited(BetaJS.Stores.DualStore, "constructor", options);
		this._supportsSync = first.supportsSync() && second.supportsSync();
		this._supportsAsync = first.supportsAsync() || second.supportsAsync();
		this.__create_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then", // "or", "single"
			auto_replicate: "first" // "first", "second", "both", "none"
		}, options.create_options);
		this.__update_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then", // "or", "single"
			auto_replicate: "first" // "first", "second", "both", "none"
		}, options.update_options);
		this.__remove_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then", // "or", "single",
			auto_replicate: "first" // "first", "second", "both", "none"
		}, options.delete_options);
		this.__get_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "or", // "single"
			clone: true, // false
			clone_second: false,
			or_on_null: true // false
		}, options.get_options);
		this.__query_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "or", // "single"
			clone: true, // false
			clone_second: false,
			or_on_null: true // false
		}, options.query_options);
		this.__first.on("insert", this.__inserted_first, this);
		this.__second.on("insert", this.__inserted_second, this);
		this.__first.on("update", this.__updated_first, this);
		this.__second.on("update", this.__updated_second, this);
		this.__first.on("remove", this.__removed_first, this);
		this.__second.on("remove", this.__removed_second, this);
	},
	
	__inserted_first: function (row, event_data) {
		if (event_data && event_data.dual_insert)
			return;
		if (this.__create_options.auto_replicate == "first" || this.__create_options.auto_replicate == "both")
			this.__second.insert([row, {dual_insert: true}], {});
		this._inserted(row);
	},
	
	__inserted_second: function (row, event_data) {
		if (event_data && event_data.dual_insert)
			return;
		if (this.__create_options.auto_replicate == "second" || this.__create_options.auto_replicate == "both")
			this.__first.insert([row, {dual_insert: true}], {});
		this._inserted(row);
	},

	__updated_first: function (row, update, event_data) {
		if (event_data && event_data.dual_update)
			return;
		if (this.__update_options.auto_replicate == "first" || this.__update_options.auto_replicate == "both")
			this.__second.update(row[this.id_key()], [update, {dual_update: true}], {});
		this._updated(row, update);
	},
	
	__updated_second: function (row, update, event_data) {
		if (event_data && event_data.dual_update)
			return;
		if (this.__update_options.auto_replicate == "second" || this.__update_options.auto_replicate == "both")
			this.__first.update(row[this.id_key()], [update, {dual_update: true}], {});
		this._updated(row, update);
	},

	__removed_first: function (id, event_data) {
		if (event_data && event_data.dual_remove)
			return;
		if (this.__remove_options.auto_replicate == "first" || this.__remove_options.auto_replicate == "both")
			this.__second.remove([id, {dual_remove: true}], {});
		this._removed(id);
	},
	
	__removed_second: function (id, event_data) {
		if (event_data && event_data.dual_remove)
			return;
		if (this.__remove_options.auto_replicate == "second" || this.__remove_options.auto_replicate == "both")
			this.__first.remove([id, {dual_remove: true}], {});
		this._removed(id);
	},

	first: function () {
		return this.__first;
	},
	
	second: function () {
		return this.__second;
	},

	_insert: function (data, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__create_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__create_options.strategy;
		if (callbacks) {
			if (strategy == "then")
				first.insert([data, {dual_insert: true}], {
					success: function (row) {
						second.insert([row, {dual_insert: true}], callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				return first.insert([data, {dual_insert: true}], {
					success: callbacks.success,
					exception: function () {
						second.insert([data, {dual_insert: true}], callbacks);
					}
				});
			else
				first.insert([data, {dual_insert: true}], callbacks);
		} else {
			if (strategy == "then")
				return second.insert([first.insert([data, {dual_insert: true}]), {dual_insert: true}]);
			else if (strategy == "or")
				try {
					return first.insert([data, {dual_insert: true}]);
				} catch (e) {
					return second.insert([data, {dual_insert: true}]);
				}
			else
				return first.insert([data, {dual_insert: true}]);
		}
		return true;
	},

	_update: function (id, data, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__update_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__update_options.strategy;
		if (callbacks) {
			if (strategy == "then")
				first.update(id, [data, {dual_update: true}], {
					success: function (row) {
						second.update(id, [row, {dual_update: true}], callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				return first.update(id, [data, {dual_update: true}], {
					success: callbacks.success,
					exception: function () {
						second.update(id, [data, {dual_update: true}], callbacks);
					}
				});
			else
				first.update(id, [data, {dual_update: true}], callbacks);
		} else {
			if (strategy == "then")
				return second.update(id, [first.update(id, [data, {dual_update: true}]), {dual_update: true}]);
			else if (strategy == "or")
				try {
					return first.update(id, [data, {dual_update: true}]);
				} catch (e) {
					return second.update(id, [data, {dual_update: true}]);
				}
			else
				return first.update(id, [data, {dual_update: true}]);
		}
		return true;
	},

	_remove: function (id, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__remove_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__remove_options.strategy;
		if (callbacks) {
			if (strategy == "then")
				first.remove([id, {dual_remove: true}], {
					success: function () {
						second.remove([id, {dual_remove: true}], callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				first.remove([id, {dual_remove: true}], {
					success: callbacks.success,
					exception: function () {
						second.remove([id, {dual_remove: true}], callbacks);
					}
				});
			else
				first.remove(id, callbacks);
		} else {
			if (strategy == "then") {
				first.remove([id, {dual_remove: true}]);
				second.remove([id, {dual_remove: true}]);
			}
			else if (strategy == "or")
				try {
					first.remove([id, {dual_remove: true}]);
				} catch (e) {
					second.remove([id, {dual_remove: true}]);
				}
			else
				first.remove([id, {dual_remove: true}]);
		}
	},

	_query_capabilities: function () {
		return {
			"query": true,
			"sort": true,
			"limit": true,
			"skip": true
		};
	},

	_get: function (id, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__get_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__get_options.strategy;
		var clone = this.__get_options.clone;
		var clone_second = this.__get_options.clone_second;
		var or_on_null = this.__get_options.or_on_null;
		var result = null;
		if (strategy == "or") {
			var fallback = function (callbacks) {
				second.get(id, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
					if (result && clone)
						first.delegate(first.insert, [result], callbacks);
					else
						this.callback(callbacks, "success", result);
				}));
			};
			return first.then(first.get, [id], callbacks, function (result, callbacks) {
				if (!result && or_on_null) {
					fallback(callbacks);
					return;
				}
				if (clone_second) {
					second.get(id, {
						success: function (row) {
							if (row)
								this.callback(callbacks, "success", result);
							else
								second.insert(result, callbacks);
						},
						exception: function () {
							second.insert(result, callbacks);
						}
					});
				} else
					this.callback(callbacks, "success", result);
			}, function (error, callbacks) {
				fallback(callbacks);
			});
		} else
			return first.get(id, callbacks);
	},

	_query: function (query, options, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__query_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__query_options.strategy;
		var clone = this.__query_options.clone;
		var clone_second = this.__get_options.clone_second;
		var or_on_null = this.__query_options.or_on_null;
		var result = null;
		if (strategy == "or") {
			var fallback = function (callbacks) {
				this.trigger("query_second", query, options);
				second.query(query, options, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
					if (result && clone) {
						arr = result.asArray();
						result = new BetaJS.Iterators.ArrayIterator(arr);
						var cb = BetaJS.SyncAsync.mapSuccess(callbacks, function () {
							BetaJS.SyncAsync.callback(callbacks, "success", result);
						});
						first.insert_all(arr, cb, {query: query, options: options});				
					} else
						BetaJS.SyncAsync.callback(callbacks, "success", result);
				}));
				return result;
			};
			var insert_second = function (result, callbacks) {
				arr = result.asArray();
				result = new BetaJS.Iterators.ArrayIterator(arr);
				var cb = BetaJS.SyncAsync.mapSuccess(callbacks, function () {
					BetaJS.SyncAsync.callback(callbacks, "success", result);
				});
				second.insert_all(arr, cb, {query: query, options: options});				
			};
			this.trigger("query_first", query, options);
			return this.then(first, first.query, [query, options], callbacks, function (result, callbacks) {
				if (!result && or_on_null) {
					fallback.call(this, callbacks);
					return;
				}
				if (clone_second) {
					this.trigger("query_second", query, options);
					second.query(query, options, {
						success: function (result2) {
							if (result2) 
								this.callback(callbacks, "success", result);
							else
								insert_second(result, callbacks);
						}, exception: function () {
							insert_second(result, callbacks);
						}
					});
				} else {
					this.callback(callbacks, "success", result);
				}
			}, function (error, callbacks) {
				fallback.call(this, callbacks);
			});
		} else {
			this.trigger("query_first", query, options);
			return first.query(query, options, callbacks);
		}
	}

});
