/** @class */
BetaJS.SyncAsync = {
	
    /** Converts a synchronous function to an asynchronous one and calls it
     * 
     * @param callbacks callbacks object with success and failure
     * @param syncCall the synchronous function
     * @param context optional object context
     */	
	syncToAsync: function (callbacks, syncCall, context) {
		try {
			callbacks.success.call(callbacks.context || this, syncCall.apply(context || this));
		} catch (e) {
			callbacks.failure.call(callbacks.context || this, e);
		}
	},
	
    /** Either calls a synchronous or asynchronous function depending on whether useSync is given
     * 
     * @param callbacks callbacks object with success and failure (or null)
     * @param useSync use synchronous call?
     * @param syncCall the synchronous function
     * @param asyncCall the asynchronous function
     * @param context optional object context
     * @return the function return data
     */	
	either: function (callbacks, useSync, syncCall, asyncCall, context) {
		context = context || this;
		if (callbacks) {
			if (useSync)
				this.syncToAsync(callbacks, syncCall, context);
			else
				asyncCall.call(context, callbacks);
		} else
			return syncCall.apply(context);
		return null;
	},
	
	SYNC: 1,
	ASYNC: 2,
	ASYNCSINGLE: 3,
	
	toCallbackType: function (callbacks, type) {
		if (type == this.ASYNCSINGLE)
			return function (err, result) {
				if (err)
					callbacks.failure.call(callbacks.context || this, err);
				callbacks.success.call(callbacks.context || this, result);
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
			success: "function"
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var callbacks = args.callbacks;
		var type = args.type || (callbacks ? this.ASYNC : this.SYNC);
		var success_ctx = args.success_ctx || func_ctx;
		var success = args.success;
		if (type != this.SYNC) {			
			params.push(this.toCallbackType(success ? {
				context: callbacks.context,
				success: function (ret) {
					success.call(success_ctx, ret, callbacks);
				},
				failure: callbacks.failure
			} : callbacks, type));
			func.apply(func_ctx, params);
		} else if (callbacks) {
			try {
				if (success)
					success.call(success_ctx, func.apply(func_ctx, params), callbacks);
				else
					callbacks.success.call(callbacks.context || this, func.apply(func_ctx, params));
			} catch (e) {
				callbacks.failure.call(callbacks.context || this, e);
			}
		} else {
			var ret = func.apply(func_ctx, params);
			if (success)
				success.call(success_ctx, ret, {
					success: function (retv) {
						ret = retv;
					},
					failure: function (err) {
						throw err;
					}
				});
			return ret;
		}
		return null;
	},
	
	PROMISE_LAZY: 1,
	PROMISE_ACTIVE: 2,
	PROMISE_SUCCESS: 3,
	PROMISE_FAILURE: 4,

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
					state: this.PROMISE_FAILURE,
					failure: e
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
					this.state = this.PROMISE_SUCCESS;
					this.result = result;
					for (var i = 0; i < this.listeners.length; ++i)
						this.listeners[i].success.call(this.listeners[i].context || this, result);
				},
				failure: function (error) {
					this.state = this.PROMISE_FAILURE;
					this.failure = error;
					for (var i = 0; i < this.listeners.length; ++i)
						this.listeners[i].failure.call(this.listeners[i].context || this, error);
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
		else if (promise.state == this.PROMISE_FAILURE)
			callbacks.failure.call(callbacks.context || this, promise.failure);
	},
	
	join: function (promises, callbacks) {
		var monitor = {
			count: promises.length,
			failure: false,
			results: []
		};
		for (var i = 0; i < count; ++i) {
			monitor.results.push(null);
			this.reveal(promises[i], {
				context: {
					monitor: monitor,
					index: i
				},
				success: function (result) {
					this.monitor.count = this.monitor.count - 1;
					if (this.monitors.failure)
						return;
					this.monitor.results[this.index] = result;
					if (this.monitor.count <= 0)
						callbacks.success.apply(callbacks.context || this, this.monitor.results);
				},
				failure: function (error) {
					this.monitor.count = this.monitor.count - 1;
					if (this.monitors.failure)
						return;
					this.monitor.failure = true;
					callbacks.failure.apply(callbacks.context || this, error);
				}
			});
		}
	}
	
};
