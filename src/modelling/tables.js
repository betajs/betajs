BetaJS.Exceptions.Exception.extend("BetaJS.Modelling.ModelException", {
	
	constructor: function (model, message) {
		this._inherited(BetaJS.Modelling.ModelException, "constructor", message);
		this.__model = model;
	},
	
	model: function () {
		return this.__model;
	}
	
});


BetaJS.Modelling.ModelException.extend("BetaJS.Modelling.ModelInvalidException", {
	
	constructor: function (model) {
		var message = BetaJS.Objs.values(model.errors()).join("\n");
		this._inherited(BetaJS.Modelling.ModelInvalidException, "constructor", model, message);
	}

});


BetaJS.Modelling.ModelException.extend("BetaJS.Modelling.ModelMissingIdException", {
	
	constructor: function (model) {
		this._inherited(BetaJS.Modelling.ModelMissingIdException, "constructor", model, "No id given.");
	}

});



BetaJS.Class.extend("BetaJS.Modelling.Table", [
	BetaJS.Events.EventsMixin,
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
			// Removing options
			remove_exception: true,
			// Creation options
			auto_create: false,
			create_exception: true,
			invalid_create_exception: true,
			invalid_create_save: false,
			greedy_create: false,
			// Validation options
			store_validation_conversion: true,
			// Update options
			auto_update: true,
			update_exception: true,
			invalid_update_exception: true,
			invalid_update_save: false,
			greedy_update: false
		}, options || {});
		this.__models_by_cid = new BetaJS.Classes.ObjectCache({ size: this.__options.model_cache_size });
		this._auto_destroy(this.__models_by_cid);
		this.__models_by_cid.on("release", function (model) {
			if (model.hasId())
				delete this.__models_by_id[model.id()];
		}, this);
	},
	
	async_read: function () {
		return this.__store.async_read();
	},
	
	async_write: function () {
		return this.__store.async_write();
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
		return this.__models_by_cid.get(model) != null;
	},

	_model_remove: function (model, options) {
		if (!this.hasModel(model))
			return false;
		var self = this;
		var callback = {
			success : function () {
				if (options && options.success)
					options.success();
				if (options && options.complete)
					options.complete();
				self.trigger("remove", model);
				model.destroy();
				return true;
			},
			exception : function (e) {
				if (options && options.exception)
					options.exception(e);
				if (options && options.complete)
					options.complete();
				if ((!options || !options.exception) && self.__options.remove_exception)
					throw e;
				return false;
			}
		};
		if (this.async_write())
			this.__store.remove(model.id(), callback)
		else try {
			this.__store.remove(model.id());
			return callback.success();
		} catch (e) {
			return callback.exception(e);
		}
	},

	_model_save: function (model, options) {
		return model.isNew() ? this._model_create(model, options) : this._model_update(model, options);
	},
	
	__exception_conversion: function (model, e) {
		if (this.__options.store_validation_conversion && e.instance_of(BetaJS.Stores.RemoteStoreException)) {
			var source = e.source();
			if (source.status_code() == BetaJS.Net.HttpHeader.HTTP_STATUS_PRECONDITION_FAILED && source.data()) {
				BetaJS.Objs.iter(source.data(), function (value, key) {
					model.setError(key, value);
				}, this);
				e = new BetaJS.Modelling.ModelInvalidException(model);
			}
		}
		return e;
	},
	
	_model_create: function (model, options) {
		if (!this.hasModel(model) || !model.isNew())
			return false;
		var self = this;
		var is_valid = model.validate();
		if (!is_valid) {
		 	var e = new BetaJS.Modelling.ModelInvalidException(model);
			if (options && options.exception)
				options.exception(e);
			if (options && options.complete)
				options.complete();
			 if ((!options || !options.exception) && self.__options.invalid_create_exception)
				throw e;
			 if (!this.__options.invalid_create_save)
			 	return false;
		}
		var attrs = this.__options.greedy_create ? model.properties_by(true) : model.getAll();
		if (this.__options.type_column)
			attrs[this.__options.type_column] = model.cls.classname;
		var callback = {
			success : function (confirmed) {
				if (!(model.cls.primary_key() in confirmed))
					return callback.exception(new BetaJS.Modelling.ModelMissingIdException(model));
				self.__models_by_id[confirmed[model.cls.primary_key()]] = model;
				if (!self.__options.greedy_create)
					for (var key in model.properties_by(false))
						delete confirmed[key];
				model.setAll(confirmed, {no_change: true, silent: true});
				if (is_valid)
					delete self.__models_changed[model.cid()];
				self.trigger("create", model);
				self.trigger("save", model);
				if (options && options.success)
					options.success(confirmed);
				if (options && options.complete)
					options.complete();
				return true;		
			},
			exception : function (e) {
				e = BetaJS.Exceptions.ensure(e);
				e = self.__exception_conversion(model, e);
				if (options && options.exception)
					options.exception(e);
				if (options && options.complete)
					options.complete();
				if ((!options || !options.exception) && self.__options.create_exception)
					throw e;
				return false;
			}
		};
		if (this.async_write())
			this.__store.insert(attrs, callback)
		else try {
			var confirmed = this.__store.insert(attrs);
			return callback.success(confirmed);		
		} catch (e) {
			return callback.exception(e);
		}
	},



	_model_update: function (model, options) {
		if (!this.hasModel(model) || model.isNew())
			return false;
		var self = this;
		var is_valid = model.validate();
		if (!is_valid) {
		 	var e = new BetaJS.Modelling.ModelInvalidException(model);
			if (options && options.exception)
				options.exception(e);
			if (options && options.complete)
				options.complete();
			 if ((!options || !options.exception) && self.__options.invalid_update_exception)
				throw e;
			 if (!this.__options.invalid_update_save)
			 	return false;
		}
		var attrs = this.__options.greedy_update ? model.properties_changed(true) : model.properties_changed();
		var callback = {
			success : function (confirmed) {
				if (!self.__options.greedy_update)
					for (var key in model.properties_changed(false))
						delete confirmed[key];
				model.setAll(confirmed, {no_change: true, silent: true});
				if (is_valid)
					delete self.__models_changed[model.cid()];
				self.trigger("update", model);
				self.trigger("save", model);
				if (options && options.success)
					options.success(confirmed);
				if (options && options.complete)
					options.complete();
				return true;		
			},
			exception : function (e) {
				if (options && options.exception)
					options.exception(e);
				if (options && options.complete)
					options.complete();
				if ((!options || !options.exception) && self.__options.update_exception)
					throw e;
				return false;
			}
		};
		if (this.async_write() && !BetaJS.Types.is_empty(attrs))
			this.__store.update(model.id(), attrs, callback)
		else try {
			var confirmed = BetaJS.Types.is_empty(attrs) ? {} : this.__store.update(model.id(), attrs);
			return callback.success(confirmed);		
		} catch (e) {
			return callback.exception(e);
		}
	},

	_model_set_value: function (model, key, value, options) {
		this.__models_changed[model.cid()] = model;
		this.trigger("change", model, key, value);
		this.trigger("change:" + key, model, value);
		if (this.__options.auto_update)
			return model.save(options);
	},
		
	save: function () {
		var result = true;
		BetaJS.Objs.iter(this.__models_changed, function (obj, id) {
			result = obj.save() && result;
		});
		return result;
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
	
	findById: function (id) {
		if (this.__models_by_id[id])
			return this.__models_by_id[id]
		else
			return this.__materialize(this.__store.get(id));
	},

	findBy: function (query) {
		return this.allBy(query, {limit: 1}).next();
	},

	all: function (options) {
		return this.allBy({}, options);
	},
	
	allBy: function (query, options) {
		var iterator = this.__store.query(query, options);
		var self = this;
		var mapped_iterator = new BetaJS.Iterators.MappedIterator(iterator, function (obj) {
			return self.__materialize(obj);
		});
		return mapped_iterator; 
	},
	
	active_query_engine: function () {
		if (!this._active_query_engine) {
			var self = this;
			this._active_query_engine = new BetaJS.Queries.ActiveQueryEngine();
			this._active_query_engine._query = function (query) {
				return self.allBy(query);
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
		for (var key in scheme)
			if (scheme[key].index)
				this.__store.ensure_index(key);
		return true;
	}
	
}]);