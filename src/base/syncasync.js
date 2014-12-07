/** @class */
BetaJS.SyncAsync = {
	
	eventually: function (func, params, context) {
		var timer = setTimeout(function () {
			clearTimeout(timer);
			if (!BetaJS.Types.is_array(params)) {
				context = params;
				params = [];
			}
			func.apply(context || this, params || []);
		}, 0);
	},
	
	eventuallyOnce: function (func, params, context) {
		var data = {
			func: func,
			params: params,
			context: context
		};
		for (var key in this.__eventuallyOnce) {
			if (BetaJS.Comparators.listEqual(this.__eventuallyOnce[key], data))
				return;
		}
		this.__eventuallyOnceIdx++;
		var index = this.__eventuallyOnceIdx;
		this.__eventuallyOnce[index] = data;
		this.eventually(function () {
			delete this.__eventuallyOnce[index];
			func.apply(context || this, params || []);
		}, this);
	},
	
	__eventuallyOnce: {},
	__eventuallyOnceIdx: 1,
	
    /** Converts a synchronous function to an asynchronous one and calls it
     * 
     * @param callbacks callbacks object with success and exception
     * @param syncCall the synchronous function
     * @param params optional syncCall params
     * @param context optional object context
     */	
	syncToAsync: function (callbacks, syncCall) {
		var args = BetaJS.Functions.matchArgs(BetaJS.Functions.getArguments(arguments, 2), {
			params: "array",
			context: "object"
		});
		try {
			if (callbacks && callbacks.success)
				callbacks.success.call(callbacks.context || this, syncCall.apply(args.context || this, args.params || []));
		} catch (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception.call(callbacks.context || this, e);
		}
	},
	
    /** Either calls a synchronous or asynchronous function depending on whether preferSync is given
     * 
     * @param callbacks callbacks object with success and exception (or null)
     * @param preferSync prefer synchronous call?
     * @param syncCall the synchronous function
     * @param asyncCall the asynchronous function
     * @param params optional syncCall params
     * @param context optional object context
     * @return the function return data
     */	
	either: function (callbacks, preferSync, syncCall, asyncCall) {
		var args = BetaJS.Functions.matchArgs(BetaJS.Functions.getArguments(arguments, 4), {
			params: "array",
			context: "object"
		});
		if (callbacks && !preferSync && !callbacks.sync) {
			var params = args.params || [];
			params.push(callbacks); 
			asyncCall.apply(args.context || this, params);
			return null;
		} else
			return this.eitherSync(callbacks, syncCall, args.params, args.context);
	},
	
	eitherSync: function (callbacks, syncCall) {
		var args = BetaJS.Functions.matchArgs(BetaJS.Functions.getArguments(arguments, 2), {
			params: "array",
			context: "object"
		});
		var context = args.context || this;
		var params = args.params || [];
		if (callbacks)
			this.syncToAsync(callbacks, syncCall, params, context);
		else
			return syncCall.apply(context, params);
		return null;
	},
	
	SYNC: 1,
	ASYNC: 2,
	ASYNCSINGLE: 3,
	
	toCallbackType: function (callbacks, type) {
		if (type == this.ASYNCSINGLE)
			return function (err, result) {
                var caller = err ? "exception" : "success";
                if (caller in callbacks)
                    callbacks[caller].call(callbacks.context || this, err ? err : result);
			};
		return callbacks;
	},
	
	then: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number",
			callbacks: true,
			success_ctx: "object",
			success: "function",
			exception: "function"
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var callbacks = args.callbacks;
		var type = args.type || (!callbacks || callbacks.sync ? this.SYNC : this.ASYNC);
		var success_ctx = args.success_ctx || func_ctx;
		var success = args.success;
		var exception = args.exception;
		if (type != this.SYNC) {
			if (callbacks) {
				params.push(this.toCallbackType({
					context: callbacks.context,
					success: success ? function (ret) {
						success.call(success_ctx, ret, callbacks);
					} : callbacks.success,
					exception: exception ? function (error) {
						exception.call(success_ctx, error, callbacks);
					} : callbacks.exception
				}, type));
			} else
				params.push({});
			func.apply(func_ctx, params);
		} else if (callbacks) {
			try {
				if (success)
					success.call(success_ctx, func.apply(func_ctx, params), callbacks);
				else
					callbacks.success.call(callbacks.context || this, func.apply(func_ctx, params));
			} catch (e) {
				if (exception)
					exception.call(success_ctx, e, callbacks);
				else if (callbacks.exception)
					callbacks.exception.call(callbacks.context || this, e);
				else
					throw e;
			}
		} else {
			try {
				var ret = func.apply(func_ctx, params);
				if (success)
					success.call(success_ctx, ret, {
						sync: true,
						success: function (retv) {
							ret = retv;
						},
						exception: function (err) {
							throw err;
						}
					});
				return ret;
			} catch (e) {
				if (exception) {
					exception.call(success_ctx, e, {
						sync: true,
						success: function (retv) {
							ret = retv;
						},
						exception: function (err) {
							throw err;
						}
					});
					return ret;
				} else
					throw e;
			}
		}
		return null;
	},
	
	PROMISE_LAZY: 1,
	PROMISE_ACTIVE: 2,
	PROMISE_SUCCESS: 3,
	PROMISE_EXCEPTION: 4,

	lazy: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number"
		});
		return {
			state: this.PROMISE_LAZY,
			func_ctx: args.func_ctx || this,
			func: args.func,
			params: args.params || [],
			type: args.type || this.ASYNC
		};
	},
	
	promise: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number"
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var type = args.type || this.ASYNC;
		if (type == this.SYNC) {
			try {
				return {
					state: this.PROMISE_SUCCESS,
					result: func.apply(func_ctx, params)
				};
			} catch (e) {
				return {
					state: this.PROMISE_EXCEPTION,
					exception: e
				};
			}
		} else {
			var promise = {
				state: this.PROMISE_ACTIVE,
				listeners: []
			};
			params.push({
				context: promise,
				success: function (result) {
					this.state = BetaJS.SyncAsync.PROMISE_SUCCESS;
					this.result = result;
					for (var i = 0; i < this.listeners.length; ++i)
						this.listeners[i].success.call(this.listeners[i].context || this, result);
				},
				exception: function (error) {
					this.state = BetaJS.SyncAsync.PROMISE_EXCEPTION;
					this.exception = error;
					for (var i = 0; i < this.listeners.length; ++i)
						this.listeners[i].exception.call(this.listeners[i].context || this, error);
				}
			});
			func.apply(func_ctx, params);
			return promise;
		}
	},
	
	reveal: function (promise, callbacks) {
		if (promise.state == this.PROMISE_LAZY) {
			var promise_temp = this.promise(promise.func_ctx, promise.func, promise.params, promise.type);
			for (var key in promise_temp)
				promise[key] = promise_temp[key];
		}
		if (promise.state == this.PROMISE_ACTIVE)
			promise.listeners.push(callbacks);
		else if (promise.state == this.PROMISE_SUCCESS)
			callbacks.success.call(callbacks.context || this, promise.result);
		else if (promise.state == this.PROMISE_EXCEPTION)
			callbacks.exception.call(callbacks.context || this, promise.exception);
	},
	
	join: function (promises, callbacks) {
		var monitor = {
			count: promises.length,
			exception: false,
			results: []
		};
		for (var i = 0; i < promises.length; ++i) {
			monitor.results.push(null);
			this.reveal(promises[i], {
				context: {
					monitor: monitor,
					index: i
				},
				sync: callbacks && callbacks.sync,
				success: function (result) {
					this.monitor.count = this.monitor.count - 1;
					if (this.monitor.exception)
						return;
					this.monitor.results[this.index] = result;
					if (this.monitor.count <= 0) {
						if (callbacks)
							callbacks.success.apply(callbacks.context || this, this.monitor.results);
					}
				},
				exception: function (error) {
					this.monitor.count = this.monitor.count - 1;
					if (this.monitor.exception)
						return;
					this.monitor.exception = true;
					if (callbacks)
						callbacks.exception.apply(callbacks.context || this, error);
					else
						throw error;
				}
			});
		}
		return monitor.results;
	},
	
	mapSuccess: function (callbacks, success) {
		var obj = BetaJS.Objs.clone(callbacks, 1);
		obj.success = success;
		return obj;
	},
	
	mapException: function (callbacks, exception) {
		var obj = BetaJS.Objs.clone(callbacks, 1);
		obj.exception = exception;
		return obj;
	},

	callback: function (callbacks, type) {
		if (!callbacks || (type != "success" && type != "exception"))
			return;
		var context = callbacks.context || this;
		var params = BetaJS.Functions.getArguments(arguments, 2);
		if (type in callbacks)
			callbacks[type].apply(context, params);
		if ("complete" in callbacks)
			callbacks.complete.apply(context);
	}
	
};



