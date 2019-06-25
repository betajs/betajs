Scoped.define("module:Iterators.MappedIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, mapping each object using a function.
         * 
         * @class BetaJS.Iterators.MappedIterator
         */
        return {

            /**
             * Create a new instance.
             * 
             * @param {object} iterator Source iterator
             * @param {function} map Function mapping source objects to target objects
             * @param {object} context Context for the map function
             */
            constructor: function(iterator, map, context) {
                inherited.constructor.call(this);
                this.__iterator = iterator;
                this.__map = map;
                this.__context = context || this;
            },

            /**
             * @override
             */
            hasNext: function() {
                return this.__iterator.hasNext();
            },

            /**
             * @override
             */
            next: function() {
                return this.hasNext() ? this.__map.call(this.__context, this.__iterator.next()) : null;
            }

        };
    });
});


Scoped.define("module:Iterators.FilteredIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, filtering single objects by a function.
         * 
         * @class BetaJS.Iterators.FilteredIterator
         */
        return {

            /**
             * Create a new instance.
             * 
             * @param {object} iterator Source iterator
             * @param {function} filter Filter function
             * @param {object} context Context for the filter function
             */
            constructor: function(iterator, filter, context) {
                inherited.constructor.call(this);
                this.__iterator = iterator;
                this.__filter = filter;
                this.__context = context || this;
                this.__next = null;
            },

            /**
             * @override
             */
            hasNext: function() {
                this.__crawl();
                return this.__next !== null;
            },

            /**
             * @override
             */
            next: function() {
                this.__crawl();
                var item = this.__next;
                this.__next = null;
                return item;
            },

            __crawl: function() {
                while (!this.__next && this.__iterator.hasNext()) {
                    var item = this.__iterator.next();
                    if (this.__filter_func(item))
                        this.__next = item;
                }
            },

            __filter_func: function(item) {
                return this.__filter.apply(this.__context, [item]);
            }

        };
    });
});


Scoped.define("module:Iterators.SkipIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, skipping some elements.
         * 
         * @class BetaJS.Iterators.SkipIterator
         */
        return {

            /**
             * Create an instance.
             * 
             * @param {object} iterator Source iterator
             * @param {int} skip How many elements should be skipped
             */
            constructor: function(iterator, skip) {
                inherited.constructor.call(this);
                this.__iterator = iterator;
                while (skip > 0) {
                    iterator.next();
                    skip--;
                }
            },

            /**
             * @override
             */
            hasNext: function() {
                return this.__iterator.hasNext();
            },

            /**
             * @override
             */
            next: function() {
                return this.__iterator.next();
            }

        };
    });
});


Scoped.define("module:Iterators.LimitIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, limiting the number of elements iterated.
         * 
         * @class BetaJS.Iterators.LimitIterator
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {object} iterator Source iterator
             * @param {int} limit What should be the maximum number of elements
             */
            constructor: function(iterator, limit) {
                inherited.constructor.call(this);
                this.__iterator = iterator;
                this.__limit = limit;
            },


            /**
             * @override
             */
            hasNext: function() {
                return this.__limit > 0 && this.__iterator.hasNext();
            },

            /**
             * @override
             */
            next: function() {
                if (this.__limit <= 0)
                    return null;
                this.__limit--;
                return this.__iterator.next();
            }

        };
    });
});


Scoped.define("module:Iterators.SortedIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, sorting the source objects by a comparator.
         * 
         * @class BetaJS.Iterators.SortedIterator
         */
        return {

            /**
             * Create an instance.
             * 
             * @param {object} iterator Source iterator
             * @param {function} compare Function comparing two elements of the source iterator
             */
            constructor: function(iterator, compare) {
                inherited.constructor.call(this);
                this.__array = iterator.asArray();
                this.__array.sort(compare);
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
    });
});


