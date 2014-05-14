/*!
  betajs - v0.0.2 - 2014-05-14
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Queries = {

	/*
	 * Syntax:
	 *
	 * queries :== [query, ...]
	 * simples :== [simple, ...]
	 * query :== {pair, ...}
	 * pair :== string: value | $or : queries | $and: queries
	 * value :== simple | {condition, ...}  
	 * condition :== $in: simples | $gt: simple | $lt: simple | $sw: simple | $gtic: simple | $ltic: simple | $swic: simple
	 *
	 */
	
	subsumizes: function (query, query2) {
		// This is very simple at this point
		if (!BetaJS.Types.is_object(query) || !BetaJS.Types.is_object)
			return query == query2;
		for (var key in query) {
			if (!(key in query2) || !this.subsumizes(query[key], query2[key]))
				return false;
		}
		return true;
	},
	
	__increase_dependency: function (key, dep) {
		if (key in dep)
			dep[key]++;
		else
			dep[key] = 1;
		return dep;		
	},
	
	__dependencies_queries: function (queries, dep) {
		BetaJS.Objs.iter(queries, function (query) {
			dep = this.__dependencies_query(query, dep);
		}, this);
		return dep;
	},
	
	__dependencies_query: function (query, dep) {
		for (key in query)
			dep = this.__dependencies_pair(key, query[key], dep);
		return dep;
	},
	
	__dependencies_pair: function (key, value, dep) {
		if (key == "$or" || key == "$and")
			return this.__dependencies_queries(value, dep);
		else
			return this.__increase_dependency(key, dep);
	},

	dependencies : function(query) {
		return this.__dependencies_query(query, {});
	},
		
	__evaluate_query: function (query, object) {
		for (var key in query) {
			if (!this.__evaluate_pair(key, query[key], object))
				return false;
		}
		return true;
	},
	
	__evaluate_pair: function (key, value, object) {
		if (key == "$or")
			return this.__evaluate_or(value, object);
		if (key == "$and")
			return this.__evaluate_and(value, object);
		return this.__evaluate_value(value, object[key]);
	},
	
	__evaluate_value: function (value, object_value) {
		if (BetaJS.Types.is_object(value)) {
			var result = true;
			BetaJS.Objs.iter(value, function (tar, op) {
				if (op == "$in")
					result = result && BetaJS.Objs.contains_value(tar, object_value);
				if (op == "$gt")
					result = result && object_value >= tar;
				if (op == "$gtic")
					result = result && object_value.toLowerCase() >= tar.toLowerCase();
				if (op == "$lt")
					result = result && object_value <= tar;
				if (op == "$ltic")
					result = result && object_value.toLowerCase() <= tar.toLowerCase();
				if (op == "$sw")
					result = result && object_value.indexOf(tar) === 0;
				if (op == "$swic")
					result = result && object_value.toLowerCase().indexOf(tar.toLowerCase()) === 0;
			}, this);
			return result;
		}
		return value == object_value;
	},
	
	__evaluate_or: function (arr, object) {
		BetaJS.Objs.iter(arr, function (query) {
			if (this.__evaluate_query(query, object))
				return true;
		}, this);
		return false;
	},
	
	__evaluate_and: function (arr, object) {
		BetaJS.Objs.iter(arr, function (query) {
			if (!this.__evaluate_query(query, object))
				return false;
		}, this);
		return true;
	},
	
	format: function (query) {
		if (BetaJS.Class.is_class_instance(query))
			return query.format();
		return JSON.stringify(query);
	},
	
	overloaded_evaluate: function (query, object) {
		if (BetaJS.Class.is_class_instance(query))
			return query.evaluate(object);
		if (BetaJS.Types.is_function(query))
			return query(object);
		return this.evaluate(query, object);
	},
	
	evaluate : function(query, object) {
		return this.__evaluate_query(query, object);
	},
