BetaJS.Views.ButtonView = BetaJS.Views.View.extend("ButtonView", {
	_templates: {
		"default": $("#button-view-template")
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.ButtonView, "constructor", options);
		this._setOption(options, "label", "");
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click button": "__clickButton"
		}]);
	},
	__clickButton: function () {
		this.trigger("clicked");
	}
});