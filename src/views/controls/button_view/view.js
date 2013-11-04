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
		options = options || {};
		this._inherited(BetaJS.Views.ButtonView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "button_container_element", "button");
		this._setOptionProperty(options, "disabled", false);
		if (options.hotkey) {
			var hotkeys = {};
			hotkeys[options.hotkey] = function () {
				this.click();
			};
			this.add_module(new BetaJS.Views.Modules.Hotkeys({hotkeys: hotkeys}));
		}
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click [data-selector='button-inner']": "click"
		}]);
	},
	click: function () {
		if (!this.get("disabled"))
			this.trigger("click");
	}
});