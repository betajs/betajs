Scoped.define("module:Collections.GroupedCollection", [
    "module:Collections.Collection",
    "module:Objs",
    "module:Properties.Properties",
    "module:Functions",
    "module:Promise",
    "module:Async"
], function(Collection, Objs, Properties, Functions, Promise, Async, scoped) {
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
                this.__groupbyCompute = options.groupbyCompute;
                this.__keepEmptyGroups = options.keepEmptyGroups;
                this.__autoIncreaseGroups = options.autoIncreaseGroups;
                this.__generateGroupData = options.generateGroupData;
                this.__nogaps = !!options.nogaps;
                this.__lazyNogaps = !!options.lazyNogaps;
                this.__insertCallback = options.insert;
                this.__removeCallback = options.remove;
                this.__afterGroupCreate = options.afterGroupCreate;
                this.__callbackContext = options.context || this;
                this.__ignoreParentIncrease = options.ignoreParentIncrease;
                this.__propertiesClass = options.properties || Properties;
                this.__itemsAttribute = options.itemsAttribute || "items";
                this.__createProperties = options.create;
                inherited.constructor.call(this, options);
                Objs.iter(this.__groupby, this.add_secondary_index, this);
                this.__parent.iterate(this.__addParentObject, this);
                this.__parent.on("add", this.__addParentObject, this);
                this.__parent.on("remove", this.__removeParentObject, this);
                this.__objectToGroup = {};
            },

            /**
             * @override
             */
            destroy: function() {
                this.__parent.off(null, null, this);
                inherited.destroy.call(this);
            },

            touchGroup: function(data, create, lazy) {
                if (this.destroyed())
                    return;
                if (lazy)
                    return Async.eventually(this.touchGroup, [data, create], this);
                data = Properties.is_instance_of(data) ? data.data() : data;
                data = this.__groupbyCompute ? this.__groupbyCompute.call(this.__callbackContext, data) : data;
                var query = {};
                this.__groupby.forEach(function(key) {
                    query[key] = data[key];
                });
                var group = this.query(query).nextOrNull();
                if (!group && create) {
                    group = this.__createProperties ? this.__createProperties.call(this.__callbackContext) : new this.__propertiesClass();
                    group[this.__itemsAttribute] = group[this.__itemsAttribute] || group.auto_destroy(new Collection({
                        compare: this.__parent.get_compare()
                    }));
                    group[this.__itemsAttribute].bulkOperationInProgress = Functions.as_method(this.bulkOperationInProgress, this);
                    group.setAll(data);
                    this.add(group);
                    if (this.__afterGroupCreate)
                        this.__afterGroupCreate.call(this.__callbackContext, group);
                    this.trigger("touchgroup", group);
                    if (this.__nogaps) {
                        if (group !== this.last())
                            this.touchGroup(this.__generateGroupData.call(this.__callbackContext, group.data(), 1), true, this.__lazyNogaps);
                        if (group !== this.first())
                            this.touchGroup(this.__generateGroupData.call(this.__callbackContext, group.data(), -1), true, this.__lazyNogaps);
                    }
                }
                return group;
            },

            __addParentObject: function(object) {
                var group = this.touchGroup(object, true);
                if (object.cid)
                    this.__objectToGroup[object.cid()] = group;
                this.__addObjectToGroup(object, group);
            },

            __removeParentObject: function(object) {
                var group = object.cid && this.__objectToGroup[object.cid()] ? this.__objectToGroup[object.cid()] : this.touchGroup(object);
                if (group) {
                    this.__removeObjectFromGroup(object, group);
                    if (!this.__keepEmptyGroups && group[this.__itemsAttribute].count() === 0)
                        this.remove(group);
                }
            },

            __addObjectToGroup: function(object, group) {
                group[this.__itemsAttribute].add(object);
                this.__insertObject(object, group);
            },

            __removeObjectFromGroup: function(object, group) {
                group[this.__itemsAttribute].remove(object);
                this.__removeObject(object, group);
            },

            /**
             * @override
             */
            increase_forwards: function(steps) {
                var oldCount = this.__parent.count();
                var promise = this.__ignoreParentIncrease ? Promise.create(true) : this.__parent.increase_forwards(steps);
                return promise.success(function() {
                    if (!this.__autoIncreaseGroups)
                        return;
                    var delta = this.__parent.count() - oldCount;
                    var current = this.last();
                    while (delta < steps) {
                        current = this.touchGroup(this.__generateGroupData.call(this.__callbackContext, current.data(), 1), true);
                        delta++;
                    }
                }, this);
            },

            /**
             * @override
             */
            bulkOperationInProgress: function() {
                return inherited.bulkOperationInProgress.call(this) || this.__parent.bulkOperationInProgress();
            },

            /**
             * @override
             */
            increase_backwards: function(steps) {
                var oldCount = this.__parent.count();
                var promise = this.__ignoreParentIncrease ? Promise.create(true) : this.__parent.increase_backwards(steps);
                return promise.success(function() {
                    if (!this.__autoIncreaseGroups)
                        return;
                    var delta = this.__parent.count() - oldCount;
                    var current = this.first();
                    while (delta < steps) {
                        current = this.touchGroup(this.__generateGroupData.call(this.__callbackContext, current.data(), -1), true);
                        delta++;
                    }
                }, this);
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