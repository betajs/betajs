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
					var object = is_prop ? oriObject : new Properties(oriObject);
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
				var result = this.__data.remove(object);
				if ("off" in object)
					object.off(null, null, this);
				this.trigger("remove", object);
				this.trigger("update");
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


Scoped.define("module:Collections.MappedCollection", [
    "module:Collections.Collection",
    "module:Functions"
], function (Collection, Functions, scoped) {
	return Collection.extend({scoped: scoped}, function (inherited) {
		return {

			constructor : function(parent, options) {
				this.__parent = parent;
				this.__parentToThis = {};
				this.__thisToParent = {};
				options = options || {};
				delete options.objects;
				options.compare = Functions.as_method(this.__compareByParent, this);
				inherited.constructor.call(this, options);
				this._mapFunction = options.map;
				this._mapCtx = options.context;
				parent.on("add", this.__parentAdd, this);
				parent.on("remove", this.__parentRemove, this);
				parent.on("change", this.__parentUpdate, this);
				parent.iterate(this.__parentAdd, this);		
			},
			
			destroy: function () {
				this.__parent.off(null, null, this);
				inherited.destroy.call(this);
			},

			__compareByParent: function (item1, item2) {
				return this.__parent.getIndex(this.__thisToParent[item1.cid()]) - this.__parent.getIndex(this.__thisToParent[item2.cid()]);
			},
			
			__mapItem: function (parentItem, thisItem) {
				return this._mapFunction.call(this._mapCtx || this, parentItem, thisItem);
			},
			
			__parentAdd: function (item) {
				var mapped = this.__mapItem(item);
				this.__parentToThis[item.cid()] = mapped;
				this.__thisToParent[mapped.cid()] = item;
				this.add(mapped);
			},
			
			__parentUpdate: function (item) {
				this.__mapItem(item, this.__parentToThis[item.cid()]);
			},
			
			__parentRemove: function (item) {
				var mapped = this.__parentToThis[item.cid()];
				delete this.__parentToThis[item.cid()];
				delete this.__thisToParent[mapped.cid()];
				this.remove(mapped);
			}
		
		};	
	});
});


Scoped.define("module:Collections.ConcatCollection", [
    "module:Collections.Collection",
    "module:Objs",
    "module:Functions"
], function (Collection, Objs, Functions, scoped) {
	return Collection.extend({scoped: scoped}, function (inherited) {
		return {

			constructor : function (parents, options) {
				this.__parents = {};
				this.__itemToParent = {};
				options = options || {};
				delete options.objects;
				options.compare = Functions.as_method(this.__compareByParent, this);
				inherited.constructor.call(this, options);				
				var idx = 0;
				Objs.iter(parents, function (parent) {
					this.__parents[parent.cid()] = {
						idx: idx,
						parent: parent
					};
					parent.iterate(function (item) {
						this.__parentAdd(parent, item);
					}, this);
					parent.on("add", function (item) {
						this.__parentAdd(parent, item);
					}, this);
					parent.on("remove", function (item) {
						this.__parentRemove(parent, item);
					}, this);
					idx++;
				}, this);
			},
			
			destroy: function () {
				Objs.iter(this.__parents, function (parent) {
					parent.parent.off(null, null, this);
				}, this);
				inherited.destroy.call(this);
			},
			
			__parentAdd: function (parent, item) {
				this.__itemToParent[item.cid()] = parent;
				this.add(item);
			},
			
			__parentRemove: function (parent, item) {
				delete this.__itemToParent[item.cid()];
				this.remove(item);
			},
			
			__compareByParent: function (item1, item2) {
				var parent1 = this.__itemToParent[item1.cid()];
				var parent2 = this.__itemToParent[item2.cid()];
				if (parent1 === parent2)
					return parent1.getIndex(item1) - parent2.getIndex(item2);
				return this.__parents[parent1.cid()].idx - this.__parents[parent2.cid()].idx;
			}			
		
		};	
	});
});
