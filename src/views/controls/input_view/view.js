BetaJS.Views.InputView = BetaJS.Views.View.extend("InputView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["input-view-template"]
	},
	_events: function () {
		return [{
			"keyup input": "__keyupEvent"		
		}];
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.InputView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
		this._setOptionProperty(options, "top", "4");
		
	},
	__keyupEvent: function (e) {
		 var key = e.keyCode || e.which;
         if (key == 13)
         	this.trigger("enter_key");
	}
});