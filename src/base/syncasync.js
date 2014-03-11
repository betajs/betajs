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
	}

};
