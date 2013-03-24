BetaJS.Views.ListView = BetaJS.Views.View.extend("ListView", {
	_templates: {
		"default": BetaJS.Templates.Cached["list-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.ListView, "constructor", options);
		this._setOption(options, "items", []);
	},
	_render: function () {
		this.$el.html("<ul></ul>");
		var self = this;
		BetaJS.Objs.iter(this.__items, function (item) {
			self.$el.find("ul").append("<li>" + item + "</li>");
		});
	},
	add: function (item) {
		this.__items.push(item);
		//this.invalidate();
		this.$el.find("ul").append("<li>" + item + "</li>");
	}
});