Scoped.define("module:Channels.SimulatorSender", ["module:Channels.Sender"], function (Sender, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {
			
			online: true,

			constructor: function (sender) {
				inherited.constructor.call(this);
				this.__sender = sender;
			},
			
			_send: function (message, data) {
				if (this.online)
					this.__sender.send(message, data);
			}
			
		};
	});
});

