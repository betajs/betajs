BetaJS.Class.extend("BetaJS.RMI.Stub", [
	BetaJS.Classes.InvokerMixin,
	{
		
	intf: [],
	
	constructor: function () {
		this._inherited(BetaJS.RMI.Stub, "constructor");
		this.invoke_delegate("invoke", this.intf);
	},
	
	destroy: function () {
		this.invoke("_destroy");
		this._inherited(BetaJS.RMI.Stub, "destroy");
	},
	
	invoke: function (message) {
		return this.__send(message, BetaJS.Functions.getArguments(arguments, 1));
	}
	
}]);

BetaJS.Class.extend("BetaJS.RMI.StubSyncer", [
	BetaJS.Classes.InvokerMixin,
	{
	
	constructor: function (stub) {
		this._inherited(BetaJS.RMI.StubSyncer, "constructor");
		this.__stub = stub;
		this.__current = null;
		this.__queue = [];
		this.invoke_delegate("invoke", this.__stub.intf);
	},
	
	invoke: function () {
		var object = {
			args: BetaJS.Functions.getArguments(arguments),
			promise: BetaJS.Promise.create()
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
	
}]);


BetaJS.Class.extend("BetaJS.RMI.Skeleton", {
	
	_stub: null,
	intf: [],
	_intf: {},
	__superIntf: ["_destroy"],
	
	constructor: function (options) {
		this._options = BetaJS.Objs.extend({
			destroyable: false
		}, options);
		this._inherited(BetaJS.RMI.Skeleton, "constructor");
		this.intf = this.intf.concat(this.__superIntf);
		for (var i = 0; i < this.intf.length; ++i)
			this._intf[this.intf[i]] = true;
	},
	
	_destroy: function () {
		if (this._options.destroyable)
			this.destroy();
	},
	
	invoke: function (message, data) {
		if (!(this._intf[message] || this._intfSync[message]))
			return BetaJS.Promise.error(message);
		try {
			var result = this[message].apply(this, data);
			return BetaJS.Promise.is(result) ? result : BetaJS.Promise.value(result);
		} catch (e) {
			return BetaJS.Promise.error(e);
		}
	},
	
	_success: function (result) {
		return BetaJS.Promise.value(result);
	},
	
	_error: function (callbacks) {
		return BetaJS.Promise.error(result);
	},
	
	stub: function () {
		if (this._stub)
			return this._stub;
		var stub = this.cls.classname;
		return stub.indexOf("Skeleton") >= 0 ? stub.replace("Skeleton", "Stub") : stub;
	}
	
});

BetaJS.Class.extend("BetaJS.RMI.Server", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (sender_or_channel_or_null, receiver_or_null) {
		this._inherited(BetaJS.RMI.Server, "constructor");
		this.__channels = new BetaJS.Lists.ObjectIdList();
		this.__instances = {};
		if (sender_or_channel_or_null) {
			var channel = sender_or_channel_or_null;
			if (receiver_or_null)
				channel = this._auto_destroy(new BetaJS.Channels.TransportChannel(sender_or_channel_or_null, receiver_or_null));
			this.registerClient(channel);
		}
	},
	
	destroy: function () {
		this.__channels.iterate(this.unregisterClient, this);
		BetaJS.Objs.iter(this.__instances, function (inst) {
			this.unregisterInstance(inst.instance);
		}, this);
		this.__channels.destroy();
		this._inherited(BetaJS.RMI.Server, "destroy");
	},
	
	registerInstance: function (instance, options) {
		options = options || {};
		this.__instances[BetaJS.Ids.objectId(instance, options.name)] = {
			instance: instance,
			options: options
		};
		return instance;
	},
	
	unregisterInstance: function (instance) {
		delete this.__instances[BetaJS.Ids.objectId(instance)];
		instance.destroy();
	},
	
	registerClient: function (channel) {
		var self = this;
		this.__channels.add(channel);
		channel._reply = function (message, data) {
			var components = message.split(":");
			if (components.length == 2)
				return self._invoke(channel, components[0], components[1], data);
			else
				return BetaJS.Promise.error(true);
		};
	},
	
	unregisterClient: function (channel) {
		this.__channels.remove(channel);
		channel._reply = null;
	},
	
	_invoke: function (channel, instance_id, method, data) {
		var instance = this.__instances[instance_id];
		if (!instance) {
			this.trigger("loadInstance", channel, instance_id);
			instance = this.__instances[instance_id];
		}
		if (!instance)
			return BetaJS.Promise.error(instance_id);
		instance = instance.instance;
		return instance.invoke(method, data, channel).mapSuccess(function (result) {
			if (BetaJS.RMI.Skeleton.is_class_instance(result) && result.instance_of(BetaJS.RMI.Skeleton)) {
				this.registerInstance(result);
				return {
					__rmi_meta: true,
					__rmi_stub: result.stub(),
					__rmi_stub_id: BetaJS.Ids.objectId(result)
				};
			} else
				return result;
		}, this);
	}
		
}]);


