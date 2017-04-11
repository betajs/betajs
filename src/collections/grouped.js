Scoped.define("module:Collections.GroupedCollection", [
    "module:Collections.Collection",
    "module:Objs",
    "module:Properties.Properties"
], function(Collection, Objs, Properties, scoped) {
    return Collection.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * The GroupedCollection Class allows you to create a dynamic sub collection based on another Collection instance by grouping together single items.
         * 
         * @class BetaJS.Collections.GroupedCollection
         */
        return {

            /**
             * Instantiates a GroupedCollection.
             * 
             * @param {object} parent Parent Collection
             * @param {object} options Standard Collection options, plus groupby, insert, remove, context, properties and create
             */
            constructor: function(parent, options) {
                this.__parent = parent;
                options = options || {};
                delete options.objects;
                this.__groupby = options.groupby;
                this.__keepEmptyGroups = options.keepEmptyGroups;
                this.__insertCallback = options.insert;
                this.__removeCallback = options.remove;
                this.__callbackContext = options.context || this;
                this.__propertiesClass = options.properties || Properties;
                this.__createProperties = options.create;
                inherited.constructor.call(this, options);
                Objs.iter(this.__groupby, this.add_secondary_index, this);
                this.__parent.iterate(this.__addParentObject, this);
                this.__parent.on("add", this.__addParentObject, this);
                this.__parent.on("remove", this.__removeParentObject, this);
            },

            /**
             * @override
             */
            destroy: function() {
                this.__parent.off(null, null, this);
                inherited.destroy.call(this);
            },

            touchGroup: function(data, create) {
                data = Properties.is_instance_of(data) ? data.data() : data;
                var query = {};
                Objs.iter(this.__groupby, function(key) {
                    query[key] = data[key];
                });
                var group = this.query(query).nextOrNull();
                if (!group && create) {
                    group = this.__createProperties ? this.__createProperties.call(this.__callbackContext) : new this.__propertiesClass();
                    group.items = group.auto_destroy(new Collection());
                    Objs.iter(this.__groupby, function(key) {
                        group.set(key, data[key]);
                    });
                    this.add(group);
                }
                return group;
            },

            __addParentObject: function(object) {
                var group = this.touchGroup(object, true);
                this.__addObjectToGroup(object, group);
            },

            __removeParentObject: function(object) {
                var group = this.touchGroup(object);
                if (group) {
                    this.__removeObjectFromGroup(object, group);
                    if (!this.__keepEmptyGroups && group.items.count() === 0)
                        this.remove(group);
                }
            },

            __addObjectToGroup: function(object, group) {
                group.items.add(object);
                this.__insertObject(object, group);
            },

            __removeObjectFromGroup: function(object, group) {
                group.items.remove(object);
                this.__removeObject(object, group);
            },

            /**
             * @override
             */
            increase_forwards: function(steps) {
                return this.__parent.increase_forwards(steps);
            },

            __insertObject: function(object, group) {
                if (this.__insertCallback)
                    this.__insertCallback.call(this.__callbackContext, object, group);
                else {
                    /**
                     * @event BetaJS.Collections.GroupedCollection#insert
                     */
                    group.trigger("insert", object);
                }
            },

            __removeObject: function(object, group) {
                if (this.__removeCallback)
                    this.__removeCallback.call(this.__callbackContext, object, group);
                else {
                    /**
                     * @event BetaJS.Collections.GroupedCollection#remove
                     */
                    group.trigger("remove", object);
                }
            }

        };
    });
});