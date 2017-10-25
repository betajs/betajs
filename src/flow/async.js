Scoped.define("module:Async", ["module:Types", "module:Functions"], function(Types, Functions) {

    var clearTimeoutGlobal = Functions.global_method("clearTimeout");

    var clearImmediate =
        Functions.global_method("clearImmediate") ||
        Functions.global_method("cancelAnimationFrame") ||
        Functions.global_method("webkitCancelAnimationFrame") ||
        Functions.global_method("mozCancelAnimationFrame") ||
        clearTimeoutGlobal;

    var setImmediate =
        Functions.global_method("setImmediate") ||
        Functions.global_method("requestAnimationFrame") ||
        Functions.global_method("webkitRequestAnimationFrame") ||
        Functions.global_method("mozRequestAnimationFrame") ||
        function(cb) {
            return setTimeout(cb, 0);
        };


    var __eventuallyOnce = {};
    var __eventuallyOnceIdx = 1;


    /**
     * Auxilary functions for asynchronous operations.
     * 
     * @module BetaJS.Async
     */
    return {


        /**
         * Wait asynchronously for a condition to be met.
         * 
         * @param {function} condition condition function
         * @param {object} conditionCtx condition context (optional)
         * @param {function} callback callback function
         * @param {object} callbackCtx callback context (optional)
         * @param {int} interval interval time between checks (optional, default 1)
         * 
         */
        waitFor: function() {
            var args = Functions.matchArgs(arguments, {
                condition: true,
                conditionCtx: "object",
                callback: true,
                callbackCtx: "object",
                interval: "int"
            });
            var h = function() {
                try {
                    return !!args.condition.apply(args.conditionCtx || args.callbackCtx || this);
                } catch (e) {
                    return false;
                }
            };
            if (h())
                args.callback.apply(args.callbackCtx || this);
            else {
                var timer = setInterval(function() {
                    if (h()) {
                        clearInterval(timer);
                        args.callback.apply(args.callbackCtx || this);
                    }
                }, args.interval || 1);
            }
        },


        /**
         * Execute a function asynchronously eventually.
         * 
         * @param {function} function function to be executed asynchronously
         * @param {array} params optional list of parameters to be passed to the function
         * @param {object} context optional context for the function execution
         * @param {int} time time to wait until execution (default is 0)
         * 
         * @return handle to the eventual call
         */
        eventually: function() {
            var args = Functions.matchArgs(arguments, {
                func: true,
                params: "array",
                context: "object",
                time: "number"
            });
            args.time = args.time || 0;
            var result = {};
            var cb = function() {
                result.clear(result.handle);
                args.func.apply(args.context || this, args.params || []);
            };
            if (args.time > 0) {
                result.clear = clearTimeoutGlobal;
                result.handle = setTimeout(cb, args.time);
            } else {
                result.clear = clearImmediate;
                result.handle = setImmediate(cb);
            }
            return result;
        },


        /**
         * Clears a call scheduled for eventual execution.
         * 
         * @param ev event handle
         * 
         */
        clearEventually: function(ev) {
            if (ev && ev.clear && ev.handle)
                ev.clear(ev.handle);
        },


        /**
         * Executes a function asynchronously eventually, but only once.
         * 
         * @param {function} function function to be executed asynchronously
         * @param {array} params list of parameters to be passed to the function
         * @param {object} context optional context for the function execution
         * 
         */
        eventuallyOnce: function(func, params, context) {
            var data = {
                func: func,
                params: params,
                context: context
            };
            for (var key in __eventuallyOnce) {
                var record = __eventuallyOnce[key];
                if (record.func == func && record.params == params && record.context == context)
                    return;
            }
            __eventuallyOnceIdx++;
            var index = __eventuallyOnceIdx;
            __eventuallyOnce[index] = data;
            return this.eventually(function() {
                delete __eventuallyOnce[index];
                func.apply(context || this, params || []);
            }, this);
        }

    };

});