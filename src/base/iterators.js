Scoped.extend("module:Iterators", ["module:Types", "module:Iterators.Iterator", "module:Iterators.ArrayIterator"], function (Types, Iterator, ArrayIterator) {
	return {
		ensure: function (mixed) {
			if (mixed === null)
				return new ArrayIterator([]);
			if (mixed.instance_of(Iterator))
				return mixed;
			if (Types.is_array(mixed))
				return new ArrayIterator(mixed);
			return new ArrayIterator([mixed]);
		}
	};
});


Scoped.define("module:Iterators.Iterator", ["module:Class", "module:Functions"], function (Class, Functions, scoped) {
	return Class.extend({scoped: scoped}, {

		asArray: function () {
			var arr = [];
			while (this.hasNext())
				arr.push(this.next());
			return arr;
		},

		asArrayDelegate: function (f) {
			var arr = [];
			while (this.hasNext()) {
				var obj = this.next();
				arr.push(obj[f].apply(obj, Functions.getArguments(arguments, 1)));
			}
			return arr;
		},

		iterate: function (callback, context) {
			while (this.hasNext())
				callback.call(context || this, this.next());
		}

	});
});


Scoped.define("module:Iterators.ArrayIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (arr) {
				inherited.constructor.call(this);
				this.__array = arr;
				this.__i = 0;
			},

			hasNext: function () {
				return this.__i < this.__array.length;
			},

			next: function () {
				var ret = this.__array[this.__i];
				this.__i++;
				return ret;
			}
		};
	}, {

		byIterate: function (iterate_func, iterate_func_ctx) {
			var result = [];
			iterate_func.call(iterate_func_ctx || this, function (item) {
				result.push(item);
			}, this);
			return new this(result);
		}
	});
});


Scoped.define("module:Iterators.ObjectKeysIterator", ["module:Iterators.ArrayIterator", "module:Objs"], function (ArrayIterator, Objs, scoped) {
	return ArrayIterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (obj) {
				inherited.constructor.call(this, Objs.keys(obj));
			}

		};
	});
});


Scoped.define("module:Iterators.ObjectValuesIterator", ["module:Iterators.ArrayIterator", "module:Objs"], function (ArrayIterator, Objs, scoped) {
	return ArrayIterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (obj) {
				inherited.constructor.call(this, Objs.values(obj));
			}

		};
	});
});


Scoped.define("module:Iterators.MappedIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (iterator, map, context) {
				inherited.constructor.call(this);
				this.__iterator = iterator;
				this.__map = map;
				this.__context = context || this;
			},

			hasNext: function () {
				return this.__iterator.hasNext();
			},

			next: function () {
				return this.hasNext() ? this.__map.call(this.__context, this.__iterator.next()) : null;
			}

		};
	});
});


Scoped.define("module:Iterators.FilteredIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (iterator, filter, context) {
				inherited.constructor.call(this);
				this.__iterator = iterator;
				this.__filter = filter;
				this.__context = context || this;
				this.__next = null;
			},

			hasNext: function () {
				this.__crawl();
				return this.__next !== null;
			},

			next: function () {
				this.__crawl();
				var item = this.__next;
				this.__next = null;
				return item;
			},

			__crawl: function () {
				while (!this.__next && this.__iterator.hasNext()) {
					var item = this.__iterator.next();
					if (this.__filter_func(item))
						this.__next = item;
				}
			},

			__filter_func: function (item) {
				return this.__filter.apply(this.__context, [item]);
			}

		};
	});
});


Scoped.define("module:Iterators.SkipIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (iterator, skip) {
				inherited.constructor.call(this);
				this.__iterator = iterator;
				while (skip > 0) {
					iterator.next();
					skip--;
				}
			},

			hasNext: function () {
				return this.__iterator.hasNext();
			},

			next: function () {
				return this.__iterator.next();
			}

		};
	});
});


Scoped.define("module:Iterators.LimitIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (iterator, limit) {
				inherited.constructor.call(this);
				this.__iterator = iterator;
				this.__limit = limit;
			},

			hasNext: function () {
				return this.__limit > 0 && this.__iterator.hasNext();
			},

			next: function () {
				if (this.__limit <= 0)
					return null;
				this.__limit--;
				return this.__iterator.next();
			}

		};
	});
});


Scoped.define("module:Iterators.SortedIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (iterator, compare) {
				inherited.constructor.call(this);
				this.__array = iterator.asArray();
				this.__array.sort(compare);
				this.__i = 0;
			},

			hasNext: function () {
				return this.__i < this.__array.length;
			},

			next: function () {
				var ret = this.__array[this.__i];
				this.__i++;
				return ret;
			}

		};
	});
});