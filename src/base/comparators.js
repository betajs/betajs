BetaJS.Comparators = {
	
	byObject: function (object) {
		return function (left, right) {
			for (key in object) {
				var l = left[key] || null;
				var r = right[key] || null;
				var c = BetaJS.Comparators.byValue(l, r);
				if (c !== 0)
				return c * object[key];
			}
			return 0;
		};
	},
	
	byValue: function (a, b) {
		if (BetaJS.Types.is_string(a))
			return a.localCompare(b);
		if (a < b)
			return -1;
		if (a > b)
			return 1;
		return 0;
	}
	
};
