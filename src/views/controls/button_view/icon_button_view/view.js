BetaJS.Views.IconButtonView = BetaJS.Views.View.extend("ButtonView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["icon-button-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.ButtonView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "icon", "question");
		this._setOptionProperty(options, "button_container_element", "div");
		this._setOptionProperty(options, "button_container_element", "div");
		this._setOption(options, "size", null);
		this._setOption(options, "width", this.__size);
		this._setOption(options, "heigth", this.__size);
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click [data-selector='button']": "__clickButton"
		}]);
	},
	__clickButton: function () {
		this.trigger("clicked");
	},
});