BetaJS.Views.View.extend("BetaJS.Views.CustomListView", {
	
	_templates: function () {
		return {
			"default": BetaJS.Templates.Cached["list-view-template"],
			"item-container": BetaJS.Templates.Cached["list-view-item-container-template"]
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
	
	_notifications: {
		activate: "__activateItems",
		deactivate: "__deactivateItems"
	},
	
	_events: function () {
		return [{
			"click": "__click"
		}];
	},	
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.CustomListView, "constructor", options);
		this._setOption(options, "list_container_element", "ul");
		this._setOption(options, "list_container_attrs", {});
		this._setOption(options, "list_container_classes", "");
		this._setOption(options, "item_container_element", "li");
		this._setOption(options, "item_container_classes", "");
		this._setOption(options, "selectable", true);
		this._setOption(options, "multi_select", false);
		this._setOption(options, "click_select", false);
		this.__itemData = {};
		if ("collection" in options) {
			this.__collection = options.collection;
			this.__destroy_collection = "destroy_collection" in options ? options.destroy_collection : false;
			if ("compare" in options)
				this.__collection.set_compare(options["compare"]);
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
			this._addItem(item);
		}, this);
		this.__collection.on("remove", function (item) {
			this._removeItem(item);
		}, this);
		this.__collection.on("change", function (item) {
			this._changeItem(item);
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
		this.__collection.iterate(function (item) {
			this._registerItem(item);
		}, this);
	},
	
	destroy: function () {
		this.__collection.iterate(function (item) {
			this._unregisterItem(item);
		}, this);
		this.__collection.off(null, null, this);
		if (this.__destroy_collection)
			this.__collection.destroy();
		this._inherited(BetaJS.Views.CustomListView, "destroy");
	},
	
	_itemBySubElement: function (element) {
		var container = element.closest("[data-view-id='" + this.cid() + "']");
		return container.length == 0 ? null : this.__collection.getById(container.attr("data-cid"));
	},
	
	__click: function (e) {
		if (this.__click_select && this.__selectable) {
			var item = this._itemBySubElement(BetaJS.$(e.target));
			if (item)
				this.select(item);
		}
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
	},
	
	_renderListContainer: function () {
		this.$el.html(this.evaluateTemplate("default", {
			list_container_element: this.__list_container_element,
			list_container_attrs: this.__list_container_attrs,
			list_container_classes: this.__list_container_classes
		}));
		return this.$data({"selector": "list"});
	},
	
	invalidate: function () {
		if (this.isActive())
			this.__deactivateItems();
		this._inherited(BetaJS.Views.CustomListView, "invalidate");
		if (this.isActive())
			this.__activateItems();
	},
	
	__activateItems: function () {
		this.__collection.iterate(function (item) {
			this._activateItem(item);
		}, this);
	},
	
	__deactivateItems: function () {
		this.__collection.iterate(function (item) {
			this._deactivateItem(item);
		}, this);
	},

	itemElement: function (item) {
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

	_changeItem: function (item) {},

	__updateItemIndex: function (item, index) {
		var element = this.itemElement(item);
		element.attr("data-index", index);
		this._updateItemIndex(item, element);
	},

	__reIndexItem: function (item) {
		var element = this.itemElement(item);
		var index = this.collection().getIndex(item);
		if (index == 0)
			this.$selector_list.prepend(element);
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
	
	itemData: function (item) {
		return this.__itemData[item.cid()];
	},

	_registerItem: function (item) {
		this.__itemData[item.cid()] = {
			properties: new BetaJS.Properties.Properties({
				selected: false,
				new_element: false
			})
		};
	},
	
	_unregisterItem: function (item) {
		this.__itemData[item.cid()].properties.destroy();
		delete this.__itemData[item.cid()];
	},
	
	_activateItem: function (item) {
		var container = this.evaluateTemplate("item-container", {
			item: item,
			item_container_element: this.__item_container_element, 
			item_container_attrs: this.__item_container_attrs,
			item_container_classes: this.__item_container_classes			
		});
		var index = this.__collection.getIndex(item);
		if (index == 0)
			this.$selector_list.prepend(container);
		else {
			var before = this._findIndexElement(index - 1);
			if (before.length > 0) 
				before.after(container);
			else {
				var after = this._findIndexElement(index + 1);
				if (after.length > 0)
					after.before(container);
				else
					this.$selector_list.append(container);
			}
		}
		this.trigger("activate_item", item);
	},
	
	_deactivateItem: function (item) {
		this.itemData(item).new_element = false;
		var element = this.itemElement(item);
		element.remove();
	},
	
	_addItem: function (item) {
		this._registerItem(item);
		if (this.isActive()) {
			this.itemData(item).new_element = true;
			this._activateItem(item);
		}
	},
	
	_removeItem: function (item) {
		if (this.isActive())
			this._deactivateItem(item);
		this._unregisterItem(item);
	},
	
	isSelected: function (item) {
		return this.itemData(item).properties.get("selected");
	},
	
	select: function (item) {
		var data = this.itemData(item);
		if (this.__selectable && !this.isSelected(item)) {
			if (!this.__multi_select)
				this.collection().iterate(function (object) {
					this.unselect(object);
				}, this);
			data.properties.set("selected", true);
			this.trigger("select", item);
		}
		return data;
	},
	
	unselect: function (item) {
		var data = this.itemData(item);
		if (this.__selectable && this.isSelected(item)) {
			data.properties.set("selected", false);
			this.trigger("unselect", item);
		}
		return data;
	}	
	
});



BetaJS.Views.CustomListView.extend("BetaJS.Views.ListView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ListView, "constructor", options);
		this._setOption(options, "item_label", "label");
		this._setOption(options, "render_item_on_change", this.dynamics("item") == null);
	},
	
	_changeItem: function (item) {
		this._inherited(BetaJS.Views.ListView, "_changeItem", item);
		if (this.__render_item_on_change && this.isActive())
			this._renderItem(item);
	},
	
	_activateItem: function (item) {
		this._inherited(BetaJS.Views.ListView, "_activateItem", item);
		this._renderItem(item);
	},
	
	_renderItem: function (item) {
		var element = this.itemElement(item);
		var properties = this.itemData(item).properties;
		if (this.templates("item") != null)
			element.html(this.evaluateTemplate("item", {item: item, properties: properties}));
		else if (this.dynamics("item") != null)
			this.evaluateDynamics("item", element, {item: item, properties: properties}, {name: "item-" + BetaJS.Ids.objectId(item)});
		else
			element.html(item.get(this.__item_label)); 
	},
	
	_deactivateItem: function (item) {
		if (this.dynamics("item") != null)
			this.dynamics("item").removeInstanceByName("item-" + BetaJS.Ids.objectId(item));
		this._inherited(BetaJS.Views.ListView, "_deactivateItem", item);
	}
	
});


BetaJS.Views.CustomListView.extend("BetaJS.Views.SubViewListView", {
	
	_sub_view: BetaJS.Views.View,
	
	_sub_view_options: function (item) {
		return {
			item: item,
			item_properties: this.itemData(item).properties
		};
	},
	
	_property_map: function (item) {},
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.SubViewListView, "constructor", options);
		if ("create_view" in options)
			this._create_view = options.create_view;
		if ("sub_view" in options)
			this._sub_view = options.sub_view;
		if ("sub_view_options" in options)
			this._sub_view_options_param = options.sub_view_options;
		if ("property_map" in options)
			this._property_map_param = options.property_map;
	},
	
	_create_view: function (item, element) {
		var properties = BetaJS.Objs.extend(
			BetaJS.Types.is_function(this._property_map) ? this._property_map.apply(this, [item]) : this._property_map,
			BetaJS.Types.is_function(this._property_map_param) ? this._property_map_param.apply(this, [item]) : this._property_map_param
		);
		var options = BetaJS.Objs.extend(
			BetaJS.Types.is_function(this._sub_view_options) ? this._sub_view_options.apply(this, [item]) : this._sub_view_options,
			BetaJS.Objs.extend(
				BetaJS.Types.is_function(this._sub_view_options_param) ? this._sub_view_options_param.apply(this, [item]) : this._sub_view_options_param || {},
				BetaJS.Objs.map(properties, item.get, item)
			)
		);
		options.el = this.itemElement(item);
		return new this._sub_view(options);
	},
	
	_activateItem: function (item) {
		this._inherited(BetaJS.Views.ListView, "_activateItem", item);
		var view = this._create_view(item); 
		this.delegateEvents(null, view, "item", [view, item]);
		this.itemData(item).view = view;
		this.addChild(view);
	},
	
	_deactivateItem: function (item) {
		var view = this.itemData(item).view;
		this.removeChild(view);
		view.destroy();
		this._inherited(BetaJS.Views.ListView, "_deactivateItem", item);
	}
	
});


BetaJS.Classes.Module.extend("BetaJS.Views.Modules.ListViewAnimation", {

	_register: function (object, data) {
		object.on("activate_item", function (item) {
			if (object.itemData(item).new_element) {
				var element = object.itemElement(item);
				element.css("display", "none");
				element.fadeIn();
			}
		}, this);
	}
	
}, {
	
	__singleton: null,
	
	singleton: function () {
		if (!this.__singleton)
			this.__singleton = new this({auto_destroy: false});
		return this.__singleton;
	}
	
});
