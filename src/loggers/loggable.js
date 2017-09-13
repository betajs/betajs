Scoped.define("module:Loggers.LoggableMixin", [
    "module:Loggers.Logger",
    "module:Objs",
    "module:Functions"
], function(Logger) {

    /**
     * LoggableMixin Mixin
     *
     * @mixin BetaJS.Loggers.LoggableMixin
     */
    return {

        /**
         * Returns the base logger.
         *
         * @returns {object} base logger
         */
        baseLogger: function() {
            if (!this._baseLogger)
                this._baseLogger = Logger.global();
            return this._baseLogger;
        },

        /**
         * Returns the logger.
         *
         * @returns {object} logger
         */
        logger: function() {
            if (!this._logger)
                this._logger = this.baseLogger().tag(this.cls.classname, this.cid());
            return this._logger;
        }

    };
});