
Scoped.define("module:RMI.Client", [
                                    "module:Class",
                                    "module:Objs",
                                    "module:Channels.TransportChannel",
                                    "module:Ids",
                                    "module:RMI.Skeleton",
                                    "module:Types",
                                    "module:RMI.Stub"
                                    ], function (Class, Objs, TransportChannel, Ids, Skeleton, Types, Stub, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {			

			constructor: function (sender_or_channel_or_null, receiver_or_null) {
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

			destroy: function () {
				if (this.__channel)
					this.disconnect();
				inherited.destroy.call(this);
			},

			connect: function (channel) {
				if (this.__channel)
					return;
				this.__channel = channel;
			},

			disconnect: function () {
				if (!this.__channel)
					return;
				this.__channel = null;
				Objs.iter(this.__instances, function (inst) {
					this.release(inst);
				}, this);
			},

			_serializeValue: function (value) {
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

			_unserializeValue: function (value) {
				if (value && value.__rmi_meta) {
					var receiver = this;
					return receiver.acquire(value.__rmi_stub, value.__rmi_stub_id);
				} else
					return value;		
			},

			acquire: function (class_type, instance_name) {
				if (this.__instances[instance_name])
					return this.__instances[instance_name];
				if (Types.is_string(class_type))
					class_type = Scoped.getGlobal(class_type);
				if (!class_type || !class_type.ancestor_of(Stub))
					return null;
				var instance = new class_type();
				this.__instances[Ids.objectId(instance, instance_name)] = instance;
				var self = this;
				instance.__send = function (message, data) {
					if (!self.__channel)
						return;
					data = Objs.map(data, self._serializeValue, self);
					return self.__channel.send(instance_name + ":" + message, data).mapSuccess(function (result) {
						return this._unserializeValue(result);
					}, self);
				};
				return instance;		
			},

			release: function (instance) {
				var instance_name = Ids.objectId(instance);
				if (!this.__instances[instance_name])
					return;
				instance.weakDestroy();
				delete this.__instances[instance_name];
			}

		};
	});
});