Scoped.define("module:Iterators.LazyIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Lazy Iterator Class that is based on only getting next elements without an internal hasNext.
         * 
         * @class BetaJS.Iterators.LazyIterator
         */
        return {

            /**
             * Create an instance.
             * 
             */
            constructor: function() {
                inherited.constructor.call(this);
                this.__finished = false;
                this.__initialized = false;
                this.__current = null;
                this.__has_current = false;
            },

            /**
             * Initialize lazy iterator.
             */
            _initialize: function() {},

            /**
             * Get next element.
             * 
             * @return next element
             */
            _next: function() {},

            /**
             * The lazy iterator is finished.
             */
            _finished: function() {
                this.__finished = true;
            },

            /**
             * Set current element of lazy iterator.
             * 
             * @param result current element
             */
            _current: function(result) {
                this.__current = result;
                this.__has_current = true;
            },

            __touch: function() {
                if (!this.__initialized)
                    this._initialize();
                this.__initialized = true;
                if (!this.__has_current && !this.__finished)
                    this._next();
            },

            /**
             * @override
             */
            hasNext: function() {
                this.__touch();
                return this.__has_current;
            },

            /**
             * @override
             */
            next: function() {
                this.__touch();
                this.__has_current = false;
                return this.__current;
            }

        };
    });
});


Scoped.define("module:Iterators.SortedOrIterator", ["module:Iterators.LazyIterator", "module:Structures.TreeMap", "module:Objs"], function(Iterator, TreeMap, Objs, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Iterator Class, iterating over an array of source iterator and returning each element by sorting lazily over all source iterators.
         * 
         * @class BetaJS.Iterators.SortedOrIterator
         */
        return {

            /**
             * Create an instance.
             * 
             * @param {array} iterators Array of source iterators
             * @param {function} compare Function comparing two elements of the source iterator
             */
            constructor: function(iterators, compare) {
                this.__iterators = iterators;
                this.__map = TreeMap.empty(compare);
                inherited.constructor.call(this);
            },

            __process: function(iter) {
                if (iter.hasNext()) {
                    var n = iter.next();
                    var value = TreeMap.find(n, this.__map);
                    if (value)
                        value.push(iter);
                    else
                        this.__map = TreeMap.add(n, [iter], this.__map);
                }
            },

            /**
             * @override
             */
            _initialize: function() {
                Objs.iter(this.__iterators, this.__process, this);
                if (TreeMap.is_empty(this.__map))
                    this._finished();
            },

            /**
             * @override
             */
            _next: function() {
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


Scoped.define("module:Iterators.PartiallySortedIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, by sorting its elements in a partially sorted iterator.
         * 
         * @class BetaJS.Iterators.PartiallySortedIterator
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {object} iterator Source iterator
             * @param {function} compare Function comparing two elements of the source iterator
             * @param {function} partial_same Function determining whether two objects are partially the same
             */
            constructor: function(iterator, compare, partial_same) {
                inherited.constructor.call(this);
                this.__compare = compare;
                this.__partial_same = partial_same;
                this.__iterator = iterator;
                this.__head = [];
                this.__tail = [];
            },

            __cache: function() {
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

            /**
             * @override
             */
            hasNext: function() {
                this.__cache();
                return this.__head.length > 0;
            },

            /**
             * @override
             */
            next: function() {
                this.__cache();
                return this.__head.shift();
            }

        };
    });
});


Scoped.define("module:Iterators.ConcatIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ConcatIterator Class
         *
         * @class BetaJS.Iterators.ConcatIterator
         */
        return {

            /**
             * Creates an Iterator of an iterator of iterators
             *
             * @param {object} iterators iterators
             */
            constructor: function(iterators) {
                inherited.constructor.call(this);
                this.__iterators = iterators;
                this.__current = null;
            },

            __ensure: function() {
                while ((!this.__current || !this.__current.hasNext()) && this.__iterators.hasNext())
                    this.__current = this.__iterators.next();
                return this.__current;
            },

            /**
             * @override
             */
            hasNext: function() {
                var iterator = this.__ensure();
                return iterator && iterator.hasNext();
            },

            /**
             * @override
             */
            next: function() {
                return this.__ensure().next();
            }

        };

    });
});