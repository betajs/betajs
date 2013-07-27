BetaJS.Views.InputLabelView = BetaJS.Views.SwitchContainerView.extend("LabelInputView", {

	constructor: function(options) {
		this._inherited(BetaJS.Views.InputLabelView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
		this._setOption(options, "edit_on_click", true);
		this._setOption(options, "label_mode", true);
		this.label = this.addChild(new BetaJS.Views.LabelView({
			label: this.binding("value")
		}));
		this.input = this.addChild(new BetaJS.Views.InputView({
			value: this.binding("value"),
			placeholder: this.binding("placeholder")
		}));
		if (!this.__label_mode)
			this.select(this.input);
		this.input.on("leave enter_key", function () {
			this.label_mode();
		}, this);
		if (this.__edit_on_click)
			this.label.on("click", function () {
				this.edit_mode();
			}, this);
	},
	
	label_mode: function () {
		this.select(this.label);		
	},
	
	edit_mode: function () {
		this.select(this.input);
		this.input.focus();
	}

});