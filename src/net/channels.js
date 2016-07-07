Scoped.define("module:Net.SocketSenderChannel", [
    "module:Channels.Sender"
], function (Sender, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (socket, message) {
				inherited.constructor.call(this);
				this.__socket = socket;
				this.__message = message;
			},
			
			_send: function (message, data) {
				this.__socket.emit(this.__message, {
					message: message,
					data: data
				});
			},
			
			socket: function () {
			    if (arguments.length > 0)
			        this.__socket = arguments[0];
			    return this.__socket;
			}
			
		};
	});
});


Scoped.define("module:Net.SocketReceiverChannel", ["module:Channels.Receiver"], function (Receiver, scoped) {
	return Receiver.extend({scoped: scoped}, function (inherited) {
		return {
						
			constructor: function (socket, message) {
				inherited.constructor.call(this);
				this.__message = message;
				this.socket(socket);
			},
			
		    socket: function () {
		        if (arguments.length > 0) {
		            this.__socket = arguments[0];
		            if (this.__socket) {
		                var self = this;
		                this.__socket.on(this.__message, function (data) {
		                    self._receive(data.message, data.data);
		                });
		            }
		        }
		        return this.__socket;
		    }
	
		};
	});
});
