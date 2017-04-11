Scoped.define("module:Classes.Taggable", [
    "module:Objs"
], function(Objs) {

    /**
     * Taggable Mixin for handling instance tags
     * 
     * @mixin BetaJS.Classes.Taggable
     */
    return {

        /**
         * Determines whether a specific tag is present. 
         * 
         * @param {string} tag tag in question
         * @return {boolean} true if tag present
         */
        hasTag: function(tag) {
            return this.__tags && (tag in this.__tags);
        },

        /**
         * Returns all tags being present.
         *  
         * @return {array} Array of tags
         */
        getTags: function() {
            return Object.keys(this.__tags || {});
        },

        /**
         * Removes a specific tag. 
         * 
         * @param {string} tag tag in question
         * @return {object} this
         */
        removeTag: function(tag) {
            if (this.__tags) {
                delete this.__tags[tag];
                this._notify("tags-changed");
            }
            return this;
        },

        /**
         * Remove a list of tags. 
         * 
         * @param {array} tags tags to be removed
         * @return {object} this
         */
        removeTags: function(tags) {
            Objs.iter(tags, this.removeTag, this);
            return this;
        },

        /**
         * Add a tag to the instance. 
         * 
         * @param {string} tag tag in question
         * @return {object} this
         */
        addTag: function(tag) {
            this.__tags = this.__tags || {};
            this.__tags[tag] = true;
            this._notify("tags-changed");
            return this;
        },

        /**
         * Add a number of tags to the instance. 
         * 
         * @param {array} tags tag to be added
         * @return {object} this
         */
        addTags: function(tags) {
            Objs.iter(tags, this.addTag, this);
            return this;
        },

        /**
         * Returns the subset of the given tags that are present in the instance. 
         * 
         * @param {array} tags Superset of tags to be checkd
         * @return {array} Subset of intersecting tags
         */
        tagIntersect: function(tags) {
            return Objs.filter(tags, this.hasTag, this);
        }

    };
});


Scoped.define("module:Classes.StringTable", [
    "module:Class",
    "module:Classes.Taggable",
    "module:Functions",
    "module:Objs"
], function(Class, Taggable, Functions, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, [Taggable, function(inherited) {

        /**
         * Taggable StringTable Class 
         * 
         * @class BetaJS.Classes.StringTable
         */
        return {

            _notifications: {
                "tags-changed": function() {
                    this.__cache = {};
                }
            },

            /**
             * Instantiates a StringTable. 
             */
            constructor: function() {
                inherited.constructor.call(this);
                this.__cache = {};
                this.__strings = {};
            },

            __resolveKey: function(key, prefix) {
                if (prefix)
                    key = prefix + "." + key;
                key = key.replace(/[^\.]+\.</g, "");
                return key;
            },

            __betterMatch: function(candidate, reference) {
                var c = this.tagIntersect(candidate.tags).length - this.tagIntersect(reference.tags).length;
                if (c !== 0)
                    return c > 0;
                c = candidate.priority - reference.priority;
                if (c !== 0)
                    return c > 0;
                c = reference.tags.length - candidate.tags.length;
                return c > 0;
            },

            /**
             * Registers string resources. 
             * 
             * @param {object} strings key-value representation of strings
             * @param {string} prefix optional prefix for the keys
             * @param {array} tags optional tags
             * @param {int} priority optional priority
             * 
             * @return {object} this
             */
            register: function() {
                var args = Functions.matchArgs(arguments, {
                    strings: true,
                    prefix: "string",
                    tags: "array",
                    priority: "number"
                });
                Objs.iter(args.strings, function(value, key) {
                    key = this.__resolveKey(key, args.prefix);
                    this.__strings[key] = this.__strings[key] || [];
                    this.__strings[key].push({
                        value: value,
                        tags: args.tags || [],
                        priority: args.priority || 0
                    });
                    delete this.__cache[key];
                }, this);
                return this;
            },

            /**
             * Returns a string resource by key 
             * 
             * @param {string} key key to be retrieved
             * @param {string} prefix optional prefix for the key
             * 
             * @return {string} resource string
             */
            get: function(key, prefix) {
                key = this.__resolveKey(key, prefix);
                if (key in this.__cache)
                    return this.__cache[key];
                if (!(key in this.__strings))
                    return null;
                var current = null;
                Objs.iter(this.__strings[key], function(candidate) {
                    if (!current || this.__betterMatch(candidate, current))
                        current = candidate;
                }, this);
                this.__cache[key] = current.value;
                return current.value;
            },

            /**
             * Retruns all included string resources 
             * 
             * @return {object} key-value representation of the included string resources
             */
            all: function() {
                return Objs.map(this.__strings, function(value, key) {
                    return this.get(key);
                }, this);
            }

        };
    }]);
});



Scoped.define("module:Classes.LocaleTable", [
    "module:Classes.StringTable",
    "module:Classes.LocaleMixin"
], function(StringTable, LocaleMixin, scoped) {
    return StringTable.extend({
        scoped: scoped
    }, [LocaleMixin,

        /**
         * Locale Table Class
         * 
         * @class BetaJS.Classes.LocaleTable
         */
        {

            _localeTags: function(locale) {
                if (!locale)
                    return null;
                var result = [];
                result.push("language:" + locale);
                if (locale.indexOf("-") > 0)
                    result.push("language:" + locale.substring(0, locale.indexOf("-")));
                return result;
            },

            /**
             * @override 
             */
            _clearLocale: function() {
                this.removeTags(this._localeTags(this.getLocale()));
            },

            /**
             * @override 
             */
            _setLocale: function(locale) {
                this.addTags(this._localeTags(locale));
            }

        }
    ]);
});