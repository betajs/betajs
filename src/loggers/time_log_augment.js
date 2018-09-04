Scoped.define("module:Loggers.TimeLogAugment", [
    "module:Loggers.AbstractLogAugment",
    "module:Time"
], function(AbstractLogAugment, Time, scoped) {
    return AbstractLogAugment.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Time Log Augment Class
         * 
         * @class BetaJS.Loggers.TimeLogAugment
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
                this.__last = Time.now();
            },

            /**
             * @override
             */
            augmentMessage: function(source, msg, depth) {
                var now = Time.now();
                var delta = now - this.__last;
                this.__last = now;
                return now + (this._options.delta ? " (+" + delta + "ms)" : "");
            }

        };
    });
});