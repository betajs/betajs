Scoped.define("module:Promise", [
    "module:Types",
    "module:Functions",
    "module:Async",
    "module:Objs"
], function (Types, Functions, Async, Objs) {
	
	/**
	 * Promise Class
	 * 
	 * @class BetaJS.Promise
	 */
	var Promise = {		

		/**
		 * Creates a new promise instance.
		 * 
		 * @param value optional promise value
		 * @param error optional promise error
		 * @param {boolean} finished does this promise have its final value / error
		 */
		Promise: function (value, error, finished) {
			this.__value = error ? null : (value || null);
			this.__error = error ? error : null;
			this.__isFinished = finished;
			this.__hasError = !!error;
			this.__resultPromise = null;
			this.__callbacks = [];
		},
		
		/**
		 * Create a new promise instance. (Simplified)
		 * 
		 * @param value optional promise value
		 * @param error optional promise error
		 * 
		 * @return {object} promise instance
		 */
		create: function (value, error) {
			return new this.Promise(value, error, arguments.length > 0);
		},
		
		/**
		 * Returns a promise instance for a value. The value might be a promise itself already.
		 * 
		 * @param value promise value or promise
		 * @return {object} promise instance
		 */
		value: function (value) {
			return this.is(value) ? value : new this.Promise(value, null, true);
		},
		
		/**
		 * Returns a promise instance for a value, setting the value asynchronously.
		 * 
		 * @param value promise value
		 * @return {object} promise instance
		 */
		eventualValue: function (value) {
			var promise = new this.Promise();
			Async.eventually(function () {
				promise.asyncSuccess(value);
			});
			return promise;
		},
	
		/**
		 * Returns a promise instance for an error. The error might be a promise itself already.
		 * 
		 * @param error promise error or promise
		 * @return {object} promise instance
		 */
		error: function (error) {
			return this.is(error) ? error : new this.Promise(null, error, true);
		},
		
		box: function (f, ctx, params) {
			try {
				var result = f.apply(ctx || this, params || []);
				return this.is(result) ? result : this.value(result);
			} catch (e) {
				return this.error(e);
			}
		},
		
		tryCatch: function (f, ctx) {
			try {
				return this.value(f.apply(ctx || this));
			} catch (e) {
				return this.error(e);
			}
		},
		
		funcCallback: function (ctx, func) {
			var args  = Functions.getArguments(arguments, 1);
			if (Types.is_function(ctx)) {
				args = Functions.getArguments(arguments, 1);
				func = ctx;
				ctx = this;
			} else
				args = Functions.getArguments(arguments, 2);
			var promise = this.create();
			args.push(promise.asyncCallbackFunc());
			func.apply(ctx, args);
			return promise;
		},
		
		and: function (promises) {
			var promise = this.create();
			promise.__promises = [];
			promise.__successCount = 0;
			promise.__values = [];
			promise.__errorPromise = null;
			promise.and = function (promises) {
				promises = promises || [];
				if (this.__ended)
					return this;
				if (!Types.is_array(promises))
					promises = [promises];
				var f = function (error, value) {
					if (error)
						this.__errorPromise = promises[this.idx];
					else {
						this.promise.__successCount++;
						this.promise.__values[this.idx] = value;
					}
					this.promise.results();
				};
				for (var i = 0; i < promises.length; ++i) {
					var last = this.__promises.length;
					this.__promises.push(promises[i]);
					this.__values.push(null);
					if (promises[i].isFinished()) {
						if (promises[i].hasValue()) {
							this.__successCount++;
							this.__values[last] = promises[i].value();
						} else
							this.__errorPromise = promises[i];
					} else {
						promises[i].callback(f, {promise: this, idx: last});					
					}
				}
				return this;
			};
			promise.end = function () {
				if (this.__ended)
					return this;
				this.__ended = true;
				this.results();
				return this;
			};
			promise.results = function () {
				if (this.__ended && this.__errorPromise)
					this.asyncError(this.__errorPromise.err(), this.__errorPromise);
				else if (this.__ended && this.__successCount == this.__promises.length)
					this.asyncSuccess(this.__values);
				return this;
			};
			promise.successUnfold = function (f, context, options) {
				return this.success(function () {
					return f.apply(context, arguments);
				}, context, options);
			};
			promise.and(promises);
			return promise;
		},
		
		func: function (func) {
			var args = Functions.getArguments(arguments, 1);
			var promises = [];
			for (var i = 0; i < args.length; ++i) {
				if (this.is(args[i]))
					promises.push(args[i]);
			}
			var promise = this.create();
			this.and(promises).end().success(function (values) {
				var params = [];
				for (var i = 0; i < args.length; ++i)
					params[i] = this.is(args[i]) ? args[i].value() : args[i];
				var result = func.apply(this, params);
				if (this.is(result))
					result.forwardCallback(promise);
				else
					promise.asyncSuccess(result);
			}, this).forwardError(promise);
			return promise;
		},
		
		methodArgs: function (ctx, func, params) {
			params.unshift(function () {
				return func.apply(ctx, arguments);
			});
			return this.func.apply(this, params);
		},
		
		method: function (ctx, func) {
			return this.methodArgs(ctx, func, Functions.getArguments(arguments, 2));
		},
	
		newClass: function (cls) {
			var params = Functions.getArguments(arguments, 1);
			params.unshift(Functions.newClassFunc(cls));
			return this.func.apply(this, params);
		},
		
		is: function (obj) {
			return obj && Types.is_object(obj) && obj.classGuid == this.Promise.prototype.classGuid;
		},
		
		resilience: function (method, context, resilience, args) {
			return method.apply(context, args).mapError(function (error) {
				return resilience === 0 ? error : this.resilience(method, context, resilience - 1, args);
			}, this);
		}
		
	};
	
	Objs.extend(Promise.Promise.prototype, {
		classGuid: "7e3ed52f-22da-4e9c-95a4-e9bb877a3935",
		
		success: function (f, context, options) {
			return this.callback(f, context, options, "success");
		},
		
		error: function (f, context, options) {
			return this.callback(f, context, options, "error");
		},
		
		callback: function (f, context, options, type) {
			if ("end" in this)
				this.end();
			var record = {
				type: type || "callback",
				func: f,
				options: options || {},
				context: context
			};
			if (this.__isFinished)
				this.triggerResult(record);
			else
				this.__callbacks.push(record);
			return this;
		},
		
		triggerResult: function (record) {
			if (!this.__isFinished)
				return this;
			if (record) {
				if (record.type == "success" && !this.__hasError)
					record.func.call(record.context || this, this.__value, this.__resultPromise || this);
				else if (record.type == "error" && this.__hasError)
					record.func.call(record.context || this, this.__error, this.__resultPromise || this);
				else if (record.type == "callback")
					record.func.call(record.context || this, this.__error, this.__value, this.__resultPromise || this);
			} else {
				var records = this.__callbacks;
				this.__callbacks = [];
				for (var i = 0; i < records.length; ++i)
					this.triggerResult(records[i]);
			}
			return this;
		},
		
		value: function () {
			return this.__value;
		},

		err: function () {
			return this.__error;
		},

		isFinished: function () {
			return this.__isFinished;
		},

		hasValue: function () {
			return this.__isFinished && !this.__hasError;
		},

		hasError: function () {
			return this.__isFinished && this.__hasError;
		},

		asyncSuccess: function (value, promise) {
			if (this.__isFinished) 
				return this;
			this.__resultPromise = promise;
			this.__error = null;
			this.__isFinished = true;
			this.__hasError = false;
			this.__value = value;
			return this.triggerResult();
		},

		forwardSuccess: function (promise) {
			this.success(promise.asyncSuccess, promise);
			return this;
		},

		asyncError: function (error, promise) {
			if (this.__isFinished) 
				return this;
			this.__resultPromise = promise;
			this.__isFinished = true;
			this.__hasError = true;
			this.__error = error;
			this.__value = null;
			return this.triggerResult();
		},

		forwardError: function (promise) {
			this.error(promise.asyncError, promise);
			return this;
		},

		asyncCallback: function (error, value, promise) {
			if (error)
				return this.asyncError(error, promise);
			else
				return this.asyncSuccess(value, promise);
		},

		asyncCallbackFunc: function () {
			return Functions.as_method(this.asyncCallback, this);
		},

		forwardCallback: function (promise) {
			this.callback(promise.asyncCallback, promise);
			return this;
		},

		mapSuccess: function (func, ctx) {
			var promise = Promise.create();
			this.forwardError(promise).success(function (value, pr) {
				var result = func.call(ctx || promise, value, pr);
				if (Promise.is(result))
					result.forwardCallback(promise);
				else
					promise.asyncSuccess(result);
			});
			return promise;
		},
		
		mapError: function (func, ctx) {
			var promise = Promise.create();
			this.forwardSuccess(promise).error(function (err, pr) {
				var result = func.call(ctx || promise, err, pr);
				if (Promise.is(result))
					result.forwardCallback(promise);
				else
					promise.asyncError(result);
			});
			return promise;
		},

		mapCallback: function (func, ctx) {
			var promise = Promise.create();
			this.callback(function (err, value, pr) {
				var result = func.call(ctx || promise, err, value, pr);
				if (Promise.is(result))
					result.forwardCallback(promise);
				else
					promise.asyncCallback(err ? result : err, err ? value : result, pr);
			});
			return promise;
		},

		and: function (promises) {
			var result = Promise.and(this);
			return result.and(promises);
		}
	});
	
	return Promise;
});

