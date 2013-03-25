BetaJS.Templates.HtmlTemplate = BetaJS.Templates.Template.extend("HtmlTemplate", {
	
	_internals: function () {
		return {
			attributes: function (arr) {
				var s = "";
				for (var key in arr) {
					s += key + "='" + /*eval(arr[key])*/ arr[key] + "' ";
				}
				return s;
			}
		};
	}
	
});