BetaJS.SyncAsync.SyncAsyncMixin = {
	
	supportsSync: function () {
		return this._supportsSync;
	},
	
	supportsAsync: function () {
		return this._supportsAsync;
	},
	
	eitherSync: function (callbacks, syncFunc, params) {
		return BetaJS.SyncAsync.eitherSync(callbacks, syncFunc, params || [], this);
	},
		
	either: function (callbacks, syncFunc, asyncFunc, preferSync, params) {
		if (BetaJS.Types.is_undefined(preferSync))
			preferSync = !this.supportsAsync();
		return BetaJS.SyncAsync.either(callbacks, preferSync, syncFunc, asyncFunc, params || [], this);
	},
	
	eitherSyncFactory: function (property, callbacks, syncFunc, params) {
		return BetaJS.SyncAsync.eitherSync(callbacks, function () {
			if (!this[property])
				this[property] = syncFunc.apply(this, params);
			return this[property];				
		}, this);
	},

	eitherAsyncFactory: function (property, callbacks, asyncFunc, params) {
		var ctx = this;
		return this.either(callbacks, function () {
			return ctx[property];				
		}, function () {
			asyncFunc.call(this, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
				ctx[property] = result;
				ctx.callback(callbacks, "success", result);
			}));
		}, property in this, this);
	},

	eitherFactory: function (property, callbacks, syncFunc, asyncFunc, params) {
		var ctx = this;
		return this.either(callbacks, function () {
			if (!this[property])
				this[property] = syncFunc.apply(this, params);
			return this[property];				
		}, function () {
			asyncFunc.call(this, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
				ctx[property] = result;
				callbacks.success.call(this, result);
			}));
		}, this[property] || !this.supportsAsync());
	},
	
	then: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number",
			callbacks: true,
			success_ctx: "object",
			success: true,
			exception: "function"
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var callbacks = args.callbacks;
		var type = args.type || (!callbacks || !this.supportsAsync() ? BetaJS.SyncAsync.SYNC : BetaJS.SyncAsync.ASYNC);
		var success_ctx = args.success_ctx || this;
		return BetaJS.SyncAsync.then(func_ctx, func, params, type, callbacks, success_ctx, args.success, args.exception);
	},
	
	thenSingle: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number",
			callbacks: true,
			success_ctx: "object",
			success: true
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var callbacks = args.callbacks;
		var type = args.type || (!callbacks || !this.supportsAsync() ? BetaJS.SyncAsync.SYNC : BetaJS.SyncAsync.ASYNCSINGLE);
		var success_ctx = args.success_ctx || this;
		var success = args.success;
		return BetaJS.SyncAsync.then(func_ctx, func, params, type, callbacks, success_ctx, success);
	},
	
	promise: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number"
		});
		return BetaJS.SyncAsync.promise(args.func_ctx || this, args.func, args.params || [], args.type);
	},
	
	join: function (promises, callbacks) {
		return BetaJS.SyncAsync.join(promises, callbacks);
	},
	
	delegate: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			callbacks: "object"
		});
		var ctx = args.func_ctx || this;
		var params = args.params || [];
		if (args.callbacks) {
			if (this.supportsAsync() && !args.callbacks.sync) {
				params.push(args.callbacks);
				return args.func.apply(ctx, params);
			} else
				return BetaJS.SyncAsync.syncToAsync(args.callbacks, args.func, params, ctx);
		} else
			return args.func.apply(ctx, params);
	},
	
	callback: function () {
		return BetaJS.SyncAsync.callback.apply(this, arguments);
	}
	
};