/*
	__compile : function(query) {
		if (BetaJS.Types.is_array(query)) {
			if (query.length == 0)
				throw "Malformed Query";
			var op = query[0];
			if (op == "Or") {
				var s = "false";
				for (var i = 1; i < query.length; ++i)
					s += " || (" + this.__compile(query[i]) + ")";
				return s;
			} else if (op == "And") {
				var s = "true";
				for (var i = 1; i < query.length; ++i)
					s += " && (" + this.__compile(query[i]) + ")";
				return s;
			} else {
				if (query.length != 3)
					throw "Malformed Query";
				var key = query[1];
				var value = query[2];
				var left = "object['" + key + "']";
				var right = BetaJS.Types.is_string(value) ? "'" + value + "'" : value;
				return left + " " + op + " " + right;
			}
		} else if (BetaJS.Types.is_object(query)) {
			var s = "true";
			for (key in query)
				s += " && (object['" + key + "'] == " + (BetaJS.Types.is_string(query[key]) ? "'" + query[key] + "'" : query[key]) + ")";
			return s;
		} else
			throw "Malformed Query";
	},

	compile : function(query) {
		var result = this.__compile(query);
		var func = new Function('object', result);
		var func_call = function(data) {
			return func.call(this, data);
		};
		func_call.source = 'function(object){\n return ' + result + '; }';
		return func_call;		
	},
*/	
	emulate: function (query, query_function, query_context) {
		var raw = query_function.apply(query_context || this, {});
		var iter = raw;
		if (!raw)
			iter = BetaJS.Iterators.ArrayIterator([]);
		else if (BetaJS.Types.is_array(raw))
			iter = BetaJS.Iterators.ArrayIterator(raw);		
		return new BetaJS.Iterators.FilteredIterator(iter, function(row) {
			return BetaJS.Queries.evaluate(query, row);
		});
	}	
	
}; 
BetaJS.Queries.Constrained = {
	
	make: function (query, options) {
		return {
			query: query,
			options: options || {}
		};
	},
	
	is_constrained: function (query) {
		return query && (query.query || query.options);
	},
	
	format: function (instance) {
		var query = instance.query;
		instance.query = BetaJS.Queries.format(query);
		var result = JSON.stringify(instance);
		instance.query = query;
		return result;
	},
	
	emulate: function (constrained_query, query_capabilities, query_function, query_context, callbacks) {
		var query = constrained_query.query || {};
		var options = constrained_query.options || {};
		var execute_query = {};
		var execute_options = {};
		if ("sort" in options && "sort" in query_capabilities)
			execute_options.sort = options.sort;
		// Test
		execute_query = query;
		if ("query" in query_capabilities || BetaJS.Types.is_empty(query)) {
			execute_query = query;
			if (!("sort" in options) || "sort" in query_capabilities) {
				if ("skip" in options && "skip" in query_capabilities)
					execute_options.skip = options.skip;
				if ("limit" in options && "limit" in query_capabilities)
					execute_options.limit = options.limit;
			}
		}
		var params = [execute_query, execute_options];
		if (callbacks)
			params.push(callbacks);
		var success_call = function (raw) {
			var iter = raw;
			if (raw === null)
				iter = new BetaJS.Iterators.ArrayIterator([]);
			else if (BetaJS.Types.is_array(raw))
				iter = new BetaJS.Iterators.ArrayIterator(raw);		
			if (!("query" in query_capabilities || BetaJS.Types.is_empty(query)))
				iter = new BetaJS.Iterators.FilteredIterator(iter, function(row) {
					return BetaJS.Queries.evaluate(query, row);
				});
			if ("sort" in options && !("sort" in execute_options))
				iter = new BetaJS.Iterators.SortedIterator(iter, BetaJS.Comparators.byObject(options.sort));
			if ("skip" in options && !("skip" in execute_options))
				iter = new BetaJS.Iterators.SkipIterator(iter, options["skip"]);
			if ("limit" in options && !("limit" in execute_options))
				iter = new BetaJS.Iterators.LimitIterator(iter, options["limit"]);
			if (callbacks && callbacks.success)
				callbacks.success(iter);
			return iter;
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception(e);
			else
				throw e;
		};
		if (callbacks) 
			query_function.apply(query_context || this, [execute_query, execute_options, {
				success: success_call,
				exception: exception_call,
				sync: callbacks.sync,
				context: callbacks.context || this
			}]);
		else
			try {
				var raw = query_function.apply(query_context || this, [execute_query, execute_options]);
				return success_call(raw);
			} catch (e) {
				exception_call(e);
			}
		return true;	
	},
	
	subsumizes: function (query, query2) {
		qopt = query.options || {};
		qopt2 = query2.options || {};
		qskip = qopt.skip || 0;
		qskip2 = qopt2.skip || 0;
		qlimit = qopt.limit || null;
		qlimit2 = qopt2.limit || null;
		qsort = qopt.sort;
		qsort2 = qopt2.sort;
		if (qskip > qskip2)
			return false;
		if (qlimit) {
			if (!qlimit2)
				return false;
			if (qlimit2 + qskip2 > qlimit + qskip)
				return false;
		}
		if ((qskip || qlimit) && (qsort || qsort2) && qsort != qsort2)
			return false;
		return BetaJS.Queries.subsumizes(query.query, query2.query);
	}

}; 

