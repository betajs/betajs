Scoped.define("module:Net.SocketSenderChannel", [
    "module:Channels.Sender"
], function(Sender, scoped) {
    return Sender.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Socket Sender Channel Class
         * 
         * @class BetaJS.Net.SocketSenderChannel
         */
        return {

            /**
             * Instantiates Socket Sender Channel
             * 
             * @param {object} socket initial socket
             * @param {string} message message string to be used on the socket
             */
            constructor: function(socket, message) {
                inherited.constructor.call(this);
                this.__socket = socket;
                this.__message = message;
            },

            _send: function(message, data) {
                this.__socket.emit(this.__message, {
                    message: message,
                    data: data
                });
            },

            /**
             * Returns current socket or sets currents socket.
             * 
             * @param {object} socket new socket (optional)
             * 
             * @return {object} current socket
             */
            socket: function() {
                if (arguments.length > 0)
                    this.__socket = arguments[0];
                return this.__socket;
            }

        };
    });
});


Scoped.define("module:Net.SocketReceiverChannel", ["module:Channels.Receiver"], function(Receiver, scoped) {
    return Receiver.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Socket Receiver Channel Class
         * 
         * @class BetaJS.Net.SocketReceiverChannel
         */
        return {

            /**
             * Instantiates Socket Receiver Channel
             * 
             * @param {object} socket initial socket
             * @param {string} message message string to be used on the socket
             */
            constructor: function(socket, message) {
                inherited.constructor.call(this);
                this.__message = message;
                this.socket(socket);
            },

            /**
             * Returns current socket or sets currents socket.
             * 
             * @param {object} socket new socket (optional)
             * 
             * @return {object} current socket
             */
            socket: function() {
                if (arguments.length > 0) {
                    this.__socket = arguments[0];
                    if (this.__socket) {
                        var self = this;
                        this.__socket.on(this.__message, function(data) {
                            self._receive(data.message, data.data);
                        });
                    }
                }
                return this.__socket;
            }

        };
    });
});