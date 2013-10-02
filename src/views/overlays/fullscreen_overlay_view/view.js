BetaJS.Views.View.extend("BetaJS.Views.FullscreenOverlayView", {
	
	_templates: {
		"default": BetaJS.Templates.Cached["fullscreen-overlay-view-template"]
	},
	
	_events: function () {
		return [{
			'click [data-selector="outer"]': function () {
				if (this.__destroy_on_unfocus)
					this.destroy()
				else if (this.__hide_on_unfocus)
					this.hide();
			}
		}];
	},

	constructor: function (options) {
		options = options || {};
		options.el = options.el || "body";
		options.append_to_el = "append_to_el" in options ? options.append_to_el : true;
		options.visible = "visible" in options ? options.visible : false;
		this._inherited(BetaJS.Views.FullscreenOverlayView, "constructor", options);
		options.overlay_inner.setEl('[data-selector="inner"]');
		this.overlay_inner = this.addChild(options.overlay_inner);
		this._setOption(options, "hide_on_unfocus", true);
		this._setOption(options, "destroy_on_unfocus", false);
		this.on("show", this._after_show, this);
		this.on("hide", this._after_hide, this);
	},
	
	_after_show: function () {	
		var outer = this.$('[data-selector="outer"]');
		var inner = this.$('[data-selector="inner"]');
		inner.removeClass("fullscreen-overlay-float");
		inner.removeClass("fullscreen-overlay-fit");
		var outer_width = outer.outerWidth();
		var outer_height = outer.outerHeight();
		var inner_width = inner.outerWidth();
		var inner_height = inner.outerHeight();
		var left = Math.floor((outer_width - inner_width) / 2);
		var top = Math.floor((outer_height - inner_height) / 2);
		if (left >= 0 && top >= 0) {
			inner.css("left", left + "px");
			inner.css("top", top + "px");
			inner.addClass("fullscreen-overlay-float");
		} else {
			inner.css("left", "0px");
			inner.css("top", "0px");
			inner.addClass("fullscreen-overlay-fit");
		}
		BetaJS.$("body").addClass("fullscreen-overlay-body");
	},
	
	_after_hide: function () {
		BetaJS.$("body").removeClass("fullscreen-overlay-body");
	}
	
	

});