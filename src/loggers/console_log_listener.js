Scoped.define("module:Loggers.ConsoleLogListener", [
    "module:Loggers.LogListener"
], function(LogListener, scoped) {
    return LogListener.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Console Log Listener Class
         * 
         * @class BetaJS.Loggers.ConsoleLogListener
         */
        return {

            /**
             * Creates a new instance.
             *
             * @param {object} options options argument
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                this._options = options || {};
            },

            /**
             * @override
             */
            message: function(source, msg) {
                var args = msg.args.concat(msg.augments);
                if (this._options.single)
                    args = [args.join(" | ")];
                console[msg.type].apply(console, args);
            }

        };
    });
});