Scoped.define("module:Scheduling.SchedulableMixin", [], function() {
    return {

        schedulable: function(callback, initialSteps) {
            if (this.scheduler)
                this.scheduler.schedulable(this, callback, initialSteps);
            else
                callback.call(this, Infinity);
        }

    };
});


Scoped.define("module:Scheduling.Helper", [], function() {
    return {

        schedulable: function(callback, initialSteps, scheduler, context) {
            if (scheduler)
                scheduler.schedulable(context || this, callback, initialSteps);
            else
                callback.call(context || this, Infinity);
        }

    };
});


Scoped.define("module:Scheduling.AbstractScheduler", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            _schedulable: function(context, callback, initialSteps) {},

            _register: function(context, options) {},

            _unregister: function(context, options) {},

            schedulable: function(context, callback, initialSteps) {
                this._schedulable(context, callback, initialSteps || 1);
            },

            register: function(context, options) {
                context.scheduler = this;
                this._register(context, options);
            },

            unregister: function(context, options) {
                if (context.scheduler === this)
                    context.scheduler = null;
                this._unregister(context, options);
            }

        };
    });
});