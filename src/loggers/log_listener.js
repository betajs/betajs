Scoped.define("module:Loggers.LogListener", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract Log Listener Class, reacting to logging calls
         * 
         * @class BetaJS.Loggers.LogListener
         */
        return {

            /**
             * Called when a log message is created.
             * 
             * @param {object} source logger source
             * @param {object} msg message object
             */
            message: function(source, msg) {}

        };
    });
});