BetaJS.Class.extend("BetaJS.Queries.AbstractQueryModel", {
	
	register: function (query) {
	},
	
	executable: function (query) {
	}
	
});


BetaJS.Queries.AbstractQueryModel.extend("BetaJS.Queries.DefaultQueryModel", {
	
	__queries: {},
	
	exists: function (query) {
		return BetaJS.Queries.Constrained.format(query) in this.__queries;
	},
	
	executable: function (query) {
		if (this.exists(query))
			return true;
		var result = false;
		BetaJS.Objs.iter(this.__queries, function (query2) {
			result = BetaJS.Queries.Constrained.subsumizes(query2, query);
			if (result) console.log(JSON.stringify(query2) + " subsumizes " + JSON.stringify(query));
			return !result;
		}, this);
		return result;
	},
	
	register: function (query) {
		BetaJS.Objs.iter(this.__queries, function (query2) {
			if (BetaJS.Queries.Constrained.subsumizes(query, query2))
				delete this.__queries[BetaJS.Queries.Constrained.format(query2)];
		}, this);
		this.__queries[BetaJS.Queries.Constrained.format(query)] = query;
	}	
	
});

BetaJS.Collections.Collection.extend("BetaJS.Collections.QueryCollection", {
	
	constructor: function (source, query, options) {
		this._source = source;
		this._inherited(BetaJS.Collections.QueryCollection, "constructor", options);
		this._options = BetaJS.Objs.extend({
			forward_steps: null,
			backward_steps: null,
			range: null
		}, options);
		this.set_query(query);
	},
	
	query: function () {
		return this._query;
	},
	
	set_query: function (query) {
		this._query = BetaJS.Objs.extend({
			query: {},
			options: {}
		}, query);
		this._query.options.skip = this._query.options.skip || 0;
		this._query.options.limit = this._query.options.limit || null;
		this._query.options.sort = this._query.options.sort || {};  
		this._count = 0;
		this.__execute_query(this._query.options.skip, this._query.options.limit, true);
	},
	
	__sub_query: function (options, callbacks) {
		this._source.query(this._query.query, options, callbacks);
	},
	
	__execute_query: function (skip, limit, clear_before) {
		skip = Math.max(skip, 0);
		var q = {};
		if (this._query.options.sort && !BetaJS.Types.is_empty(this._query.options.sort))
			q.sort = this._query.options.sort;
		if (clear_before) {
			if (skip > 0)
				q.skip = skip;
			if (limit !== null)
				q.limit = limit;
			this.__sub_query(q, {
				context: this,
				success: function (iter) {
					var objs = iter.asArray();
					this._query.options.skip = skip;
					this._query.options.limit = limit;
					this._count = !limit || objs.length < limit ? skip + objs.length : null;
					this.clear();
					this.add_objects(objs);
				}
			});
		} else if (skip < this._query.options.skip) {
			limit = this._query.options.skip - skip;
			if (skip > 0)
				q.skip = skip;
			q.limit = limit;
			this.__sub_query(q, {
				context: this,
				success: function (iter) {
					var objs = iter.asArray();
					this._query.options.skip = skip;
					var added = this.add_objects(objs);
					this._query.options.limit = this._query.options.limit === null ? null : this._query.options.limit + added;
				}
			});
		} else if (skip >= this._query.options.skip) {
			if (this._query.options.limit !== null && (!limit || skip + limit > this._query.options.skip + this._query.options.limit)) {
				limit = (skip + limit) - (this._query.options.skip + this._query.options.limit);
				skip = this._query.options.skip + this._query.options.limit;
				if (skip > 0)
					q.skip = skip;
				if (limit)
					q.limit = limit;
				this.__sub_query(q, {
					context: this,
					success: function (iter) {
						var objs = iter.asArray();
						var added = this.add_objects(objs);
						this._query.options.limit = this._query.options.limit + added;
						if (limit > objs.length)
							this._count = skip + added;
					}
				});
			}
		}
	},
	
	increase_forwards: function (steps) {
		steps = !steps ? this._options.forward_steps : steps;
		if (!steps || this._query.options.limit === null)
			return;
		this.__execute_query(this._query.options.skip + this._query.options.limit, steps, false);
	},
	
	increase_backwards: function (steps) {
		steps = !steps ? this._options.backward_steps : steps;
		if (steps && this._query.options.skip > 0) {
			steps = Math.min(steps, this._query.options.skip);
			this.__execute_query(this._query.options.skip - steps, steps, false);
		}
	},
	
	paginate: function (index) {
		this.__execute_query(this._options.range * index, this._options.range, true);
	},
	
	paginate_index: function () {
		return !this._options.range ? null : Math.floor(this._query.options.skip / this._options.range);
	},
	
	paginate_count: function () {
		return !this._count || !this._options.range ? null : Math.ceil(this._count / this._options.range);
	},
	
	next: function () {
		var paginate_index = this.paginate_index();
		if (!paginate_index)
			return;
		var paginate_count = this.paginate_count();
		if (!paginate_count || paginate_index < this.paginate_count() - 1)
			this.paginate(paginate_index + 1);
	},
	
	prev: function () {
		var paginate_index = this.paginate_index();
		if (!paginate_index)
			return;
		if (paginate_index > 0)
			this.paginate(paginate_index - 1);
	},
	
	isComplete: function () {
		return this._count !== null;
	}
	
});



