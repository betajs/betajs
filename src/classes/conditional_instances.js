Scoped.define("module:Classes.ConditionalInstance", [
    "module:Class",
    "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Conditional Instance Class for registering and creating particular flavors of a certain class under particular conditions
         * 
         * @class BetaJS.Classes.ConditionalInstance
         */
        return {

            /**
             * Instantiates a particular flavor of a ConditionalInstance
             * 
             * @param {object} options Options for the instance
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                this._options = this.cls._initializeOptions(options);
            }

        };
    }, {

        /**
         * Initialize given options with potentially additional parameters
         * 
         * @param {object} options Given options
         * @return {object} Initialized options
         * 
         * @static
         */
        _initializeOptions: function(options) {
            return options;
        },

        /**
         * Determines whether a set of options is supported by this flavor of a ConditionalInstance
         * 
         * @param {object} options set of options
         * @return {boolean} true if supported
         * 
         * @static
         */
        supported: function(options) {
            return false;
        }

    }, {

        __registry: [],

        /**
         * Registers a particular flavor of a ConditionalInstance
         * 
         * @param {object} cls flavor class
         * @param {int} priority priority of this class; the higher the priority the more likely it is to be instantiated
         * 
         * @static
         */
        register: function(cls, priority) {
            this.__registry.push({
                cls: cls,
                priority: priority
            });
        },

        /**
         * Determines the best match of all registered flavors, given a set of options.
         * 
         * @param {object} options Set of options
         * @return {object} flavor class being the best match
         * 
         * @static
         */
        match: function(options) {
            options = this._initializeOptions(options);
            var bestMatch = null;
            Objs.iter(this.__registry, function(entry) {
                if ((!bestMatch || bestMatch.priority < entry.priority) && entry.cls.supported(options))
                    bestMatch = entry;
            }, this);
            return bestMatch;
        },

        /**
         * Instantiates the best match.
         * 
         * @param {object} options Set of options
         * @return {object} Instance of best match
         * 
         * @static
         */
        create: function(options) {
            var match = this.match(options);
            return match ? new match.cls(options) : null;
        },

        /**
         * Determines whether there is any support for a given set of options.
         * 
         * @param {object} options Set of options
         * @return {boolean} True if there is at least one match.
         * 
         * @static
         */
        anySupport: function(options) {
            return this.match(options) !== null;
        }

    });
});




Scoped.define("module:Classes.OptimisticConditionalInstance", [
    "module:Class",
    "module:Objs",
    "module:Promise"
], function(Class, Objs, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * OptimisticConditionalInstance for registering and optimistically creating particular flavors of a certain class under particular conditions
         * 
         * @class BetaJS.Classes.OptimisticConditionalInstance
         */
        return {

            /**
             * Instantiates a particular flavor of a OptimisticConditionalInstance
             * 
             * @param {object} options Options for the instance
             * @param {object} transitionals Particular transitional data that should be passed on from one instance to the next
             */
            constructor: function(options, transitionals) {
                inherited.constructor.call(this);
                this._transitionals = {};
            },

            /**
             * Returns an initialization promise.
             * 
             * @return {object} Initialization promise
             */
            _initializer: function() {
                // returns a promise
            },

            /**
             * Tries to initialize this instance.
             * 
             * @return {object} Success promise
             */
            _initialize: function() {
                return this._initializer().success(function() {
                    this._afterInitialize();
                }, this);
            },

            /**
             * Returns the current set of transitionals.
             * 
             * @return {object} Set of transitionals
             */
            transitionals: function() {
                return this._transitionals;
            },

            /**
             * Will be called after an instance has been initialized.
             * 
             */
            _afterInitialize: function() {
                // setup
            }

        };
    }, {}, {

        __registry: [],

        /**
         * Registers a particular flavor of an OptimisticConditionalInstance
         * 
         * @param {object} cls flavor class
         * @param {int} priority priority of this class; the higher the priority the more likely it is to be instantiated
         * 
         * @static
         */
        register: function(cls, priority) {
            this.__registry.push({
                cls: cls,
                priority: priority
            });
        },

        /**
         * Instantiates the best match.
         * 
         * @param {object} options Set of options
         * @return {object} Instance of best match as a promise
         * 
         * @static
         */
        create: function(options) {
            var promise = Promise.create();
            var reg = Objs.clone(this.__registry, 1);
            var transitionals = {};
            var next = function() {
                if (!reg.length) {
                    promise.asyncError(true);
                    return;
                }
                var p = -1;
                var j = -1;
                for (var i = 0; i < reg.length; ++i) {
                    if (reg[i].priority > p) {
                        p = reg[i].priority;
                        j = i;
                    }
                }
                var cls = reg[j].cls;
                reg.splice(j, 1);
                var instance = new cls(options, transitionals);
                instance._initialize().error(function() {
                    transitionals = instance.transitionals();
                    instance.destroy();
                    next.call(this);
                }, this).success(function() {
                    promise.asyncSuccess(instance);
                });
            };
            next.call(this);
            return promise;
        }

    });
});