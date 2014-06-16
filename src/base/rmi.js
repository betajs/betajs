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
		this.trigger("destroy");
		this._inherited(BetaJS.RMI.Stub, "destroy");
	},
	
	invoke: function (message) {
		var promise = {
			context: this,
			success: function (f) {
				this.__success = f;
				if (this.is_complete && this.is_success)
					this.__success.call(this, this.result);
			},
			failure: function (f) {
				this.__failure = f;
				if (this.is_complete && this.is_failure)
					this.__failure.call(this);
			}
		};
		this.trigger("send", message, BetaJS.Functions.getArguments(arguments, 1), {
			context: this,
			success: function (result) {
				promise.result = result;
				promise.is_complete = true;
				promise.is_success = true;
				if (promise.__success)
					promise.__success.call(this, result);
			},
			failure: function () {
				promise.is_complete = true;
				promise.is_failure = true;		
				if (promise.__failure)
					promise.__failure.call(this);
			}
		});
		return promise;
	}
	
}]);


BetaJS.Class.extend("BetaJS.RMI.Skeleton", [
	BetaJS.Events.EventsMixin,
	{
	
	intf: [],
	_intf: {},
	
	constructor: function () {
		this._inherited(BetaJS.RMI.Skeleton, "constructor");
		for (var i = 0; i < this.intf.length; ++i)
			this._intf[this.intf[i]] = true;
	},

	destroy: function () {
		this.trigger("destroy");
		this._inherited(BetaJS.RMI.Skeleton, "destroy");
	},
	
	invoke: function (message, data, callbacks, caller) {
		if (!(this._intf[message])) {
			this._failure(callbacks);
			return;
		}
		data.unshift({
			callbacks: callbacks,
			caller: caller
		});
		this[message].apply(this, data);
	},
	
	_success: function (callbacks, result) {
		callbacks = callbacks.callbacks ? callbacks.callbacks : callbacks;
		BetaJS.SyncAsync.callback(callbacks, "success", result);
	},
	
	_failure: function (callbacks) {
		callbacks = callbacks.callbacks ? callbacks.callbacks : callbacks;
		BetaJS.SyncAsync.callback(callbacks, "failure");
	}
	
}]);

BetaJS.Class.extend("BetaJS.RMI.Server", {
	
	constructor: function () {
		this._inherited(BetaJS.RMI.Server, "constructor");
		this.__channels = new BetaJS.Lists.ObjectIdList();
		this.__instances = {};
	},
	
	destroy: function () {
		this.__channels.iterate(this.unregisterClient, this);
		BetaJS.Objs.iter(this.__instances, function (inst) {
			this.unregisterInstance(inst.instance);
		}, this);
		this._inherited(BetaJS.RMI.Server, "destroy");
	},
	
	registerInstance: function (instance, options) {
		options = options || {};
		this.__instances[BetaJS.Ids.objectId(instance, options.name)] = {
			instance: instance,
			options: options
		};
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
			BetaJS.SyncAsync.callback(callbacks, "failure");
			return;
		}
		instance = instance.instance;
		instance.invoke(method, data, callbacks, channel);
	}
	
});


BetaJS.Class.extend("BetaJS.RMI.Client", {
	
	constructor: function () {
		this._inherited(BetaJS.RMI.Client, "constructor");
		this.__channel = null;
		this.__instances = {};
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
		var instance = new class_type();
		this.__instances[BetaJS.Ids.objectId(instance, instance_name)] = instance;
		instance.on("send", function (message, data, callbacks) {
			this.__channel.send(instance_name + ":" + message, data, callbacks);
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
