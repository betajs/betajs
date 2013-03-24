BetaJS.Views.TextAreaView = BetaJS.Views.View.extend("TextAreaView", {
	_templates: {
		"default": BetaJS.Templates.Cached["textarea-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.InputView, "constructor", options);
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