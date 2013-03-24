BetaJS.Templates = BetaJS.Templates || {};


BetaJS.Templates.AbstractTemplate = BetaJS.Class.extend("AbstractTemplate", {
	
	constructor: function (template_string) {
		this._inherited(BetaJS.Templates.AbstractTemplate, "constructor");
		this.__template_string = template_string;
		this.__tokens = BetaJS.Templates.tokenize(template_string);
	},
	
	template_string: function () {
		return this.__template_string;
	},
	
	tokens: function () {
		return this.__tokens;
	},
	
	evaluate: function () {
		return this.__compiled.apply(this, arguments);
	}
	
});


BetaJS.Templates.Template = BetaJS.Templates.AbstractTemplate.extend("Template", {
	
	evaluate: function () {
		if (!this.__compiled)
			this.__compiled = BetaJS.Templates.compile(this.tokens());
		return this.__compiled.apply(this, arguments);
	}
	
}, {
	
	bySelector: function (selector) {
		return new BetaJS.Templates.Template($(selector).html());
	}
	
});
