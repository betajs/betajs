BetaJS.ButtonView = BetaJS.Views.View.extend("ButtonView", {
	_templates: {
		"default": $("#button-view-template")
	},
	constructor: function(options) {
		this._inherited(ButtonView, "constructor", options);
		this._setOption(options, "label", "");
	},
	_render: function () {
		this.$el.html("<button>" + this.__label + "</button>");
	},
	_events: function () {
		return this._inherited(ButtonView, "_events").concat([{
			"click button": "__clickButton"
		}]);
	},
	__clickButton: function () {
		this.trigger("clicked");
	}
});