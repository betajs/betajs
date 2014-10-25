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
	},
	
	listEqual: function (a, b) {
		if (BetaJS.Types.is_array(a) && BetaJS.Types.is_array(b)) {
			if (a.length != b.length)
				return false;
			for (var i = 0; i < a.length; ++i) {
				if (a[i] !== b[i])
					return false;
			}
			return true;
		} else if (BetaJS.Types.is_object(a) && BetaJS.Types.is_object(b)) {
			for (var key in a) {
				if (b[key] !== a[key])
					return false;
			}
			for (key in b) {
				if (!(key in a))
					return false;
			}
			return true;
		} else
			return false;
	}
		
};