BetaJS.Collections.QueryCollection.extend("BetaJS.Collections.ActiveQueryCollection", {
	
	constructor: function (source, query, options) {
		this._inherited(BetaJS.Collections.ActiveQueryCollection, "constructor", source, query, options);
		source.on("create", this.__active_create, this);
		source.on("remove", this.__active_remove, this);
		source.on("update", this.__active_update, this);
	},
	
	destroy: function () {
		this._source.off(null, null, this);
		this._inherited(BetaJS.Collections.ActiveQueryCollection, "destroy");
	},
	
	is_valid: function (object) {
		return BetaJS.Queries.evaluate(this.query().query, object.getAll());
	},
	
	__active_create: function (object) {
		if (!this.is_valid(object) || this.exists(object))
			return;
		this.add(object);
		this._count = this._count + 1;
		if (this._query.options.limit !== null)
			this._query.options.limit = this._query.options.limit + 1;
	},
	
	__active_remove: function (object) {
		if (!this.exists(object))
			return;
		this.remove(object);
		this._count = this._count - 1;
		if (this._query.options.limit !== null)
			this._query.options.limit = this._query.options.limit - 1;
	},
	
	__active_update: function (object) {
		if (!this.is_valid(object))
			this.__active_remove(object);
		else
			this.__active_create(object);
	}
	
});

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
		if (query && this._query_model) {
			this.trigger("query_register", query);
			this._query_model.register(query);
		}
		var promises = BetaJS.Objs.map(data, function (obj) {
			return this.promise(this.insert, [obj]);
		}, this);
		return this.join(promises, callbacks);
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
		if (this._query_model && !this._query_model.executable({query: query, options: options})) {
			this.trigger("query_miss", {query: query, options: options});
			var e = BetaJS.Stores.StoreException("Cannot execute query");
			if (callbacks)
				calbacks.exception.call(callbacks.context || this, e);
			else
				throw e;
			return null;
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

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.AssocStore", {
	
	_read_key: function (key) {},
	_write_key: function (key, value) {},
	_remove_key: function (key) {},
	_iterate: function () {},
	
	constructor: function (options) {
		options = options || {};
		options.create_ids = true;
		this._inherited(BetaJS.Stores.AssocStore, "constructor", options);
		this._supportsAsync = false;
	},
	
	_insert: function (data) {
		this._write_key(data[this._id_key], data);
		return data;
	},
	
	_remove: function (id) {
		var row = this._read_key(id);
		if (row && !this._remove_key(id))
			return null;
		return row;
	},
	
	_get: function (id) {
		return this._read_key(id);
	},
	
	_update: function (id, data) {
		var row = this._get(id);
		if (row) {
			delete data[this._id_key];
			BetaJS.Objs.extend(row, data);
			this._write_key(id, row);
		}
		return row;
	},
	
	_query: function (query, options) {
		return this._iterate();
	}

});

