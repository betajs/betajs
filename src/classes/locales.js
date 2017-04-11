Scoped.define("module:Classes.LocaleMixin", function() {

    /**
     * Locale Mixin for adding Locale access to a Class
     * 
     * @mixin BetaJS.Classes.LocaleMixin
     */
    return {

        _clearLocale: function() {},
        _setLocale: function(locale) {},

        /**
         * Returns the current locale.
         * 
         * @return {object} current locale
         */
        getLocale: function() {
            return this.__locale;
        },

        /**
         * Clears the current locale.
         * 
         */
        clearLocale: function() {
            this._clearLocale();
            this.__locale = null;
        },

        /**
         * Sets the current locale
         * 
         * @param {object} locale New locale
         */
        setLocale: function(locale) {
            this.clearLocale();
            this.__locale = locale;
            this._setLocale(locale);
        },

        /**
         * Returns whether a locale is set.
         * 
         * @return {boolean} true if locale is set
         */
        isLocaleSet: function() {
            return !!this.__locale;
        },

        /**
         * Sets a locale if not locale is set.
         * 
         * @param {object} locale New weak locale
         */
        setWeakLocale: function(locale) {
            if (!this.isLocaleSet())
                this.setLocale(locale);
        }

    };
});



Scoped.define("module:Classes.LocaleAggregator", [
    "module:Class",
    "module:Classes.LocaleMixin",
    "module:Objs"
], function(Class, LocaleMixin, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, [LocaleMixin, function(inherited) {

        /**
         * Locale Aggregator Class for combining multiple locales into one.
         * 
         * @class BetaJS.Classes.LocaleAggregator
         */
        return {

            /**
             * Create a Locale Aggregator instance.
             * 
             */
            constructor: function() {
                inherited.constructor.call(this);
                this.__locales = [];
            },

            /**
             * Registers a new locale.
             * 
             * @return {object} Locale
             */
            register: function(obj) {
                this.__locales.push(obj);
            },

            /**
             * @override
             */
            _clearLocale: function() {
                Objs.iter(this.__locales, function(obj) {
                    obj.clearLocale();
                }, this);
            },

            /**
             * @override
             */
            _setLocale: function(locale) {
                Objs.iter(this.__locales, function(obj) {
                    obj.setLocale(locale);
                }, this);
            }

        };
    }]);
});