/*!
  betajs - v0.0.1 - 2013-06-15
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
		this.__properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
		this.__enter_table_count = 0;
		if ("table" in options)
			this.__table = options["table"];
		this.__saved = "saved" in options ? options["saved"] : false;
		this.__new = "new" in options ? options["new"] : true;
		for (key in attributes)
			this.set(key, attributes[key]);
		if (this.__canCallTable())
			this.__table.__modelCreate(this);
	},
	
	destroy: function () {
		if (this.__canCallTable() && !this.__table.__modelDestroy(this))
			return false;
		this.trigger("destroy");
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
	
	_canSet: function (key, value) {
		var scheme = this.cls.scheme();
		return key in scheme;
	},
	
	_afterSet: function (key, value) {
		this.__properties_changed[key] = true;
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
		this.__new = false;
		return true;
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
	}
	
}], {

	_initializeScheme: function () {
		return {
			"id": {}
		};
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
		this._inherited(BetaJS.Modelling.Collection, "constructor");
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
		}, options);
	},
	
	__enterModel: function (model) {
		this.trigger("enter", model);
		this.__models_by_cid[model.cid()] = model;
		if (model.has("id"))
			this.__models_by_id[model.get("id")] = model;
	},
	
	__leaveModel: function (model) {
		this.trigger("leave", model);
		delete this.__models_by_cid[model.cid()];
		if (model.has("id"))
			delete this.__models_by_id[model.get("id")];
	},
	
	__hasModel: function (model) {
		return model.cid() in this.__model_by_cid;
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
		var result = this.__store.remove(model.get("id"));
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
		if (this.__options["save_invalid"])
			attrs = model.properties_changed()
		else
			attrs = model.properties_changed(true);
		var confirmed = {};
		var new_model = model.isNew();
		if (new_model) {
			if (this.__options["type_column"])
				attrs[this.__options["type_column"]] = model.cls.classname;
			confirmed = this.__store.insert(attrs);
			if (!("id" in confirmed))
				return false;
			this.__models_by_id[confirmed["id"]] = model;
		} else if (!BetaJS.Types.is_empty(attrs)){
			confirmed = this.__store.update(model.get("id"), attrs);
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
	}
	
	/*
	all: function (options) {
		return this.allBy({}, options);
	},
	
	findById: function (id) {
		if (this.__cache[id])
			return this.__cache[id]
		else
			return this.findBy({id: id});
	},
	
	allBy: function (query, options) {
		var iterator = this.__store.query(query, options);
		var self = this;
		var mapped_iterator = new BetaJS.Iterators.MappedIterator(iterator, function (obj) {
			return self.__materialize(obj);
		});
		return mapped_iterator; 
	},
	
	findBy: function (query) {
		var obj = this.__store.query(query).next();
		return obj ? this.__materialize(obj) : null;
	},
	
	__materialize: function (obj) {
		if (this.__cache[obj.id])
			return this.__cache[obj.id];
		var type = this.__model_type;
		if (this.__options.type_column && obj[this.__options.type_column])
			type = obj[this.__options.type_column];
		var model = new window[type](obj);
		this.__enter_cache(model);
		return model;
	},
	*/
	
}]);
BetaJS.Modelling.Associations = {};

BetaJS.Modelling.Associations.Association = BetaJS.Class.extend("Assocation", {
});
BetaJS.Modelling.Associations.HasManyAssociation = BetaJS.Modelling.Associations.Association.extend("HasManyAssocation", {
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