/** @class */
BetaJS.Views.IconButtonView = BetaJS.Views.View.extend("ButtonView", 
/** @lends BetaJS.Views.IconButtonView.prototype */
{
	/** This is a test.
	 */	
	_dynamics: {
		"default": BetaJS.Templates.Cached["icon-button-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.ButtonView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "icon", "question");
		this._setOptionProperty(options, "button_container_element", "div");
		this._setOptionProperty(options, "button_container_element", "div");
		this._setOption(options, "size", 50);
		this._setOption(options, "width", this.__size);
		this._setOption(options, "height", this.__size);
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click [data-selector='button']": "__clickButton"
		}]);
	},
	__clickButton: function () {
		this.trigger("clicked");
	},
	_el_styles: function() {
		var styles = {"position": "relative"};
		if (this.__width)
			styles.width = this.__width + "px";
		if (this.__height)
			styles.height = this.__height + "px";
		return styles;
	},
});