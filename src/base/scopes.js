BetaJS.Scopes = {
	
	resolve: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var object = base || window || global;
		var a = s.split(".");
		for (var i = 0; i < a.length; ++i)
			object = object[a[i]];
		return object;
	}
	
};
