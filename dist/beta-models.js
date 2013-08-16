/*!
  betajs - v0.0.1 - 2013-08-15
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Net.HttpHeader = {
	
	HTTP_STATUS_OK : 200,
	HTTP_STATUS_CREATED : 201,
	HTTP_STATUS_PAYMENT_REQUIRED : 402,
	HTTP_STATUS_FORBIDDEN : 403,
	HTTP_STATUS_NOT_FOUND : 404,
	HTTP_STATUS_PRECONDITION_FAILED : 412,
	HTTP_STATUS_INTERNAL_SERVER_ERROR : 500,
	
	format: function (code, prepend_code) {
		var ret = "";
		if (code == this.HTTP_STATUS_OK)
			ret = "OK"
		else if (code == this.HTTP.STATUS_CREATED)
			ret = "Created"
		else if (code == this.HTTP_STATUS_PAYMENT_REQUIRED)
			ret = "Payment Required"
		else if (code == this.HTTP_STATUS_FORBIDDEN)
			ret = "Forbidden"
		else if (code == this.HTTP_STATUS_NOT_FOUND)
			ret = "Not found"
		else if (code == this.HTTP_STATUS_PRECONDITION_FAILED)
			ret = "Precondition Failed"
		else if (code == this.HTTP_STATUS_INTERNAL_SERVER_ERROR)
			ret = "Internal Server Error"
		else
			ret = "Other Error";
		return prepend_code ? code + " " + ret : ret;
	}
	
}
BetaJS.Modelling = BetaJS.Modelling || {};

BetaJS.Modelling.SchemedProperties = BetaJS.Properties.Properties.extend("SchemedProperties", {
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.SchemedProperties, "constructor");
		var scheme = this.cls.scheme();
		this._properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
		for (var key in scheme)
			if ("def" in scheme[key]) 
				this.set(key, scheme[key].def);
			else if (scheme[key].auto_create)
				this.set(key, scheme[key].auto_create(this))
			else
				this.set(key, null);
		options = options || {};
		this._properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
		for (key in attributes)
			this.set(key, attributes[key]);
	},
	
	_unsetChanged: function (key) {
		delete this._properties_changed[key];
	},
	
	_afterSet: function (key, value) {
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		this._properties_changed[key] = value;
		this.__unvalidated[key] = true;
		delete this.__errors[key];
	},

	properties_changed: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this._properties_changed;
		return BetaJS.Objs.filter(this._properties_changed, function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	properties_by: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this.getAll();
		return BetaJS.Objs.filter(this.getAll(), function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	validate: function () {
		this.trigger("validate");
		for (key in this.__unvalidated)
			this.validateAttr(key);
		return BetaJS.Types.is_empty(this.__errors);
	},
	
	validateAttr: function (attr) {
		if (attr in this.__unvalidated) {
			delete this.__unvalidated[attr];
			delete this.__errors[attr];
			var scheme = this.cls.scheme();
			var entry = scheme[attr];
			if ("validate" in entry) {
				var validate = entry["validate"];
				if (!BetaJS.Types.is_array(validate))
					validate = [validate];
				var value = this.get(attr);
				BetaJS.Objs.iter(validate, function (validator) {
					var result = validator.validate(value, this);
					if (result != null)
						this.__errors[attr] = result;
					return result == null;
				}, this);
			}
			this.trigger("validate:" + attr, !(attr in this.__errors), this.__errors[attr]);
		}
		return !(attr in this.__errors);
	},
	
	setError: function (attr, error) {
		delete this.__unvalidated[attr];
		this.__errors[attr] = error;
	},
	
	revalidate: function () {
		this.__errors = {};
		this.__unvalidated = this.keys(true);
		return this.validate();
	},
	
	errors: function () {
		return this.__errors;
	},
	
	asRecord: function (tags) {
		var rec = {};
		var scheme = this.cls.scheme();
		var props = this.getAll();
		tags = tags || {};
		for (var key in props) 
			if (key in scheme) {
				var target = scheme[key]["tags"] || [];
				var tarobj = {};
				BetaJS.Objs.iter(target, function (value) {
					tarobj[value] = true;
				});
				var success = true;
				BetaJS.Objs.iter(tags, function (x) {
					success = success && x in tarobj;
				}, this);
				if (success)
					rec[key] = props[key];
			}
		return rec;		
	},
	
	setByTags: function (data, tags) {
		var scheme = this.cls.scheme();
		tags = tags || {};
		for (var key in data) 
			if (key in scheme) {
				var target = scheme[key]["tags"] || [];
				var tarobj = {};
				BetaJS.Objs.iter(target, function (value) {
					tarobj[value] = true;
				});
				var success = true;
				BetaJS.Objs.iter(tags, function (x) {
					success = success && x in tarobj;
				}, this);
				if (success)
					this.set(key, data[key]);
			}
	},
	
}, {

	_initializeScheme: function () {
		var s = {};
		s[this.primary_key()] = {
			type: "id"
		};
		return s;
	},
	
	asRecords: function (arr, tags) {
		return arr.map(function (item) {
			return item.asRecord(tags);
		});
	}
	
}, {
	
	scheme: function () {
		this.__scheme = this.__scheme || this._initializeScheme();
		return this.__scheme;
	}
	
});



BetaJS.Modelling.AssociatedProperties = BetaJS.Modelling.SchemedProperties.extend("AssociatedProperties", {
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.AssociatedProperties, "constructor", attributes, options);
		this.assocs = this._initializeAssociations();
		for (var key in this.assocs)
			this.__addAssoc(key, this.assocs[key]);
		this.on("change:" + this.cls.primary_key(), function (new_id, old_id) {
			this._change_id(new_id, old_id);
			this.trigger("change_id", new_id, old_id);
		}, this);
	},
	
	_change_id: function (new_id, old_id) {
	},

	__addAssoc: function (key, obj) {
		this[key] = function () {
			return obj.yield();
		}
	},
	
	_initializeAssociations: function () {
		return {};
	},
	
	destroy: function () {
		for (var key in this.assocs)
			this.assocs[key].destroy();
		this._inherited(BetaJS.Modelling.AssociatedProperties, "destroy");
	},

	id: function () {
		return this.get(this.cls.primary_key());
	},
	
	hasId: function () {
		return this.has(this.cls.primary_key());
	}
	
}, {

	primary_key: function () {
		return "id";
	},

});
BetaJS.Modelling.Model = BetaJS.Modelling.AssociatedProperties.extend("Model", [
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Classes.AutoDestroyMixin,
	{
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.Model, "constructor", attributes, options);
		this.__saved = "saved" in options ? options["saved"] : false;
		this.__new = "new" in options ? options["new"] : true;
		this.__removed = false;
		if (this.__saved)
			this._properties_changed = {};
		this.__table = options["table"];
		this.__table._model_register(this);
	},
	
	destroy: function () {
		this.__table._model_unregister(this);
		this.trigger("destroy");
		this._inherited(BetaJS.Modelling.Model, "destroy");
	},

	isSaved: function () {
		return this.__saved;
	},
	
	isNew: function () {
		return this.__new;
	},
	
	isRemoved: function () {
		return this.__removed;
	},

	update: function (data, options) {
		this.setAll(data, {silent: true});
		this.save(options);
	},

	_afterSet: function (key, value, old_value, options) {
		this._inherited(BetaJS.Modelling.Model, "_afterSet", key, value, old_value, options);
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		if (options && options.no_change)
			this._unsetChanged(key)
		else
			this.__saved = false;
		if (options && options.silent)
			return;
		if (this.__table)
			this.__table._model_set_value(this, key, value, options);
	},
	
	_after_create: function () {
	},
	
	save: function (options) {
		var self = this;
		var opts = BetaJS.Objs.clone(options || {}, 1);
		opts.success = function () {
			self.trigger("save");		
			self.__saved = true;
			var was_new = self.__new;
			self.__new = false;
			if (was_new)
				self._after_create();
			if (options && options.success)
				options.success();
		};
		return this.__table._model_save(this, opts);
	},
	
	remove: function (options) {
		var self = this;
		var opts = BetaJS.Objs.clone(options || {}, 1);
		opts.success = function () {
			self.trigger("remove");		
			self.__removed = true;
			if (options && options.success)
				options.success();
		};
		return this.__table._model_remove(this, opts);
	},
	
}]);
BetaJS.Modelling.ModelException = BetaJS.Exceptions.Exception.extend("ModelException", {
	
	constructor: function (model, message) {
		this._inherited(BetaJS.Modelling.ModelException, "constructor", message);
		this.__model = model;
	},
	
	model: function () {
		return this.__model;
	}
	
});


BetaJS.Modelling.ModelInvalidException = BetaJS.Modelling.ModelException.extend("ModelInvalidException", {
	
	constructor: function (model) {
		var message = BetaJS.Objs.values(model.errors()).join("\n");
		this._inherited(BetaJS.Modelling.ModelInvalidException, "constructor", model, message);
	},

});


BetaJS.Modelling.ModelMissingIdException = BetaJS.Modelling.ModelException.extend("ModelMissingIdException", {
	
	constructor: function (model) {
		this._inherited(BetaJS.Modelling.ModelMissingIdException, "constructor", model, "No id given.");
	},

});



BetaJS.Modelling.Table = BetaJS.Class.extend("Table", [
	BetaJS.Events.EventsMixin,
	{

	constructor: function (store, model_type, options) {
		this._inherited(BetaJS.Modelling.Table, "constructor");
		this.__store = store;
		this.__model_type = model_type;
		this.__models_by_id = {};
		this.__models_by_cid = {};
		this.__models_changed = {};
		this.__options = BetaJS.Objs.extend({
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
		this.__models_by_cid[model.cid()] = model;
		if (model.hasId())
			this.__models_by_id[model.id()] = model;
		if (model.isNew() && this.__options.auto_create)
			this._model_create(model);
	},
	
	_model_unregister: function (model) {
		if (!this.hasModel(model))
			return;
		model.save();
		delete this.__models_by_cid[model.cid()];
		if (model.hasId())
			delete this.__models_by_id[model.id()];
		this.trigger("unregister", model);
	},
	
	hasModel: function (model) {
		return model.cid() in this.__models_by_cid;
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
	
	__materialize: function (obj) {
		if (!obj)
			return null;
		var type = this.__model_type;
		if (this.__options.type_column && obj[this.__options.type_column])
			type = obj[this.__options.type_column];
		var cls = BetaJS.Scopes.resolve(type);
		if (this.__models_by_id[obj[cls.primary_key()]])
			return this.__models_by_id[obj[cls.primary_key()]];
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
	}
	
}]);
BetaJS.Modelling.Associations = {};

BetaJS.Modelling.Associations.Association = BetaJS.Class.extend("Assocation", {

	constructor: function (model, options) {
		this._inherited(BetaJS.Modelling.Associations.Association, "constructor");
		this._model = model;
		this._options = options || {};
		this.__cache = null;
		if (options["delete_cascade"])
			model.on("remove", function () {
				this.__delete_cascade();
			}, this);
		if (!options["ignore_change_id"])
			model.on("change_id", function (new_id, old_id) {
				this._change_id(new_id, old_id);
			}, this);
	},
	
	_change_id: function () {},
	
	__delete_cascade: function () {
		var iter = BetaJS.Iterators.ensure(this.yield());
		while (iter.hasNext())
			iter.next().remove();
	},
	
	yield: function () {
		if (this.__cache)
			return this.__cache;
		var obj = this._yield();
		if (this._options["cached"])
			this.__cache = obj;
		return obj;
	},
	
	invalidate: function () {
		delete this["__cache"];
	}

});
BetaJS.Modelling.Associations.TableAssociation = BetaJS.Modelling.Associations.Association.extend("TableAssociation", {

	constructor: function (model, foreign_table, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.TableAssociation, "constructor", model, options);
		this._foreign_table = foreign_table;
		this._foreign_key = foreign_key;
		// TODO: Active Query would be better
		if (this._options["cached"]) 
			this._foreign_table.on("create update remove", function () {
				this.invalidate();
			}, this);
	},
	
	destroy: function () {
		this._foreign_table.off(null, null, this);
		this._inherited(BetaJS.Modelling.Associations.TableAssociation, "destroy");
	}
	
});
BetaJS.Modelling.Associations.HasManyAssociation = BetaJS.Modelling.Associations.TableAssociation.extend("HasManyAssocation", {

	_yield: function () {
		var query = {};
		query[this._foreign_key] = this._model.id();
		return this._foreign_table.allBy(query);
	},

	yield: function () {
		if (!this._options["cached"])
			return this._yield();
		if (!this.__cache)
			this.__cache = this._yield().asArray();
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
	},
	
	findBy: function (query) {
		query[this._foreign_key] = this._model.id();
		return this._foreign_table.findBy(query);
	},

	allBy: function (query) {
		query[this._foreign_key] = this._model.id();
		return this._foreign_table.allBy(query);
	},

	_change_id: function (new_id, old_id) {
		var objects = this._yield();
		while (objects.hasNext()) {
			var object = objects.next();
			object.set(this._foreign_key, new_id);
			object.save();
		}
	},

});
BetaJS.Modelling.Associations.HasManyThroughArrayAssociation = BetaJS.Modelling.Associations.HasManyAssociation.extend("HasManyThroughArrayAssociation", {

	_yield: function () {
		var result = [];
		BetaJS.Objs.iter(this._model.get(this._foreign_key), function ($id) {
			var item = this._foreign_table.findById($id);
			if (item)
				result.push(item);
		}, this);
		return result;
	},

	yield: function () {
		if (!this._options["cached"])
			return new BetaJS.Iterators.ArrayIterator(this._yield());
		if (!this.__cache)
			this.__cache = this._yield();
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
	},

});
BetaJS.Modelling.Associations.HasOneAssociation = BetaJS.Modelling.Associations.TableAssociation.extend("HasOneAssocation", {

	_yield: function (id) {
		var query = {};
		query[this._foreign_key] = id || this._model.id();
		return this._foreign_table.findBy(query);
	},
	
	_change_id: function (new_id, old_id) {
		var object = this._yield(old_id);
		if (object) {
			object.set(this._foreign_key, new_id);
			object.save();
		}
	},

});
BetaJS.Modelling.Associations.BelongsToAssociation = BetaJS.Modelling.Associations.TableAssociation.extend("BelongsToAssocation", {
	
	_yield: function () {
		return this._foreign_table.findById(this._model.get(this._foreign_key));
	},
	
});
BetaJS.Modelling.Validators = {};

BetaJS.Modelling.Validators.Validator = BetaJS.Class.extend("Validator", {
	
	validate: function (value, context) {
		return null;
	}

});
BetaJS.Modelling.Validators.PresentValidator = BetaJS.Modelling.Validators.Validator.extend("PresentValidator", {
	
	constructor: function (error_string) {
		this._inherited(BetaJS.Modelling.Validators.PresentValidator, "constructor");
		this.__error_string = error_string ? error_string : "Field is required";
	},

	validate: function (value, context) {
		return BetaJS.Types.is_null(value) ? this.__error_string : null;
	}

});