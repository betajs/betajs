BetaJS.Scopes = {
	
	base: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		if (base)
			return base[s];
		try {
			if (window)
				return window[s];
		} catch (e) {}
		try {
			if (global && global[s])
				return global[s];
		} catch (e) {}
		try {
			if (module && module.exports)
				return module.exports;
		} catch (e) {}
		return null;
	},
	
	resolve: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var a = s.split(".");			
		var object = this.base(a[0], base);
		for (var i = 1; i < a.length; ++i)
			object = object[a[i]];
		return object;
	},
	
	touch: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var a = s.split(".");			
		var object = this.base(a[0], base);
		for (var i = 1; i < a.length; ++i) {
			if (!(a[i] in object))
				object[a[i]] = {};
			object = object[a[i]];
		}
		return object;
	},
	
	set: function (obj, s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var a = s.split(".");			
		var object = this.base(a[0], base);
		for (var i = 1; i < a.length - 1; ++i) {
			if (!(a[i] in object))
				object[a[i]] = {};
			object = object[a[i]];
		}
		if (a.length > 1)
			object[a[a.length - 1]] = obj;
		return obj;
	},
	
};
