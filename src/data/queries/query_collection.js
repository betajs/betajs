BetaJS.Collections.Collection.extend("BetaJS.Collections.QueryCollection", {
	
	constructor: function (source, query, options, callbacks) {
		this._source = source;
		this._inherited(BetaJS.Collections.QueryCollection, "constructor", options);
		this._options = BetaJS.Objs.extend({
			forward_steps: null,
			backward_steps: null,
			range: null
		}, options);
		if (callbacks)
			callbacks.context = callbacks.context || this;
		this.set_query(query, callbacks);
	},
	
	query: function () {
		return this._query;
	},
	
	set_query: function (query, callbacks) {
		this._query = BetaJS.Objs.extend({
			query: {},
			options: {}
		}, query);
		this._query.options.skip = this._query.options.skip || 0;
		this._query.options.limit = this._query.options.limit || null;
		this._query.options.sort = this._query.options.sort || {};  
		this._count = 0;
		this.__execute_query(this._query.options.skip, this._query.options.limit, true, callbacks);
	},
	
	__sub_query: function (options, callbacks) {
		this._source.query(this._query.query, options, callbacks);
	},
	
	__execute_query: function (skip, limit, clear_before, callbacks) {
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
					BetaJS.SyncAsync.callback(callbacks, "success");
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
					BetaJS.SyncAsync.callback(callbacks, "success");
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
						BetaJS.SyncAsync.callback(callbacks, "success");
					}
				});
			}
		}
	},
	
	increase_forwards: function (steps, callbacks) {
		steps = !steps ? this._options.forward_steps : steps;
		if (!steps || this._query.options.limit === null)
			return;
		this.__execute_query(this._query.options.skip + this._query.options.limit, steps, false, callbacks);
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
	
	constructor: function (source, query, options, callbacks) {
		this._inherited(BetaJS.Collections.ActiveQueryCollection, "constructor", source, query, options, callbacks);
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
