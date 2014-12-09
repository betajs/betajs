BetaJS.Promise = {
		
	Promise: function (value, error, finished) {
		this.__value = error ? null : (value || null);
		this.__error = error ? error : null;
		this.__isFinished = finished;
		this.__hasError = !!error;
		this.__resultPromise = null;
		this.__callbacks = [];
	},
	
	create: function (value, error) {
		return new this.Promise(value, error, arguments.length > 0);
	},
	
	value: function (value) {
		return this.is(value) ? value : new this.Promise(value, null, true);
	},
	
	eventualValue: function (value) {
		var promise = new this.Promise();
		BetaJS.Async.eventually(function () {
			promise.asyncSuccess(value);
		});
		return promise;
	},

	error: function (error) {
		return this.is(error) ? error : new this.Promise(null, error, true);
	},
	
	tryCatch: function (f, ctx) {
		try {
			return this.value(f.apply(ctx || this));
		} catch (e) {
			return this.error(e);
		}
	},
	
	funcCallback: function (ctx, func) {
		var args  = BetaJS.Functions.getArguments(arguments, 1);
		if (BetaJS.Types.is_function(ctx)) {
			args = BetaJS.Functions.getArguments(arguments, 1);
			func = ctx;
			ctx = this;
		} else
			args = BetaJS.Functions.getArguments(arguments, 2);
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
			if (!BetaJS.Types.is_array(promises))
				promises = [promises];	
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
					promises[i].callback(function (error, value) {
						if (error)
							this.__errorPromise = promises[this.idx];
						else {
							this.promise.__successCount++;
							this.promise.__values[this.idx] = value;
						}
						this.promise.results();
					}, {promise: this, idx: last});					
				}
			}
			return this;
		};
		promise.end = function () {
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
		var args = BetaJS.Functions.getArguments(arguments, 1);
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
		return this.methodArgs(ctx, func, BetaJS.Functions.getArguments(arguments, 2));
	},

	newClass: function (cls) {
		var params = BetaJS.Functions.getArguments(arguments, 1);
		params.unshift(BetaJS.Functions.newClassFunc(cls));
		return this.func.apply(this, params);
	},
	
	is: function (obj) {
		return obj && BetaJS.Types.is_object(obj) && obj.classGuid == BetaJS.Promise.Promise.prototype.classGuid;
	} 
	
};

BetaJS.Promise.Promise.prototype.classGuid = "7e3ed52f-22da-4e9c-95a4-e9bb877a3935"; 

BetaJS.Promise.Promise.prototype.success = function (f, context, options) {
	return this.callback(f, context, options, "success");
};

BetaJS.Promise.Promise.prototype.error = function (f, context, options) {
	return this.callback(f, context, options, "error");
};

BetaJS.Promise.Promise.prototype.callback = function (f, context, options, type) {
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
};

BetaJS.Promise.Promise.prototype.triggerResult = function (record) {
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
};

BetaJS.Promise.Promise.prototype.value = function () {
	return this.__value;
};

BetaJS.Promise.Promise.prototype.err = function () {
	return this.__error;
};

BetaJS.Promise.Promise.prototype.isFinished = function () {
	return this.__isFinished;
};

BetaJS.Promise.Promise.prototype.hasValue = function () {
	return this.__isFinished && !this.__hasError;
};

BetaJS.Promise.Promise.prototype.hasError = function () {
	return this.__isFinished && this.__hasError;
};

BetaJS.Promise.Promise.prototype.asyncSuccess = function (value, promise) {
	if (this.__isFinished) 
		return this;
	this.__resultPromise = promise;
	this.__error = null;
	this.__isFinished = true;
	this.__hasError = false;
	this.__value = value;
	return this.triggerResult();
};

BetaJS.Promise.Promise.prototype.forwardSuccess = function (promise) {
	this.success(promise.asyncSuccess, promise);
	return this;
};

BetaJS.Promise.Promise.prototype.asyncError = function (error, promise) {
	if (this.__isFinished) 
		return this;
	this.__resultPromise = promise;
	this.__isFinished = true;
	this.__hasError = true;
	this.__error = error;
	this.__value = null;
	return this.triggerResult();
};

BetaJS.Promise.Promise.prototype.forwardError = function (promise) {
	this.error(promise.asyncError, promise);
	return this;
};

BetaJS.Promise.Promise.prototype.asyncCallback = function (error, value, promise) {
	if (error)
		return this.asyncError(error, promise);
	else
		return this.asyncSuccess(value, promise);
};

BetaJS.Promise.Promise.prototype.asyncCallbackFunc = function () {
	return BetaJS.Functions.as_method(BetaJS.Promise.Promise.prototype.asyncCallback, this);
};

BetaJS.Promise.Promise.prototype.forwardCallback = function (promise) {
	this.callback(promise.asyncCallback, promise);
	return this;
};

BetaJS.Promise.Promise.prototype.mapSuccess = function (func, ctx) {
	var promise = BetaJS.Promise.create();
	this.forwardError(promise).success(function (value, pr) {
		var result = func.call(ctx || promise, value, pr);
		if (BetaJS.Promise.is(result))
			result.forwardCallback(promise);
		else
			promise.asyncSuccess(result);
	});
	return promise;
};

BetaJS.Promise.Promise.prototype.mapError = function (func, ctx) {
	var promise = BetaJS.Promise.create();
	this.forwardSuccess(promise).error(function (err, pr) {
		var result = func.call(ctx || promise, err, pr);
		if (BetaJS.Promise.is(result))
			result.forwardCallback(promise);
		else
			promise.asyncError(result);
	});
	return promise;
};

BetaJS.Promise.Promise.prototype.mapCallback = function (func, ctx) {
	var promise = BetaJS.Promise.create();
	this.callback(function (err, value, pr) {
		var result = func.call(ctx || promise, err, value, pr);
		if (BetaJS.Promise.is(result))
			result.forwardCallback(promise);
		else
			promise.asyncCallback(err ? result : err, err ? value : result, pr);
	});
	return promise;
};

BetaJS.Promise.Promise.prototype.and = function (promises) {
	var result = BetaJS.Promise.and(this);
	return result.and(promises);
};