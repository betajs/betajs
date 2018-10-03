Scoped.define("module:Loggers.StaticLogAugment", [
    "module:Loggers.AbstractLogAugment"
], function(AbstractLogAugment, scoped) {
    return AbstractLogAugment.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Static Log Augment Class
         * 
         * @class BetaJS.Loggers.StaticLogAugment
         */
        return {

            /**
             * Creates a new instance.
             *
             * @param value value
             */
            constructor: function(value) {
                inherited.constructor.call(this);
                this.__value = value;
            },

            /**
             * Returns current value.
             *
             * @return value
             */
            getValue: function() {
                return this.__value;
            },

            /**
             * Set current value.
             *
             * @param value current value
             */
            setValue: function(value) {
                this.__value = value;
                return this;
            },

            /**
             * @override
             */
            augmentMessage: function(source, msg, depth) {
                return this.__value;
            }

        };
    });
});