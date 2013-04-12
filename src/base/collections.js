BetaJS.Collections = {};


BetaJS.Collections.Collection = BetaJS.Class.extend("Collection", [
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Events.EventsMixin, {
		
	constructor: function (options) {
		this._inherited(BetaJS.Collections.Collection, "constructor");
		options = options || {};
		var list_options = {};
		if ("compare" in options)
			list_options["compare"] = options["compare"];
		this.__data = new BetaJS.Lists.IdArrayList({}, list_options);
		this.__data._ident_changed = function (object, index) {
			self._index_changed(object, index);
		};
		if (options["objects"])
			this.addArray(options["objects"]);
	},
	
	set_compare: function (compare) {
		this.__data.set_compare(compare);
	},
	
	get_compare: function () {
		this.__data.get_compare();
	},

	destroy: function () {
		this.__data.iterate(function (object) {
			if ("off" in object)
				object.off(null, null, this);
		});
		this.__data.destroy();
		this._inherited(BetaJS.Collections.Collection, "destroy");
	},
	
	_index_changed: function (object, index) {
		this.trigger("index", object, index);
	},
	
	_object_changed: function (object, key, value) {
		this.trigger("change", object, key, value);
		this.trigger("change:" + key, object, value);
		this.__data.re_index(object);
	},
	
	add: function (object) {
		if (this.exists(object))
			return null;
		var ident = this.__data.add(object);
		if (ident) {
			this.trigger("add", object);
			if ("on" in object)
				object.on("change", function (key, value) {
					this._object_changed(object, key, value);
				}, this);
		}
		return ident;
	},
	
	addArray: function (objects) {
		BetaJS.Objs.iter(objects, function (object) {
			this.add(object);
		}, this);
	},
	
	exists: function (object) {
		return this.__data.exists(object);
	},
	
	remove: function (object) {
		if (!this.exists(object))
			return null;
		var obj = this.__data.remove(object);
		if (obj) {
			this.trigger("remove", object);
			if ("off" in object)
				object.off(null, null, this);
		}
		return object;
	},
	
	getByIndex: function (index) {
		return this.__data.get(index);
	},
	
	getById: function (id) {
		return this.__data.get(this.__data.ident_by_id(id));
	},
	
	getIndex: function (object) {
		return this.__data.get_ident(object);
	},
	
	iterate: function (cb) {
		this.__data.iterate(cb);
	}
		
}]);



BetaJS.Collections.FilteredCollection = BetaJS.Collections.Collection.extend("FilteredCollection", {
	
	constructor: function (parent, options) {
		this.__parent = parent;
		options = options || {};
		delete options["objects"];
		options.compare = options.compare || parent.get_compare();
		this._inherited(BetaJS.Collections.FilteredCollection, "constructor", options);
		if ("filter" in options)
			this.filter = options["filter"];
		var self = this;
		this.__parent.iterate(function (object) {
			self.add(object);
			return true;
		});
		this.__parent.on("add", this.add, this);
		this.__parent.on("remove", this.remove, this);
	},
	
	filter: function (object) {
		return true;
	},
	
	_object_changed: function (object, key, value) {
		this._inherited(BetaJS.Collections.FilteredCollection, "_object_changed", object, key, value);
		if (!this.filter(object))
			this.__selfRemove(object);
	},
	
	destroy: function () {
		this.__parent.off(null, null, this);
		this._inherited(BetaJS.Collections.FilteredCollection, "destroy");
	},
	
	__selfAdd: function (object) {
		return this._inherited(BetaJS.Collections.FilteredCollection, "add", object);
	},
	
	add: function (object) {
		if (this.exists(object) || !this.filter(object))
			return null;
		var id = this.__selfAdd(object);
		this.__parent.add(object);
		return id;
	},
	
	__selfRemove: function (object) {
		return this._inherited(BetaJS.Collections.FilteredCollection, "remove", object);
	},

	remove: function (object) {
		if (!this.exists(object))
			return null;
		var result = this.__selfRemove(object);
		if (result == null)
			return null;
		return this.__parent.remove(object);
	}
	
});
