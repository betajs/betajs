Scoped.define("module:Classes.LocaleMixin", function () {
    return {

        __locale: null,

        _clearLocale: function () {},
        _setLocale: function (locale) {},

        getLocale: function () {
            return this.__locale;
        },

        clearLocale: function () {
            this._clearLocale();
            this.__locale = null;
        },

        setLocale: function (locale) {
            this.clearLocale();
            this.__locale = locale;
            this._setLocale(locale);
        },

        isLocaleSet: function () {
            return !!this.__locale;
        },

        setWeakLocale: function (locale) {
            if (!this.isLocaleSet())
                this.setLocale(locale);
        }

    };
});



Scoped.define("module:Classes.LocaleAggregator", [
    "module:Class",
    "module:Classes.LocaleMixin",
    "module:Objs"
], function (Class, LocaleMixin, Objs, scoped) {
    return Class.extend({scoped: scoped}, [LocaleMixin, function (inherited) {
        return {

            constructor: function () {
                inherited.constructor.call(this);
                this.__locales = [];
            },

            register: function (obj) {
                this.__locales.push(obj);
            },

            _clearLocale: function () {
                Objs.iter(this.__locales, function (obj) {
                    obj.clearLocale();
                }, this);
            },

            _setLocale: function (locale) {
                Objs.iter(this.__locales, function (obj) {
                    obj.setLocale(locale);
                }, this);
            }

        };
    }]);
});