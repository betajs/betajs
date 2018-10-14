Scoped.define("module:Channels.Sender", [
    "module:Class",
    "module:Events.EventsMixin"
], function(Class, EventsMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin,

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
             * @param serializerInfo Custom serializer information
             * @fires BetaJS.Channels.Sender#send
             */
            send: function(message, data, serializerInfo) {
                /**
                 * @event BetaJS.Channels.Sender#send
                 */
                this.trigger("send", message, data);
                this._send(message, data, serializerInfo);
            },

            /**
             * Protected function for sending the message.
             * 
             * @param {string} message Message string
             * @param data Custom message data
             * @param serializerInfo Custom serializer information
             */
            _send: function(message, data, serializerInfo) {},

            /**
             * Connect sender directly to a receiver.
             *
             * @param {object} receiver receiver object
             */
            connectToReceiver: function(receiver) {
                receiver.connectToSender(this);
                return this;
            }


        }
    ]);
});


Scoped.define("module:Channels.Receiver", [
    "module:Class",
    "module:Events.EventsMixin"
], function(Class, EventsMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin,

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
             * @fires BetaJS.Channels.Receiver#receive
             */
            _receive: function(message, data) {
                /**
                 * @event BetaJS.Channels.Receiver#receive
                 */
                this.trigger("receive", message, data);
                this.trigger("receive:" + message, data);
            },

            /**
             * Connect receiver directly to a sender.
             *
             * @param {object} sender sender object
             */
            connectToSender: function(sender) {
                this.on("receive", sender.send, sender);
                return this;
            }

        }
    ]);
});


Scoped.define("module:Channels.ReceiverSender", [
    "module:Channels.Sender",
    "module:Channels.Receiver",
    "module:Async"
], function(Sender, Receiver, Async, scoped) {
    return Sender.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ReceiverSender Class, directly connecting this sender to a receiver.
         * 
         * @class BetaJS.Channels.ReceiverSender
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} receiver Receiver object
             * @param {boolean} async Handle every invocation asynchronously
             * @param {int} delay Delay time for asynchronous invocation
             * @param {boolean} json Convert to JSON (optional, false)
             */
            constructor: function(receiver, async, delay, json) {
                inherited.constructor.call(this);
                this.__receiver = receiver;
                this.__async = async;
                this.__delay = delay;
                this.__json = json;
            },

            /**
             * @override
             */
            _send: function(message, data, serializerInfo) {
                if (this.__json)
                    data = JSON.parse(JSON.stringify(data));
                if (this.__async) {
                    Async.eventually(function() {
                        this.__receiver._receive(message, data);
                    }, this, this.__delay);
                } else
                    this.__receiver._receive(message, data);
            }

        };
    }, {

        createPair: function(async, delay, json) {
            var receiver = new Receiver();
            return {
                sender: new this(receiver, async, delay, json),
                receiver: receiver
            };
        }

    });
});


Scoped.define("module:Channels.ReadySender", [
    "module:Channels.Sender"
], function(Sender, scoped) {
    return Sender.extend({
        scoped: scoped
    }, function(inherited) {

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
            constructor: function(sender) {
                inherited.constructor.call(this);
                this.__cache = [];
                this.__sender = sender;
            },

            /**
             * @override
             */
            _send: function(message, data, serializerInfo) {
                if (this.__ready)
                    this.__sender.send(message, data, serializerInfo);
                else
                    this.__cache.push({
                        message: message,
                        data: data,
                        serializerInfo: serializerInfo
                    });
            },

            /**
             * Allow all messages to be flushed directly to the sender delegate.
             * 
             */
            ready: function() {
                this.__ready = true;
                this.__cache.forEach(function(entry) {
                    this.__sender.send(entry.message, entry.data, entry.serializerInfo);
                }, this);
                this.__cache = [];
            },

            /**
             * Stop all messages being flushed.
             * 
             */
            unready: function() {
                this.__ready = false;
            }

        };
    });
});