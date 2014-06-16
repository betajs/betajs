BetaJS.Channels.Sender.extend("BetaJS.Net.SocketSenderChannel", {
	
	constructor: function (socket, message) {
		this._inherited(BetaJS.Net.SocketSenderChannel, "constructor");
		this.__socket = socket;
		this.__message = message;
	},
	
	_send: function (message, data) {
		this.__socket.emit(this.__message, {
			message: message,
			data: data
		});
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
