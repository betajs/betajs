Scoped.define("module:Collections.Collection", [
    "module:Class",
    "module:Events.EventsMixin",
    "module:Objs",
    "module:Functions",
    "module:Lists.ArrayList",
    "module:Ids",
    "module:Properties.ObservableMixin",
    "module:Properties.Properties",
    "module:Iterators.ArrayIterator",
    "module:Iterators.MappedIterator",
    "module:Iterators.ConcatIterator",
    "module:Iterators.FilteredIterator",
    "module:Iterators.ObjectValuesIterator",
    "module:Types",
    "module:Promise"
], function(Class, EventsMixin, Objs, Functions, ArrayList, Ids, ObservableMixin, Properties, ArrayIterator, MappedIterator, ConcatIterator, FilteredIterator, ObjectValuesIterator, Types, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, ObservableMixin, function(inherited) {

        /**
         * A collection class for managing a list of Properties-based objects.
         * 
         * @class BetaJS.Collections.Collection
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {object} options Options for the collection or an array of initial objects
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                if (Types.is_array(options)) {
                    options = {
                        objects: options
                    };
                }
                options = options || {};
                this.bulk_operations = 0;
                this.__indices = {};
                if (options.release_references)
                    this.__release_references = true;
                var list_options = {};
                if ("compare" in options)
                    list_options.compare = options.compare;
                list_options.get_ident = Functions.as_method(this.get_ident, this);
                this.__data = new ArrayList([], list_options);
                var self = this;
                this.__data._ident_changed = function(object, index) {
                    self._index_changed(object, index);
                };
                this.__data._re_indexed = function(object) {
                    self._re_indexed(object);
                };
                this.__data._sorted = function() {
                    self._sorted();
                };
                if ("objects" in options)
                    this.add_objects(options.objects);
                if (options.indices)
                    Objs.iter(options.indices, this.add_secondary_index, this);
                if (options.uniqueness)
                    this.__uniqueness = options.uniqueness;
            },

            /**
             * Returns the value associated with an observable key.
             *
             * @param {string} key key to read value for
             *
             * @return value for key
             */
            get: function(key) {
                switch (key) {
                    case "observable_count":
                        return this.count();
                }
                return undefined;
            },

            /**
             * Checks whether an observable key is set.
             *
             * @param {string} key key in question
             *
             * @return {boolean} true if key is set
             */
            hasKey: function(key) {
                switch (key) {
                    case "observable_count":
                        return true;
                }
                return false;
            },

            /**
             * Add a secondary key index to the collection.
             * 
             * @param {string} key Name of key to be added
             */
            add_secondary_index: function(key) {
                this.__indices[key] = {};
                this.iterate(function(object) {
                    var value = object.get(key);
                    this.__indices[key][value] = this.__indices[key][value] || {};
                    this.__indices[key][value][this.get_ident(object)] = object;
                }, this);
                return this;
            },

            /**
             * Return entry by value from a secondary index.
             * 
             * @param {string} key Name of secondary index key
             * @param value Value to the secondary index
             * @param {boolean} returnFirst Only return single element
             * 
             * @return Returns entry associated with the key value pair
             */
            get_by_secondary_index: function(key, value, returnFirst) {
                return returnFirst ? Objs.ithValue(this.__indices[key][value]) : this.__indices[key][value];
            },

            /**
             * Get the identifier of an object.
             * 
             * @param {object} obj Source object
             * 
             * @return {string} identifier of source object
             */
            get_ident: function(obj) {
                return Ids.objectId(obj);
            },

            /**
             * Set the comparison function.
             * 
             * @param {function} compare Comparison function
             * @fires BetaJS.Collections.Collection#set_compare
             */
            set_compare: function(compare) {
                /**
                 * @event BetaJS.Collections.Collection#set_compare
                 */
                this.trigger("set_compare", compare);
                this.__data.set_compare(compare);
                return this;
            },

            /**
             * Return the current comparison function.
             * 
             * @return {function} current compare function
             */
            get_compare: function() {
                return this.__data.get_compare();
            },

            __load_item: function(object) {
                if ("on" in object) {
                    object.on("change", function(key, value, oldvalue) {
                        this._object_changed(object, key, value, oldvalue);
                    }, this);
                }
                if (this.__release_references)
                    object.increaseRef(this);
            },

            __unload_item: function(object) {
                if ("off" in object)
                    object.off(null, null, this);
                if (this.__release_references)
                    object.decreaseRef(this);
            },

            /**
             * @override
             * @fires BetaJS.Collections.Collection#destroy
             */
            destroy: function() {
                this.__data.iterate(this.__unload_item, this);
                this.__data.destroy();
                /**
                 * @event BetaJS.Collections.Collection#destroy
                 */
                this.trigger("destroy");
                inherited.destroy.call(this);
            },

            /**
             * Return the number of elements in the collection.
             * 
             * @return {int} number of elements
             */
            count: function() {
                return this.__data.count();
            },

            /**
             * Called when the index of an object has changed.
             * 
             * @param {object} object Object whose index has changed
             * @param {int} index New index
             * @fires BetaJS.Collections.Collection#index
             */
            _index_changed: function(object, index) {
                /**
                 * @event BetaJS.Collections.Collection#index
                 */
                this.trigger("index", object, index);
            },

            /**
             * Called when the index of an object has been successfully updated.
             * 
             * @param {object} object Object whose index has been updated
             * @fires BetaJS.Collections.Collection#reindexed
             */
            _re_indexed: function(object) {
                /**
                 * @event BetaJS.Collections.Collection#reindexed
                 */
                this.trigger("reindexed", object);
            },

            /**
             * Called when the collection has been sorted.
             * 
             * @fires BetaJS.Collections.Collection#sorted
             */
            _sorted: function() {
                /**
                 * @event BetaJS.Collections.Collection#sorted
                 */
                this.trigger("sorted");
            },

            /**
             * Called when an attribute of an object has changed.
             * 
             * @param {object} object Object whose attribute has changed
             * @param {string} key Key of changed attribute
             * @param value New value of the object
             * @param oldValue Old value of the object
             * @fires BetaJS.Collections.Collection#update
             * @fires BetaJS.Collections.Collection#change
             */
            _object_changed: function(object, key, value, oldValue) {
                /**
                 * @event BetaJS.Collections.Collection#update
                 */
                this.trigger("update");
                /**
                 * @event BetaJS.Collections.Collection#change
                 */
                this.trigger("change", object, key, value, oldValue);
                this.trigger("change:" + key, object, value, oldValue);
                this.__data.re_index(this.getIndex(object));
            },

            /**
             * Add an object to the collection.
             * 
             * @param {object} object Object to be added
             * @return {string} Identifier of added object
             * @fires BetaJS.Collections.Collection#add
             * @fires BetaJS.Collections.Collection#update
             */
            add: function(object) {
                if (!Class.is_class_instance(object))
                    object = new Properties(object);
                if (this.exists(object))
                    return null;
                var ident = this.__data.add(object);
                if (ident !== null) {
                    Objs.iter(this.__indices, function(entries, key) {
                        var value = object.get(key);
                        entries[value] = entries[value] || {};
                        entries[value][this.get_ident(object)] = object;
                    }, this);
                    /**
                     * @event BetaJS.Collections.Collection#add
                     */
                    this.trigger("add", object);
                    /**
                     * @event BetaJS.Collections.Collection#update
                     */
                    this.trigger("update");
                    this.trigger("change:observable_count", this.count());
                    this.__load_item(object);
                }
                return ident;
            },

            /**
             * Checks whether a bulk operation is in progress.
             *
             * @returns {boolean} true if in progress
             */
            bulkOperationInProgress: function() {
                return this.bulk_operations > 0;
            },

            /**
             * Replace objects by other objects with the same id.
             * 
             * @param {array} object New objects with ids
             * @param {boolean} keep_others True if objects with ids not included should be kept
             * 
             */
            replace_objects: function(objects, keep_others) {
                if (this.destroyed())
                    return this;
                this.bulk_operations++;
                var addQueue = [];
                var ids = {};
                Objs.iter(objects, function(oriObject) {
                    var is_prop = Class.is_class_instance(oriObject);
                    var obj = is_prop ? oriObject : new Properties(oriObject);
                    var id = this.get_ident(obj);
                    ids[id] = true;
                    var old = this.getById(id);
                    if (!old)
                        addQueue.push(obj);
                    else if (is_prop) {
                        /*
                        this.remove(old);
                        this.add(obj);
                        */
                    } else {
                        obj.destroy();
                        old.setAll(oriObject);
                    }
                }, this);
                if (!keep_others) {
                    var iterator = this.iterator();
                    while (iterator.hasNext()) {
                        var object = iterator.next();
                        if (!ids[this.get_ident(object)]) {
                            this.remove(object);
                            if (addQueue.length > 0)
                                this.add(addQueue.shift());
                        }
                    }
                    iterator.destroy();
                }
                while (addQueue.length > 0)
                    this.add(addQueue.shift());
                this.bulk_operations--;
                this.trigger("replaced-objects");
                return this;
            },

            /**
             * Add objects in a bulk.
             * 
             * @param {array} objects Objects to be added
             * @param {boolean} return_collection Whether the return value should be the collection or its length
             * @return {int} Number of objects added
             */
            add_objects: function(objects, return_collection) {
                var count = 0;
                Objs.iter(objects, function(object) {
                    if (this.add(object))
                        count++;
                }, this);
                if (return_collection)
                    return this;
                else
                    return count;
            },

            /**
             * Determine whether an object is already included.
             * 
             * @param {object} object Object in question
             * @return {boolean} True if contained
             */
            exists: function(object) {
                if (this.__data.exists(object))
                    return true;
                if (!this.__uniqueness)
                    return false;
                if (this.__indices[this.__uniqueness])
                    return !!this.get_by_secondary_index(this.__uniqueness, object.get(this.__uniqueness), true);
                return !!this.queryOne(Objs.objectBy(this.__uniqueness, object.get(this.__uniqueness)));
            },

            /**
             * Remove an object from the collection.
             * 
             * @param {object} object Object to be removed
             * @return {object} Removed object
             * @fires BetaJS.Collections.Collection#remove
             * @fires BetaJS.Collections.Collection#update
             */
            remove: function(object) {
                if (!this.exists(object))
                    return null;
                Objs.iter(this.__indices, function(entry, key) {
                    var value = object.get(key);
                    if (entry[value]) {
                        delete entry[value][this.get_ident(object)];
                        if (Types.is_empty(entry[value]))
                            delete entry[value];
                    }
                }, this);
                var result = this.__data.remove(object);
                /**
                 * @event BetaJS.Collections.Collection#remove
                 */
                this.trigger("remove", object);
                this.trigger("change:observable_count", this.count());
                this.__unload_item(object);
                /**
                 * @event BetaJS.Collections.Collection#update
                 */
                this.trigger("update");
                return result;
            },

            /**
             * Get an object by index.
             * 
             * @param {int} index Index to be returned
             * @return {object} Object at that index
             */
            getByIndex: function(index) {
                return this.__data.get(index);
            },

            /**
             * Get an object by identifier.
             * 
             * @param {string} id Identifier of object
             * @return {object} Object with that identifier
             */
            getById: function(id) {
                return this.__data.get(this.__data.ident_by_id(id));
            },

            /**
             * Get the index of an object.
             * 
             * @param {object} object Object in question
             * @return {int} Index of object
             */
            getIndex: function(object) {
                return this.__data.get_ident(object);
            },

            /**
             * Iterate over the collection.
             * 
             * @param {function} cb Item callback
             * @param {object} context Context for callback
             * 
             */
            iterate: function(cb, context) {
                this.__data.iterate(cb, context);
                return this;
            },

            /**
             * Checks whether an item exists
             *
             * @param {function} cb Item callback
             * @param {object} context Context for callback
             * @returns {boolean} true if element exists
             *
             */
            has: function(cb, context) {
                var result = false;
                this.iterate(function(item) {
                    result = result || cb.call(this, item);
                }, context);
                return result;
            },

            /**
             * Checks whether something holds for all items
             *
             * @param {function} cb Item callback
             * @param {object} context Context for callback
             * @returns {boolean} true if holds for all items
             *
             */
            forall: function(cb, context) {
                var result = true;
                this.iterate(function(item) {
                    result = result && cb.call(this, item);
                }, context);
                return result;
            },

            /**
             * Creates an iterator instance for the collection.
             * 
             * @return {object} Iterator instance
             */
            iterator: function() {
                return ArrayIterator.byIterate(this.iterate, this);
            },

            /**
             * Creates an iterator instance via a secondary index for a specific value.
             * 
             * @param {string} key Key of secondary index
             * @param value Particular value
             * @return {object} Iterator instance
             */
            iterateSecondaryIndexValue: function(key, value) {
                if (Types.is_array(value)) {
                    return new ConcatIterator(new MappedIterator(new ArrayIterator(value), function(v) {
                        return this.iterateSecondaryIndexValue(key, v);
                    }, this));
                }
                return new ObjectValuesIterator(this.__indices[key][value]);
            },

            /**
             * Query the collection for items matching some query data.
             * 
             * @param {object} subset Query data to be matched.
             * @return {object} Iterator instance
             */
            query: function(subset) {
                var iterator = null;
                for (var index_key in this.__indices) {
                    if (index_key in subset) {
                        iterator = this.iterateSecondaryIndexValue(index_key, subset[index_key]);
                        delete subset[index_key];
                        break;
                    }
                }
                return new FilteredIterator(iterator || this.iterator(), function(prop) {
                    return prop.isSupersetOf(subset);
                });
            },

            /**
             * Query the collection for a single item matching some query data.
             *
             * @param {object} subset Query data to be matched.
             * @return {object} Item match
             */
            queryOne: function(subset) {
                return this.query(subset).next();
            },

            /**
             * Clears the whole collection.
             * 
             */
            clear: function() {
                this.iterate(function(obj) {
                    this.remove(obj);
                }, this);
                return this;
            },

            /**
             * Increase the view of the collection by a number of steps.
             * 
             * @param {int} steps Steps to increase
             */
            increase_forwards: function(steps) {
                return Promise.error(true);
            },

            /**
             * Increase the view of the collection by a number of steps backwards.
             *
             * @param {int} steps Steps to increase
             */
            increase_backwards: function(steps) {
                return Promise.error(true);
            },

            /**
             * Returns the first item in the collection.
             *
             * @returns {Object} first item
             */
            first: function() {
                return this.getByIndex(0);
            },

            /**
             * Returns the last item in the collection
             *
             * @returns {Object} last item
             */
            last: function() {
                return this.getByIndex(this.count() - 1);
            },

            /**
             * Sets a key value pair in all items
             *
             * @param {string} key key of pair
             * @param value value of pair
             *
             * @returns {BetaJS.Collections.Collection}
             */
            allSet: function(key, value) {
                this.iterate(function(obj) {
                    obj.set(key, value);
                });
                return this;
            },

            /**
             * Sets a set of key-value pairs in all items
             *
             * @param {object} data key-value pair to be set
             *
             * @returns {BetaJS.Collections.Collection}
             */
            allSetAll: function(data) {
                this.iterate(function(obj) {
                    obj.setAll(data);
                });
                return this;
            },

            asJSON: function() {
                var result = [];
                this.iterate(function(p) {
                    result.push(p.data());
                });
                return result;
            }

        };
    }]);
});