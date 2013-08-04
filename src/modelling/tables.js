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
	
	active_query_engine: function () {
		if (!this.__active_query_engine) {
			var self = this;
			this._active_query_engine = new BetaJS.Queries.ActiveQueryEngine();
			this._active_query_engine._query = function (query) {
				return self.allBy(query);
			};
			this.on("create", function (object) {
				this._active_query_engine.insert(object);
			});
			this.on("remove", function (object) {
				this._active_query_engine.insert(remove);
			});
			this.on("change", function (object) {
				this._active_query_engine.update(object);
			});
		}
		return this._active_query_engine;
	}
	
}]);