Scoped.define("module:Collections.FilteredCollection", [
	    "module:Collections.Collection"
	], function (Collection, scoped) {
	return Collection.extend({scoped: scoped}, function (inherited) {
		return {

			constructor : function(parent, options) {
				this.__parent = parent;
				options = options || {};
				delete options.objects;
				options.compare = options.compare || parent.get_compare();
				inherited.constructor.call(this, options);
				this.__parent.on("add", this.add, this);
				this.__parent.on("remove", this.__selfRemove, this);
				this.setFilter(options.filter, options.context);
			},
			
			filter: function (object) {
				return !this.__filter || this.__filter.call(this.__filterContext || this, object);
			},
			
			setFilter: function (filterFunction, filterContext) {
				this.__filterContext = filterContext;
				this.__filter = filterFunction;
				this.iterate(function (obj) {
					if (!this.filter(obj))
						this.__selfRemove(obj);
				}, this);
				this.__parent.iterate(function (object) {
					if (!this.exists(object) && this.filter(object))
						this.__selfAdd(object);
					return true;
				}, this);
			},
			
			_object_changed: function (object, key, value) {
				inherited._object_changed.call(this, object, key, value);
				if (!this.filter(object))
					this.__selfRemove(object);
			},
			
			destroy: function () {
				this.__parent.off(null, null, this);
				inherited.destroy.call(this);
			},
			
			__selfAdd: function (object) {
				return inherited.add.call(this, object);
			},
			
			add: function (object) {
				if (this.exists(object) || !this.filter(object))
					return null;
				var id = this.__selfAdd(object);
				this.__parent.add(object);
				return id;
			},
			
			__selfRemove: function (object) {
				return inherited.remove.call(this, object);
			},
		
			remove: function (object) {
				if (!this.exists(object))
					return null;
				var result = this.__selfRemove(object);
				if (!result)
					return null;
				return this.__parent.remove(object);
			}
			
		};	
	});
});
