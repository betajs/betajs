

Scoped.define("module:RMI.Peer", [
                                  "module:Class",
                                  "module:Channels.SenderMultiplexer",
                                  "module:Channels.ReceiverMultiplexer",
                                  "module:RMI.Client",
                                  "module:RMI.Server"
                                  ], function (Class, SenderMultiplexer, ReceiverMultiplexer, Client, Server, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {			

			constructor: function (sender, receiver) {
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

			acquire: function (class_type, instance_name) {
				return this.client.acquire(class_type, instance_name);
			},

			release: function (instance) {
				this.client.release(instance);
			},

			registerInstance: function (instance, options) {
				return this.server.registerInstance(instance, options);
			},

			unregisterInstance: function (instance) {
				this.server.unregisterInstance(instance);
			}

		};
	});
});
