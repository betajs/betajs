BetaJS.Class.extend("BetaJS.Modelling.Table", [
	BetaJS.Events.EventsMixin,
	BetaJS.SyncAsync.SyncAsyncMixin,
	{

	constructor: function (store, model_type, options) {
		this._inherited(BetaJS.Modelling.Table, "constructor");
		this.__store = store;
		this.__model_type = model_type;
		this.__models_by_id = {};
		this.__models_changed = {};
		this.__options = BetaJS.Objs.extend({
			// Cache Size
			model_cache_size: null,
			// Attribute that describes the type
			type_column: null,
			// Creation options
			auto_create: false,
			// Validation options
			store_validation_conversion: true,
			// Update options
			auto_update: true
		}, options || {});
		this.__models_by_cid = new BetaJS.Classes.ObjectCache({ size: this.__options.model_cache_size });
		this._auto_destroy(this.__models_by_cid);
		this.__models_by_cid.on("release", function (model) {
			if (model.hasId())
				delete this.__models_by_id[model.id()];
		}, this);
	},
	
	_model_register: function (model) {
		if (this.hasModel(model))
			return;
		this.trigger("register", model);
		this.__models_by_cid.add(model);
		if (model.hasId())
			this.__models_by_id[model.id()] = model;
		if (model.isNew() && this.__options.auto_create)
			this._model_create(model);
	},
	
	_model_unregister: function (model) {
		if (!this.hasModel(model))
			return;
		model.save();
		this.__models_by_cid.remove(model);
		if (model.hasId())
			delete this.__models_by_id[model.id()];
		this.trigger("unregister", model);
	},
	
	hasModel: function (model) {
		return this.__models_by_cid.get(model) !== null;
	},

	_model_remove: function (model, callbacks) {
		if (!this.hasModel(model))
			return false;
		return this.then(this.__store, this.__store.remove, [model.id()], callbacks, function (result, callbacks) {
			this.trigger("remove", model);
			model.destroy();
			this.callback(callbacks, "success", true);
		}, function (error, callbacks) {
			this.callback(callbacks, "exception", error);
		});
	},

	_model_save: function (model, callbacks) {
		return model.isNew() ? this._model_create(model, callbacks) : this._model_update(model, callbacks);
	},
	
	__exception_conversion: function (model, e) {
		return this.__options.store_validation_conversion ? model.validation_exception_conversion(e) : e;
	},
	
	_model_create: function (model, callbacks) {
		if (!this.hasModel(model) || !model.isNew())
			return false;
		if (!model.validate()) {
		 	var e = new BetaJS.Modelling.ModelInvalidException(model);
		 	if (callbacks)
		 		this.callback(callbacks, "exception", e);
		 	else
		 		throw e;
		}
		var attrs = BetaJS.Scopes.resolve(this.__model_type).filterPersistent(model.get_all_properties());
		if (this.__options.type_column)
			attrs[this.__options.type_column] = model.cls.classname;
		return this.then(this.__store, this.__store.insert, [attrs], callbacks, function (confirmed, callbacks) {
			if (!(model.cls.primary_key() in confirmed))
				return this.callback(callbacks, "exception", new BetaJS.Modelling.ModelMissingIdException(model));
			this.__models_by_id[confirmed[model.cls.primary_key()]] = model;
			model.setAll(confirmed, {no_change: true, silent: true});
			delete this.__models_changed[model.cid()];
			this.trigger("create", model);
			this.trigger("save", model);
			return true;		
		}, function (e, callbacks) {
			e = BetaJS.Exceptions.ensure(e);
			e = self.__exception_conversion(model, e);
			this.callback(callbacks, "exception", e);
		});
	},

	_model_update: function (model, callbacks) {
		if (!this.hasModel(model) || model.isNew())
			return false;
		if (!model.validate()) {
		 	var e = new BetaJS.Modelling.ModelInvalidException(model);
		 	if (callbacks)
		 		this.callback(callbacks, "exception", e);
		 	else
		 		throw e;
		}
		var attrs = BetaJS.Scopes.resolve(this.__model_type).filterPersistent(model.properties_changed());
		if (BetaJS.Types.is_empty(attrs)) {
			if (callbacks)
				this.callback(callbacks, "success", attrs);
			return attrs;
		}
		return this.then(this.__store, this.__store.update, [model.id(), attrs], callbacks, function (confirmed, callbacks) {
			model.setAll(confirmed, {no_change: true, silent: true});
			delete this.__models_changed[model.cid()];
			this.trigger("update", model);
			this.trigger("save", model);
			this.callback(callbacks, "success", confirmed);
			return confirmed;		
		}, function (e, callbacks) {
			e = BetaJS.Exceptions.ensure(e);
			e = this.__exception_conversion(model, e);
			this.callback(callbacks, "exception", e);
			return false;
		});
	},

	_model_set_value: function (model, key, value, callbacks) {
		this.__models_changed[model.cid()] = model;
		this.trigger("change", model, key, value);
		this.trigger("change:" + key, model, value);
		if (this.__options.auto_update)
			return model.save(callbacks);
	},
	
	save: function (callbacks) {
		if (callbacks) {
			var promises = [];
			BetaJS.Objs.iter(this.__models_changed, function (obj) {
				promises.push(obj.promise(obj.save));
			}, this);
			return this.join(promises, callbacks);
		} else {
			var result = true;
			BetaJS.Objs.iter(this.__models_changed, function (obj, id) {
				result = obj.save() && result;
			});
			return result;
		}
	},
	
	primary_key: function () {
		return BetaJS.Scopes.resolve(this.__model_type).primary_key();
	},
	
	__materialize: function (obj) {
		if (!obj)
			return null;
		var type = this.__model_type;
		if (this.__options.type_column && obj[this.__options.type_column])
			type = obj[this.__options.type_column];
		var cls = BetaJS.Scopes.resolve(type);
		if (this.__models_by_id[obj[this.primary_key()]])
			return this.__models_by_id[obj[this.primary_key()]];
		var model = new cls(obj, {
			table: this,
			saved: true,
			"new": false
		});
		return model;
	},
	
	findById: function (id, callbacks) {
		if (this.__models_by_id[id]) {
			if (callbacks)
				this.callback(callbacks, "success", this.__models_by_id[id]);
			return this.__models_by_id[id];
		} else
			return this.then(this.__store, this.__store.get, [id], callbacks, function (attrs, callbacks) {
				this.callback(callbacks, "success", this.__materialize(this.__store.get(id)));
			});
	},

	findBy: function (query, callbacks) {
		return this.then(this, this.allBy, [query, {limit: 1}], callbacks, function (iterator, callbacks) {
			this.callback(callbacks, "success", iterator.next());
		});
	},

	all: function (options, callbacks) {
		return this.allBy({}, options, callbacks);
	},
	
	allBy: function (query, options, callbacks) {
		return this.then(this.__store, this.__store.query, [query, options], callbacks, function (iterator, callbacks) {
			var mapped_iterator = new BetaJS.Iterators.MappedIterator(iterator, function (obj) {
				return this.__materialize(obj);
			}, this);
			this.callback(callbacks, "success", mapped_iterator);
		});
	},
	
	active_query_engine: function () {
		if (!this._active_query_engine) {
			var self = this;
			this._active_query_engine = new BetaJS.Queries.ActiveQueryEngine();
			this._active_query_engine._query = function (query, callbacks) {
				return self.allBy(query, {}, callbacks);
			};
			this.on("create", function (object) {
				this._active_query_engine.insert(object);
			});
			this.on("remove", function (object) {
				this._active_query_engine.remove(object);
			});
			this.on("change", function (object) {
				this._active_query_engine.update(object);
			});
		}
		return this._active_query_engine;
	},
	
	scheme: function () {
		return this.__model_type.scheme();
	},
	
	ensure_indices: function () {
		if (!("ensure_index" in this.__store))
			return false;
		var scheme = this.scheme();
		for (var key in scheme) {
			if (scheme[key].index)
				this.__store.ensure_index(key);
		}
		return true;
	}
	
}]);