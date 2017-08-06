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
], function(Class, EventsMixin, Objs, Functions, ArrayList, Ids, Properties, ArrayIterator, FilteredIterator, ObjectValuesIterator, Types, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

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
                this.__indices = {};
                if (options.release_references)
                    this.__release_references = true;
                if (options.indices)
                    Objs.iter(options.indices, this.add_secondary_index, this);
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
             * @fires BetaJS.Collections.Collection#update
             * @fires BetaJS.Collections.Collection#change
             */
            _object_changed: function(object, key, value) {
                /**
                 * @event BetaJS.Collections.Collection#update
                 */
                this.trigger("update");
                /**
                 * @event BetaJS.Collections.Collection#change
                 */
                this.trigger("change", object, key, value);
                this.trigger("change:" + key, object, value);
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
                    this.__load_item(object);
                }
                return ident;
            },

            /**
             * Replace objects by other objects with the same id.
             * 
             * @param {array} object New objects with ids
             * @param {boolean} keep_others True if objects with ids not included should be kept
             * 
             */
            replace_objects: function(objects, keep_others) {
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
                        this.remove(old);
                        this.add(obj);
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
                return this.__data.exists(object);
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
                        break;
                    }
                }
                return new FilteredIterator(iterator || this.iterator(), function(prop) {
                    return prop.isSupersetOf(subset);
                });
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
            }

        };
    }]);
});