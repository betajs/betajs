Scoped.define("module:RMI.Stub", [
    "module:Class",
    "module:Classes.InvokerMixin",
    "module:Functions"
], function(Class, InvokerMixin, Functions, scoped) {
    return Class.extend({
        scoped: scoped
    }, [InvokerMixin, function(inherited) {

        /**
         * Abstract Stub Class
         * 
         * @class BetaJS.RMI.Stub
         */
        return {

            /**
             * 
             * @member {array} intf abstract interface list, needs to be overwritten in subclasses
             */
            intf: [],

            /**
             * 
             * @member {object} serializes list of serialization information
             */
            serializes: {},

            /**
             * Instantiates the stub.
             * 
             */
            constructor: function() {
                inherited.constructor.call(this);
                this.invoke_delegate("invoke", this.intf);
            },

            /**
             * @override
             */
            destroy: function() {
                this.invoke("_destroy");
                inherited.destroy.call(this);
            },

            /**
             * @override
             */
            invoke: function(message) {
                return this.__send(message, Functions.getArguments(arguments, 1), this.serializes[message]);
            }

        };
    }]);
});


Scoped.define("module:RMI.StubSyncer", [
    "module:Class",
    "module:Classes.InvokerMixin",
    "module:Functions",
    "module:Promise"
], function(Class, InvokerMixin, Functions, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, [InvokerMixin, function(inherited) {

        /**
         * Stub Syncer class for executing RMI methods one after the other.
         * 
         * @class BetaJS.RMI.StubSyncer
         */
        return {

            /**
             * Instantiates the stub syncer.
             * 
             * @param {object} stub stub object
             */
            constructor: function(stub) {
                inherited.constructor.call(this);
                this.__stub = stub;
                this.__current = null;
                this.__queue = [];
                this.invoke_delegate("invoke", this.__stub.intf);
            },

            /**
             * @override
             */
            invoke: function() {
                var object = {
                    args: Functions.getArguments(arguments),
                    promise: Promise.create()
                };
                this.__queue.push(object);
                if (!this.__current)
                    this.__next();
                return object.promise;
            },

            /**
             * @private
             */
            __next: function() {
                if (this.__queue.length === 0)
                    return;
                this.__current = this.__queue.shift();
                this.__stub.invoke.apply(this.__stub, this.__current.args).forwardCallback(this.__current.promise).callback(this.__next, this);
            }

        };
    }]);
});