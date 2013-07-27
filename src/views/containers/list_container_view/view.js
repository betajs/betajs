BetaJS.Views.ListContainerView = BetaJS.Views.View.extend("ListContainerView", {
	_templates: {
		"item": BetaJS.Templates.Cached["list-container-view-item-template"]
	},
	_notifications: {
		"addChild": "__addChildContainer",
		"removeChild": "__removeChildContainer"
	},
	_render: function () {
		this.$el.html("");
		BetaJS.Objs.iter(this.children(), function (child) {
			this.__addChildContainer(child);
		}, this);
	},
	__addChildContainer: function (child) {
		var options = this.childOptions(child);
		if (this.isActive())
			this.$el.append(this.evaluateTemplate("item", {cid: child.cid()}));
		child.setEl("[data-view-id='" + child.cid() + "']");
		if (this.isActive() && "float" in options) {
			var container = this.$("[data-view-id='" + child.cid() + "']");
			container.css("float", options["float"]);
		}			
	},
	__removeChildContainer: function (child) {
		this.$data({"view-id": child.cid()}).remove();
	}
});