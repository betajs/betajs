Scoped.define("module:Iterators.ArrayIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ArrayIterator Class
         * 
         * @class BetaJS.Iterators.ArrayIterator
         */
        return {

            /**
             * Creates an Array Iterator
             * 
             * @param {array} arr array
             */
            constructor: function(arr) {
                inherited.constructor.call(this);
                this.__array = arr;
                this.__i = 0;
            },

            /**
             * @override
             */
            hasNext: function() {
                return this.__i < this.__array.length;
            },

            /**
             * @override
             */
            next: function() {
                var ret = this.__array[this.__i];
                this.__i++;
                return ret;
            }

        };
    }, {

        /**
         * Creates an Array Iterator by an iteration function
         * 
         * @param {function} iterate_func Iteration function
         * @param {object} iterate_func_ctx Optional context
         * 
         * @return {object} Array Iterator instance
         */
        byIterate: function(iterate_func, iterate_func_ctx) {
            var result = [];
            iterate_func.call(iterate_func_ctx || this, function(item) {
                result.push(item);
            }, this);
            return new this(result);
        }
    });
});


Scoped.define("module:Iterators.NativeMapIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * NativeMapIterator Class
         * 
         * @class BetaJS.Iterators.NativeMapIterator
         */
        return {

            /**
             * Creates a Native Map Iterator
             * 
             * @param {Map} map Iterator based on the values of this native map
             */
            constructor: function(map) {
                inherited.constructor.call(this);
                this.__iter = map.values();
                this.__next = this.__iter.next();
            },

            /**
             * @override
             */
            hasNext: function() {
                return !this.__next.done;
            },

            /**
             * @override
             */
            next: function() {
                var value = this.__next.value;
                this.__next = this.__iter.next();
                return value;
            }

        };
    });
});


Scoped.define("module:Iterators.ObjectKeysIterator", ["module:Iterators.ArrayIterator"], function(ArrayIterator, scoped) {
    return ArrayIterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ObjectKeysIterator Class
         * 
         * @class BetaJS.Iterators.ObjectKeysIterator
         */
        return {

            /**
             * Creates an Object Keys Iterator
             * 
             * @param {object} obj Object to create iterator from
             */
            constructor: function(obj) {
                inherited.constructor.call(this, Object.keys(obj));
            }

        };
    });
});


Scoped.define("module:Iterators.ObjectValuesIterator", ["module:Iterators.ArrayIterator", "module:Objs"], function(ArrayIterator, Objs, scoped) {
    return ArrayIterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ObjectValuesIterator Class
         * 
         * @class BetaJS.Iterators.ObjectValuesIterator
         */
        return {

            /**
             * Creates an Object Values Iterator
             * 
             * @param {object} obj Object to create iterator from
             */
            constructor: function(obj) {
                inherited.constructor.call(this, Objs.values(obj));
            }

        };
    });
});


Scoped.define("module:Iterators.LazyMultiArrayIterator", ["module:Iterators.LazyIterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * LazyMultiArrayIterator Class
         * 
         * @class BetaJS.Iterators.LazyMultiArrayIterator
         */
        return {

            /**
             * Creates a Lazy Multi Array Iterator
             * 
             * @param {function} next_callback Function returning the next array
             * @param {object} next_context Context for next function
             */
            constructor: function(next_callback, next_context) {
                inherited.constructor.call(this);
                this.__next_callback = next_callback;
                this.__next_context = next_context;
                this.__array = null;
                this.__i = 0;
            },

            /**
             * @override
             */
            _next: function() {
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