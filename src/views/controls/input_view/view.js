BetaJS.Views.InputView = BetaJS.Views.View.extend("InputView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["input-view-template"]
	},
	_events: function () {
		return [{
			"keyup input": "__keyupEvent",
			"blur input": "__leaveEvent",
		}, {
			"keyup input": "__changeEvent",
			"change input": "__changeEvent",
			"input input": "__changeEvent",
			"paste input": "__changeEvent",
		}];
	},
	constructor: function(options) {
		options = options || {};
		this._inherited(BetaJS.Views.InputView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");	
	},
	__keyupEvent: function (e) {
		 var key = e.keyCode || e.which;
         if (key == 13)
         	this.trigger("enter_key");
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