BetaJS.Views.InputView = BetaJS.Views.View.extend("InputView", {
	_templates: {
		"default": BetaJS.Templates.Cached["input-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.InputView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
	},
	getValue: function () {
		return this.$el.find("input").val();
	},
	setValue: function (value) {
		this.$el.find("input").val(value);
	}
});