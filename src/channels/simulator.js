Scoped.define("module:Channels.SimulatorSender", [
    "module:Channels.Sender"
], function(Sender, scoped) {
    return Sender.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Sender Simulating Online / Offline behavior
         * 
         * @class BetaJS.Channels.SimulatorSender
         */
        return {

            /**
             * Attribute for setting / online offline
             * 
             * @member {boolean} online online / offline setting
             */
            online: true,

            /**
             * Create a new instance given an inner sender channel.
             * 
             * @param {object} sender sender instance
             * 
             * @return {object} simulated sender instance
             */
            constructor: function(sender) {
                inherited.constructor.call(this);
                this.__sender = sender;
            },

            _send: function(message, data) {
                if (this.online)
                    this.__sender.send(message, data);
            }

        };
    });
});



Scoped.define("module:Channels.SimulatorReceiver", [
    "module:Channels.Receiver"
], function(Receiver, scoped) {
    return Receiver.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Receiver Simulating Online / Offline behavior
         *
         * @class BetaJS.Channels.SimulatorReceiver
         */
        return {

            /**
             * Attribute for setting / online offline
             *
             * @member {boolean} online online / offline setting
             */
            online: true,

            /**
             * Create a new instance given an inner receiver channel.
             *
             * @param {object} receiver receiver instance
             *
             * @return {object} simulated receiver instance
             */
            constructor: function(receiver) {
                inherited.constructor.call(this);
                this.__receiver = receiver;
                this.__receiver.on("receive", function(message, data) {
                    if (this.online)
                        this._receive(message, data);
                }, this);
            }

        };
    });
});