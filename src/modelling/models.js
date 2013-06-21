BetaJS.Modelling = BetaJS.Modelling || {};

BetaJS.Modelling.Model = BetaJS.Properties.Properties.extend("Model", [
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Classes.AutoDestroyMixin,
	{
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.Model, "constructor");
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