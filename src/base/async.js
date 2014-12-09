/** @class */
BetaJS.Async = {
	
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
	__eventuallyOnceIdx: 1
	
};
