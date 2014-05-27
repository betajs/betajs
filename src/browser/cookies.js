BetaJS.Browser.Cookies = {

	get : function(key) {
		return BetaJS.Strings.read_cookie_string(document.cookie, key);
	},

	set : function(key, value) {
		document.cookie = BetaJS.Strings.write_cookie_string(document.cookie, key, value);
	}
};