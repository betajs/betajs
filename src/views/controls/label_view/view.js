BetaJS.Views.LabelView = BetaJS.Views.View.extend("LabelView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["label-view-template"]
	},
	_events: function () {
		return [{
			"click": "__clickEvent"	
		}];
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.LabelView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "element", "label");
	},
	__clickEvent: function () {
		this.trigger("click");
	}
});