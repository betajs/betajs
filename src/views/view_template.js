BetaJS.Templates.ViewTemplate = BetaJS.Templates.Template.extend("ViewTemplate", {
	
	_internals: function () {
		return {
			bind: {
				attributes: function (arr) {
					var s = "";
					for (var key in arr) 
						s += this.attribute(key, arr[key]) + " ";
					return s;
				},
				attribute: function (key, value) {
					return key + "='" + eval("this." + value) + "'";				
				},
				inner: function (value) {
				},
				selector: function (key) {
				},
				view: function (key) {
				}
			}
		};
	}
	
});

BetaJS.Templates.ViewTemplateContent = BetaJS.Class.extend("ViewTemplateContext", {
	
	
	
});