Scoped.define("module:Collections.MappedCollection", [
    "module:Collections.Collection",
    "module:Functions"
], function(Collection, Functions, scoped) {
    return Collection.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * The MappedCollection Class allows you to create a dynamic sub collection based on another Collection instance and a mapping function.
         * 
         * @class BetaJS.Collections.MappedCollection
         */
        return {

            /**
             * Instantiates a MappedCollection.
             * 
             * @param {object} parent Parent Collection
             * @param {object} options Standard Collection options, plus map and context
             */
            constructor: function(parent, options) {
                this.__parent = parent;
                this.__parentToThis = {};
                this.__thisToParent = {};
                options = options || {};
                delete options.objects;
                options.compare = Functions.as_method(this.__compareByParent, this);
                inherited.constructor.call(this, options);
                this._mapFunction = options.map;
                this._mapCtx = options.context;
                parent.on("add", this.__parentAdd, this);
                parent.on("remove", this.__parentRemove, this);
                parent.on("change", this.__parentUpdate, this);
                parent.iterate(this.__parentAdd, this);
            },

            /**
             * @override
             */
            destroy: function() {
                this.__parent.off(null, null, this);
                inherited.destroy.call(this);
            },

            __compareByParent: function(item1, item2) {
                return this.__parent.getIndex(this.__thisToParent[item1.cid()]) - this.__parent.getIndex(this.__thisToParent[item2.cid()]);
            },

            __mapItem: function(parentItem, thisItem) {
                return this._mapFunction.call(this._mapCtx || this, parentItem, thisItem);
            },

            __parentAdd: function(item) {
                var mapped = this.__mapItem(item);
                this.__parentToThis[item.cid()] = mapped;
                this.__thisToParent[mapped.cid()] = item;
                this.add(mapped);
            },

            __parentUpdate: function(item) {
                this.__mapItem(item, this.__parentToThis[item.cid()]);
            },

            __parentRemove: function(item) {
                var mapped = this.__parentToThis[item.cid()];
                delete this.__parentToThis[item.cid()];
                delete this.__thisToParent[mapped.cid()];
                this.remove(mapped);
            }

        };
    });
});