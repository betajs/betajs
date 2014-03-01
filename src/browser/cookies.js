BetaJS.Browser.Cookies = {

	get : function(key) {
		var cookie = "; " + document.cookie;
		var parts = cookie.split("; " + key + "=");
		if (parts.length == 2)
			return parts.pop().split(";").shift();
		return null;
	},

	set : function(key, value) {
		var cookie = "; " + document.cookie;
		var parts = cookie.split("; " + key + "=");
		if (parts.length == 2)
			cookie = parts[0] + parts[1].substring(parts[1].indexOf(";"));
		document.cookie = key + "=" + value + cookie;
	}
};