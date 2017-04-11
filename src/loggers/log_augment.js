Scoped.define("module:Loggers.AbstractLogAugment", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract Log Augment Class, augmenting logs
         * 
         * @class BetaJS.Loggers.AbstractLogAugment
         */
        return {

            /**
             * Called when a log message is created.
             * 
             * @param {object} source logger source
             * @param {object} msg message object
             * @param {int} depth call depth (internal use)
             * @return augmentation
             */
            augmentMessage: function(source, msg, depth) {}

        };
    });
});