BetaJS.Properties.Properties.extend("BetaJS.Modelling.SchemedProperties", {
	
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
	
	_beforeSet: function (key, value) {
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return value;
		var sch = scheme[key];
		if (sch.type == "boolean")
			return BetaJS.Types.parseBool(value);
		return value;
	},
	
	_afterSet: function (key, value) {
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		this._properties_changed[key] = value;
		this.__unvalidated[key] = true;
		delete this.__errors[key];
		if (scheme[key].after_set) {
			var f = BetaJS.Types.is_string(scheme[key].after_set) ? this[scheme[key].after_set] : scheme[key].after_set;
			f.apply(this, value);
		}
	},

	properties_changed: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this._properties_changed;
		return BetaJS.Objs.filter(this._properties_changed, function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	get_all_properties: function () {
		var result = {};
		var scheme = this.cls.scheme();
		for (var key in scheme)
			result[key] = this.get(key);
		return result;
	},
	
	properties_by: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this.get_all_properties();
		return BetaJS.Objs.filter(this.get_all_properties(), function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	validate: function () {
		this.trigger("validate");
		for (var key in this.__unvalidated)
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
		var props = this.get_all_properties();
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
	
	validation_exception_conversion: function (e) {
		if (e.instance_of(BetaJS.Stores.RemoteStoreException)) {
			var source = e.source();
			if (source.status_code() == BetaJS.Net.HttpHeader.HTTP_STATUS_PRECONDITION_FAILED && source.data()) {
				BetaJS.Objs.iter(source.data(), function (value, key) {
					this.setError(key, value);
				}, this);
				e = new BetaJS.Modelling.ModelInvalidException(model);
			}
		}
		return e;		
	}
	
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
	},
	
	filterPersistent: function (obj) {
		var result = {};
		var scheme = this.scheme();
		for (var key in obj)
			if (!BetaJS.Types.is_defined(scheme[key].persistent) || scheme[key].persistent)
				result[key] = obj[key];
		return result;
	}
	
}, {
	
	scheme: function () {
		this.__scheme = this.__scheme || this._initializeScheme();
		return this.__scheme;
	}
	
});



BetaJS.Modelling.SchemedProperties.extend("BetaJS.Modelling.AssociatedProperties", {
	
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
	}

});