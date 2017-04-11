Scoped.define("module:Scheduling.GarbageCollector", [
    "module:Class",
    "module:Scheduling.SchedulableMixin"
], function(Class, SchedulableMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [SchedulableMixin, function(inherited) {
        /**
         * Garbage Collector
         * 
         * @class BetaJS.Scheduling.GarbageCollector
         */
        return {

            /**
             * Instantiate garbage collector.
             * 
             */
            constructor: function() {
                inherited.constructor.call(this);
                this.__classes = {};
            },

            /**
             * Add an object to the garbage collection queue.
             * 
             * @param {object} obj object to be destroyed
             */
            queue: function(obj) {
                if (!obj || obj.destroyed() || this.__classes[obj.cid()])
                    return this;
                var cid = obj.cid();
                this.__classes[cid] = true;
                this.schedulable(function() {
                    delete this.__classes[cid];
                    if (!obj.destroyed())
                        obj.destroy();
                    delete obj.__gc;
                });
                return this;
            }

        };
    }]);
});