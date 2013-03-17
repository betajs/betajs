BetaJS.Strings = {
	
	nl2br: function (s) {
		return (s + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
	},
	
	htmlentities: function (s) {
		return (s + "").
			replace(/&/g, '&amp;').
			replace(/</g, '&lt;').
			replace(/>/g, '&gt;').
			replace(/"/g, '&quot;').
			replace(/'/g, '&#x27;').
			replace(/\//g, '&#x2F;');
	}

};