BetaJS.Stores.AssocStore.extend("BetaJS.Stores.MemoryStore", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.MemoryStore, "constructor", options);
		this.__data = {};
	},

	_read_key: function (key) {
		return this.__data[key];
	},
	
	_write_key: function (key, value) {
		this.__data[key] = value;
	},
	
	_remove_key: function (key) {
		delete this.__data[key];
	},
	
	_iterate: function () {
		return new BetaJS.Iterators.ObjectValuesIterator(this.__data);
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.DumbStore", {
	
	_read_last_id: function () {},
	_write_last_id: function (id) {},
	_remove_last_id: function () {},
	_read_first_id: function () {},
	_write_first_id: function (id) {},
	_remove_first_id: function () {},
	_read_item: function (id) {},
	_write_item: function (id, data) {},
	_remove_item: function (id) {},
	_read_next_id: function (id) {},
	_write_next_id: function (id, next_id) {},
	_remove_next_id: function (id) {},
	_read_prev_id: function (id) {},
	_write_prev_id: function (id, prev_id) {},
	_remove_prev_id: function (id) {},
	
	constructor: function (options) {
		options = options || {};
		options.create_ids = true;
		this._inherited(BetaJS.Stores.DumbStore, "constructor", options);
		this._supportsAsync = false;
	},

	_insert: function (data) {
		var last_id = this._read_last_id();
		var id = data[this._id_key];
		if (last_id !== null) {
			this._write_next_id(last_id, id);
			this._write_prev_id(id, last_id);
		} else
			this._write_first_id(id);
		this._write_last_id(id);
		this._write_item(id, data);
		return data;
	},
	
	_remove: function (id) {
		var row = this._read_item(id);
		if (row) {
			this._remove_item(id);
			var next_id = this._read_next_id(id);
			var prev_id = this._read_prev_id(id);
			if (next_id !== null) {
				this._remove_next_id(id);
				if (prev_id !== null) {
					this._remove_prev_id(id);
					this._write_next_id(prev_id, next_id);
					this._write_prev_id(next_id, prev_id);
				} else {
					this._remove_prev_id(next_id);
					this._write_first_id(next_id);
				}
			} else if (prev_id !== null) {
				this._remove_next_id(prev_id);
				this._write_last_id(prev_id);
			} else {
				this._remove_first_id();
				this._remove_last_id();
			}
		}
		return row;
	},
	
	_get: function (id) {
		return this._read_item(id);
	},
	
	_update: function (id, data) {
		var row = this._get(id);
		if (row) {
			delete data[this._id_key];
			BetaJS.Objs.extend(row, data);
			this._write_item(id, row);
		}
		return row;
	},
	
	_query_capabilities: function () {
		return {
			query: true
		};
	},

	_query: function (query, options) {
		var iter = new BetaJS.Iterators.Iterator();
		var store = this;
		var fid = this._read_first_id();
		BetaJS.Objs.extend(iter, {
			__id: fid === null ? 1 : fid,
			__store: store,
			__query: query,
			
			hasNext: function () {
				var last_id = this.__store._read_last_id();
				if (last_id === null)
					return false;
				while (this.__id < last_id && !this.__store._read_item(this.__id))
					this.__id++;
				while (this.__id <= last_id) {
					if (this.__store._query_applies_to_id(query, this.__id))
						return true;
					if (this.__id < last_id)
						this.__id = this.__store._read_next_id(this.__id);
					else
						this.__id++;
				}
				return false;
			},
			
			next: function () {
				if (this.hasNext()) {
					var item = this.__store.get(this.__id);
					if (this.__id == this.__store._read_last_id())
						this.__id++;
					else
						this.__id = this.__store._read_next_id(this.__id);
					return item;
				}
				return null;
			}
		});
		return iter;
	}	
	
});

