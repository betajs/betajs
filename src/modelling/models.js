BetaJS.Modelling.AssociatedProperties.extend("BetaJS.Modelling.Model", [
	BetaJS.SyncAsync.SyncAsyncMixin,
	{
	
	constructor: function (attributes, options) {
		options = options || {};
		this._inherited(BetaJS.Modelling.Model, "constructor", attributes, options);
		this.__saved = "saved" in options ? options["saved"] : false;
		this.__new = "new" in options ? options["new"] : true;
		this.__removed = false;
		if (this.__saved)
			this._properties_changed = {};
		this.__table = options["table"];
		this.__table._model_register(this);
		this.__destroying = false;
	},
	
	destroy: function () {
		if (this.__destroying)
			return;
		this.__destroying = true;
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

	update: function (data, options, callbacks) {
		this.setAll(data, {silent: true});
		this.save(options, callbacks);
	},

	_afterSet: function (key, value, old_value, options) {
		this._inherited(BetaJS.Modelling.Model, "_afterSet", key, value, old_value, options);
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		if (options && options.no_change)
			this._unsetChanged(key);
		else
			this.__saved = false;
		if (options && options.silent)
			return;
		if (this.__table)
			this.__table._model_set_value(this, key, value, options);
	},
	
	_after_create: function () {
	},
	
	_before_create: function () {
	},
	
	save: function (callbacks) {
		if (this.__new)
			this._before_create();
		return this.then(this.__table, this.__table._model_save, [this], callbacks, function (result, callbacks) {
			this.trigger("save");
			this.__saved = true;
			var was_new = this.__new;
			this.__new = false;
			if (was_new)
				this._after_create();
			this.callback(callbacks, "success", result);
		});
	},
	
	remove: function (callbacks) {
		return this.then(this.__table, this.__table._model_remove, [this], callbacks, function (result, callbacks) {
			this.trigger("remove");		
			this.__removed = true;
			this.callback(callbacks, "success", result);
		});
	},
	
	table: function () {
		return this.__table;
	}
	
}]);