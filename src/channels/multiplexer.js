Scoped.define("module:Channels.SenderMultiplexer", ["module:Channels.Sender"], function(Sender, scoped) {
    return Sender.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Channel Sender Multiplexer Class
         * 
         * @class BetaJS.Channels.SenderMultiplexer
         * 
         */
        return {

            /**
             * Instantiates the Multiplexer Sender
             * 
             * @param {object} sender sender channel
             * @param {string} prefix prefix string for multiplexing
             * 
             */
            constructor: function(sender, prefix) {
                inherited.constructor.call(this);
                this.__sender = sender;
                this.__prefix = prefix;
            },

            _send: function(message, data, serializerInfo) {
                this.__sender.send(this.__prefix + ":" + message, data, serializerInfo);
            }

        };
    });
});


Scoped.define("module:Channels.ReceiverMultiplexer", ["module:Channels.Receiver", "module:Strings"], function(Receiver, Strings, scoped) {
    return Receiver.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Channel Receiver Multiplexer Class
         * 
         * @class BetaJS.Channels.ReceiverMultiplexer
         * 
         */
        return {

            /**
             * Instantiates the Multiplexer Receiver
             * 
             * @param {object} receiver receiver channel
             * @param {string} prefix prefix string for de-multiplexing
             * 
             */
            constructor: function(receiver, prefix) {
                inherited.constructor.call(this);
                this.__receiver = receiver;
                this.__prefix = prefix;
                this.__receiver.on("receive", function(message, data) {
                    if (Strings.starts_with(message, this.__prefix + ":"))
                        this._receive(Strings.strip_start(message, this.__prefix + ":"), data);
                }, this);
            }

        };
    });
});