BetaJS.Views = BetaJS.Views || {};

BetaJS.Views.View = BetaJS.Class.extend("View", [BetaJS.Events.EventsMixin, BetaJS.Ids.ClientIdMixin, {
	
	_templates: function () {
		// {"name": "string" or jquery selector}
		return {};
	},
	
	_events: function () {
		// [{"event selector": "function"}]
		return [];
	},
	
	_render: function () {
		if (this.__render_string)
			this.$el.html(this.__render_string)
		else if (this.__templates["default"])
			this.$el.html(this.__templates["default"].evaluate(this.__properties.getAll()));
	},
	
	getTemplate: function (key) {
		return this.__templates[key];
	},

	_setOption: function (options, key, value, prefix) {
		var prefix = prefix ? prefix : "__";
		this[prefix + key] = key in options ? options[key] : value;
	},
	
	_setOptionProperty: function (options, key, value) {
		this.set(key, key in options ? options[key] : value);
	},
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.View, "constructor");
		this._setOption(options, "el", null);
		this._setOption(options, "visible", true);
		this._setOption(options, "render_string", null);
		this._setOption(options, "events", []);
		this._setOption(options, "attributes", {});
		this.__old_attributes = {};
		this._setOption(options, "css_classes", []);
		this.__added_css_classes = [];
		this._setOption(options, "css_styles", {});
		this.__old_css_styles = {};
		this.__parent = null;
		this.__children = {};
		this.__active = false;
		this.$el = null;
		this.__events = this._events().concat(this.__events);
		var templates = BetaJS.Objs.extend(BetaJS.Types.is_function(this._templates) ? this._templates() : this._templates, options["templates"] || {});
		if ("template" in options)
			templates["default"] = options["template"];
		this.__templates = {};
		for (var key in templates)
			if (BetaJS.Types.is_string(templates[key]))
				this.__templates[key] = new BetaJS.Templates.Template(templates[key])
			else
				this.__templates[key] = new BetaJS.Templates.Template(templates[key].html());
		this.__properties = new BetaJS.Events.Properties(options["properties"] || {});
		this._setOption(options, "objects", {});
	},
	
	get: function (key) {
		return this.__properties.get(key);
	},
	
	set: function (key, value) {
		this.__properties.set(key, value);
	},
	
	isActive: function () {
		return this.__active;
	},
	
	activate: function () {
		if (this.isActive())
			return true;
		if (!this.__el)
			return false;
		if (this.__parent && !this.__parent.isActive())
			return false;
		if (this.__parent)
			this.$el  = this.__parent.$(this.__el)
		else
			this.$el = $(this.__el);
		if (this.$el.size() == 0)
			this.$el = null;
		if (!this.$el)
			return false;
		this.__old_attributes = {};
		for (var key in this.__attributes) {
			var old_value = this.$el.attr(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_attributes[key] = old_value
			else
				this.__old_attributes[key] = null;
			this.$el.attr(key, this.__attributes[key]);
		}
		this.__added_css_classes = [];
		for (var i; i < this.__css_classes; ++i)
			if (!this.$el.hasClass(this.__css_classes[i])) {
				this.$el.addClass(this.__css_classes[i]);
				this.__added_css_classes.push(this.__css_classes[i]);
			}
		this.__old_css_styles = {};
		for (var key in this.__css_styles)  {
			var old_value = this.$el.css(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_css_styles[key] = old_value
			else
				this.__old_css_styles[key] = null;
			this.$el.css(key, this.__css_styles[key]);
		}
		this.__bind();
		this.$el.css("display", this.__visible ? "" : "none");
		this.__active = true;
		this.__render();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.activate();
		});
		return true;
	},
	
	deactivate: function () {
		if (!this.isActive())
			return false;
		BetaJS.Objs.iter(this.__children, function (child) {
			child.deactivate();
		});
		this.__active = false;
		this.__unbind();
		this.$el.html("");
		for (var key in this.__old_attributes) 
			this.$el.attr(key, this.__old_attributes[key]);
		for (var i; i < this.__added_css_classes; ++i)
			this.$el.removeClass(this.__added_css_classes[i]);
		for (var key in this.__old_css_styles) 
			this.$el.css(key, this.__old_css_styles[key]);
		this.$el = null;
		return true;
	},
	
	$: function(selector) {
		return this.$el.find(selector);
	},
	
	$data: function(key, value) {
		return this.$("[data-" + key + "='" + value + "']");
	},
	
	destroy: function () {
		this.deactivate();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.destroy();
		});
		this._inherited(BetaJS.Views.View, "destroy");
	},
	
	show: function () {
		this.setVisibility(true);
	},
	
	hide: function () {
		this.setVisibility(false);
	},
	
	setVisibility: function (visible) {
		if (visible == this.__visible)
			return;
		this.__visible = visible;
		if (this.isActive())
			this.$el.css("display", this.__visible ? "" : "none");		
	},
	
	__bind: function () {
		var self = this;
		this.__unbind();
		BetaJS.Objs.iter(this.__events, function (obj) {
			BetaJS.Objs.iter(obj, function (value, key) {
				var func = self[value];
		        var match = key.match(BetaJS.Views.BIND_EVENT_SPLITTER);
		        var event = match[1];
		        var selector = match[2];
		        event = event + ".events" + self.cid();
		        var method = BetaJS.Functions.as_method(func, self);
		        if (selector === '')
		        	self.$el.on(event, method)
		        else
		        	self.$el.on(event, selector, method);
			});
		});
	},
	
	__unbind: function () {
		this.$el.off('.events' + this.cid());
	},
	
	__render: function () {
		if (!this.isActive())
			return;
		this._render();
	},
	
	invalidate: function () {
		if (!this.isActive())
			return;
		BetaJS.Objs.iter(this.__children, function (child) {
			child.deactivate();
		});
		this.__render();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.activate();
		});
	},
	
	setEl: function (el) {
		if (this.isActive()) {
			this.deactivate();
			this.__el = el;
			this.activate();
		}
		else
			this.__el = el;
	},
	
	getParent: function () {
		return this.__parent;
	},
	
	hasChild: function (child) {
		return child && child.cid() in this.__children;
	},
	
	setParent: function (parent) {
		if (parent == this.__parent)
			return;
		this.deactivate();
		if (this.__parent) {
			var old_parent = this.__parent;
			this.__parent = null;
			old_parent.removeChild(this);
		}
		if (parent) {
			this.__parent = parent;
			parent.addChild(this);
			if (parent.isActive())
				this.activate();
		}
	},
	
	children: function () {
		return BetaJS.Objs.values(this.__children);
	},
	
	addChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.addChild(child);
		}, this);
	},
	
	addChild: function (child) {
		if (!this.hasChild(child)) {
			this.__children[child.cid()] = child;
			this._notify("addChild", child);
			child.setParent(this);
			return child;
		}
		return null;
	},
	
	removeChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.removeChild(child);
		}, this);
	},
	
	removeChild: function (child) {
		if (this.hasChild(child)) {
			delete this.__children[child.cid()];
			child.setParent(null);
			this._notify("removeChild", child);
		}
	}
	
}]);

BetaJS.Views.BIND_EVENT_SPLITTER = /^(\S+)\s*(.*)$/;
