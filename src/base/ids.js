Scoped.define("module:Ids", [
    "module:Types",
    "module:Objs"
], function(Types, Objs) {

    /**
     * Id Generation
     * 
     * @module BetaJS.Ids
     */
    return {

        __uniqueId: 0,


        /**
         * Returns a unique identifier
         * 
         * @param {string} prefix a prefix string for the identifier (optional)
         * @return {string} unique identifier
         */
        uniqueId: function(prefix) {
            return (prefix || "") + (this.__uniqueId++);
        },


        /**
         * Returns the object's unique identifier or sets it
         * 
         * @param {object} object the object
         * @param {string} id (optional)
         * @return {string} object's unique identifier
         */
        objectId: function(object, id) {
            if (!object)
                return undefined;
            if (id !== undefined)
                object.__cid = id;
            else if (!object.__cid)
                object.__cid = this.uniqueId("cid_");
            return object.__cid;
        },

        /**
         * Returns a unique key for any given value of any type.
         * This is not a hash value.
         * 
         * @param value a value to generate a unique key
         * @param {int} depth optional depth for exploring by value instead of by reference
         * @return unique key
         */
        uniqueKey: function(value, depth) {
            if (depth && depth > 0 && (Types.is_object(value) || Types.is_array(value))) {
                return JSON.stringify(Objs.map(value, function(x) {
                    return this.uniqueKey(x, depth - 1);
                }, this));
            }
            if ((value !== null && Types.is_object(value)) || Types.is_array(value) || Types.is_function(value))
                return this.objectId(value);
            return value;
        }

    };
});


Scoped.define("module:IdGenerators.IdGenerator", ["module:Class"], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, {

        generate: function(ctx) {},

        valid: function(id, ctx) {
            return false;
        }

    });
});


Scoped.define("module:IdGenerators.PrefixedIdGenerator", ["module:IdGenerators.IdGenerator"], function(IdGenerator, scoped) {
    return IdGenerator.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(prefix, generator) {
                inherited.constructor.call(this);
                this.__prefix = prefix;
                this.__generator = generator;
            },

            generate: function(ctx) {
                return this.__prefix + this.__generator.generate(ctx);
            },

            valid: function(id, ctx) {
                return id.indexOf(this.__prefix) === 0 && this.__generator.valid(id.substring(this.__prefix.length), ctx);
            }

        };
    });
});


Scoped.define("module:IdGenerators.RandomIdGenerator", ["module:IdGenerators.IdGenerator", "module:Tokens"], function(IdGenerator, Tokens, scoped) {
    return IdGenerator.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(length) {
                inherited.constructor.call(this);
                this.__length = length || 16;
            },

            generate: function(ctx) {
                return Tokens.generate_token(this.__length);
            },

            valid: function(id, ctx) {
                return id.length === this.__length;
            }

        };
    });
});


Scoped.define("module:IdGenerators.ConsecutiveIdGenerator", ["module:IdGenerators.IdGenerator"], function(IdGenerator, scoped) {
    return IdGenerator.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(initial) {
                inherited.constructor.call(this);
                this.__current = initial || 0;
            },

            generate: function(ctx) {
                this.__current++;
                return this.__current;
            },

            valid: function(id, ctx) {
                return !isNaN(id);
            }

        };
    });
});


Scoped.define("module:IdGenerators.TimedIdGenerator", ["module:IdGenerators.IdGenerator", "module:Time"], function(IdGenerator, Time, scoped) {
    return IdGenerator.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function() {
                inherited.constructor.call(this);
                this.__current = Time.now() - 1;
            },

            generate: function(ctx) {
                var now = Time.now();
                this.__current = now > this.__current ? now : (this.__current + 1);
                return this.__current;
            },

            valid: function(id, ctx) {
                return !isNaN(id);
            }

        };
    });
});