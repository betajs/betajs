BetaJS.Views.View.extend("BetaJS.Views.ButtonView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["button-view-template"]
	},
	_css: function () {
		return {
			"disabled": "",
			"default": ""
		};
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.ButtonView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "button_container_element", "button");
		this._setOptionProperty(options, "disabled", false);
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click [data-selector='button-inner']": "__clickButton"
		}]);
	},
	__clickButton: function () {
		if (!this.get("disabled"))
			this.trigger("click");
	}
});