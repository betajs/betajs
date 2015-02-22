Scoped.define("module:Lists.AbstractList", [
	"module:Class",
	"module:Objs",
	"module:Types",
	"module:Iterators.ArrayIterator"
], function (Class, Objs, Types, ArrayIterator, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			_add: function (object) {},
			_remove: function (ident) {},
			_get: function (ident) {},
			_iterate: function (callback, context) {},

			get_ident: function (object) {
				var ident = null;
				this._iterate(function (obj, id) {
					if (obj == object) {
						ident = id;
						return false;
					}
					return true;
				});
				return ident;
			},

			exists: function (object) {
				return object && this.get_ident(object) !== null;
			},

			_ident_changed: function (object, new_ident) {},

			constructor: function (objects) {
				inherited.constructor.call(this);
				this.__count = 0;
				if (objects) {
					Objs.iter(objects, function (object) {
						this.add(object);
					}, this);
				}
			},

			add: function (object) {
				var ident = this._add(object);
				if (Types.is_defined(ident))
					this.__count++;
				return ident;
			},

			count: function () {
				return this.__count;
			},

			clear: function () {
				this._iterate(function (object, ident) {
					this.remove_by_ident(ident);
					return true;
				}, this);
			},

			remove_by_ident: function (ident) {
				var ret = this._remove(ident);
				if (Types.is_defined(ret))
					this.__count--;
				return ret;
			},

			remove: function (object) {
				return this.remove_by_ident(this.get_ident(object));
			},

			remove_by_filter: function (filter) {
				this._iterate(function (object, ident) {
					if (filter(object))
						this.remove_by_ident(ident);
					return true;
				}, this);
			},

			get: function (ident) {
				return this._get(ident);
			},

			iterate: function (cb, context) {
				this._iterate(function (object, ident) {
					var ret = cb.apply(this, [object, ident]);
					return Types.is_defined(ret) ? ret : true;
				}, context);
			},

			iterator: function () {
				return ArrayIterator.byIterate(this.iterate, this);
			}

		};
	});
});


Scoped.define("module:Lists.LinkedList", ["module:Lists.AbstractList"], function (AbstractList, scoped) {
	return AbstractList.extend({scoped: scoped},  {

		__first: null,
		__last: null,

		_add: function (obj) {
			this.__last = {
				obj: obj,
				prev: this.__last,
				next: null
			};
			if (this.__first)
				this.__last.prev.next = this.__last;
			else
				this.__first = this.__last;
			return this.__last;
		},

		_remove: function (container) {
			if (container.next)
				container.next.prev = container.prev;
			else
				this.__last = container.prev;
			if (container.prev)
				container.prev.next = container.next;
			else
				this.__first = container.next;
			return container.obj;
		},

		_get: function (container) {
			return container.obj;
		},

		_iterate: function (cb, context) {
			var current = this.__first;
			while (current) {
				var prev = current;
				current = current.next;
				if (!cb.apply(context || this, [prev.obj, prev]))
					return;
			}
		}

	});
});


Scoped.define("module:Lists.ObjectIdList", ["module:Lists.AbstractList", "module:Ids"], function (AbstractList, Ids, scoped) {
	return AbstractList.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (objects, id_generator) {
				this.__map = {};
				this.__id_generator = id_generator;
				inherited.constructor.call(this, objects);
			},

			_add: function (object) {
				while (true) {
					var id = object.__cid;
					if (!id) {
						id = this.__id_generator ? Ids.objectId(object, this.__id_generator()) : Ids.objectId(object);
						if (this.__map[id] && this.__id_generator)
							continue;
					}
					this.__map[id] = object;
					return id;
				}
				return null;
			},

			_remove: function (ident) {
				var obj = this.__map[ident];
				delete this.__map[ident];
				return obj;
			},

			_get: function (ident) {
				return this.__map[ident];
			},

			_iterate: function (callback, context) {
				for (var key in this.__map)
					callback.apply(context || this, [this.__map[key], key]);
			},

			get_ident: function (object) {
				var ident = Ids.objectId(object);
				return this.__map[ident] ? ident : null;
			}

		};
	});
});



Scoped.define("module:Lists.ArrayList", ["module:Lists.AbstractList", "module:Ids", "module:Objs"], function (AbstractList, Ids, Objs, scoped) {
	return AbstractList.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (objects, options) {
				this.__idToIndex = {};
				this.__items = [];
				options = options || {};
				if ("compare" in options)
					this._compare = options["compare"];
				if ("get_ident" in options)
					this._get_ident = options["get_ident"];
				inherited.constructor.call(this, objects);
			},

			set_compare: function (compare) {
				this._compare = compare;
				if (compare)
					this.sort();
			},

			get_compare: function () {
				return this._compare;
			},

			sort: function (compare) {
				compare = compare || this._compare;
				if (!compare)
					return;
				this.__items.sort(compare);
				for (var i = 0; i < this.__items.length; ++i)
					this.__ident_changed(this.__items[i], i);
				this._sorted();
			},

			_sorted: function () {},

			re_index: function (index) {
				if (!this._compare)
					return index;
				var last = this.__items.length - 1;
				var object = this.__items[index];
				var i = index;
				while (i < last && this._compare(this.__items[i], this.__items[i + 1]) > 0) {
					this.__items[i] = this.__items[i + 1];
					this.__ident_changed(this.__items[i], i);
					this.__items[i + 1] = object;
					++i;
				}
				if (i == index) {
					while (i > 0 && this._compare(this.__items[i], this.__items[i - 1]) < 0) {
						this.__items[i] = this.__items[i - 1];
						this.__ident_changed(this.__items[i], i);
						this.__items[i - 1] = object;
						--i;
					}
				}
				if (i != index) {
					this.__ident_changed(object, i);
					this._re_indexed(object);
				}
				return i;
			},

			_re_indexed: function (object) {},

			__objectId: function(object) {
				return this._get_ident ? this._get_ident(object) : Ids.objectId(object);
			},

			_add: function (object) {
				var last = this.__items.length;
				this.__items.push(object);
				var i = this.re_index(last);
				this.__idToIndex[this.__objectId(object)] = i;
				return i;
			},

			_remove: function (ident) {
				var obj = this.__items[ident];
				for (var i = ident + 1; i < this.__items.length; ++i) {
					this.__items[i-1] = this.__items[i];
					this.__ident_changed(this.__items[i-1], i-1);
				}
				this.__items.pop();
				delete this.__idToIndex[this.__objectId(obj)];
				return obj;
			},

			_get: function (ident) {
				return this.__items[ident];
			},

			_iterate: function (callback, context) {
				var items = Objs.clone(this.__items, 1);
				for (var i = 0; i < items.length; ++i)
					callback.apply(context || this, [items[i], this.get_ident(items[i])]);
			},

			__ident_changed: function (object, index) {
				this.__idToIndex[this.__objectId(object)] = index;
				this._ident_changed(object, index);
			},

			get_ident: function (object) {
				var id = this.__objectId(object);
				return id in this.__idToIndex ? this.__idToIndex[id] : null;
			},

			ident_by_id: function (id) {
				return this.__idToIndex[id];
			}

		};
	});
});