/*!
  betajs - v0.0.1 - 2013-07-29
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Modelling = BetaJS.Modelling || {};

BetaJS.Modelling.Model = BetaJS.Properties.Properties.extend("Model", [
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Classes.AutoDestroyMixin,
	{
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.Model, "constructor");
		var scheme = this.cls.scheme();
		this.__properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
		for (var key in scheme)
			if (scheme[key].def) 
				this.set(key, scheme[key].def)
			else if (scheme[key].auto_create)
				this.set(key, scheme[key].auto_create(this))
			else
				this.set(key, null);
		options = options || {};
		this.__properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
		this.__enter_table_count = 0;
		for (key in attributes)
			this.set(key, attributes[key]);
		this.__saved = "saved" in options ? options["saved"] : false;
		this.__new = "new" in options ? options["new"] : true;
		if (this.__saved)
			this.__properties_changed = {};
		if ("table" in options)
			this.__table = options["table"];
		if (this.__canCallTable())
			this.__table.__modelCreate(this);
		this.assocs = this._initializeAssociations();
		for (var key in this.assocs)
			this.__addAssoc(key, this.assocs[key]);
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
		if (this.__canCallTable() && !this.__table.__modelDestroy(this))
			return false;
		this.trigger("destroy");
		for (var key in this.assocs)
			this.assocs[key].destroy();
		this._inherited(BetaJS.Modelling.Model, "destroy");
	},
	
	__canCallTable: function () {
		return this.__table && this.__enter_table_count >= 0;
	},
	
	__enterTable: function () {
		this.__enter_table_count = this.__enter_table_count + 1;
	},
	
	__leaveTable: function () {
		this.__enter_table_count = this.__enter_table_count - 1;
	},

	__unsetChanged: function (key) {
		delete this.__properties_changed[key];
	},
	
	_afterSet: function (key, value) {
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		this.__properties_changed[key] = value;
		this.__unvalidated[key] = true;
		this.__saved = false;
		delete this.__errors[key];
		if (this.__canCallTable())
			this.__table.__modelSetAttr(this, key, value);
	},
	
	update: function (data) {
		this.setAll(data);
		if (this.__canCallTable())
			this.__table.__modelUpdate(this);
	},
	
	properties_changed: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this.__properties_changed;
		return BetaJS.Objs.filter(this.__properties_changed, function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	validate: function () {
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
		}
		return !(attr in this.__errors);
	},
	
	revalidate: function () {
		this.__errors = {};
		this.__unvalidated = this.keys(true);
		return this.validate();
	},
	
	errors: function () {
		return this.__errors;
	},
	
	save: function () {
		if (this.__saved)
			return true;
		if (this.__canCallTable() && !this.__table.__modelSave(this))
			return false;
		this.trigger("save");
		this.__saved = true;
		var was_new = this.__new;
		this.__new = false;
		if (was_new)
			this._after_create();
		return true;
	},
	
	_after_create: function () {
	},
	
	isSaved: function () {
		return this.__saved;
	},
	
	isNew: function () {
		return this.__new;
	},
	
	remove: function () {
		if (this.__canCallTable() && !this.__table.__modelRemove(this))
			return false;
		this.trigger("remove");
		this.destroy();
		return true;
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
	
	id: function () {
		return this.get(this.cls.primary_key());
	},
	
	hasId: function () {
		return this.has(this.cls.primary_key());
	}
	
}], {

	primary_key: function () {
		return "id";
	},

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
			"type_column": null,
			"auto_update": true,
			"auto_update_attr": false,
			"auto_create": false,
			"save_invalid": false,
			"greedy_save": true
		}, options || {});
	},
	
	__enterModel: function (model) {
		this.trigger("enter", model);
		this.__models_by_cid[model.cid()] = model;
		if (model.hasId())
			this.__models_by_id[model.id()] = model;
	},
	
	__leaveModel: function (model) {
		this.trigger("leave", model);
		delete this.__models_by_cid[model.cid()];
		if (model.hasId())
			delete this.__models_by_id[model.id()];
	},
	
	__hasModel: function (model) {
		return model.cid() in this.__models_by_cid;
	},
	
	__modelCreate: function (model) {
		if (this.__hasModel(model))
			return false;
		return this.__enterModel(model) && (!this.__options["auto_create"] || model.save());
	},
	
	__modelDestroy: function (model) {
		if (!this.__hasModel(model))
			return true;
		var result = model.save();
		return this.__leaveModel(model) && result;
	},
	
	__modelRemove: function (model) {
		if (!this.__hasModel(model))
			return false;
		var result = this.__store.remove(model.id());
		if (result)
			this.trigger("remove", model);
		return this.__leaveModel(model) && result;
	},
	
	__modelSetAttr: function (model, key, value) {
		this.__models_changed[model.cid()] = model;
		this.trigger("change", model, key, value);
		this.trigger("change:" + key, model, value);
		return !this.__options["auto_update_attr"] || model.save();
	},
	
	__modelUpdate: function (model) {
		this.trigger("update", model);
		return !this.__options["auto_update"] || model.save();
	},
	
	__modelSave: function (model) {
		if (model.isSaved())
			return true;
		var is_valid = model.validate();
		if (!is_valid && !this.__options["save_invalid"] && !this.__options["greedy_save"])
			return false;
		var attrs = {};
		var new_model = model.isNew();
		if (new_model)
			attrs = model.getAll()
		else if (this.__options["save_invalid"])
			attrs = model.properties_changed()
		else
			attrs = model.properties_changed(true);
		var confirmed = {};
		if (new_model) {
			if (this.__options["type_column"])
				attrs[this.__options["type_column"]] = model.cls.classname;
			confirmed = this.__store.insert(attrs);
			if (!(model.cls.primary_key() in confirmed))
				return false;
			this.__models_by_id[confirmed[model.cls.primary_key()]] = model;
		} else if (!BetaJS.Types.is_empty(attrs)){
			confirmed = this.__store.update(model.id(), attrs);
			if (BetaJS.Types.is_empty(confirmed))
				return false;			
		}
		if (!this.__options["save_invalid"])
			for (var key in model.properties_changed(false))
				delete confirmed[key];
		model.__leaveTable();
		model.setAll(confirmed);
		model.__enterTable();
		for (var key in confirmed)
			model.__unsetChanged(key);
		if (is_valid)
			delete this.__models_changed[model.cid()];
		if (new_model)
			this.trigger("create", model);
		this.trigger("save", model);
		return this.__options["save_invalid"] || is_valid;
	},
	
	save: function () {
		var result = true;
		BetaJS.Objs.iter(this.__models_changed, function (obj, id) {
			result = obj.save() && result;
		});
		return result;
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
		this.__enterModel(model);
		return model;
	},
	
}]);
BetaJS.Modelling.Associations = {};

BetaJS.Modelling.Associations.Association = BetaJS.Class.extend("Assocation", {

	constructor: function (model, foreign_table, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.Association, "constructor");
		this._model = model;
		this._foreign_table = foreign_table;
		this._foreign_key = foreign_key;
		this._options = options || {};
		this.__cache = null;
		if (options["delete_cascade"])
			model.on("remove", function () {
				this.__delete_cascade();
			}, this);
	},
	
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
BetaJS.Modelling.Associations.HasManyAssociation = BetaJS.Modelling.Associations.Association.extend("HasManyAssocation", {

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

});
BetaJS.Modelling.Associations.HasOneAssociation = BetaJS.Modelling.Associations.Association.extend("HasOneAssocation", {

	_yield: function () {
		var query = {};
		query[this._foreign_key] = this._model.id();
		return this._foreign_table.findBy(query);
	}

});
BetaJS.Modelling.Associations.BelongsToAssociation = BetaJS.Modelling.Associations.Association.extend("BelongsToAssocation", {
	
	_yield: function () {
		return this._foreign_table.findById(this._model.get(this._foreign_key));
	}
	
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