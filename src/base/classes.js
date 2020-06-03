Scoped.define("module:Classes.InvokerMixin", [
    "module:Objs", "module:Types", "module:Functions"
], function(Objs, Types, Functions) {

    /**
     * Invoker Mixin, delegating method calls to an invocation function.
     * 
     * @mixin BetaJS.Classes.InvokerMixin
     */
    return {

        /**
         * Delegate member functio names to an invoker function.
         * 
         * @param {function} invoker invoker delegation function
         * @param {array} members array of member function names
         */
        invoke_delegate: function(invoker, members) {
            if (!Types.is_array(members))
                members = [members];
            invoker = this[invoker];
            var self = this;
            Objs.iter(members, function(member) {
                this[member] = function(member) {
                    return function() {
                        var args = Functions.getArguments(arguments);
                        args.unshift(member);
                        return invoker.apply(self, args);
                    };
                }.call(self, member);
            }, this);
        }
    };
});




Scoped.define("module:Classes.HelperClassMixin", [
    "module:Objs", "module:Types", "module:Functions", "module:Promise"
], function(Objs, Types, Functions, Promise) {

    /**
     * HelperClass Mixin
     * 
     * @mixin BetaJS.Classes.HelperClassMixin
     */
    return {

        /**
         * Add Helper Class
         * 
         * @param {class} helper_class helper class to add
         * @param {objects} options optional options
         * 
         * @return {object} added helper instance
         */
        addHelper: function(helper_class, options) {
            var helper = new helper_class(this, options);
            this.__helpers = this.__helpers || [];
            this.__helpers.push(this._auto_destroy(helper));
            return helper;
        },

        /**
         * Notify all helpers of a method call.
         * 
         * @param {objects} options method call options
         * @return accumlated return value
         */
        _helper: function(options) {
            this.__helpers = this.__helpers || [];
            if (Types.is_string(options)) {
                options = {
                    method: options
                };
            }
            options = Objs.extend({
                fold_start: null,
                fold: function(acc, result) {
                    return acc || result;
                }
            }, options);
            var args = Functions.getArguments(arguments, 1);
            var acc = options.async ? Promise.create(options.fold_start) : options.fold_start;
            for (var i = 0; i < this.__helpers.length; ++i) {
                var helper = this.__helpers[i];
                if (options.method in helper) {
                    if (options.async)
                        acc = Promise.func(options.fold, acc, Promise.methodArgs(helper, helper[options.method], args));
                    else
                        acc = options.fold(acc, helper[options.method].apply(helper, args));
                }
            }
            return acc;
        }

    };
});



Scoped.define("module:Classes.PathResolver", [
    "module:Class", "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Path Resolver Class
         * 
         * @class BetaJS.Classes.PathResolver
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} bindings path resolution bindings
             */
            constructor: function(bindings) {
                inherited.constructor.call(this);
                this._bindings = bindings || {};
            },

            /**
             * Extend instance by more bindings.
             * 
             * @param {object} bindings bindings to extend
             * @param {string} namespace optional namespace
             * 
             */
            extend: function(bindings, namespace) {
                if (namespace) {
                    for (var key in bindings) {
                        var value = bindings[key];
                        var regExp = /\{([^}]+)\}/;
                        while (true) {
                            var matches = regExp.exec(value);
                            if (!matches)
                                break;
                            value = value.replace(regExp, namespace + "." + matches[1]);
                        }
                        this._bindings[namespace + "." + key] = value;
                    }
                } else
                    this._bindings = Objs.extend(this._bindings, bindings);
            },

            /**
             * Map an array of path expressions to their resolutions.
             * 
             * @param {array} arr list of path expression
             * 
             * @return {array} resolved expressions
             */
            map: function(arr) {
                var result = [];
                for (var i = 0; i < arr.length; ++i) {
                    if (arr[i])
                        result.push(this.resolve(arr[i]));
                }
                return result;
            },

            /**
             * Resolve a path rexpression.
             * 
             * @param {string} path path expression to resolve
             * 
             * @return {string} resolved path expression
             */
            resolve: function(path) {
                var regExp = /\{([^}]+)\}/;
                while (true) {
                    var matches = regExp.exec(path);
                    if (!matches)
                        break;
                    path = path.replace(regExp, this._bindings[matches[1]]);
                }
                return this.simplify(path);
            },

            /**
             * Simplify a path expression.
             * 
             * @param {string} path path expression to simplify
             * 
             * @return {string} simplified path expression
             */
            simplify: function(path) {
                return path.replace(/[^\/]+\/\.\.\//, "").replace(/\/[^\/]+\/\.\./, "");
            }

        };
    });
});


