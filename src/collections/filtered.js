Scoped.define("module:Collections.FilteredCollection", [
    "module:Collections.Collection"
], function(Collection, scoped) {
    return Collection.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * The FilteredCollection Class allows you to create a dynamic sub collection based on another Collection instance and a filter function.
         * 
         * @class BetaJS.Collections.FilteredCollection
         */
        return {

            /**
             * Instantiates a FilteredCollection.
             * 
             * @param {object} parent Parent Collection
             * @param {object} options Standard Collection options, plus filter and context
             */
            constructor: function(parent, options) {
                this.__parent = parent;
                options = options || {};
                delete options.objects;
                options.compare = options.compare || parent.get_compare();
                inherited.constructor.call(this, options);
                this.__parent.on("add", this.add, this);
                this.__parent.on("remove", this.__selfRemove, this);
                this.__parent.on("change", this.add, this);
                this.setFilter(options.filter, options.context);
            },

            /**
             * Determines whether an item satisfies the filter of this collection.
             * 
             * @param {object} object Properties instance to be checked
             * 
             * @return {boolean} True if object satisfies current filter
             */
            filter: function(object) {
                return !this.__filter || this.__filter.call(this.__filterContext || this, object);
            },

            /**
             * Sets the current filter
             * 
             * @param {function} filterFunction Filter function to be used for checking items
             * @param {object} filterContext Optional filter function context
             */
            setFilter: function(filterFunction, filterContext) {
                this.__filterContext = filterContext;
                this.__filter = filterFunction;
                this.iterate(function(obj) {
                    if (!this.filter(obj))
                        this.__selfRemove(obj);
                }, this);
                this.__parent.iterate(function(object) {
                    if (!this.exists(object) && this.filter(object))
                        this.__selfAdd(object);
                    return true;
                }, this);
            },

            /**
             * @override
             */
            _object_changed: function(object, key, value) {
                inherited._object_changed.call(this, object, key, value);
                if (!this.filter(object))
                    this.__selfRemove(object);
            },

            /**
             * @override
             */
            destroy: function() {
                this.__parent.off(null, null, this);
                inherited.destroy.call(this);
            },

            __selfAdd: function(object) {
                return inherited.add.call(this, object);
            },

            /**
             * @override
             */
            add: function(object) {
                if (this.exists(object) || !this.filter(object))
                    return null;
                var id = this.__selfAdd(object);
                this.__parent.add(object);
                return id;
            },

            __selfRemove: function(object) {
                return inherited.remove.call(this, object);
            },

            /**
             * @override
             */
            remove: function(object) {
                if (!this.exists(object))
                    return null;
                var result = this.__selfRemove(object);
                if (!result)
                    return null;
                return this.__parent.remove(object);
            }

        };
    });
});