BetaJS.Stores.DumbStore.extend("BetaJS.Stores.AssocDumbStore", {
	
	_read_key: function (key) {},
	_write_key: function (key, value) {},
	_remove_key: function (key) {},
	
	__read_id: function (key) {
		var raw = this._read_key(key);
		return raw ? parseInt(raw, 10) : null;
	},
	
	_read_last_id: function () {
		return this.__read_id("last_id");
	},
	
	_write_last_id: function (id) {
		this._write_key("last_id", id);
	},

	_remove_last_id: function () {
		this._remove_key("last_id");
	},

	_read_first_id: function () {
		return this.__read_id("first_id");
	},
	
	_write_first_id: function (id) {
		this._write_key("first_id", id);
	},
	
	_remove_first_id: function () {
		this._remove_key("first_id");
	},

	_read_item: function (id) {
		return this._read_key("item_" + id);
	},

	_write_item: function (id, data) {
		this._write_key("item_" + id, data);
	},
	
	_remove_item: function (id) {
		this._remove_key("item_" + id);
	},
	
	_read_next_id: function (id) {
		return this.__read_id("next_" + id);
	},

	_write_next_id: function (id, next_id) {
		this._write_key("next_" + id, next_id);
	},
	
	_remove_next_id: function (id) {
		this._remove_key("next_" + id);
	},
	
	_read_prev_id: function (id) {
		return this.__read_id("prev_" + id);
	},

	_write_prev_id: function (id, prev_id) {
		this._write_key("prev_" + id, prev_id);
	},

	_remove_prev_id: function (id) {
		this._remove_key("prev_" + id);
	}
	
});

BetaJS.Stores.AssocDumbStore.extend("BetaJS.Stores.LocalStore", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.LocalStore, "constructor", options);
		this.__prefix = options.prefix;
	},
	
	__key: function (key) {
		return this.__prefix + key;
	},
	
	_read_key: function (key) {
		var prfkey = this.__key(key);
		return prfkey in localStorage ? JSON.parse(localStorage[prfkey]) : null;
	},
	
	_write_key: function (key, value) {
		localStorage[this.__key(key)] = JSON.stringify(value);
	},
	
	_remove_key: function (key) {
		delete localStorage[this.__key(key)];
	}
	
});

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
		this._supportsAsync = (first.supportsAsync() && second.supportsAsync()) || !this._supportsSync;
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
						callbacks.success(result);
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
				} else
					this.callback(callbacks, "success", result);
			}, function (error, callbacks) {
				fallback.call(this, callbacks);
			});
		} else {
			this.trigger("query_first", query, options);
			return first.query(query, options, callbacks);
		}
	}

});

