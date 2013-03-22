BetaJS.Views.InputView = BetaJS.Views.View.extend("InputView", {
	_templates: {
		"default": BetaJS.Templates.Cached["input-view-template"]
	},
	constructor: function(options) {
		this._inherited(InputView, "constructor", options);
		this._setOption(options, "value", "");
		this._setOption(options, "placeholder", "");
	},
	_render: function () {
		this.$el.html("<input placeholder='" + this.__placeholder + "' value='" + this.__value + "' />");
	},
	getValue: function () {
		return this.$el.find("input").val();
	},
	setValue: function (value) {
		this.$el.find("input").val(value);
	}
});