Scoped.define("module:Classes.MultiDelegatable", [
    "module:Class", "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Multi Delegatable Class
         * 
         * @class BetaJS.Classes.MultiDelegatable
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {array} objects list of objects
             * @param {array} methods list of methods
             */
            constructor: function(objects, methods) {
                inherited.constructor.call(this);
                Objs.iter(methods, function(method) {
                    this[method] = function() {
                        var args = arguments;
                        Objs.iter(objects, function(object) {
                            object[method].apply(object, args);
                        }, this);
                        return this;
                    };
                }, this);
            }

        };
    });
});



Scoped.define("module:Classes.ObjectIdScopeMixin", function() {

    /**
     * Object Id Scope Mixin
     * 
     * @mixin BetaJS.Classes.ObjectIdScopeMixin
     */
    return {

        __objects: {},

        /**
         * Return object for specific id
         * 
         * @param {string} id id of object
         * 
         * @return {object} object in question
         */
        get: function(id) {
            return this.__objects[id];
        }

    };
});


Scoped.define("module:Classes.ObjectIdScope", [
    "module:Class", "module:Classes.ObjectIdScopeMixin"
], function(Class, Mixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, Mixin, function(inherited) {

        /**
         * Object Id Scope Class
         * 
         * @class BetaJS.Classes.ObjectIdScope
         */
        return {

            /**
             * Create or return singleton instance of this class.
             * 
             * @return {object} singleton instance
             */
            singleton: function() {
                if (!this.__singleton)
                    this.__singleton = new this();
                return this.__singleton;
            }
        };
    });
});


Scoped.define("module:Classes.SingletonMixin", [], function() {
    /**
     * SingletonMixin
     *
     * @mixin BetaJS.Classes.SingletonMixin
     */
    return {

        _notifications: {
            construct: "__singleton_create",
            destroy: "__singleton_destroy"
        },

        __singleton_create: function() {
            if (this.cls.__singleton)
                throw ("Can only create a single instance of " + this.cls.classname);
            this.cls.__singleton = this;
        },

        __singleton_destroy: function() {
            this.cls.__singleton = null;
        }

    };
});


Scoped.define("module:Classes.SingletonClassMixin", [], function() {
    /**
     * SingletonMixinClass
     *
     * @mixin BetaJS.Classes.SingletonMixinClass
     */
    return {

        singleton: function() {
            this.__singleton = this.__singleton || new this();
            return this.__singleton;
        }

    };
});


Scoped.define("module:Classes.ObjectIdMixin", [
    "module:Classes.ObjectIdScope"
], function(ObjectIdScope) {

    /**
     * Object Id Mixin
     * 
     * @mixin BetaJS.Classes.ObjectIdMixin
     */
    return {

        _notifications: {
            construct: "__register_object_id",
            destroy: "__unregister_object_id"
        },

        __object_id_scope: function() {
            if (!this.object_id_scope)
                this.object_id_scope = ObjectIdScope.singleton();
            return this.object_id_scope;
        },

        __register_object_id: function() {
            var scope = this.__object_id_scope();
            scope.__objects[this.cid()] = this;
        },

        __unregister_object_id: function() {
            var scope = this.__object_id_scope();
            delete scope.__objects[this.cid()];
        }

    };
});


