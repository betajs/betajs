BetaJS.Views.View.extend("BetaJS.Views.InputView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["input-view-template"]
	},
	_events: function () {
		return [{
			"blur input": "__leaveEvent",
			"keyup input": "__changeEvent",
			"change input": "__changeEvent",
			"input input": "__changeEvent",
			"paste input": "__changeEvent"
		}];
	},
	constructor: function(options) {
		options = options || {};
		this._inherited(BetaJS.Views.InputView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");	
		this._setOptionProperty(options, "input_type", "text");
	},
	_hotkeys: function () {
		return [{
			"ENTER": function () {
				this.trigger("enter_key", this.get("value"));
			}
		}];
	},
	__leaveEvent: function () {
		this.trigger("leave");
	},
	__changeEvent: function () {
		this.trigger("change", this.get("value"));
	},
	focus: function (select_all) {
		this.$("input").focus();
		this.$("input").focus();
		if (select_all)
			this.$("input").select();
	}
});