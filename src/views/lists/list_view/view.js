// TODO: Dynamics, Settings Per Item, Change, SubView instead of Template, Animations
BetaJS.Views.ListView = BetaJS.Views.View.extend("ListView", {
	_templates: {
		"default": BetaJS.Templates.Cached["list-view-template"],
		"item-container": BetaJS.Templates.Cached["list-view-item-container-template"],
		"item": BetaJS.Templates.Cached["list-view-item-template"],
	},
	_supp: function () {
		return BetaJS.Objs.extend(this._inherited(BetaJS.Views.ListView, "_supp"), {
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
		this._inherited(BetaJS.Views.ListView, "constructor", options);
		this._setOption(options, "list_container_element", "ul");
		this._setOption(options, "list_container_attrs", {});
		this._setOption(options, "item_container_element", "li");
		this._setOption(options, "item_container_attrs", {});
		this._setOption(options, "item_label", "label");
		if ("collection" in options) {
			this.__collection = options.collection;
			this.__destroy_collection = false;
		} else {
			this.__collection = new BetaJS.Collections.Collection({
				objects: options["objects"],
				compare: options["compare"]
			});
			this.__destroy_collection = true;
		}
		this.__collection.on("add", function (item) {
			this.__renderAdd(item);
		}, this);
		this.__collection.on("remove", function (item) {
			this.__renderRemove(item);
		}, this);
		this.__collection.on("index", function (item, index) {
			this.__renderUpdateIndex(item, index);
		}, this);
	},
	destroy: function () {
		this.__collection.off(null, null, this);
		if (this.__destroy_collection)
			this.__collection.destroy();
		this._inherited(BetaJS.Views.ListView, "destroy");
	},
	getCollection: function () {
		return this.__collection;
	},
	_render: function () {
		this.$el.html(this.evaluateTemplate("default", {
			list_container_element: this.__list_container_element,
			list_container_attrs: this.__list_container_attrs
		}));
		this.$selector_list = this.$data("selector", "list");
		var self = this;
		this.__collection.iterate(function (item) {
			self.__renderAdd(item);
		});
	},
	__renderAdd: function (item) {
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
			var before = this.__findIndexElement(index - 1);
			if (before.length > 0) 
				before.after(container)
			else {
				var after = this.__findIndexElement(index + 1);
				if (after.length > 0)
					after.before(container)
				else
					this.$selector_list.append(container);
			}
		}
		var element = this.__findItemElement(item);
		element.html(this.evaluateTemplate("item", {
			item_label: this.__item_label,
			item: item
		}));
	},
	__renderRemove: function (item) {
		if (!this.isActive())
			return;
		this.__findItemElement(item).remove();
	},
	__renderUpdateIndex: function (item, index) {
		var element = this.__findItemElement(item);
		var old_index = element.attr("data-index");
		element.attr("data-index", index);
		if (old_index <= index + 1 || old_index >= index - 1)
			return;
		if (index == 0)
			this.$selector_list.prepend(element)
		else {
			var before = this.__findIndexElement(index - 1);
			if (before.length > 0) 
				before.insertAfter(element)
			else {
				var after = this.__findIndexElement(index + 1);
				if (after.length > 0)
					after.insertBefore(element);
			}
		}
	},
	__findItemElement: function (item) {
		return this.$subdata(this.$selector_list, {
			"view-id": this.cid(),
			"cid": BetaJS.Ids.objectId(item)
		});
	},
	__findIndexElement: function (index) {
		return this.$subdata(this.$selector_list, {
			"view-id": this.cid(),
			"index": index
		});
	},
	add: function (item) {
		this.__collection.add(item);						
	}
});
