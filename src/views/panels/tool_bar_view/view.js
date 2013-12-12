BetaJS.Views.ListContainerView.extend("BetaJS.Views.ToolBarView", {
	
	_css: function () {
		return {
			"divider": "divider",
			"group": "group"
		};
	},

	constructor: function (options) {
		options = BetaJS.Objs.extend({
			clear_float: true
		}, options || {});
		this._inherited(BetaJS.Views.ToolBarView, "constructor", options);
		this.__group_by_ident = {};
		this.__item_by_ident = {};
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
		"group_ident", "group_type", "group_options"
	]),

	addGroup: function (options) {
		var parent_options = {
			group_type: "container"
		};
		var group_options = {};
		BetaJS.Objs.iter(options || {}, function (value, key) {
			if (key in this.__group_parent_options)
				parent_options[key] = value;
			else
				group_options[key] = value;
		}, this);
		var view = null;
		if (parent_options.group_type == "container") {
			group_options.el_classes = this.css("group");
			view = this.addChild(new BetaJS.Views.ListContainerView(group_options), parent_options);
			if (parent_options.group_ident) {
				if (parent_options.group_ident in this.__group_by_ident)
					throw ("Group identifier already registered: " + parent_options.group_ident);
				this.__group_by_ident[parent_options.group_ident] = view;
			}
			return view;			
		} else if (parent_options.group_type == "divider") {
			group_options.el_classes = this.css("divider");
			view = this.addChild(new BetaJS.Views.View(group_options), parent_options);
		} else throw ("Unknown group type: " + parent_options.group_type);
		return view;			
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
		var parent = this;
		if (parent_options.item_group) {
			if (parent_options.item_group in this.__group_by_ident) {
				parent = this.__group_by_ident[parent_options.item_group];
				var group_options = this.childOptions(parent);
				item_options = BetaJS.Objs.extend(group_options.group_options || {}, item_options);
			} else
				throw ("Unknown group identifier: " + parent_options.item_group);
		}
		var view = parent.addChild(new parent_options.item_type(item_options), parent_options);
		this.delegateEvents(null, view, "item", [view, parent_options]);
		if (parent_options.item_ident)
			this.delegateEvents(null, view, "item-" + parent_options.item_ident, [view, parent_options]);
		if (parent_options.item_ident) {
			if (parent_options.item_ident in this.__item_by_ident)
				throw ("Item identifier already registered: " + parent_options.item_ident);
			this.__item_by_ident[parent_options.item_ident] = view;
		}
		return view;
	},
	
	itemByIdent: function (ident) {
		return this.__item_by_ident[ident];
	}
		
});
