Scoped.define("module:Channels.TransportChannel", [
    "module:Class",
    "module:Objs",
    "module:Timers.Timer",
    "module:Time",
    "module:Promise"
], function(Class, Objs, Timer, Time, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Transport Channel for reliable transmission of data.
         * 
         * @class BetaJS.Channels.TransportChannel
         */
        return {

            /**
             * Instantiates TransportChannel
             * 
             * @param {object} sender Sender Channel
             * @param {object} receiver Receiver Channel
             * @param {object} options options (timeout, tries, timer, auto_destroy) for configuring the Transport Channel
             */
            constructor: function(sender, receiver, options) {
                inherited.constructor.call(this);
                this.__sender = sender;
                this.__receiver = receiver;
                this.__options = Objs.extend(options, {
                    timeout: 10000,
                    tries: 1,
                    timer: 500
                });
                if (this.__options.auto_destroy) {
                    this.auto_destroy(sender);
                    this.auto_destroy(receiver);
                }
                this.__receiver.on("receive:send", function(data) {
                    this.__reply(data);
                }, this);
                this.__receiver.on("receive:reply", function(data) {
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

            /**
             * Callback function for replying to a message. Needs to be overwritten from the outside.
             * 
             * @param {string} message message string
             * @param {object} data data object
             * 
             * @return {object} promise object containin the reply data or an error
             */
            _reply: function(message, data) {},

            /**
             * Send a message through the channel.
             * 
             * @param {string} message message string
             * @param {object} data data object
             * @param {object} options options (stateless) for sending the message
             * 
             * @return {object} promise object
             */
            send: function(message, data, options) {
                var promise = Promise.create();
                options = options || {};
                if (options.stateless) {
                    this.__sender.send("send", {
                        message: message,
                        data: data,
                        stateless: true
                    }, options.serializerInfo);
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
                    }, options.serializerInfo);
                }
                return promise;
            },

            __reply: function(data) {
                if (data.stateless) {
                    this._reply(data.message, data.data);
                    return;
                }
                if (!this.__received[data.id]) {
                    this.__received[data.id] = data;
                    this.__received[data.id].time = Time.now();
                    this.__received[data.id].returned = false;
                    this.__received[data.id].success = false;
                    Promise.value(this._reply(data.message, data.data)).success(function(result) {
                        this.__received[data.id].reply = result;
                        this.__received[data.id].success = true;
                    }, this).error(function(error) {
                        if (error && error.constructor && error.constructor === Error)
                            error = error.toString();
                        this.__received[data.id].reply = error;
                    }, this).callback(function() {
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

            __complete: function(data) {
                if (this.__sent[data.id]) {
                    var promise = this.__sent[data.id].promise;
                    promise[data.success ? "asyncSuccess" : "asyncError"](data.reply);
                    if (this.__sent)
                        delete this.__sent[data.id];
                }
            },

            __maintenance: function() {
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