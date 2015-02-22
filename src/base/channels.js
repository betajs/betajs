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


Scoped.define("module:Channels.SenderMultiplexer", ["module:Channels.Sender"], function (Sender, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (sender, prefix) {
				inherited.constructor.call(this);
				this.__sender = sender;
				this.__prefix = prefix;
			},
			
			_send: function (message, data) {
				this.__sender.send(this.__prefix + ":" + message, data);
			}
			
		};
	});
});


Scoped.define("module:Channels.ReceiverMultiplexer", ["module:Channels.Receiver", "module:Strings"], function (Receiver, Strings, scoped) {
	return Receiver.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (receiver, prefix) {
				inherited.constructor.call(this);
				this.__receiver = receiver;
				this.__prefix = prefix;
				this.__receiver.on("receive", function (message, data) {
					if (Strings.starts_with(message, this.__prefix + ":"))
						this._receive(Strings.strip_start(message, this.__prefix + ":"), data);
				}, this);
			}
		
		};
	});
});



Scoped.define("module:Channels.TransportChannel", [
	    "module:Class",
	    "module:Objs",
	    "module:Timers.Timer",
	    "module:Time",
	    "module:Promise"
	], function (Class, Objs, Timer, Time, Promise, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
					
			constructor: function (sender, receiver, options) {
				inherited.constructor.call(this);
				this.__sender = sender;
				this.__receiver = receiver;
				this.__options = Objs.extend(options, {
					timeout: 10000,
					tries: 1,
					timer: 500
				});
				this.__receiver.on("receive:send", function (data) {
					this.__reply(data);
				}, this);
				this.__receiver.on("receive:reply", function (data) {
					this.__complete(data);
				}, this);
				this.__sent_id = 0;
				this.__sent = {};
				this.__received = {};
				this.__timer = this._auto_destroy(new Timer({
					delay: this.__options.timer,
					context: this,
					fire: this.__maintenance
				}));
			},
			
			// Returns Promise
			_reply: function (message, data) {},
			
			send: function (message, data, options) {
				var promise = Promise.create();
				options = options || {};
				if (options.stateless) {
					this.__sender.send("send", {
						message: message,
						data: data,
						stateless: true
					});
					promise.asyncSuccess(true);
				} else {
					this.__sent_id++;
					this.__sent[this.__sent_id] = {
						message: message,
						data: data,
						tries: 1,
						time: Time.now(),
						id: this.__sent_id,
						promise: promise
					};
					this.__sender.send("send", {
						message: message,
						data: data,
						id: this.__sent_id
					});
				}
				return promise;
			},
			
			__reply: function (data) {
				if (data.stateless) {
					this._reply(data.message, data.data);
					return;
				}
				if (!this.__received[data.id]) {
					this.__received[data.id] = data;
					this.__received[data.id].time = Time.now();
					this.__received[data.id].returned = false;
					this.__received[data.id].success = false;
					this._reply(data.message, data.data).success(function (result) {
						this.__received[data.id].reply = result;
						this.__received[data.id].success = true;
					}, this).error(function (error) {
						this.__received[data.id].reply = error;
					}, this).callback(function () {
						this.__received[data.id].returned = true;
						this.__sender.send("reply", {
							id: data.id,
							reply: data.reply,
							success: data.success
						});
					}, this);			  
				} else if (this.__received[data.id].returned) {
					this.__sender.send("reply", {
						id: data.id,
						reply: data.reply,
						success: data.success
					});
				}
			},
			
			__complete: function (data) {
				if (this.__sent[data.id]) {
					var promise = this.__sent[data.id].promise;
					promise[data.success ? "asyncSuccess" : "asyncError"](data.reply);
					delete this.__sent[data.id];
				}
			},
			
			__maintenance: function () {
				var now = Time.now();
				for (var received_key in this.__received) {
					var received = this.__received[received_key];
					if (received.time + this.__options.tries * this.__options.timeout <= now)
						delete this.__received[received_key];
				}
				for (var sent_key in this.__sent) {
					var sent = this.__sent[sent_key];
					if (sent.time + sent.tries * this.__options.timeout <= now) {
						if (sent.tries < this.__options.tries) {
							sent.tries++;
							this.__sender.send("send", {
								message: sent.message,
								data: sent.data,
								id: sent.id
							});
						} else {
							sent.promise.asyncError({
								message: sent.message,
								data: sent.data
							});
							delete this.__sent[sent_key];
						}
					}
				}
			}
			
		};
	});
});

