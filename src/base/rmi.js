Scoped.define("module:RMI.Stub", [
                                  "module:Class",
                                  "module:Classes.InvokerMixin",
                                  "module:Functions"
                                  ], function (Class, InvokerMixin, Functions, scoped) {
	return Class.extend({scoped: scoped}, [InvokerMixin, function (inherited) {
		return {

			intf: [],

			constructor: function () {
				inherited.constructor.call(this);
				this.invoke_delegate("invoke", this.intf);
			},

			destroy: function () {
				this.invoke("_destroy");
				inherited.destroy.call(this);
			},

			invoke: function (message) {
				return this.__send(message, Functions.getArguments(arguments, 1));
			}

		};
	}]);
});


Scoped.define("module:RMI.StubSyncer", [
                                        "module:Class",
                                        "module:Classes.InvokerMixin",
                                        "module:Functions",
                                        "module:Promise"
                                        ], function (Class, InvokerMixin, Functions, Promise, scoped) {
	return Class.extend({scoped: scoped}, [InvokerMixin, function (inherited) {
		return {

			constructor: function (stub) {
				inherited.constructor.call(this);
				this.__stub = stub;
				this.__current = null;
				this.__queue = [];
				this.invoke_delegate("invoke", this.__stub.intf);
			},

			invoke: function () {
				var object = {
						args: Functions.getArguments(arguments),
						promise: Promise.create()
				};
				this.__queue.push(object);
				if (!this.__current)
					this.__next();
				return object.promise;		
			},

			__next: function () {
				if (this.__queue.length === 0)
					return;
				this.__current = this.__queue.shift();
				this.__stub.invoke.apply(this.__stub, this.__current.args).forwardCallback(this.__current.promise).callback(this.__next, this);
			}

		};
	}]);
});


Scoped.define("module:RMI.Skeleton", [
                                      "module:Class",
                                      "module:Objs",
                                      "module:Promise"
                                      ], function (Class, Objs, Promise, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			_stub: null,
			intf: [],
			_intf: {},
			__superIntf: ["_destroy"],

			constructor: function (options) {
				this._options = Objs.extend({
					destroyable: false
				}, options);
				inherited.constructor.call(this);
				this.intf = this.intf.concat(this.__superIntf);
				for (var i = 0; i < this.intf.length; ++i)
					this._intf[this.intf[i]] = true;
			},

			_destroy: function () {
				if (this._options.destroyable)
					this.destroy();
			},

			invoke: function (message, data) {
				if (!(this._intf[message]))
					return Promise.error(message);
				try {
					var result = this[message].apply(this, data);
					return Promise.is(result) ? result : Promise.value(result);
				} catch (e) {
					return Promise.error(e);
				}
			},

			_success: function (result) {
				return Promise.value(result);
			},

			_error: function (result) {
				return Promise.error(result);
			},

			stub: function () {
				if (this._stub)
					return this._stub;
				var stub = this.cls.classname;
				return stub.indexOf("Skeleton") >= 0 ? stub.replace("Skeleton", "Stub") : stub;
			}

		};
	});
});


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


Scoped.define("module:RMI.Peer", [
                                  "module:Class",
                                  "module:Channels.SenderMultiplexer",
                                  "module:Channels.ReceiverMultiplexer",
                                  "module:RMI.Client",
                                  "module:RMI.Server"
                                  ], function (Class, SenderMultiplexer, ReceiverMultiplexer, Client, Server, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {			

			constructor: function (sender, receiver) {
				inherited.constructor.call(this);
				this.__sender = sender;
				this.__receiver = receiver;
				this.__client_sender = this._auto_destroy(new SenderMultiplexer(sender, "client"));
				this.__server_sender = this._auto_destroy(new SenderMultiplexer(sender, "server"));
				this.__client_receiver = this._auto_destroy(new ReceiverMultiplexer(receiver, "server"));
				this.__server_receiver = this._auto_destroy(new ReceiverMultiplexer(receiver, "client"));
				this.client = this._auto_destroy(new Client(this.__client_sender, this.__client_receiver));
				this.server = this._auto_destroy(new Server(this.__server_sender, this.__server_receiver));
				this.client.server = this.server;
				this.server.client = this.client;
			},	

			acquire: function (class_type, instance_name) {
				return this.client.acquire(class_type, instance_name);
			},

			release: function (instance) {
				this.client.release(instance);
			},

			registerInstance: function (instance, options) {
				return this.server.registerInstance(instance, options);
			},

			unregisterInstance: function (instance) {
				this.server.unregisterInstance(instance);
			}

		};
	});
});
