BetaJS.Views.ActiveDom = {
	
	__prefix_alias: ["bjs", "betajs"],
	
	__view_alias: {},
	
	__views: {},
	
	__active: false,
	
	__on_add_element: function (event) {
		var element = BetaJS.$(event.target);
		if (!element)
			return;
		var done = false;
		if (element.prop("tagName")) {
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
				if (element.prop("tagName").toLowerCase() == alias + "view") {
					BetaJS.Views.ActiveDom.__attach(element);
					done = true;
				}
			});
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__view_alias, function (data, alias) {
				if (element.prop("tagName").toLowerCase() == alias) {
					BetaJS.Views.ActiveDom.__attach(element, data);
					done = true;
				}
			});
		}
		if (!done) {
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
				element.find(alias + "view").each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this));
				});
			});
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__view_alias, function (data, alias) {
				element.find(alias).each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this), data);
				});
			});
		}
	},
	
	__on_remove_element: function (event) {
		var element = $(event.target);
		if (element.attr("data-active-dom-id") in BetaJS.Views.ActiveDom.__views)
			BetaJS.Views.ActiveDom.__views[element.attr("data-active-dom-id")].destroy();
	},
	
	__attach: function (element, meta_attrs) {
		var process = function (key, value) {
			var i = 0;
			while (i < BetaJS.Views.ActiveDom.__prefix_alias.length) {
				var alias = BetaJS.Views.ActiveDom.__prefix_alias[i];
				if (BetaJS.Strings.starts_with(key, alias + "-")) {
					key = BetaJS.Strings.strip_start(key, alias + "-");
					if (BetaJS.Strings.starts_with(key, "child-")) {
						key = BetaJS.Strings.strip_start(key, "child-");
						dom_child_attrs[key] = value;
					} else if (key in meta_attrs_scheme)
						meta_attrs[key] = value;
					else
						option_attrs[key] = value;
					return;
				} else
				++i;
			}
			dom_attrs[key] = value;			
		};
		var element_data = function (element) {
			var query = element.find("script[type='text/param']");
			return BetaJS.Strings.nltrim(query.length > 0 ? query.html() : element.html());
		};
		var dom_attrs = {};
		var dom_child_attrs = {};
		var option_attrs = {};
		var meta_attrs_scheme = {type: "View", "default": null, "name": null};
		meta_attrs = BetaJS.Objs.extend(BetaJS.Objs.clone(meta_attrs_scheme, 1), meta_attrs || {});
		var attrs = element.get(0).attributes;
		for (var i = 0; i < attrs.length; ++i) 
			process(attrs.item(i).nodeName, attrs.item(i).nodeValue);
		BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
			element.children(alias + "param").each(function () {
				var child = BetaJS.$(this);
				process(alias + "-" + child.attr(alias + "-key"), element_data(child));
			});
		});
		if (meta_attrs["default"])
			option_attrs[meta_attrs["default"]] = element_data(element);
		if (meta_attrs.type in BetaJS.Views)
			meta_attrs.type = BetaJS.Views[meta_attrs.type];
		if (BetaJS.Types.is_string(meta_attrs.type))
			meta_attrs.type = BetaJS.Scopes.resolve(meta_attrs.type);
		var view = new meta_attrs.type(option_attrs);
		view.setEl("[data-active-dom-id='" + view.cid() + "']");
		element.replaceWith("<div data-active-dom-id='" + view.cid() + "'></div>");
		element = BetaJS.$("[data-active-dom-id='" + view.cid() + "']");
		var key = null;
		for (key in dom_attrs)
			element.attr(key, dom_attrs[key]);
		view.on("destroy", function () {
			delete BetaJS.Views.ActiveDom.__views[view.cid()];
		});
		BetaJS.Views.ActiveDom.__views[view.cid()] = view;
		view.activate();
		for (key in dom_child_attrs)
			element.children().attr(key, dom_child_attrs[key]);
		if (meta_attrs["name"])
			BetaJS.Scopes.set(view, meta_attrs["name"]);
	},
	
	activate: function () {
		BetaJS.$(document).ready(function () {
			if (BetaJS.Views.ActiveDom.__active)
				return;
			document.addEventListener("DOMNodeInserted", BetaJS.Views.ActiveDom.__on_add_element);
			document.addEventListener("DOMNodeRemoved", BetaJS.Views.ActiveDom.__on_remove_element);
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
				BetaJS.$(alias + "view").each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this));
				});
			});
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__view_alias, function (data, alias) {
				BetaJS.$(alias).each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this), data);
				});
			});
			BetaJS.Views.ActiveDom.__active = true;
		});
	},
	
	deactivate: function () {
		BetaJS.$(document).ready(function () {
			if (!BetaJS.Views.ActiveDom.__active)
				return;
			document.removeEventListener("DOMNodeInserted", BetaJS.Views.ActiveDom.__on_add_element);
			document.removeEventListener("DOMNodeRemoved", BetaJS.Views.ActiveDom.__on_remove_element);
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__views, function (view) {
				view.destroy();
			});
			BetaJS.Views.ActiveDom.__active = false;
		});
	},
	
	registerPrefixAlias: function (alias) {
		this.__prefix_alias.push(alias);
	},
	
	registerViewAlias: function (alias, type, def) {
		this.__view_alias[alias] = { type: type };
		this.__view_alias[alias]["default"] = def;
	}
	
};