Scoped.define("module:Channels.Sender", ["module:Class", "module:Events.EventsMixin"], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, {
		
		send: function (message, data) {
			this.trigger("send", message, data);
			this._send(message, data);
		},
		
		_send: function (message, data) {}
	
	}]);
});


Scoped.define("module:Channels.Receiver", ["module:Class", "module:Events.EventsMixin"], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, {
			
		_receive: function (message, data) {
			this.trigger("receive", message, data);
			this.trigger("receive:" + message, data);
		}
	
	}]);
});


Scoped.define("module:Channels.ReceiverSender", ["module:Channels.Sender"], function (Sender, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (receiver) {
				inherited.constructor.call(this);
				this.__receiver = receiver;
			},
			
			_send: function (message, data) {
				this.__receiver._receive(message, data);
			}
			
		};
	});
});

