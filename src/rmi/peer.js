Scoped.define("module:RMI.Peer", [
    "module:Class",
    "module:Channels.SenderMultiplexer",
    "module:Channels.ReceiverMultiplexer",
    "module:RMI.Client",
    "module:RMI.Server"
], function(Class, SenderMultiplexer, ReceiverMultiplexer, Client, Server, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * RMI Peer Class, combining Sender and Receiver into bidirectional Client and Server
         * 
         * @class BetaJS.RMI.Peer
         */
        return {

            /**
             * Instantiates Peer Class
             * 
             * @param {object} sender Sender Channel
             * @param {object} receiver Receiver Channel
             */
            constructor: function(sender, receiver) {
                inherited.constructor.call(this);
                this.__sender = sender;
                this.__receiver = receiver;
                this.__client_sender = this._auto_destroy(new SenderMultiplexer(sender, "client"));
                this.__server_sender = this._auto_destroy(new SenderMultiplexer(sender, "server"));
                this.__client_receiver = this._auto_destroy(new ReceiverMultiplexer(receiver, "server"));
                this.__server_receiver = this._auto_destroy(new ReceiverMultiplexer(receiver, "client"));
                this.client = this._auto_destroy(new Client(this.__client_sender, this.__client_receiver));
                this.server = this._auto_destroy(new Server(this.__server_sender, this.__server_receiver));
                this.client.server = this.server;
                this.server.client = this.client;
            },

            /**
             * Acquires an instance.
             * 
             * @param {string} class_type Type of Class
             * @param {string} instance_name Name of Instance
             * 
             * @return {object} acquired instance
             */
            acquire: function(class_type, instance_name) {
                return this.client.acquire(class_type, instance_name);
            },

            /**
             * Releases an instance.
             * 
             * @param {object} instance Previously acquired instance
             */
            release: function(instance) {
                this.client.release(instance);
            },

            /**
             * Register an instance.
             * 
             * @param {object} instance Object instance
             * @param {object} options Registration options
             * 
             * @return {object} Registered instance
             */
            registerInstance: function(instance, options) {
                return this.server.registerInstance(instance, options);
            },

            /**
             * Unregister an instance.
             * 
             * @param {object} instance Previously registered instance
             */
            unregisterInstance: function(instance) {
                this.server.unregisterInstance(instance);
            }

        };
    });
});