BetaJS.Class.extend("BetaJS.RMI.Client", {
	
	constructor: function (sender_or_channel_or_null, receiver_or_null) {
		this._inherited(BetaJS.RMI.Client, "constructor");
		this.__channel = null;
		this.__instances = {};
		if (sender_or_channel_or_null) {
			var channel = sender_or_channel_or_null;
			if (receiver_or_null)
				channel = this._auto_destroy(new BetaJS.Channels.TransportChannel(sender_or_channel_or_null, receiver_or_null));
			this.__channel = channel;
		}
	},
	
	destroy: function () {
		if (this.__channel)
			this.disconnect();
		this._inherited(BetaJS.RMI.Client, "destroy");
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
		BetaJS.Objs.iter(this.__instances, function (inst) {
			this.release(inst);
		}, this);
	},
	
	acquire: function (class_type, instance_name) {
		if (this.__instances[instance_name])
			return this.__instances[instance_name];
		if (BetaJS.Types.is_string(class_type))
			class_type = BetaJS.Scopes.resolve(class_type);
		if (!class_type || !class_type.ancestor_of(BetaJS.RMI.Stub))
			return null;
		var instance = new class_type();
		this.__instances[BetaJS.Ids.objectId(instance, instance_name)] = instance;
		var self = this;
		instance.__send = function (message, data) {
			return self.__channel.send(instance_name + ":" + message, data).mapSuccess(function (result) {
				return BetaJS.Types.is_object(result) && result.__rmi_meta ? this.acquire(result.__rmi_stub, result.__rmi_stub_id) : result;
			}, self);
		};
		return instance;		
	},
	
	release: function (instance) {
		var instance_name = BetaJS.Ids.objectId(instance);
		if (!this.__instances[instance_name])
			return;
		instance.off(null, null, this);
		instance.destroy();
		delete this.__instances[instance_name];
	}
	
});


BetaJS.Class.extend("BetaJS.RMI.Peer", {

	constructor: function (sender, receiver) {
		this._inherited(BetaJS.RMI.Peer, "constructor");
		this.__sender = sender;
		this.__receiver = receiver;
		this.__client_sender = this._auto_destroy(new BetaJS.Channels.SenderMultiplexer(sender, "client"));
		this.__server_sender = this._auto_destroy(new BetaJS.Channels.SenderMultiplexer(sender, "server"));
		this.__client_receiver = this._auto_destroy(new BetaJS.Channels.ReceiverMultiplexer(receiver, "server"));
		this.__server_receiver = this._auto_destroy(new BetaJS.Channels.ReceiverMultiplexer(receiver, "client"));
		this.client = this._auto_destroy(new BetaJS.RMI.Client(this.__client_sender, this.__client_receiver));
		this.server = this._auto_destroy(new BetaJS.RMI.Server(this.__server_sender, this.__server_receiver));
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

});
