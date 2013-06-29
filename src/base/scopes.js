BetaJS.Scopes = {
	
	resolve: function (s, base) {
		var object = base || window || global;
		var a = s.split(".");
		for (var i = 0; i < a.length; ++i)
			object = object[a[i]];
		return object;
	}
	
};
