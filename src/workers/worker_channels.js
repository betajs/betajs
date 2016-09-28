Scoped.define("module:Workers.WorkerSenderChannel", [
    "module:Channels.Sender",
    "module:Objs"
], function (Sender, Objs, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (worker) {
				inherited.constructor.call(this);
				this.__worker = worker || self;
			},
			
			_send: function (message, data, serializerInfo) {
				var transfer = [];
				if (serializerInfo) {
					Objs.iter(serializerInfo, function (value, key) {
						if (value && value.transfer && data[key])
							transfer.push(data[key]);
					}, this);
				}
				this.__worker.postMessage({
					message: message,
					data: data
				}, transfer);
			}
			
		};
	});
});


Scoped.define("module:Workers.WorkerReceiverChannel", [
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
