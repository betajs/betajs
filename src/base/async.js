Scoped.define("module:Async", ["module:Types", "module:Functions"], function (Types, Functions) {
	return {		
		
		waitFor: function () {
			var args = Functions.matchArgs(arguments, {
				condition: true,
				conditionCtx: "object",
				callback: true,
				callbackCtx: "object",
				interval: "int"
			});
			var h = function () {
				try {
					return !!args.condition.apply(args.conditionCtx || args.callbackCtx || this);
				} catch (e) {
					
					return false;
				}
			};
			if (h())
				args.callback.apply(args.callbackCtx || this);
			else {
				var timer = setInterval(function () {
					if (h()) {
						clearInterval(timer);
						args.callback.apply(args.callbackCtx || this);
					}
				}, args.interval || 1);
			}
		},
		
		eventually: function (func, params, context) {
			var timer = setTimeout(function () {
				clearTimeout(timer);
				if (!Types.is_array(params)) {
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
				var record = this.__eventuallyOnce[key];
				if (record.func == func && record.params == params && record.context == context)
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
		__eventuallyOnceIdx: 1
		
	};

});