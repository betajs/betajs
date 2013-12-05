BetaJS.Views.ListContainerView.extend("BetaJS.Views.ToolBarView", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.ToolBarView, "constructor", options);
		options = options || {};
		if (options.groups) {
			BetaJS.Objs.iter(options.groups, function (group) {
				this.addGroup(group);
			}, this);
		}
		if (options.items) {
			BetaJS.Objs.iter(options.items, function (item) {
				this.addItem(item);
			}, this);
		}
	},
	
	__group_parent_options: BetaJS.Objs.objectify([
		"group_ident", "group_type"
	]),

	addGroup: function (options) {
		// TODO: Divider
		// TODO
	},
	
	__item_parent_options: BetaJS.Objs.objectify([
		"item_ident", "item_type", "item_group"
	]),
	
	addItem: function (options) {
		var parent_options = {
			item_type: "ButtonView"
		};
		var item_options = {};
		BetaJS.Objs.iter(options || {}, function (value, key) {
			if (key in this.__item_parent_options)
				parent_options[key] = value;
			else
				item_options[key] = value;
		}, this);
		if (parent_options.item_type in BetaJS.Views)
			parent_options.item_type = BetaJS.Views[parent_options.item_type];
		if (BetaJS.Types.is_string(parent_options.item_type))
			parent_options.item_type = BetaJS.Scopes.resolve(parent_options.item_type);
		var view = this.addChild(new parent_options.item_type(options), parent_options);
		this.delegateEvents(null, view, "item", [view, parent_options]);
		if (parent_options.item_ident)
			this.delegateEvents(null, view, "item-" + parent_options.item_ident, [view, parent_options]);
	}
		
});
