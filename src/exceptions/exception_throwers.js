Scoped.define("module:Exceptions.ExceptionThrower", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        /**
         * Abstract Exception Thrower Class
         * 
         * @class BetaJS.Exceptions.ExceptionThrower
         */
        return {

            /**
             * Throws an exception.
             * 
             * @param {exception} e exception to be thrown
             */
            throwException: function(e) {
                this._throwException(e);
                return this;
            },

            _throwException: function(e) {
                throw e;
            }

        };
    });
});


Scoped.define("module:Exceptions.NullExceptionThrower", [
    "module:Exceptions.ExceptionThrower"
], function(ExceptionThrower, scoped) {
    return ExceptionThrower.extend({
        scoped: scoped
    }, function(inherited) {
        /**
         * Silentely forgets about the exception.
         * 
         * @class BetaJS.Exceptions.NullExceptionThrower
         */
        return {

            /**
             * @override
             */
            _throwException: function(e) {}

        };
    });
});


Scoped.define("module:Exceptions.AsyncExceptionThrower", [
    "module:Exceptions.ExceptionThrower",
    "module:Async"
], function(ExceptionThrower, Async, scoped) {
    return ExceptionThrower.extend({
        scoped: scoped
    }, function(inherited) {
        /**
         * Throws an exception asynchronously.
         * 
         * @class BetaJS.Exceptions.AsyncExceptionThrower
         */
        return {

            /**
             * @override
             */
            _throwException: function(e) {
                Async.eventually(function() {
                    throw e;
                });
            }

        };
    });
});


Scoped.define("module:Exceptions.ConsoleExceptionThrower", [
    "module:Exceptions.ExceptionThrower",
    "module:Exceptions.NativeException"
], function(ExceptionThrower, NativeException, scoped) {
    return ExceptionThrower.extend({
        scoped: scoped
    }, function(inherited) {
        /**
         * Throws execption by console-logging it.
         * 
         * @class BetaJS.Exceptions.ConsoleExceptionThrower
         */
        return {

            /**
             * @override
             */
            _throwException: function(e) {
                console.warn(e.toString());
            }

        };
    });
});


Scoped.define("module:Exceptions.EventExceptionThrower", [
    "module:Exceptions.ExceptionThrower",
    "module:Events.EventsMixin"
], function(ExceptionThrower, EventsMixin, scoped) {
    return ExceptionThrower.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {
        /**
         * Throws exception by triggering an exception event.
         * 
         * @class BetaJS.Exceptions.EventExceptionThrower
         */
        return {

            /**
             * @override
             * @fires BetaJS.Exceptions.EventExceptionThrower#exception
             */
            _throwException: function(e) {
                /**
                 * @event BetaJS.Exceptions.EventExceptionThrower#exception
                 */
                this.trigger("exception", e);
            }

        };
    }]);
});