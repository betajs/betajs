BetaJS.Views.ItemListItemView = BetaJS.Views.View.extend("ItemListItemView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ItemListItemView, "constructor", options);
		this._setOptionProperty(options, "item", null);
		this._setOptionProperty(options, "_selected");
	},
	
	_events: function () {
		return [{
			"click": "__click"
		}];
	},
	
	isSelected: function () {
		return this.get("_selected");
	},
	
	__click: function () {
		if (this.getParent().__click_select)
			this.select();
	},
	
	select: function () {
		this.getParent().select(this.get("item"));
	},
	
	unselect: function () {
		this.getParent().unselect(this.get("item"));
	}

});

BetaJS.Views.ItemListView = BetaJS.Views.CustomListView.extend("ItemListView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ItemListView, "constructor", options);
		this._setOption(options, "sub_view", BetaJS.Views.ItemListItemView);
		this._setOption(options, "sub_view_options", this._sub_view_options || {});
		this._setOption(options, "selectable", true);
		this._setOption(options, "multi_select", false);
		this._setOption(options, "click_select", true);
	},
	
	_addItem: function (item, element, is_new_item) {
		var view = new this.__sub_view(BetaJS.Objs.extend({
			el: element,
			item: item
		}, this.__sub_view_options));
		this.itemData(item).view = view;
		this.addChild(view);
	},
	
	_destroyItemData: function (data) {
		this.removeChild(data.view);
		data.view.destroy();
	},
	
	isSelected: function (item) {
		return this.itemData(item).view.get("_selected");
	},
	
	select: function (item) {
		if (!this.itemData(item))
			return;
		var self = this;
		if (this.__selectable && !this.isSelected(item)) {
			if (!this.__multi_select)
				this.collection().iterate(function (object) {
					self.unselect(object);
				});
			this.itemData(item).view.set("_selected", true);
			this.trigger("select", item);
		}
		return this.itemData(item).view;
	},
	
	unselect: function (item) {
		if (this.__selectable && this.isSelected(item)) {
			this.itemData(item).view.set("_selected", false);
			this.trigger("unselect", item);
		}
		return this.itemData(item).view;
	}
	
});