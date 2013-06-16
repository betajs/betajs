BetaJS.Properties = {};


BetaJS.Properties.PropertiesMixin = {
	
	get: function (key) {
		return this.__properties[key];
	},
	
	_canSet: function (key, value) {
		return true;
	},
	
	_afterSet: function (key, value) {
		
	},
	
	has: function (key) {
		return key in this.__properties;
	},
	
	set: function (key, value) {
		if (!this.__properties) 
			this.__properties = {};
		if (((! key in this.__properties) || (this.__properties[key] != value)) && (this._canSet(key, value))) {
			this.__properties[key] = value;
			this._afterSet(key, value);
			this.trigger("change", key, value);
			this.trigger("change:" + key, value);
		}
	},
	
	binding: function (key) {
		return {
			bindee: this,
			property: key
		};
	},
	
	getAll: function () {
		return BetaJS.Objs.clone(this.__properties || {}, 1);
	},
	
	setAll: function (obj) {
		for (var key in obj)
			this.set(key, obj[key]);
	},
	
	keys: function (mapped) {
		return BetaJS.Objs.keys(this.__properties, mapped);
	}	
	
};

BetaJS.Properties.Properties = BetaJS.Class.extend("Properties", [
	BetaJS.Events.EventsMixin,
	BetaJS.Properties.PropertiesMixin, {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Properties.Properties, "constructor");
		if (obj)
			this.setAll(obj);
	}
	
}]);


BetaJS.Properties.BindablePropertiesMixin = {
	
	_notifications: {
		"construct": "__bindable_properties_construct",
		"destroy": "__bindable_properties_destroy"
	},
	
	__bindable_properties_construct: function () {
		this.__properties = {};
	},
	
	__bindable_properties_destroy: function () {
		for (var key in this.__properties) 
			this.__bindable_remove(key);
	},
	
	__bindable_remove: function (key) {
		var entry = this.__properties[key];
		if (entry.bindee)
			entry.bindee.off("change:" + entry.property, null, this);
		delete this.__properties[key];
	},
	
	get: function (key) {
		var entry = this.__properties[key];
		if (entry == null)
			return null;
		if (entry.bindee)
			return entry.bindee.get(entry.property);
		return entry.value;
	},
	
	has: function (key) {
		return key in this.__properties;
	},
	
	set: function (key, value) {
		if (this.get(key) != value) {
			var entry = this.__properties[key];
			if (value.bindee && value.property) {
				if (entry)
					this.__bindable_remove(key);
				this.__properties[key] = value;
				value.bindee.on("change:" + value.property, function () {
					this.trigger("change");
					this.trigger("change:" + key);
				}, this);
			} else if (entry && entry.bindee) 
				entry.bindee.set(entry.property, value);
			else 
				this.__properties[key] = { value: value };
			this.trigger("change");
			this.trigger("change:" + key);
		}
	},
	
	binding: function (key) {
		return {
			bindee: this,
			property: key
		};
	},
	
	getAll: function () {
		var result = {};
		for (var key in this.__properties)
			result[key] = this.get(key);
		return result;
	},
	
	setAll: function (obj) {
		for (var key in obj)
			this.set(key, obj[key]);
	},
	
	keys: function (mapped) {
		return BetaJS.Objs.keys(this.__properties, mapped);
	}	
	
};

BetaJS.Properties.BindableProperties = BetaJS.Class.extend("BindableProperties", [
  	BetaJS.Events.EventsMixin,
	BetaJS.Properties.BindablePropertiesMixin, {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Properties.BindableProperties, "constructor");
		if (obj)
			this.setAll(obj);
	}
	
}]);