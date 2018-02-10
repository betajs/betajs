Scoped.extend("module:Iterators", [
    "module:Types",
    "module:Iterators.Iterator",
    "module:Iterators.ArrayIterator"
], function(Types, Iterator, ArrayIterator) {
    return {

        /**
         * Ensure that something is an iterator and if it is not and iterator is created from the data.
         * 
         * @param mixed mixed type variable
         * 
         * @return {object} iterator
         */
        ensure: function(mixed) {
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


Scoped.define("module:Iterators.Iterator", [
    "module:Class",
    "module:Functions",
    "module:Async",
    "module:Promise"
], function(Class, Functions, Async, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract Iterator Class
         * 
         * @class BetaJS.Iterators.Iterator
         */
        return {

            /**
             * Determines whether there are more elements in the iterator.
             * Should be overwritten by subclass.
             *
             * @return {boolean} true if more elements present
             */
            hasNext: function() {
                return false;
            },

            /**
             * Returns the next element in the iterator.
             * Should be overwritten by subclass.
             * 
             * @return next element in iterator
             */
            next: function() {
                return null;
            },

            /**
             * Returns the next element if present or null otherwise.
             * 
             * @return next element in iterator or null
             */
            nextOrNull: function() {
                return this.hasNext() ? this.next() : null;
            },

            /**
             * Materializes the iterator as an array.
             *
             * @param {boolean} keep do not destroy iterator
             * @return {array} array of elements in iterator
             */
            asArray: function(keep) {
                var arr = [];
                while (this.hasNext())
                    arr.push(this.next());
                if (!keep)
                    this.weakDestroy();
                return arr;
            },

            /**
             * Iterate over the iterator, calling a callback function for every element.
             * 
             * @param {function} cb callback function
             * @param {object} ctx optional callback context
             * @param {boolean} keep do not destroy iterator
             */
            iterate: function(cb, ctx, keep) {
                while (this.hasNext()) {
                    var result = cb.call(ctx || this, this.next());
                    if (result === false)
                        break;
                }
                if (!keep)
                    this.weakDestroy();
            },

            /**
             * Asynchronously iterate over the iterator, calling a callback function for every element.
             * 
             * @param {function} cb callback function
             * @param {object} ctx optional callback context
             * @param {int} time optional time between calls
             * 
             * @return {object} finish promise
             */
            asyncIterate: function(cb, ctx, time) {
                if (!this.hasNext()) {
                    this.destroy();
                    return Promise.value(true);
                }
                var result = cb.call(ctx || this, this.next());
                if (result === false)
                    return Promise.value(true);
                var promise = Promise.create();
                Async.eventually(function() {
                    this.asyncIterate(cb, ctx, time).forwardCallback(promise);
                }, this, time);
                return promise;
            }

        };
    });
});