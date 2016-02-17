Scoped.define("module:Collections.Collection", [
	    "module:Class",
	    "module:Events.EventsMixin",
	    "module:Objs",
	    "module:Functions",
	    "module:Lists.ArrayList",
	    "module:Ids",
	    "module:Properties.Properties",
	    "module:Iterators.ArrayIterator",
	    "module:Iterators.FilteredIterator",
	    "module:Iterators.ObjectValuesIterator",
	    "module:Types",
	    "module:Promise"
	], function (Class, EventsMixin, Objs, Functions, ArrayList, Ids, Properties, ArrayIterator, FilteredIterator, ObjectValuesIterator, Types, Promise, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {

			constructor : function(options) {
				inherited.constructor.call(this);
				if (Types.is_array(options)) {
					options = {
						objects: options
					};
				}
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
					var value = object.get(key);
					this.__indices[key][value] = this.__indices[key][value] || {};
					this.__indices[key][value][this.get_ident(object)] = object;
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
					Objs.iter(this.__indices, function (entries, key) {
						var value = object.get(key);
						entries[value] = entries[value] || {};
						entries[value][this.get_ident(object)] = object;
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
			
			replace_objects: function (objects, keep_others) {
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
				if (!keep_others) {
					var iterator = this.iterator();
					while (iterator.hasNext()) {
						var object = iterator.next();
						var ident = this.get_ident(object);
						if (!(ident in ids))
							this.remove(object);
					}
					iterator.destroy();
				}
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
					var value = object.get(key);
					if (entry[value]) {
						delete entry[value][this.get_ident(object)];
						if (Types.is_empty(entry[value]))
							delete entry[value];
					}
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
			
			iterateSecondaryIndexValue: function (key, value) {
				return new ObjectValuesIterator(this.__indices[key][value]);
			},
			
			query: function (subset) {
				var iterator = null;
				for (var index_key in this.__indices) {
					if (index_key in subset) {
						iterator = this.iterateSecondaryIndexValue(index_key, subset[index_key]);
						break;
					}
				}
				return new FilteredIterator(iterator || this.iterator(), function (prop) {
					return prop.isSupersetOf(subset); 
				});
			},
			
			clear: function () {
				this.iterate(function (obj) {
					this.remove(obj);
				}, this);
			},
			
			increase_forwards: function (steps) {
				return Promise.error(true);
			}
			
		};
	}]);
});
