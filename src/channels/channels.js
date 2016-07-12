Scoped.define("module:Channels.Sender", [
    "module:Class",
    "module:Events.EventsMixin"
], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, 
        
        /**
         * Abstract Sender Channel Class
         * 
         * @class BetaJS.Channels.Sender
         */	                                       
        {
		
		/**
		 * Sends a message into the channel.
		 * 
		 * @param {string} message Message string
		 * @param data Custom message data
		 */
		send: function (message, data) {
			this.trigger("send", message, data);
			this._send(message, data);
		},
		
		/**
		 * Protected function for sending the message.
		 * 
		 * @param {string} message Message string
		 * @param data Custom message data
		 */
		_send: function (message, data) {}
	
	}]);
});


Scoped.define("module:Channels.Receiver", [
    "module:Class",
    "module:Events.EventsMixin"
], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin,
	                                       
       /**
        * Abstract Receiver Channel Class
        * 
        * @class BetaJS.Channels.Receiver
        */	                                       
        {
			
		/**
		 * Protected function for receiving the message.
		 * 
		 * @param {string} message Message string
		 * @param data Custom message data
		 */
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

		/**
         * ReceiverSender Class, directly connecting this sender to a receiver.
         * 
         * @class BetaJS.Channels.ReceiverSender
         */	                                       
		return {

			/**
			 * TODO
			 * 
			 * @param {object} receiver TODO
			 * @param {boolean} async TODO
			 * @param {int} delay TODO
			 */
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

        /**
         * ReadySender class that buffers messages until sender is ready.
         * 
         * @class BetaJS.Channels.ReadySender
         */	                                       
		return {
			
			/**
			 * Instantiates a Ready Sender instance.
			 * 
			 * @param {object} sender sender instance that should be used as delegate
			 */
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
			
			/**
			 * Allow all messages to be flushed directly to the sender delegate.
			 * 
			 */
			ready: function () {
				this.__ready = true;
				for (var i = 0; i < this.__cache.length; ++i)
					this.__sender.send(this.__cache[i].message, this.__cache[i].data);
				this.__cache = [];
			},
			
			/**
			 * Stop all messages being flushed.
			 * 
			 */
			unready: function () {
			    this.__ready = false;			
			}
			
		};
	});
});

