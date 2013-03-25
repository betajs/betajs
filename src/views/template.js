BetaJS.Templates = BetaJS.Templates || {};


BetaJS.Templates.Template = BetaJS.Class.extend("Template", {
	
	constructor: function (template_string) {
		this._inherited(BetaJS.Templates.Template, "constructor");
		this.__tokens = BetaJS.Templates.tokenize(template_string);
		this.__compiled = BetaJS.Templates.compile(this.__tokens);
	},
	
	evaluate: function (obj, _context) {
		var args = BetaJS.Objs.extend(BetaJS.Objs.clone(obj, 1), this._internals());
		if (_context)
			args._context = _context;
		return this.__compiled.apply(this, [args]);
	},
	
	_internals: function () {
		return {};
	}
	
}, {
	
	bySelector: function (selector) {
		return new this($(selector).html());
	}
	
});