Scoped.define("module:Classes.SharedObjectFactory", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Shared Object Factory Class
         *
         * @class BetaJS.Classes.SharedObjectFactory
         */
        return {

            /**
             * Creates a new factory.
             *
             * @param {function} createCallback callback function for creating an instance
             * @param {object} createContext optional callback context
             */
            constructor: function(createCallback, createContext, createArgs) {
                inherited.constructor.call(this);
                this.__createCallback = createCallback;
                this.__createContext = createContext;
                this.__createArgs = createArgs || [];
                this.__object = null;
            },

            /**
             * @override
             */
            destroy: function() {
                if (this.__object && !this.__object.destroyed())
                    this.__object.destroy();
                inherited.destroy.call(this);
            },

            /**
             * Return object instance.
             *
             * @returns {object} shared object instance
             */
            value: function() {
                return this.__object && !this.__object.destroyed() ? this.__object : null;
            },

            /**
             * Return true if acquired.
             *
             * @returns {boolean} true if acquired
             */
            isAcquired: function() {
                return !!this.value();
            },

            /**
             * Acquire object instance.
             *
             * @param {object} reference optional reference
             * @param {boolean} autoDecreaseRef automatically decrease reference upon destruction
             *
             * @returns {object} shared object instance
             */
            acquire: function(reference, autoDecreaseRef) {
                if (!this.__object || this.__object.destroyed())
                    this.__object = this.__createCallback.apply(this.__createContext || this, this.__createArgs);
                this.__object.increaseRef(reference, autoDecreaseRef);
                return this.__object;
            },

            /**
             * Release object instance.
             *
             * @param {object} obj object instance
             * @param {object} reference optional reference
             */
            release: function(obj, reference) {
                if (obj && obj === this.__object && !obj.destroyed())
                    obj.decreaseRef(obj);
            }

        };
    });
});


Scoped.define("module:Classes.SharedObjectFactoryPool", [
    "module:Class",
    "module:Objs",
    "module:Functions"
], function(Class, Objs, Functions, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Shared Object Factory Pool Class
         *
         * @class BetaJS.Classes.SharedObjectFactoryPool
         */
        return {

            /**
             * Creates a new factory pool.
             *
             * @param {function} createCallback callback function for creating a shared object factory instance
             * @param {object} createContext optional callback context
             */
            constructor: function(createCallback, createContext) {
                inherited.constructor.call(this);
                this.__createCallback = createCallback;
                this.__createContext = createContext;
                this.__cache = {};
            },

            /**
             * @override
             */
            destroy: function() {
                Objs.iter(this.__cache, function(instance) {
                    instance.weakDestroy();
                }, this);
                inherited.destroy.call(this);
            },

            acquire: function() {
                var args = Functions.getArguments(arguments);
                var serialized = JSON.stringify(args);
                if (!this.__cache[serialized] || this.__cache[serialized].destroyed())
                    this.__cache[serialized] = this.__createCallback.apply(this.__createContext || this, args);
                return this.__cache[serialized];
            }

        };
    });
});



Scoped.define("module:Classes.CriticalSectionMixin", [
    "module:Promise"
], function(Promise) {

    return {

        criticalSection: function(name, cb) {
            this.__criticalSections = this.__criticalSections || {};
            this.__criticalSections[name] = this.__criticalSections[name] || [];
            var promise = Promise.create();
            this.__criticalSections[name].push(promise);
            if (this.__criticalSections[name].length === 1)
                promise.asyncSuccess(true);
            return promise.mapSuccess(function() {
                return Promise.box(cb, this).callback(function() {
                    this.__criticalSections[name].shift();
                    if (this.__criticalSections[name].length > 0)
                        this.__criticalSections[name][0].asyncSuccess(true);
                }, this);
            }, this);
        }

    };
});



Scoped.define("module:Classes.CacheHash", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(prefix) {
                inherited.constructor.call(this);
                this.__prefix = prefix || "";
                this.__counter = 0;
                this.__cache = {};
                this.__hash = {};
            },

            hashKey: function(key) {
                if (key in this.__hash)
                    return this.__hash[key];
                var c = this.__prefix + this.__counter++;
                this.__hash[key] = c;
                this.__cache[c] = key;
                return c;
            },

            hash: function() {
                return this.__hash;
            },

            cache: function() {
                return this.__cache;
            }

        };
    });
});