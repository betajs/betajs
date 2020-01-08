Scoped.define("module:Events.HooksMixin", [
    "module:Promise",
    "module:Functions"
], function(Promise, Functions) {

    var sequential = function(promise, funcs) {
        if (funcs.length > 0) {
            return promise.mapSuccess(function(result) {
                var func = funcs.shift();
                return sequential(Promise.value(func(result)), funcs);
            });
        } else
            return promise;
    };

    /**
     * Hooks Mixin
     * 
     * @mixin BetaJS.Events.HooksMixin
     */
    return {

        _implements: "e07d77f0-d9d5-41dc-ae4d-20fb8af0a334",

        _notifications: {
            "construct": function() {
                this.__methodHooks = {};
            }
        },

        registerHook: function(method, func, ctx) {
            this.__methodHooks[method] = this.__methodHooks[method] || [];
            this.__methodHooks[method].push(Functions.as_method(func, ctx || this));
        },

        invokeHook: function(method, result) {
            return sequential(Promise.value(result), this.__methodHooks[method] || []);
        }

    };
});