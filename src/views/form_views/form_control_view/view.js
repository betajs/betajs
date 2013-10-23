BetaJS.Views.ListContainerView.extend("BetaJS.Views.FormControlView", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.FormControlView, "constructor", options);
		this._model = options.model;
		this._property = options.property;
		this._setOption(options, "validate_on_change", false);
		this._setOption(options, "validate_on_show", false);
		this._setOption(options, "error_classes", "");
		this.control_view = this.addChild(this._createControl(this._model, this._property, options.control_options || {}));
		this.label_view = this.addChild(new BetaJS.Views.LabelView(BetaJS.Objs.extend(options.label_options || {}, {visible: false})));
		if (this.__validate_on_change)
			this._model.on("change:" + this._property, this.validate, this);
		if (this.__validate_on_show)
			this.on("show", this.validate, this);
		this._model.on("validate:" + this._property, this.validate, this);
	},
	
	validate: function () {
		if (this.isActive()) {
			var result = this._model.validateAttr(this._property);
			this.label_view.setVisibility(!result);
			if (result) {
				this.$el.removeClass(this.__error_classes);
			} else {
				this.$el.addClass(this.__error_classes);
				this.label_view.set("label", this._model.getError(this._property));
			}
		}			
	},
	
	_createControl: function (model, property, options) {}
	
});