BetaJS.Stores.DualStore.extend("BetaJS.Stores.CachedStore", {
	constructor: function (parent, options) {
		options = options || {};
		this._inherited(BetaJS.Stores.CachedStore, "constructor",
			parent,
			new BetaJS.Stores.MemoryStore({
				id_key: parent.id_key(),
				query_model: new BetaJS.Queries.DefaultQueryModel()
			}),
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
	},
	
	cache: function () {
		return this.second();
	},
	
	store: function () {
		return this.first();
	}
});
BetaJS.Stores.BaseStore.extend("BetaJS.Stores.ConversionStore", {
	
	constructor: function (store, options) {
		options = options || {};
		options.id_key = store._id_key;
		this._inherited(BetaJS.Stores.ConversionStore, "constructor", options);
		this.__store = store;
		this.__key_encoding = options["key_encoding"] || {};
		this.__key_decoding = options["key_decoding"] || {};
		this.__value_encoding = options["value_encoding"] || {};
		this.__value_decoding = options["value_decoding"] || {};
	},
	
	encode_object: function (obj) {
		var result = {};
		for (var key in obj)
			result[this.encode_key(key)] = this.encode_value(key, obj[key]);
		return result;
	},
	
	decode_object: function (obj) {
		var result = {};
		for (var key in obj)
			result[this.decode_key(key)] = this.decode_value(key, obj[key]);
		return result;
	},
	
	encode_key: function (key) {
		return key in this.__key_encoding ? this.__key_encoding[key] : key;
	},
	
	decode_key: function (key) {
		return key in this.__key_decoding ? this.__key_decoding[key] : key;
	},
	
	encode_value: function (key, value) {
		return key in this.__value_encoding ? this.__value_encoding[key](value) : value;
	},
	
	decode_value: function (key, value) {
		return key in this.__value_decoding ? this.__value_decoding[key](value) : value;
	},	

	_query_capabilities: function () {
		return this.__store._query_capabilities();
	},
	
	_ensure_index: function (key) {
		return this.__store.ensure_index(key);
	},
	
	_insert: function (data, callbacks) {
		return this.then(this.__store, this.__store.insert, [this.encode_object(data)], callbacks, function (result, callbacks) {
			callbacks.success(this.decode_object(result));
		});
	},
	
	_remove: function (id, callbacks) {
		return this.delegate(this.__store, this.__store.remove, [this.encode_value(this._id_key, id)], callbacks);
	},

	_get: function (id, callbacks) {
		return this.then(this.__store, this.__store.get, [this.encode_value(this._id_key, id)], callbacks, function (result, callbacks) {
			callbacks.success(this.decode_object(result));
		});
	},
	
	_update: function (id, data, callbacks) {
		return this.then(this.__store, this.__store.update, [this.encode_value(this._id_key, id), this.encode_object(data)], callbacks, function (result, callbacks) {
			callbacks.success(this.decode_object(result));
		});
	},
	
	_query: function (query, options, callbacks) {
		return this.then(this.__store, this.__store.query, [this.encode_object(query), options], callbacks, function (result, callbacks) {
			var mapped = new BetaJS.Iterators.MappedIterator(result, function (row) {
				return this.decode_object(row);
			}, this);
			callbacks.success(mapped);
		});
	}		

});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.PassthroughStore", {
	
	constructor: function (store, options) {
		this.__store = store;
		options = options || {};
		options.id_key = store.id_key();
		this._inherited(BetaJS.Stores.PassthroughStore, "constructor", options);
		this._supportsAsync = store.supportsAsync();
		this._supportsSync = store.supportsSync();
	},
	
	_query_capabilities: function () {
		return this.__store._query_capabilities();
	},

	_insert: function (data, callbacks) {
		return this.__store.insert(data, callbacks);
	},
	
	_remove: function (id, callbacks) {
		return this.__store.remove(id, callbacks);
	},
	
	_get: function (id, callbacks) {
		return this.__store.get(id, callbacks);
	},
	
	_update: function (id, data, callbacks) {
		return this.__store.update(id, data, callbacks);
	},
	
	_query: function (query, options, callbacks) {
		return this.__store.query(query, options, callbacks);
	},
	
	_ensure_index: function (key) {
		return this.__store.ensure_index(key);
	},
	
	_store: function () {
		return this.__store;
	}

});



