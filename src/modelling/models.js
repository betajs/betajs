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