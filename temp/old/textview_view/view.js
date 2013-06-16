BetaJS.Views.TextViewView = BetaJS.Views.View.extend("TextViewView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["text-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.TextViewView, "constructor", options);
		this._setOptionProperty(options, "text", "This is a Text");
		this._setOption(options, "width", 150);
	},
	_el_styles: function() {
		var styles = {"position": "relative"};
		if (this.__width)
			styles.width = this.__width + "px";
		return styles;
	},
});