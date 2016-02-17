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


Scoped.define("module:Iterators.LazyIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function () {
				inherited.constructor.call(this);
				this.__finished = false;
				this.__initialized = false;
				this.__current = null;
				this.__has_current = false;
			},

			_initialize: function () {},

			_next: function () {},

			_finished: function () {
				this.__finished = true;
			},

			_current: function (result) {
				this.__current = result;
				this.__has_current = true;
			},

			__touch: function () {
				if (!this.__initialized)
					this._initialize();
				this.__initialized = true;
				if (!this.__has_current && !this.__finished)
					this._next();
			},

			hasNext: function () {
				this.__touch();
				return this.__has_current;
			},

			next: function () {
				this.__touch();
				this.__has_current = false;
				return this.__current;
			}

		};
	});
});


Scoped.define("module:Iterators.SortedOrIterator", ["module:Iterators.LazyIterator", "module:Structures.TreeMap", "module:Objs"], function (Iterator, TreeMap, Objs, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (iterators, compare) {
				this.__iterators = iterators;
				this.__map = TreeMap.empty(compare);
				inherited.constructor.call(this);
			},

			__process: function (iter) {
				if (iter.hasNext()) {
					var n = iter.next();
					var value = TreeMap.find(n, this.__map);
					if (value)
						value.push(iter);
					else 
						this.__map = TreeMap.add(n, [iter], this.__map);
				}
			},

			_initialize: function () {
				Objs.iter(this.__iterators, this.__process, this);
				if (TreeMap.is_empty(this.__map))
					this._finished();
			},

			_next: function () {
				var ret = TreeMap.take_min(this.__map);
				this._current(ret[0].key);
				this.__map = ret[1];
				Objs.iter(ret[0].value, this.__process, this);
				if (TreeMap.is_empty(this.__map))
					this._finished();
			}

		};
	});
});


Scoped.define("module:Iterators.PartiallySortedIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (iterator, compare, partial_same) {
				inherited.constructor.call(this);
				this.__compare = compare;
				this.__partial_same = partial_same;
				this.__iterator = iterator;
				this.__head = [];
				this.__tail = [];
			},

			__cache: function () {
				if (this.__head.length > 0)
					return;
				this.__head = this.__tail;
				this.__tail = [];
				if (!this.__iterator.hasNext())
					return;
				if (this.__head.length === 0)
					this.__head.push(this.__iterator.next());
				while (this.__iterator.hasNext()) {
					var n = this.__iterator.next();
					if (!this.__partial_same(this.__head[0], n)) {
						this.__tail.push(n);
						break;
					}
					this.__head.push(n);
				}
				this.__head.sort(this.__compare);
			},

			hasNext: function () {
				this.__cache();
				return this.__head.length > 0;
			},

			next: function () {
				this.__cache();
				return this.__head.shift();
			}

		};
	});		
});
