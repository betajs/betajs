BetaJS.Class.extend("BetaJS.RMI.Stub", [
	BetaJS.Classes.InvokerMixin,
	BetaJS.Events.EventsMixin,
	{
		
	intf: [],
	
	constructor: function () {
		this._inherited(BetaJS.RMI.Stub, "constructor");
		this.invoke_delegate("invoke", this.intf);
	},
	
	destroy: function () {
		this.invoke("_destroy");
		this.trigger("destroy");
		this._inherited(BetaJS.RMI.Stub, "destroy");
	},
	
	invoke: function (message) {
		var promise = {
			context: this,
			success: function (f) {
				this.__success = f;
				if (this.is_complete && this.is_success)
					this.__success.call(this.context, this.result);
				return this;
			},
			failure: function (f) {
				this.__failure = f;
				if (this.is_complete && this.is_failure)
					this.__failure.call(this.context);
				return this;
			},
			callbacks: function (c) {
			    c = c.callbacks ? c.callbacks : c;
			    this.context = c.context || this;
			    if (c.success)
			        this.success(c.success);
                if (c.failure)
                    this.failure(c.failure);
                return this;
			}
		};
		this.trigger("send", message, BetaJS.Functions.getArguments(arguments, 1), {
			context: this,
			success: function (result) {
				promise.result = result;
				promise.is_complete = true;
				promise.is_success = true;
				if (promise.__success)
					promise.__success.call(this.context, result);
			},
			failure: function () {
				promise.is_complete = true;
				promise.is_failure = true;		
				if (promise.__failure)
					promise.__failure.call(this.context);
			}
		});
		return promise;
	}
	
}]);


BetaJS.Class.extend("BetaJS.RMI.Skeleton", [
	BetaJS.Events.EventsMixin,
	{
	
	_stub: null,
	intf: [],
	intfSync: [],
	_intf: {},
	_intfSync: {},
	__superIntf: [],
	__superIntfSync: ["_destroy"],
	
	constructor: function (options) {
		this._options = BetaJS.Objs.extend({
			destroyable: false
		}, options);
		this._inherited(BetaJS.RMI.Skeleton, "constructor");
		this.intf = this.intf.concat(this.__superIntf);
		this.intfSync = this.intfSync.concat(this.__superIntfSync);
		for (var i = 0; i < this.intf.length; ++i)
			this._intf[this.intf[i]] = true;
		for (i = 0; i < this.intfSync.length; ++i)
			this._intfSync[this.intfSync[i]] = true;
	},
	
	_destroy: function () {
		if (this._options.destroyable)
			this.destroy();
	},
	
	destroy: function () {
		this.trigger("destroy");
		this._inherited(BetaJS.RMI.Skeleton, "destroy");
	},
	
	invoke: function (message, data, callbacks, caller) {
		if (!(this._intf[message] || this._intfSync[message])) {
			this._failure(callbacks);
			return;
		}
		var ctx = {
			callbacks: callbacks,
			caller: caller
		};
		if (this._intf[message]) {
			data.unshift(ctx);
			this[message].apply(this, data);
		} else {
			try {
				this._success(ctx, this[message].apply(this, data));
			} catch (e) {
				this._failure(ctx, e);
			}
		}
	},
	
	_success: function (callbacks, result) {
		callbacks = callbacks.callbacks ? callbacks.callbacks : callbacks;
		BetaJS.SyncAsync.callback(callbacks, "success", result);
	},
	
	_failure: function (callbacks) {
		callbacks = callbacks.callbacks ? callbacks.callbacks : callbacks;
		BetaJS.SyncAsync.callback(callbacks, "failure");
	},
	
	stub: function () {
		if (this._stub)
			return this._stub;
		var stub = this.cls.classname;
		return stub.indexOf("Skeleton") >= 0 ? stub.replace("Skeleton", "Stub") : stub;
	}
	
}]);

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
		channel._reply = function (message, data, callbacks) {
			var components = message.split(":");
			if (components.length == 2)
				self._invoke(channel, components[0], components[1], data, callbacks);
			else
				BetaJS.SyncAsync.callback(callbacks, "failure");
		};
	},
	
	unregisterClient: function (channel) {
		this.__channels.remove(channel);
		channel._reply = null;
	},
	
	_invoke: function (channel, instance_id, method, data, callbacks) {
		var instance = this.__instances[instance_id];
		if (!instance) {
			this.trigger("loadInstance", channel, instance_id);
			instance = this.__instances[instance_id];
		}
		if (!instance) {
			BetaJS.SyncAsync.callback(callbacks, "failure");
			return;
		}
		instance = instance.instance;
		var self = this;
		instance.invoke(method, data, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
			if (BetaJS.RMI.Skeleton.is_class_instance(result) && result.instance_of(BetaJS.RMI.Skeleton)) {
				self.registerInstance(result);
				BetaJS.SyncAsync.callback(callbacks, "success", {
					__rmi_meta: true,
					__rmi_stub: result.stub(),
					__rmi_stub_id: BetaJS.Ids.objectId(result)
				});
			} else
				BetaJS.SyncAsync.callback(callbacks, "success", result);
		}), channel);
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
		instance.on("send", function (message, data, callbacks) {
			this.__channel.send(instance_name + ":" + message, data, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
				if (BetaJS.Types.is_object(result) && result.__rmi_meta)
					BetaJS.SyncAsync.callback(callbacks, "success", self.acquire(result.__rmi_stub, result.__rmi_stub_id));
				else
					BetaJS.SyncAsync.callback(callbacks, "success", result);
			}));
		}, this);
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
