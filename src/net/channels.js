Scoped.define("module:Net.SocketSenderChannel", ["module:Channels.Sender", "module:Types"], function (Sender, Types, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (socket, message, ready) {
				inherited.constructor.call(this);
				this.__socket = socket;
				this.__message = message;
				this.__ready = Types.is_defined(ready) ? ready : true;
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
			},
			
			unready: function () {
			    this.__ready = false;
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
