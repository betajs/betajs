BetaJS.Templates = BetaJS.Templates || {};


BetaJS.Templates.Template = BetaJS.Class.extend("Template", {
	
	constructor: function (template_string) {
		this._inherited(BetaJS.Templates.Template, "constructor");
		this.__tokens = BetaJS.Templates.tokenize(template_string);
		this.__compiled = BetaJS.Templates.compile(this.__tokens);
	},
	
	evaluate: function () {
		return this.__compiled.apply(this, arguments);
	}
	
}, {
	
	bySelector: function (selector) {
		return new BetaJS.Templates.Template($(selector).html());
	}
	
});