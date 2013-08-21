BetaJS.Scopes = {
	
	resolve: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var object = base || window || global;
		var a = s.split(".");
		for (var i = 0; i < a.length; ++i)
			object = object[a[i]];
		return object;
	},
	
	touch: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var object = base || window || global;
		var a = s.split(".");
		for (var i = 0; i < a.length; ++i) {
			if (!(a[i] in object))
				object[a[i]] = {};
			object = object[a[i]];
		}
		return object;
	},
	
	set: function (obj, s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var object = base || window || global;
		var a = s.split(".");
		for (var i = 0; i < a.length - 1; ++i) {
			if (!(a[i] in object))
				object[a[i]] = {};
			object = object[a[i]];
		}
		object[a[a.length - 1]] = obj;
		return obj;
	},
	
};
