BetaJS.Views.View.extend("BetaJS.Views.LabelView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["label-view-template"]
	},
	_css: function () {
		return {"label": "label-view-class"};
	},
	_events: function () {
		return [{
			"click": "__clickEvent"	
		}];
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.LabelView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "element", "span");
	},
	__clickEvent: function () {
		this.trigger("click");
	}
});