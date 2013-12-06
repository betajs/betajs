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
		options.async_write = first.async_write();
		this.__first = first;
		this.__second = second;
		this._inherited(BetaJS.Stores.DualStore, "constructor", options);
		this.__create_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then" // "or", "single"
		}, options.create_options);
		this.__update_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then" // "or", "single"
		}, options.update_options);
		this.__remove_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then" // "or", "single"
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
			clone: true, // false (will use "cache_query" if present and inserts otherwise)
			clone_second: false,
			or_on_null: true // false
		}, options.query_options);
	},
	
	first: function () {
		return this.__first;
	},
	
	second: function () {
		return this.__second;
	},

	_supports_async_read: function () {
		return false;
	},
	
	_supports_async_write: function () {
		return this.__first.async_write();
	},

	_insert: function (data, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__create_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__create_options.strategy;
		if (this.async_write()) {
			if (strategy == "then")
				first.insert(data, {
					success: function (row) {
						second.insert(row, callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				return first.insert(data, {
					success: callbacks.success,
					exception: function () {
						second.insert(data, callbacks);
					}
				});
			else
				first.insert(data, callbacks);
		} else {
			if (strategy == "then")
				return second.insert(first.insert(data));
			else if (strategy == "or")
				try {
					return first.insert(data);
				} catch (e) {
					return second.insert(data);
				}
			else
				return first.insert(data);
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
		if (this.async_write()) {
			if (strategy == "then")
				first.update(id, data, {
					success: function (row) {
						second.update(id, row, callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				return first.update(id, data, {
					success: callbacks.success,
					exception: function () {
						second.update(id, data, callbacks);
					}
				});
			else
				first.update(id, data, callbacks);
		} else {
			if (strategy == "then")
				return second.update(id, first.update(id, data));
			else if (strategy == "or")
				try {
					return first.update(id, data);
				} catch (e) {
					return second.update(id, data);
				}
			else
				return first.update(id, data);
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
		if (this.async_write()) {
			if (strategy == "then")
				first.remove(id, {
					success: function () {
						second.remove(id, callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				first.remove(id, {
					success: callbacks.success,
					exception: function () {
						second.remove(id, callbacks);
					}
				});
			else
				first.remove(id, callbacks);
		} else {
			if (strategy == "then") {
				first.remove(id);
				second.remove(id);
			}
			else if (strategy == "or")
				try {
					first.remove(id);
				} catch (e) {
					second.remove(id);
				}
			else
				first.remove(id);
		}
	},

	_get: function (id) {
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
		if (strategy == "or")
			try {
				result = first.get(id);
				if (!result && or_on_null)
					throw new {};
				if (clone_second) {
					try {
						if (second.get(id))
							clone_second = false;
					} catch (e) {
					}
					if (clone_second)
						second.insert(result);
				}
				return result;
			} catch (e) {
				result = second.get(id);
				if (result && clone)
					first.insert(result);
				return result;
			}
		else
			return first.get(id);
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
		if (strategy == "or")
			try {
				result = first.query(query, options);
				if (!result && or_on_null)
					throw {};
				if (clone_second) {
					try {
						if (second.get(query, options))
							clone = false;
					} catch (e) {
					}
					if (clone_second) {
						result = result.asArray();
						if ("cache_query" in second)
							second.cache_query(query, options, result);
						else
							second.insert_all(result);
						result = new BetaJS.Iterators.ArrayIterator(result);
					}
				}
				return result;
			} catch (e) {
				result = second.query(query, options);
				if (result && clone) {
					result = result.asArray();
					if ("cache_query" in first)
						first.cache_query(query, options, result);
					else
						first.insert_all(result);
					result = new BetaJS.Iterators.ArrayIterator(result);
				}
				return result;
			}
		else
			return first.query(query, options);
	}

});
