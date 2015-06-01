Scoped.define("module:Collections.Collection", [
	    "module:Class",
	    "module:Events.EventsMixin",
	    "module:Objs",
	    "module:Functions",
	    "module:Lists.ArrayList",
	    "module:Ids",
	    "module:Properties.Properties",
	    "module:Iterators.ArrayIterator"
	], function (Class, EventsMixin, Objs, Functions, ArrayList, Ids, Properties, ArrayIterator, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {

			constructor : function(options) {
				inherited.constructor.call(this);
				options = options || {};
				this.__indices = {};
				if (options.indices)
					Objs.iter(options.indices, this.add_secondary_index, this);
				var list_options = {};
				if ("compare" in options)
					list_options.compare = options.compare;
				list_options.get_ident = Functions.as_method(this.get_ident, this);
				this.__data = new ArrayList([], list_options);
				var self = this;
				this.__data._ident_changed = function (object, index) {
					self._index_changed(object, index);
				};
				this.__data._re_indexed = function (object) {
					self._re_indexed(object);
				};
				this.__data._sorted = function () {
					self._sorted();
				};
				if ("objects" in options)
					this.add_objects(options.objects);
			},
			
			add_secondary_index: function (key) {
				this.__indices[key] = {};
				this.iterate(function (object) {
					this.__indices[key][object.get(key)] = object;
				}, this);
			},
			
			get_by_secondary_index: function (key, value) {
				return this.__indices[key][value];
			},
			
			get_ident: function (obj) {
				return Ids.objectId(obj);
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
				}, this);
				this.__data.destroy();
				this.trigger("destroy");
				inherited.destroy.call(this);
			},
			
			count: function () {
				return this.__data.count();
			},
			
			_index_changed: function (object, index) {
				this.trigger("index", object, index);
			},
			
			_re_indexed: function (object) {
				this.trigger("reindexed", object);
			},
			
			_sorted: function () {
				this.trigger("sorted");
			},
			
			_object_changed: function (object, key, value) {
				this.trigger("update");
				this.trigger("change", object, key, value);
				this.trigger("change:" + key, object, value);
				this.__data.re_index(this.getIndex(object));
			},
			
			add: function (object) {
				if (!Class.is_class_instance(object))
					object = new Properties(object);
				if (this.exists(object))
					return null;
				var ident = this.__data.add(object);
				if (ident !== null) {
					Objs.iter(this.__indices, function (entry, key) {
						entry[object.get(key)] = object;
					}, this);
					this.trigger("add", object);
					this.trigger("update");
					if ("on" in object)
						object.on("change", function (key, value, oldvalue) {
							this._object_changed(object, key, value, oldvalue);
						}, this);
				}
				return ident;
			},
			
			replace_objects: function (objects) {
				var ids = {};
				Objs.iter(objects, function (oriObject) {
					var is_prop = Class.is_class_instance(oriObject);
					var object = is_prop ? new Properties(oriObject) : oriObject;
					ids[this.get_ident(object)] = true;
					if (this.exists(object)) {
						var existing = this.getById(this.get_ident(object));
						if (is_prop) {
							this.remove(existing);
							this.add(object);
						} else
							existing.setAll(oriObject);
					} else
						this.add(object);
				}, this);
				var iterator = this.iterator();
				while (iterator.hasNext()) {
					var object = iterator.next();
					var ident = this.get_ident(object);
					if (!(ident in ids))
						this.remove(object);
				}
				iterator.destroy();
			},
			
			add_objects: function (objects) {
				var count = 0;
				Objs.iter(objects, function (object) {
					if (this.add(object))
						count++;
				}, this);		
				return count;
			},
			
			exists: function (object) {
				return this.__data.exists(object);
			},
			
			remove: function (object) {
				if (!this.exists(object))
					return null;
				Objs.iter(this.__indices, function (entry, key) {
					delete entry[object.get(key)];
				}, this);
				this.trigger("remove", object);
				this.trigger("update");
				var result = this.__data.remove(object);
				if ("off" in object)
					object.off(null, null, this);
				return result;
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
			
			iterate: function (cb, context) {
				this.__data.iterate(cb, context);
			},
			
			iterator: function () {
				return ArrayIterator.byIterate(this.iterate, this);
			},
			
			clear: function () {
				this.iterate(function (obj) {
					this.remove(obj);
				}, this);
			}
			
		};
	}]);
});


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
				this.__parent.on("remove", this.remove, this);
				this.setFilter(options.filter, options.context);
			},
			
			filter: function (object) {
				return !this.__filter || this.__filter.call(this.__filterContext || this, object);
			},
			
			setFilter: function (filterFunction, filterContext) {
				this.__filterContext = filterContext;
				this.__filter = filterFunction;
				this.iterate(function (obj) {
					inherited.remove.call(this, obj);
				}, this);
				this.__parent.iterate(function (object) {
					this.add(object);
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
