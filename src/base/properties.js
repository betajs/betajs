BetaJS.Properties = {};


BetaJS.Properties.TYPE_VALUE = 0;
BetaJS.Properties.TYPE_BINDING = 1;
BetaJS.Properties.TYPE_COMPUTED = 2;



BetaJS.Properties.PropertiesMixin = {
	
	get: function (key) {
		return key in this.__properties ? this.__properties[key].value : null;
	},
	
	_canSet: function (key, value) {
		return true;
	},
	
	_afterSet: function (key, value) {
	},
	
	has: function (key) {
		return key in this.__properties;
	},
	
	setAll: function (obj) {
		for (var key in obj)
			this.set(key, obj[key]);
	},
	
	keys: function (mapped) {
		return BetaJS.Objs.keys(this.__properties, mapped);
	},
	
	binding: function (key) {
		return {
			type: BetaJS.Properties.TYPE_BINDING,
			bindee: this,
			property: key
		};
	},
	
	computed : function (f, dependencies) {
		return {
			type: BetaJS.Properties.TYPE_COMPUTED,
			func: f,
			dependencies: dependencies || []
		};
	},
	
	_isBinding: function (object) {
		return BetaJS.Types.is_object(object) && object && object.type && object.type == BetaJS.Properties.TYPE_BINDING && object.bindee && object.property;
	},
	
	_isComputed: function (object) {
		return BetaJS.Types.is_object(object) && object && object.type && object.type == BetaJS.Properties.TYPE_COMPUTED && object.func && object.dependencies;
	},
		
	getAll: function () {
		var obj = {};
		for (var key in this.__properties)
			obj[key] = this.get(key);
		return obj;
	},
	
	unset: function (key) {
		if (key in this.__properties) {
			var entry = this.__properties[key];
			if (entry.type == BetaJS.Properties.TYPE_BINDING) {
				entry.bindee.off("change:" + entry.property, null, this.__properties[key]);
			} else if (entry.type == BetaJS.Properties.TYPE_COMPUTED) {
				var self = this;
				BetaJS.Objs.iter(entry.dependencies, function (dep) {
					if (this._isBinding(dep))
						dep.bindee.off("change:" + dep.property, null, this.__properties[key])
					else
						self.off("change:" + dep, null, this.__properties[key]);
				}, this);
			}
			delete this.__properties[key];
		};
	},
	
	set: function (key, value) {
		if (this.get(key) != value) {
			var self = this;
			var entry = this.__properties[key];
			if (this._isBinding(value)) {
				this.unset(key);
				this.__properties[key] = {
					type: BetaJS.Properties.TYPE_BINDING,
					bindee: value.bindee,
					property: value.property,
					value: value.bindee.get(value.property)
				};
				value.bindee.on("change:" + value.property, function () {
					self.__properties[key].value = value.bindee.get(value.property);
					self.trigger("change");
					self.trigger("change:" + key);
				}, this.__properties[key]);
				this._afterSet(key, this.__properties[key].value);
				this.trigger("change");
				this.trigger("change:" + key);
			} else if (this._isComputed(value)) {
				this.unset(key);
				this.__properties[key] = {
					type: BetaJS.Properties.TYPE_COMPUTED,
					func: value.func,
					dependencies: value.dependencies,
					value: value.func.apply(self)
				};
				BetaJS.Objs.iter(value.dependencies, function (dep) {
					if (this._isBinding(dep))
						dep.bindee.on("change:" + dep.property, function () {
							self.__properties[key].value = value.func.apply(self);
							self.trigger("change");
							self.trigger("change:" + key);
						}, this.__properties[key]);
					else
						self.on("change:" + dep, function () {
							self.__properties[key].value = value.func.apply(self);
							self.trigger("change");
							self.trigger("change:" + key);
						}, this.__properties[key]);
				}, this);
				this._afterSet(key, this.__properties[key].value);
				this.trigger("change");
				this.trigger("change:" + key);
			} else if (this._canSet(key, value)) {
				if (this.__properties[key] && this.__properties[key].type == BetaJS.Properties.TYPE_BINDING) {
					this.__properties[key].bindee.set(this.__properties[key].property, value);
				} else {
					this.unset(key);
					this.__properties[key] = {
						type: BetaJS.Properties.TYPE_VALUE,
						value: value
					};
					this._afterSet(key, value);
					this.trigger("change");
					this.trigger("change:" + key);
				}
			}
		}
	},
	
	_notifications: {
		"construct": "__properties_construct",
		"destroy": "__properties_destroy"
	},
	
	__properties_construct: function () {
		this.__properties = {};
	},
	
	__properties_destroy: function () {
		for (var key in this.__properties) 
			this.unset(key);
	},
	
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
