Scoped.define("module:Loggers.TagLogAugment", [
    "module:Loggers.AbstractLogAugment"
], function(AbstractLogAugment, scoped) {
    return AbstractLogAugment.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Tag Log Augment Class
         * 
         * @class BetaJS.Loggers.TagLogAugment
         */
        return {

            /**
             * @override
             */
            augmentMessage: function(source, msg, depth) {
                return msg.tags.join(",");
            }

        };
    });
});