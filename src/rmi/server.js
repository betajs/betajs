Scoped.define("module:RMI.Server", [
    "module:Class",
    "module:Events.EventsMixin",
    "module:Objs",
    "module:Channels.TransportChannel",
    "module:Lists.ObjectIdList",
    "module:Ids",
    "module:RMI.Skeleton",
    "module:Promise"
], function(Class, EventsMixin, Objs, TransportChannel, ObjectIdList, Ids, Skeleton, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

        /**
         * @class BetaJS.RMI.Server
         */
        return {

            /**
             * Creates an RMI Server instance
             * 
             * @param {object} sender_or_channel_or_null a channel or sender that should be connected to
             * @param {object} receiver_or_null a receiver that should be connected to
             */
            constructor: function(sender_or_channel_or_null, receiver_or_null) {
                inherited.constructor.call(this);
                this.__channels = new ObjectIdList();
                this.__instances = {};
                if (sender_or_channel_or_null) {
                    var channel = sender_or_channel_or_null;
                    if (receiver_or_null)
                        channel = this._auto_destroy(new TransportChannel(sender_or_channel_or_null, receiver_or_null));
                    this.registerClient(channel);
                }
            },

            /**
             * @override
             */
            destroy: function() {
                this.__channels.iterate(this.unregisterClient, this);
                Objs.iter(this.__instances, function(inst) {
                    this.unregisterInstance(inst.instance);
                }, this);
                this.__channels.destroy();
                inherited.destroy.call(this);
            },

            /**
             * Registers an RMI skeleton instance.
             * 
             * @param {object} instance skeleton instance
             * @param {object} options Options like name of instance
             * 
             * @return {object} Instance
             */
            registerInstance: function(instance, options) {
                options = options || {};
                this.__instances[Ids.objectId(instance, options.name)] = {
                    instance: instance,
                    options: options
                };
                if (options.auto_destroy)
                    this.auto_destroy(instance);
                return instance;
            },

            /**
             * Unregisters a RMI skeleton instance
             * 
             * @param {object} instance skeleton instance
             */
            unregisterInstance: function(instance) {
                delete this.__instances[Ids.objectId(instance)];
                instance.weakDestroy();
                return this;
            },

            /**
             * Register a client channel
             * 
             * @param {object} channel Client channel
             * @param {object} options Options
             */
            registerClient: function(channel, options) {
                options = options || {};
                var self = this;
                this.__channels.add(channel);
                channel._reply = function(message, data) {
                    var components = message.split(":");
                    if (components.length == 2)
                        return self._invoke(channel, components[0], components[1], data);
                    else
                        return Promise.error(true);
                };
                if (options.auto_destroy)
                    this.auto_destroy(channel);
                return this;
            },

            /**
             * Register a client by sender and receiver channel
             * 
             * @param {object} sender Sender channel
             * @param {object} receiver Receiver channel
             * @param {object} options Options
             */
            registerTransportClient: function(sender, receiver, options) {
                return this.registerClient(this.auto_destroy(new TransportChannel(sender, receiver, options)));
            },

            /**
             * Unregister a client channel
             * 
             * @param {object} channel Client channel
             */
            unregisterClient: function(channel) {
                this.__channels.remove(channel);
                channel._reply = null;
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
                    var registry = this;
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
                    var receiver = this.client;
                    return receiver.acquire(value.__rmi_stub, value.__rmi_stub_id);
                } else
                    return value;
            },

            /**
             * Invokes an instance method on a channel.
             * 
             * @param {object} channel Channel to be used for invokation
             * @param {string} instance_id Id of instance to be used as context
             * @param {string} method Method to be called
             * @param data Data to be passed to method
             * 
             * @return Return value of method as promise. 
             * 
             * @fires BetaJS.RMI.Server#loadInstance
             */
            _invoke: function(channel, instance_id, method, data) {
                var instance = this.__instances[instance_id];
                if (!instance) {
                    /**
                     * @event BetaJS.RMI.Server#loadInstance
                     */
                    this.trigger("loadInstance", channel, instance_id);
                    instance = this.__instances[instance_id];
                }
                if (!instance)
                    return Promise.error(instance_id);
                instance = instance.instance;
                data = Objs.map(data, this._unserializeValue, this);
                return instance.invoke(method, data, channel).mapSuccess(function(result) {
                    return this._serializeValue(result);
                }, this);
            }

        };
    }]);
});