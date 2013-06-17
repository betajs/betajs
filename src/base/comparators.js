BetaJS.Comparators = {
	
	byObject: function (object) {
		return function (left, right) {
			for (key in object) {
				var l = left.key || null;
				var r = right.key || null;
				if (l < r)
					return object[key]
				else if (l > r)
					return -object[key];
			}
			return 0;
		};
	}
	
};
