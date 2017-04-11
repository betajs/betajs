Scoped.define("module:RMI.Client", [
    "module:Class",
    "module:Objs",
    "module:Channels.TransportChannel",
    "module:Ids",
    "module:RMI.Skeleton",
    "module:Types",
    "module:RMI.Stub"
], function(Class, Objs, TransportChannel, Ids, Skeleton, Types, Stub, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * RMI Client Class
         * 
         * @class BetaJS.RMI.Client
         */
        return {

            /**
             * Creates a new instance of an RMI client.
             * 
             * @param {object} sender_or_channel_or_null a channel or sender that should be connected to
             * @param {object} receiver_or_null a receiver that should be connected to
             */
            constructor: function(sender_or_channel_or_null, receiver_or_null) {
                inherited.constructor.call(this);
                this.__channel = null;
                this.__instances = {};
                if (sender_or_channel_or_null) {
                    var channel = sender_or_channel_or_null;
                    if (receiver_or_null)
                        channel = this._auto_destroy(new TransportChannel(sender_or_channel_or_null, receiver_or_null));
                    this.__channel = channel;
                }
            },

            /**
             * @override
             */
            destroy: function() {
                if (this.__channel)
                    this.disconnect();
                inherited.destroy.call(this);
            },

            /**
             * Connect to a channel.
             * 
             * @param {object} channel channel to be connected to
             */
            connect: function(channel) {
                if (this.__channel)
                    return;
                this.__channel = channel;
                return this;
            },

            /**
             * Connect to a channel using sender and receiver.
             * 
             * @param {object} sender sender channel to be connected to
             * @param {object} receiver receiver channel to be connected to
             * @param {object} options options for transport channel
             */
            connectTransport: function(sender, receiver, options) {
                return this.connect(this.auto_destroy(new TransportChannel(sender, receiver, options)));
            },

            /**
             * Disconnect from channel.
             * 
             */
            disconnect: function() {
                if (!this.__channel)
                    return;
                this.__channel = null;
                Objs.iter(this.__instances, function(inst) {
                    this.release(inst);
                }, this);
                return this;
            },

            /**
             * Serialize a value.
             * 
             * @param value value to be serialized.
             * 
             * @return Serialized value
             */
            _serializeValue: function(value) {
                if (Skeleton.is_instance_of(value)) {
                    var registry = this.server;
                    registry.registerInstance(value);
                    return {
                        __rmi_meta: true,
                        __rmi_stub: value.stub(),
                        __rmi_stub_id: Ids.objectId(value)
                    };
                } else
                    return value;
            },

            /**
             * Unserialize a value.
             * 
             * @param value value to be unserialized.
             * 
             * @return unserialized value
             */
            _unserializeValue: function(value) {
                if (value && value.__rmi_meta) {
                    var receiver = this;
                    return receiver.acquire(value.__rmi_stub, value.__rmi_stub_id);
                } else
                    return value;
            },

            /**
             * Acquires an object instance.
             * 
             * @param {string} class_type class type of object instance
             * @param {string} instance_name registered name of instance
             * 
             * @return {object} object instance
             */
            acquire: function(class_type, instance_name) {
                if (this.__instances[instance_name])
                    return this.__instances[instance_name];
                if (Types.is_string(class_type))
                    class_type = Scoped.getGlobal(class_type);
                if (!class_type || !class_type.ancestor_of(Stub))
                    return null;
                var instance = new class_type();
                this.__instances[Ids.objectId(instance, instance_name)] = instance;
                var self = this;
                instance.__send = function(message, data, serializes) {
                    if (!self.__channel)
                        return;
                    data = Objs.map(data, self._serializeValue, self);
                    return self.__channel.send(instance_name + ":" + message, data, {
                        serializerInfo: serializes
                    }).mapSuccess(function(result) {
                        return this._unserializeValue(result);
                    }, self);
                };
                return instance;
            },

            /**
             * Releases an acquired instance.
             * 
             * @param {object} instance instance to be released
             * 
             */
            release: function(instance) {
                var instance_name = Ids.objectId(instance);
                if (this.__instances[instance_name]) {
                    instance.weakDestroy();
                    delete this.__instances[instance_name];
                }
                return this;
            }

        };
    });
});