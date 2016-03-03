

Scoped.define("module:RMI.Server", [
                                    "module:Class",
                                    "module:Events.EventsMixin",
                                    "module:Objs",
                                    "module:Channels.TransportChannel",
                                    "module:Lists.ObjectIdList",
                                    "module:Ids",
                                    "module:RMI.Skeleton",
                                    "module:Promise"
                                    ], function (Class, EventsMixin, Objs, TransportChannel, ObjectIdList, Ids, Skeleton, Promise, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {

			constructor: function (sender_or_channel_or_null, receiver_or_null) {
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

			destroy: function () {
				this.__channels.iterate(this.unregisterClient, this);
				Objs.iter(this.__instances, function (inst) {
					this.unregisterInstance(inst.instance);
				}, this);
				this.__channels.destroy();
				inherited.destroy.call(this);
			},

			registerInstance: function (instance, options) {
				options = options || {};
				this.__instances[Ids.objectId(instance, options.name)] = {
						instance: instance,
						options: options
				};
				return instance;
			},

			unregisterInstance: function (instance) {
				delete this.__instances[Ids.objectId(instance)];
				instance.weakDestroy();
			},

			registerClient: function (channel) {
				var self = this;
				this.__channels.add(channel);
				channel._reply = function (message, data) {
					var components = message.split(":");
					if (components.length == 2)
						return self._invoke(channel, components[0], components[1], data);
					else
						return Promise.error(true);
				};
			},

			unregisterClient: function (channel) {
				this.__channels.remove(channel);
				channel._reply = null;
			},

			_serializeValue: function (value) {
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

			_unserializeValue: function (value) {
				if (value && value.__rmi_meta) {
					var receiver = this.client;
					return receiver.acquire(value.__rmi_stub, value.__rmi_stub_id);
				} else
					return value;		
			},

			_invoke: function (channel, instance_id, method, data) {
				var instance = this.__instances[instance_id];
				if (!instance) {
					this.trigger("loadInstance", channel, instance_id);
					instance = this.__instances[instance_id];
				}
				if (!instance)
					return Promise.error(instance_id);
				instance = instance.instance;
				data = Objs.map(data, this._unserializeValue, this);
				return instance.invoke(method, data, channel).mapSuccess(function (result) {
					return this._serializeValue(result);
				}, this);
			}

		};
	}]);
});

