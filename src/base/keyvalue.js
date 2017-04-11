Scoped.define("module:KeyValue.KeyValueStore", [
    "module:Class",
    "module:Events.EventsMixin"
], function(Class, EventsMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

        /**
         * Abstract Key Value Store
         * 
         * @class BetaJS.KeyValue.KeyValueStore
         */
        return {

            /**
             * Determines whether a key exists in the store.
             * 
             * @param {string} key key to check
             * 
             * @return {boolean} true if key exists
             */
            mem: function(key) {
                return this._mem(key);
            },

            /**
             * Returns the value for a key in the store.
             * 
             * @param {string} key key to get the value for
             * 
             * @return value of key
             */
            get: function(key) {
                return this._get(key);
            },

            /**
             * Sets the value of a key in the store.
             * 
             * @param {string} key key to set the value for
             * @param value new value for key
             * @fires BetaJS.KeyValue.KeyValueStore#change
             */
            set: function(key, value) {
                this._set(key, value);
                /**
                 * @event BetaJS.KeyValue.KeyValueStore#change
                 */
                this.trigger("change:" + key, value);
            },

            /**
             * Removes a key from the store
             * 
             * @param {string} key key to be removed
             */
            remove: function(key) {
                this._remove(key);
            }

        };
    }]);
});


Scoped.define("module:KeyValue.PrefixKeyValueStore", [
    "module:KeyValue.KeyValueStore"
], function(KeyValueStore, scoped) {
    return KeyValueStore.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated Key-Value-Store by automatically prefixing keys.
         * 
         * @class BetaJS.KeyValue.PrefixKeyValueStore
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} kv Underlying Key-Value store
             * @param {string} prefix prefix string to be used for all keys
             */
            constructor: function(kv, prefix) {
                inherited.constructor.call(this);
                this.__kv = kv;
                this.__prefix = prefix;
            },

            /**
             * @override
             */
            _mem: function(key) {
                return this.__kv.mem(this.__prefix + key);
            },

            /**
             * @override
             */
            _get: function(key) {
                return this.__kv.get(this.__prefix + key);
            },

            /**
             * @override
             */
            _set: function(key, value) {
                this.__kv.set(this.__prefix + key, value);
            },

            /**
             * @override
             */
            _remove: function(key) {
                this.__kv.remove(this.__prefix + key);
            }

        };
    });
});


Scoped.define("module:KeyValue.MemoryKeyValueStore", [
    "module:KeyValue.KeyValueStore",
    "module:Objs"
], function(KeyValueStore, Objs, scoped) {
    return KeyValueStore.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A Memory-based Key-Value-Store.
         * 
         * @class BetaJS.KeyValue.MemoryKeyValueStore
         */
        return {

            /**
             * Creates a new Memory KV-Store
             * 
             * @param {object} data Initial data object
             * @param {boolean} clone Should the initial data object be cloned or used directly (default: false)
             */
            constructor: function(data, clone) {
                inherited.constructor.call(this);
                this.__data = Objs.clone(data, clone ? 1 : 0);
            },

            /**
             * @override
             */
            _mem: function(key) {
                return key in this.__data;
            },

            /**
             * @override
             */
            _get: function(key) {
                return this.__data[key];
            },

            /**
             * @override
             */
            _set: function(key, value) {
                this.__data[key] = value;
            },

            /**
             * @override
             */
            _remove: function(key) {
                delete this.__data[key];
            }

        };
    });
});


Scoped.define("module:KeyValue.DefaultKeyValueStore", [
    "module:KeyValue.KeyValueStore"
], function(KeyValueStore, scoped) {
    return KeyValueStore.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated KV-Store falling back to a default KV-Store if a key is not defined.
         * 
         * @class BetaJS.KeyValue.DefaultKeyValueStore
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} kv The main underlying key value store
             * @param {object} def The default key value store that we fallback to if a key is not defined in the main key value store
             */
            constructor: function(kv, def) {
                inherited.constructor.call(this);
                this.__kv = kv;
                this.__def = def;
            },

            /**
             * @override
             */
            _mem: function(key) {
                return this.__kv.mem(key) || this.__def.mem(key);
            },

            /**
             * @override
             */
            _get: function(key) {
                return this.__kv.mem(key) ? this.__kv.get(key) : this.__def.get(key);
            },

            /**
             * @override
             */
            _set: function(key, value) {
                this.__kv.set(key, value);
            },

            /**
             * @override
             */
            _remove: function(key) {
                this.__kv.remove(key);
            }

        };
    });
});