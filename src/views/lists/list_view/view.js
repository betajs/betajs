BetaJS.Views.CustomListView = BetaJS.Views.View.extend("CustomListView", {
	
	_templates: function () {
		return {
			"default": BetaJS.Templates.Cached["list-view-template"],
			"item-container": BetaJS.Templates.Cached["list-view-item-container-template"],
		};
	},
	
	_supp: function () {
		return BetaJS.Objs.extend(this._inherited(BetaJS.Views.CustomListView, "_supp"), {
			list_item_attr: function (item) {
				return this.attrs({
					"data-view-id": this.__context.cid(),
					"data-cid": BetaJS.Ids.objectId(item),
					"data-index": this.__context.__collection.getIndex(item)
				});
			}
		});
	},
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.CustomListView, "constructor", options);
		this._setOption(options, "list_container_element", "ul");
		this._setOption(options, "list_container_attrs", {});
		this._setOption(options, "item_container_element", "li");
		this._setOption(options, "item_container_attrs", {});
		this.__itemData = {};
		if ("collection" in options) {
			this.__collection = options.collection;
			this.__destroy_collection = false;
		} else {
			var col_options = {};
			if ("objects" in options) 
				col_options["objects"] = options["objects"];
			if ("compare" in options) 
				col_options["compare"] = options["compare"];
			this.__collection = new BetaJS.Collections.Collection(col_options);
			this.__destroy_collection = true;
		}
		this.__collection.on("add", function (item) {
			this.__addItem(item, true);
		}, this);
		this.__collection.on("remove", function (item) {
			this.__removeItem(item);
		}, this);
		this.__collection.on("change", function (item) {
			this.__changeItem(item);
		}, this);
		this.__collection.on("index", function (item, index) {
			this.__updateItemIndex(item, index);
		}, this);
		this.__collection.on("reindexed", function (item) {
			this.__reIndexItem(item);
		}, this);
		this.__collection.on("sorted", function () {
			this.__sorted();
		}, this);
	},
	
	destroy: function () {
		for (var key in this.__itemData)
			this._destroyItemData(this.__itemData[key]);
		this.__itemData = null;
		this.__collection.off(null, null, this);
		if (this.__destroy_collection)
			this.__collection.destroy();
		this._inherited(BetaJS.Views.CustomListView, "destroy");
	},
	
	collection: function () {
		return this.__collection;
	},
	
	add: function (item) {
		this.__collection.add(item);						
	},
	
	remove: function (item) {
		this.__collection.remove(item);
	},
	
	_render: function () {
		this.$selector_list = this._renderListContainer();
		var self = this;
		this.__collection.iterate(function (item) {
			self.__addItem(item, false);
		});
	},
	
	_renderListContainer: function () {
		this.$el.html(this.evaluateTemplate("default", {
			list_container_element: this.__list_container_element,
			list_container_attrs: this.__list_container_attrs
		}));
		return this.$data({"selector": "list"});
	},

	_findItemElement: function (item) {
		return this.$data({
			"view-id": this.cid(),
			"cid": BetaJS.Ids.objectId(item)
		}, this.$selector_list);
	},
	
	_findIndexElement: function (index) {
		return this.$data({
			"view-id": this.cid(),
			"index": index
		}, this.$selector_list);
	},

	__changeItem: function (item) {
		if (!this.isActive())
			return;
		this._changeItem(item);
	},
	
	_newItemData: function (item) {
		return {};
	},
	
	_destroyItemData: function (data) {
	},
	
	itemData: function (item) {
		return this.__itemData[BetaJS.Ids.objectId(item)];
	},

	_changeItem: function (item) {},

	__addItem: function (item, is_new_item) {
		if (!this.isActive())
			return;
		var container = this.evaluateTemplate("item-container", {
			item: item,
			item_container_element: this.__item_container_element, 
			item_container_attrs: this.__item_container_attrs 
		});
		var index = this.__collection.getIndex(item);
		if (index == 0)
			this.$selector_list.prepend(container)
		else {
			var before = this._findIndexElement(index - 1);
			if (before.length > 0) 
				before.after(container)
			else {
				var after = this._findIndexElement(index + 1);
				if (after.length > 0)
					after.before(container)
				else
					this.$selector_list.append(container);
			}
		}
		var element = this._findItemElement(item);
		this.__itemData[BetaJS.Ids.objectId(item)] = this._newItemData(item);
		this._addItem(item, element, is_new_item);
		this._addElement(element, is_new_item);
	},
	
	_addElement: function (element, is_new_item) {},
	
	_addItem: function (item, element, is_new_item) {},
	
	__removeItem: function (item) {
		if (!this.isActive())
			return;
		var element = this._findItemElement(item);
		this._removeItem(item, element);
		this._destroyItemData(this.__itemData[BetaJS.Ids.objectId(item)]);
		delete this.__itemData[BetaJS.Ids.objectId(item)];
		this._removeElement(element);
	},
	
	_removeElement: function (element) {
		element.remove();
	},
	
	_removeItem: function (item, element) {},

	__updateItemIndex: function (item, index) {
		var element = this._findItemElement(item);
		element.attr("data-index", index);
		this._updateItemIndex(item, element);
	},

	__reIndexItem: function (item) {
		var element = this._findItemElement(item);
		var index = this.collection().getIndex(item);
		if (index == 0)
			this.$selector_list.prepend(element)
		else {
			var before = this._findIndexElement(index - 1);
			before.after(element);
		}
	},
	
	_updateItemIndex: function (item, index) {},
	
	__sort: function () {
		for (var index = this.collection().count() - 1; index >= 0; index--)
			this.$selector_list.prepend(this._findIndexElement(index));
	},
	
});



BetaJS.Views.ListView = BetaJS.Views.CustomListView.extend("ListView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ListView, "constructor", options);
		this._setOption(options, "item_label", "label");
		this._setOption(options, "render_item_on_change", this.dynamics("item") == null);
	},
	
	_changeItem: function (item) {
		if (this.__render_item_on_change) {
			var element = this._findItemElement(item);
			this._renderItem(item, element, false);
		}
	},
	
	_addItem: function (item, element, is_new_item) {
		this._renderItem(item, element, is_new_item);
	},
	
	_renderItem: function (item, element, is_new_item) {
		if (this.templates("item") != null)
			element.html(this.evaluateTemplate("item", {item: item}))
		else if (this.dynamics("item") != null)
			this.evaluateDynamics("item", element, {item: item}, {name: "item-" + BetaJS.Ids.objectId(item)})
		else
			element.html(item.get(this.__item_label)); 
	},
	
	_removeItem: function (item, element) {
		if (this.dynamics("item") != null)
			this.dynamics("item").removeInstanceByName("item-" + BetaJS.Ids.objectId(item));
	},
	
});


BetaJS.Views.SubViewListView = BetaJS.Views.CustomListView.extend("SubViewListView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.SubViewListView, "constructor", options);
		if ("create_view" in options)
			this._create_view = options["create_view"];
		this._setOption(options, "sub_view", BetaJS.Views.LabelView);
		this._setOption(options, "item_label", "label");
		var self = this;
		this._setOption(options, "sub_view_options", function (item) {
			return {
				label: item.binding(self.__item_label)
			};
		});
	},
	
	_create_view: function (item, element) {
		var options = this.__sub_view_options(item);
		options.el = element;
		return new this.__sub_view(options);
	},
	
	_addItem: function (item, element, is_new_item) {
		var view = this._create_view(item, element); 
		this.itemData(item).view = view;
		this.addChild(view);
	},
	
	_destroyItemData: function (data) {
		this.removeChild(data.view);
		data.view.destroy();
	},
	
});