Scoped.define("module:Async", ["module:Types"], function (Types) {
	return {		
		
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