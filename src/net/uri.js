BetaJS.Net = BetaJS.Net || {};

BetaJS.Net.Uri = {
	
	encodeUriParams: function (arr) {
		var res = [];
		BetaJS.Objs.iter(arr, function (value, key) {
			res.push(key + "=" + encodeURI(value));
		});
		return res.join("&");
	}
	
};
