Scoped.define("module:Channels.WorkerSenderChannel", [
    "module:Channels.Sender"
], function (Sender, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (worker) {
				inherited.constructor.call(this);
				this.__worker = worker || self;
			},
			
			_send: function (message, data) {
				this.__worker.postMessage({
					message: message,
					data: data
				});
			}
			
		};
	});
});


Scoped.define("module:Channels.WorkerReceiverChannel", [
    "module:Channels.Receiver"
], function (Receiver, scoped) {
	return Receiver.extend({scoped: scoped}, function (inherited) {
		return {
						
			constructor: function (worker) {
				inherited.constructor.call(this);
				this.__worker = worker || self;
				var _this = this;
				this.__worker.addEventListener("message", function (data) {
					_this._receive(data.data.message, data.data.data);
				});
		    }
	
		};
	});
});
