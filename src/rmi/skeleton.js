Scoped.define("module:RMI.Skeleton", [
    "module:Class",
    "module:Objs",
    "module:Promise"
], function(Class, Objs, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Rmi Skeleton Class containing the server-side implementation.
         * 
         * @class BetaJS.RMI.Skeleton
         */
        return {

            /**
             * @member {array} intf List of exported functions
             */
            intf: [],

            _stub: null,
            _intf: {},
            __superIntf: ["_destroy"],

            /**
             * Instantiates a skeleton instance.
             * 
             * @param {object} options Options, currently supported destroyable.
             */
            constructor: function(options) {
                this._options = Objs.extend({
                    destroyable: false
                }, options);
                inherited.constructor.call(this);
                this.intf = this.intf.concat(this.__superIntf);
                for (var i = 0; i < this.intf.length; ++i)
                    this._intf[this.intf[i]] = true;
            },

            /**
             * (Remotely) destroy the skeleton if supported.
             * 
             * @protected
             */
            _destroy: function() {
                if (this._options.destroyable)
                    this.destroy();
            },

            /**
             * Invoke an exported function.
             * 
             * @param {string} message name of exported function
             * @param {array} data custom data array
             * 
             * @return {object} execution promise
             */
            invoke: function(message, data) {
                if (!(this._intf[message]))
                    return Promise.error(message);
                try {
                    var result = this[message].apply(this, data);
                    return Promise.is(result) ? result : Promise.value(result);
                } catch (e) {
                    return Promise.error(e);
                }
            },

            /**
             * Returns a success promise for an exported call.
             * 
             * @param result Success value
             * 
             * @return {object} success promise
             * 
             * @protected
             */
            _success: function(result) {
                return Promise.value(result);
            },

            /**
             * Returns an error promise for an exported call.
             * 
             * @param result Error value
             * 
             * @return {object} error promise
             * 
             * @protected
             */
            _error: function(result) {
                return Promise.error(result);
            },

            /**
             * Returns the name of the corresponding Stub.
             * 
             * @return {string} corresponding Stub name
             */
            stub: function() {
                if (this._stub)
                    return this._stub;
                var stub = this.cls.classname;
                return stub.indexOf("Skeleton") >= 0 ? stub.replace("Skeleton", "Stub") : stub;
            }

        };
    });
});