BetaJS.Stores.PassthroughStore.extend("BetaJS.Stores.ActiveStore", {
	
	constructor: function (store, listener, options) {
		this._inherited(BetaJS.Stores.ActiveStore, "constructor", store, options);
		this.__listener = listener;
		this.delegateEvents(null, listener);
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.SocketStore", {
	
	constructor: function (options, socket, prefix) {
		this._inherited(BetaJS.Stores.SocketStore, "constructor", options);
		this.__socket = socket;
		this.__prefix = prefix;
		this._supportsAsync = false;
	},
	
	__send: function (action, data) {
		this.__socket.emit(this.__prefix + ":" + action, data);
	},
	
	_insert: function (data) {
		this.__send("insert", data);
	},
	
	_remove: function (id) {
		this.__send("remove", id);
	},
	
	_update: function (id, data) {
		this.__send("update", BetaJS.Objs.objectBy(id, data));
	},
	
	bulk: function (commits, optimistic, callbacks) {
		this.__send("bulk", commits);
	}	
	
});


BetaJS.Stores.ListenerStore.extend("BetaJS.Stores.SocketListenerStore", {

	constructor: function (options, socket, prefix) {
		this._inherited(BetaJS.Stores.SocketListenerStore, "constructor", options);
		var self = this;
		this.__prefix = prefix;
		socket.on(this.__prefix + ":insert", function (data) {
			self._perform("insert", data);
		});
		socket.on(this.__prefix + ":remove", function (id) {
			self._perform("remove", id);
		});
		socket.on(this.__prefix + ":update", function (data) {
			self._perform("update", data);
		});
		socket.on(this.__prefix + ":bulk", function (commits) {
			for (var i = 0; i < commits.length; ++i)
				self._perform(BetaJS.Objs.keyByIndex(commits[i]), BetaJS.Objs.valueByIndex(commits[i]));
		});
	},
	
	_perform: function (action, data) {
		if (action == "insert")
			this._inserted(data);
		else if (action == "remove")
			this._removed(data);
		else if (action == "update")
			this._updated(BetaJS.Objs.objectBy(this.id_key(), BetaJS.Objs.keyByIndex(data)), BetaJS.Objs.valueByIndex(data));
		else
			throw new BetaJS.Stores.StoreException("unsupported: perform " + action);
	}

});
BetaJS.Class.extend("BetaJS.Stores.StoresMonitor", [
	BetaJS.Events.EventsMixin,
{
	attach: function (ident, store) {
		store.on("insert", function (row) {
			this.trigger("insert", ident, store, row);
			this.trigger("write", "insert", ident, store, row);
		}, this);
		store.on("remove", function (id) {
			this.trigger("remove", ident, store, id);
			this.trigger("write", "remove", ident, store, id);
		}, this);
		store.on("update", function (row, data) {
			this.trigger("update", ident, store, row, data);
			this.trigger("write", "update", ident, store, row, data);
		}, this);
	}
		
}]);

BetaJS.Class.extend("BetaJS.Stores.StoreHistory", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (store, options) {
		this._inherited(BetaJS.Stores.StoreHistory, "constructor");
		options = options || {};
		this._combine_update_update = options.combine_update_update || false;
		this._combine_insert_update = options.combine_insert_update || false;
		this._combine_insert_remove = options.combine_insert_remove || false;
		this._combine_update_remove = options.combine_update_remove || false;
		this._commits = {};
		this._revision_id = null;
		this._store = store;
		this._item_commits = {};
		this._store.on("insert", function (data) {
			this.__add_commit({action: "insert", id: data[this._store.id_key()], data: data});
		}, this);
		this._store.on("remove", function (id) {
			this.__add_commit({action: "remove", id: id});
		}, this);
		this._store.on("update", function (id, data) {
			this.__add_commit({action: "update", id: id, data: data});
		}, this);
	},
	
	__remove_commit: function (revision_id) {
		this.trigger("remove", this._commits[revision_id]);
		var id = this._commits[revision_id].id;
		delete this._commits[revision_id];
		delete this._item_commits[id];
		if (BetaJS.Objs.is_empty(this._item_commits[id]))
			delete this._item_commits[id];
	},
	
	__add_commit: function (object) {
		object.revision_id = this._new_revision_id();
		var has_insert = false;
		var has_update = false;
		var last_rev_id = null;
		for (var rev_id in this._item_commits[object.id]) {
			var obj = this._commits[rev_id];
			has_insert = has_insert || obj.action == "insert";
			has_update = has_update || obj.action == "update";
			last_rev_id = rev_id;
		}	
		this._revision_id = object.revision_id;
		this._commits[this._revision_id] = object;
		this._item_commits[object.id] = this._item_commits[object.id] || {};
		this._item_commits[object.id][object.revision_id] = true;
		this.trigger("commit", object);
		if (object.action == "update") {
			if ((this._combine_insert_update && !has_update && has_insert) || (this._combine_update_update && has_update)) {
				this.__remove_commit(object.revision_id);
				this._commits[last_rev_id].data = BetaJS.Objs.extend(this._commits[last_rev_id].data, object.data);
			}
		} else if (object.action == "remove") {
			for (rev_id in this._item_commits[object.id]) {
				obj = this._commits[rev_id];
				if ((has_insert && this._combine_insert_remove) || (obj.action == "update" && this._combine_update_remove))
					this.__remove_commit(rev_id);
			}
		}
	},
	
	flush: function (revision_id) {
		revision_id = revision_id || this._revision_id;
		for (var id in this._commits) {
			if (id > revision_id)
				break;
			this.__remove_commit(id);
		}
	},
	
	serialize: function (revision_id) {
		var commit = this._commits[revision_id];
		if (commin.action == "insert")
			return {
				"insert": commit.data
			};
		else if (commit.action == "remove")
			return {
				"remove": commit.id
			};
		else if (commit == "update")
			return {
				"update": BetaJS.Objs.objectBy(commit.id, commit.data) 
			};
		return null;
	},
	
	serialize_bulk: function (revision_id) {
		revision_id = revision_id || this._revision_id;
		var result = [];
		for (var id in this._commits) {
			if (id > revision_id)
				break;
			result.push(this.serialize(id));
		}
		return result;
	},
	
	revision_id: function () {
		return this._revision_id;
	},
	
	_new_revision_id: function () {
		return this.cls.__revision_id + 1;
	}
	
}], {
	
	__revision_id: 0
	
});