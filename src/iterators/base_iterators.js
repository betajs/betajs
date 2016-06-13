Scoped.define("module:Iterators.ArrayIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		
		/** ArrayIterator Class
		 * 
		 * @class BetaJS.Iterators.ArrayIterator
		 */
		return {

			/** Creates an Array Iterator
			 * 
			 * @param arr array
			 */
			constructor: function (arr) {
				inherited.constructor.call(this);
				this.__array = arr;
				this.__i = 0;
			},

			/** Determines whether there are more items.
			 * 
			 * @return true if there are more items
			 */
			hasNext: function () {
				return this.__i < this.__array.length;
			},

			/** Returns the next items if there is one.
			 * 
			 * @return next item
			 */
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


Scoped.define("module:Iterators.NativeMapIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (map) {
				inherited.constructor.call(this);
				this.__iter = map.values();
				this.__next = this.__iter.next();
			},

			hasNext: function () {
				return !this.__next.done;
			},

			next: function () {
				var value = this.__next.value;
				this.__next = this.__iter.next();
				return value;
			}
			
		};
	});
});


Scoped.define("module:Iterators.ObjectKeysIterator", ["module:Iterators.ArrayIterator"], function (ArrayIterator, scoped) {
	return ArrayIterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (obj) {
				inherited.constructor.call(this, Object.keys(obj));
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


Scoped.define("module:Iterators.LazyMultiArrayIterator", ["module:Iterators.LazyIterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (next_callback, next_context) {
				inherited.constructor.call(this);
				this.__next_callback = next_callback;
				this.__next_context = next_context;
				this.__array = null;
				this.__i = 0;
			},

			_next: function () {
				if (this.__array === null || this.__i >= this.__array.length) {
					this.__array = this.__next_callback.apply(this.__next_context);
					this.__i = 0;
				}
				if (this.__array !== null) {
					var ret = this.__array[this.__i];
					this.__i++;
					return ret;
				} else
					this._finished();
			}

		};
	});
});
