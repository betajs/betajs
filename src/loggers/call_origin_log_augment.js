Scoped.define("module:Loggers.CallOriginLogAugment", [
    "module:Loggers.AbstractLogAugment",
    "module:Functions"
], function(AbstractLogAugment, Functions, scoped) {
    return AbstractLogAugment.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Call Origin Log Augment Class
         * 
         * @class BetaJS.Loggers.CallOriginLogAugment
         */
        return {

            /**
             * @override
             */
            augmentMessage: function(source, msg, depth) {
                var stack = Functions.getStackTrace(depth * 3 + 6);
                return stack[0].trim();
            }

        };
    });
});