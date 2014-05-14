BetaJS.Comparators = {
	
	byObject: function (object) {
		return function (left, right) {
			for (key in object) {
				var c = 0;
				if (BetaJS.Properties.Properties.is_class_instance(left) && BetaJS.Properties.Properties.is_class_instance(right))
					c = BetaJS.Comparators.byValue(left.get(key) || null, right.get(key) || null);
				else
					c = BetaJS.Comparators.byValue(left[key] || null, right[key] || null);
				if (c !== 0)
					return c * object[key];
			}
			return 0;
		};
	},
	
	byValue: function (a, b) {
		if (BetaJS.Types.is_string(a))
			return a.localeCompare(b);
		if (a < b)
			return -1;
		if (a > b)
			return 1;
		return 0;
	}
		
};
