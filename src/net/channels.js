BetaJS.Channels.Sender.extend("BetaJS.Net.SocketSenderChannel", {
	
	constructor: function (socket, message, ready) {
		this._inherited(BetaJS.Net.SocketSenderChannel, "constructor");
		this.__socket = socket;
		this.__message = message;
		this.__ready = BetaJS.Types.is_defined(ready) ? ready : true;
		this.__cache = [];
	},
	
	_send: function (message, data) {
		if (this.__ready) {
			this.__socket.emit(this.__message, {
				message: message,
				data: data
			});
		} else {
			this.__cache.push({
				message: message,
				data: data
			});
		}
	},
	
	ready: function () {
		this.__ready = true;
		for (var i = 0; i < this.__cache.length; ++i)
			this._send(this.__cache[i].message, this.__cache[i].data);
		this.__cache = [];
	}
	
});


BetaJS.Channels.Receiver.extend("BetaJS.Net.SocketReceiverChannel", {
	
	constructor: function (socket, message) {
		this._inherited(BetaJS.Net.SocketReceiverChannel, "constructor");
		var self = this;
		socket.on(message, function (data) {
			self._receive(data.message, data.data);
		});
	}
	
});
