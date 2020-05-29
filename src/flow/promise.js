Scoped.define("module:Promise", [
    "module:Types",
    "module:Functions",
    "module:Async",
    "module:Objs"
], function(Types, Functions, Async, Objs) {

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
        Promise: function(value, error, finished) {
            this.__value = error ? null : (value === undefined ? null : value);
            this.__error = error ? error : null;
            this.__isFinished = finished;
            this.__hasError = !!error;
            this.__resultPromise = null;
            this.__callbacks = [];
        },

        fromNativePromise: function(nativePromise) {
            var promise = this.create();
            nativePromise.then(function(value) {
                promise.asyncSuccess(value);
            })['catch'](function(error) {
                promise.asyncError(error);
            });
            return promise;
        },

        /**
         * Create a new promise instance. (Simplified)
         * 
         * @param value optional promise value
         * @param error optional promise error
         * 
         * @return {object} promise instance
         */
        create: function(value, error) {
            return new this.Promise(value, error, arguments.length > 0);
        },

        /**
         * Returns a promise instance for a value. The value might be a promise itself already.
         * 
         * @param value promise value or promise
         * @return {object} promise instance
         */
        value: function(value) {
            return this.is(value) ? value : new this.Promise(value, null, true);
        },

        /**
         * Returns a promise instance for a value, setting the value asynchronously.
         * 
         * @param value promise value
         * @return {object} promise instance
         */
        eventualValue: function(value) {
            var promise = new this.Promise();
            Async.eventually(function() {
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
        error: function(error) {
            return this.is(error) ? error : new this.Promise(null, error, true);
        },

        /**
         * Turns a function call or a native promise into a promise, mapping exceptions to errors.
         * 
         * @param {function} f function or native promise
         * @param {object} ctx optional function context
         * @param {array} params optional function parameters
         * 
         * @return {object} promise
         */
        box: function(f, ctx, params) {
            if (f && 'then' in f && 'catch' in f) {
                var promise = this.create();
                f.then(promise.asyncSuccessFunc());
                f['catch'](promise.asyncErrorFunc());
                return promise;
            } else {
                try {
                    var result = f.apply(ctx || this, params || []);
                    return this.is(result) ? result : this.value(result);
                } catch (e) {
                    return this.error(e);
                }
            }
        },

        /**
         * Try-Catch a function, wrapping it into a promise.
         * 
         * @param {function} f function
         * @param {object} ctx optional function context
         * 
         * @return {object} promise
         */
        tryCatch: function(f, ctx) {
            try {
                return this.value(f.apply(ctx || this));
            } catch (e) {
                return this.error(e);
            }
        },

        /**
         * Turns a function accepting a callback function as last parameter into a promise.
         * 
         * @param {object} optional function context
         * @param {function} func function
         * 
         * @return {object} promise
         */
        funcCallback: function(ctx, func) {
            var args = [];
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

        /**
         * Takes a number of promises and creates a single new promise being successful if and only if all input promises are successful.
         * 
         * @param {array} promises promises array
         * 
         * @return {object} promise
         */
        and: function(promises) {
            var promise = this.create();
            promise.__promises = [];
            promise.__successCount = 0;
            promise.__values = [];
            promise.__errorPromise = null;
            promise.and = function(promises) {
                promises = promises || [];
                if (this.__ended)
                    return this;
                if (!Types.is_array(promises))
                    promises = [promises];
                var f = function(error, value) {
                    if (error)
                        this.promise.__errorPromise = this.promise.__promises[this.idx];
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
                        promises[i].callback(f, {
                            promise: this,
                            idx: last
                        });
                    }
                }
                return this;
            };
            promise.end = function() {
                if (this.__ended)
                    return this;
                this.__ended = true;
                this.results();
                return this;
            };
            promise.results = function() {
                if (this.__ended && this.__errorPromise)
                    this.asyncError(this.__errorPromise.err(), this.__errorPromise);
                else if (this.__ended && this.__successCount == this.__promises.length)
                    this.asyncSuccess(this.__values);
                return this;
            };
            promise.successUnfold = function(f, context, options) {
                return this.success(function() {
                    return f.apply(context, arguments);
                }, context, options);
            };
            promise.and(promises);
            return promise;
        },

        /**
         * Takes a function and calls with a number of arguments, some of which might be promises and turns it into actual values.
         * 
         * @param {function} func function
         * 
         * @return {object} promise
         */
        func: function(func) {
            var args = Functions.getArguments(arguments, 1);
            var promises = [];
            for (var i = 0; i < args.length; ++i) {
                if (this.is(args[i]))
                    promises.push(args[i]);
            }
            var promise = this.create();
            this.and(promises).end().success(function(values) {
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

        /**
         * Takes a method and calls with a number of arguments, some of which might be promises and turns it into actual values.
         * 
         * @param {object} ctx function context
         * @param {function} func function
         * @param {array} params parameters
         * 
         * @return {object} promise
         */
        methodArgs: function(ctx, func, params) {
            params.unshift(function() {
                return func.apply(ctx, arguments);
            });
            return this.func.apply(this, params);
        },

        /**
         * Takes a method and calls with a number of arguments, some of which might be promises and turns it into actual values.
         * 
         * @param {object} ctx function context
         * @param {function} func function
         * 
         * @return {object} promise
         */
        method: function(ctx, func) {
            return this.methodArgs(ctx, func, Functions.getArguments(arguments, 2));
        },

        /**
         * Takes a constructor and calls with a number of arguments, some of which might be promises and turns it into actual values.
         * 
         * @param {object} cls constructor class
         * 
         * @return {object} promise
         */
        newClass: function(cls) {
            var params = Functions.getArguments(arguments, 1);
            params.unshift(Functions.newClassFunc(cls));
            return this.func.apply(this, params);
        },

        /**
         * Determines whether some value is a promise object.
         * 
         * @param obj value
         * 
         * @return {boolean} true if obj is a promise object
         */
        is: function(obj) {
            return obj && Types.is_object(obj) && obj.classGuid == this.Promise.prototype.classGuid;
        },

        /**
         * Applies a method multiple times until it succeeds.
         * 
         * @param {function} method method
         * @param {object} context method context
         * @param {int} resilience number of times to call
         * @param {array} args arguments for method
         * @param {int} delay optional delay in-between tries
         * 
         * @return {object} promise
         */
        resilience: function(method, context, resilience, args, delay) {
            if (delay)
                method = this.delayPromiseMethod(method, delay);
            return method.apply(context, args).mapError(function(error) {
                return resilience === 0 ? error : this.resilience(method, context, resilience - 1, args);
            }, this);
        },

        /**
         * Creates a new method returning a promise based on a method returning a promise by delaying the underlying method.
         *
         * @param {function} method original method
         * @param {int} delay delay time
         * @returns {function} delayed method
         */
        delayPromiseMethod: function(method, delay) {
            var self = this;
            return function() {
                var promise = self.create();
                var args = Functions.getArguments(arguments);
                Async.eventually(function() {
                    method.apply(this, args).forwardCallback(promise);
                }, this, delay);
                return promise;
            };
        },

        /**
         * Wait asynchronously for a condition to be met.
         *
         * @param {function} condition condition function
         * @param {object} conditionCtx condition context (optional)
         * @param {int} interval interval time between checks (optional, default 1)
         * @param {int} timeout optional timeout
         *
         * @return {object} promise
         *
         */
        waitFor: function(condition, conditionCtx, interval, timeout) {
            var promise = this.create();
            var successTimer, errorTimer;
            if (timeout) {
                errorTimer = setTimeout(function() {
                    if (successTimer)
                        clearInterval(successTimer);
                    promise.asyncError(true);
                }, timeout);
            }
            successTimer = Async.waitFor(condition, conditionCtx, function() {
                if (errorTimer)
                    clearTimeout(errorTimer);
                promise.asyncSuccess(true);
            }, interval);
            return promise;
        },

        /**
         * Exclusively execute a promise-based function by postponing execution of further calls by waiting for the
         * promise completion.
         *
         * @param {function} promiseFunc promise function
         * @param {object} ctx function context (optional)
         *
         * @return {function} exclusive function
         *
         */
        exclusiveExecution: function(promiseFunc, ctx) {
            var currentPromise = null;
            var promiseQueue = [];
            return function() {
                var args = arguments;
                var resultPromise = null;
                if (!currentPromise) {
                    currentPromise = promiseFunc.apply(ctx, args);
                    resultPromise = currentPromise;
                } else {
                    var promise = Promise.create();
                    promiseQueue.push(promise);
                    resultPromise = promise.mapSuccess(function() {
                        return promiseFunc.apply(this, args);
                    }, ctx);
                }
                resultPromise.callback(function() {
                    currentPromise = null;
                    if (promiseQueue.length > 0) {
                        currentPromise = promiseQueue.shift();
                        currentPromise.asyncSuccess(true);
                    }
                });
                return resultPromise;
            };
        }

    };

    Objs.extend(Promise.Promise.prototype, {
        classGuid: "7e3ed52f-22da-4e9c-95a4-e9bb877a3935",

        /**
         * Be notified when the promise is successful.
         * 
         * @param {function} f callback function
         * @param {object} context optional callback context
         * @param {object} options optional options
         */
        success: function(f, context, options) {
            return this.callback(f, context, options, "success");
        },

        /**
         * Be notified when the promise is successful asynchronously.
         *
         * @param {function} f callback function
         * @param {object} context optional callback context
         * @param {object} options optional options
         */
        asuccess: function(f, context, options) {
            return this.success(Async.asyncify(f), context, options);
        },

        /**
         * Set an object value once value is known.
         *
         * @param {object} obj object
         * @param {string} key key to set value for
         */
        valueify: function(obj, key) {
            return this.success(function(value) {
                obj[key] = value;
            });
        },

        /**
         * Be notified when the promise is unsuccessful.
         * 
         * @param {function} f callback function
         * @param {object} context optional callback context
         * @param {object} options optional options
         */
        error: function(f, context, options) {
            return this.callback(f, context, options, "error");
        },

        /**
         * Be notified when the promise is finished..
         * 
         * @param {function} f callback function
         * @param {object} context callback context
         * @param {object} options options
         * @param {string} type type of callback like "success"
         */
        callback: function(f, context, options, type) {
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

        /**
         * Be notified when the promise does not finish with a certain time.
         *
         * @param {int} delay delay timeout
         * @param {function} f callback function
         * @param {object} context callback context
         */
        timeout: function(delay, f, context) {
            var ev = Async.eventually(f, context, delay);
            return this.callback(function() {
                Async.clearEventually(ev);
            });
        },

        /**
         * Timeout with an error.
         *
         * @param {int} delay delay timeout
         * @param error error value
         */
        timeoutError: function(delay, error) {
            if (!delay)
                return this;
            return this.timeout(delay, function() {
                this.asyncError(error);
            }, this);
        },

        /**
         * Trigger the result.
         * 
         * @param {object} record optional specific callback record
         * 
         */
        triggerResult: function(record) {
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

        /**
         * Returns the value of the promise.
         * 
         * @return value of promise
         */
        value: function() {
            return this.__value;
        },

        /**
         * Returns the error of the promise.
         * 
         * @return error of promise
         */
        err: function() {
            return this.__error;
        },

        /**
         * Determines whether the promise has a value or an error already.
         * 
         * @return {boolean} true if value or error present
         */
        isFinished: function() {
            return this.__isFinished;
        },

        /**
         * Determines whether the promise has a value.
         * 
         * @return {boolean} true if value present
         */
        hasValue: function() {
            return this.__isFinished && !this.__hasError;
        },

        /**
         * Determines whether the promise has an error.
         * 
         * @return {boolean} true if error present
         */
        hasError: function() {
            return this.__isFinished && this.__hasError;
        },

        /**
         * Informs the promise of a successful value.
         * 
         * @param value success value
         * @param {object} promise optional success promise
         */
        asyncSuccess: function(value, promise) {
            if (this.__isFinished)
                return this;
            this.__resultPromise = promise;
            this.__error = null;
            this.__isFinished = true;
            this.__hasError = false;
            this.__value = value;
            return this.triggerResult();
        },

        /**
         * Informs the promise of an error value.
         * 
         * @param error error value
         * @param {object} promise optional error promise
         */
        asyncError: function(error, promise) {
            if (this.__isFinished)
                return this;
            this.__resultPromise = promise;
            this.__isFinished = true;
            this.__hasError = true;
            this.__error = error;
            this.__value = null;
            return this.triggerResult();
        },

        /**
         * Informs the promise of an error or success value.
         * 
         * @param error optional error value
         * @param value optional success value
         * @param {object} promise optional callback promise
         */
        asyncCallback: function(error, value, promise) {
            if (error)
                return this.asyncError(error, promise);
            else
                return this.asyncSuccess(value, promise);
        },

        /**
         * Forwards the success of this promise to another promise.
         * 
         * @param {object} promise promise to which the success should be forwarded to
         */
        forwardSuccess: function(promise) {
            this.success(promise.asyncSuccess, promise);
            return this;
        },

        /**
         * Forwards the error of this promise to another promise.
         * 
         * @param {object} promise promise to which the error should be forwarded to
         */
        forwardError: function(promise) {
            this.error(promise.asyncError, promise);
            return this;
        },

        /**
         * Forwards the callback of this promise to another promise.
         * 
         * @param {object} promise promise to which the callback should be forwarded to
         */
        forwardCallback: function(promise) {
            this.callback(promise.asyncCallback, promise);
            return this;
        },

        /**
         * Generates a context-less function for the asynchronous callback.
         * 
         * @return {function} context-less function
         */
        asyncCallbackFunc: function() {
            return Functions.as_method(this.asyncCallback, this);
        },

        /**
         * Generates a context-less function for the asynchronous success.
         *
         * @return {function} context-less function
         */
        asyncSuccessFunc: function() {
            return Functions.as_method(this.asyncSuccess, this);
        },

        /**
         * Generates a context-less function for the asynchronous error.
         *
         * @return {function} context-less function
         */
        asyncErrorFunc: function() {
            return Functions.as_method(this.asyncError, this);
        },

        /**
         * Maps the success value of the promise to a function that might return another promise.
         * 
         * @param {function} func success callback
         * @param {object} ctx optional context
         * 
         * @return {object} promise
         */
        mapSuccess: function(func, ctx) {
            var promise = Promise.create();
            this.forwardError(promise).success(function(value, pr) {
                try {
                    var result = func.call(ctx || promise, value, pr);
                    if (Promise.is(result))
                        result.forwardCallback(promise);
                    else
                        promise.asyncSuccess(result);
                } catch (e) {
                    if (this.__callbacks.every(function(cb) {
                            return cb.type === "success";
                        })) {
                        console.warn(e);
                    }
                    promise.asyncError(e);
                }
            });
            return promise;
        },

        /**
         * Maps the success value of the promise asynchronously to a function that might return another promise.
         *
         * @param {function} func success callback
         * @param {object} ctx optional context
         *
         * @return {object} promise
         */
        mapASuccess: function(func, ctx) {
            return this.mapSuccess(function(result) {
                var promise = Promise.create();
                Async.eventually(function() {
                    Promise.box(func, ctx, [result]).forwardCallback(promise);
                });
                return promise;
            });
        },

        /**
         * Maps the error value of the promise to a function that might return another promise.
         * 
         * @param {function} func error callback
         * @param {object} ctx optional context
         * 
         * @return {object} promise
         */
        mapError: function(func, ctx) {
            var promise = Promise.create();
            this.forwardSuccess(promise).error(function(err, pr) {
                var result = func.call(ctx || promise, err, pr);
                if (Promise.is(result))
                    result.forwardCallback(promise);
                else
                    promise.asyncError(result);
            });
            return promise;
        },

        /**
         * Maps the error or success value of the promise to a function that might return another promise.
         * 
         * @param {function} func callback function
         * @param {object} ctx optional context
         * 
         * @return {object} promise
         */
        mapCallback: function(func, ctx) {
            var promise = Promise.create();
            this.callback(function(err, value, pr) {
                var result = func.call(ctx || promise, err, value, pr);
                if (Promise.is(result))
                    result.forwardCallback(promise);
                else
                    promise.asyncCallback(err ? result : err, err ? value : result, pr);
            });
            return promise;
        },

        /**
         * Concatenates more promises to this promise
         * 
         * @param {array} promises other promises
         * 
         * @return {object} promise
         */
        and: function(promises) {
            var result = Promise.and(this);
            return result.and(promises);
        }
    });

    return Promise;
});