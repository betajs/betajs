Scoped.define("module:Channels.Sender", [
    "module:Class",
    "module:Events.EventsMixin"
], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, {
		
		send: function (message, data) {
			this.trigger("send", message, data);
			this._send(message, data);
		},
		
		_send: function (message, data) {}
	
	}]);
});


Scoped.define("module:Channels.Receiver", [
    "module:Class",
    "module:Events.EventsMixin"
], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, {
			
		_receive: function (message, data) {
			this.trigger("receive", message, data);
			this.trigger("receive:" + message, data);
		}
	
	}]);
});


Scoped.define("module:Channels.ReceiverSender", [
    "module:Channels.Sender",
    "module:Async"
], function (Sender, Async, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (receiver, async, delay) {
				inherited.constructor.call(this);
				this.__receiver = receiver;
				this.__async = async;
				this.__delay = delay;
			},
			
			_send: function (message, data) {
				if (this.__async) {
					Async.eventually(function () {
						this.__receiver._receive(message, data);
					}, this, this.__delay);
				} else
					this.__receiver._receive(message, data);
			}
			
		};
	});
});


Scoped.define("module:Channels.ReadySender", [
    "module:Channels.Sender"
], function (Sender, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (sender) {
				inherited.constructor.call(this);
				this.__cache = [];
				this.__sender = sender;
			},
			
			_send: function (message, data) {
				if (this.__ready)
					this.__sender.send(message, data);
				else
					this.__cache.push({message: message, data: data});
			},
			
			ready: function () {
				this.__ready = true;
				for (var i = 0; i < this.__cache.length; ++i)
					this.__sender.send(this.__cache[i].message, this.__cache[i].data);
				this.__cache = [];
			},
			
			unready: function () {
			    this.__ready = false;			
			}
			
		};
	});
});

