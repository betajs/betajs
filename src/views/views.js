BetaJS.Views = BetaJS.Views || {};

/** @class */
BetaJS.Views.View = BetaJS.Class.extend("View", [
    BetaJS.Events.EventsMixin,                                            
	BetaJS.Events.ListenMixin,
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Properties.BindablePropertiesMixin,
	/** @lends BetaJS.Views.View.prototype */
	{
    
    /** Returns all templates to be pre-loaded.
     * It should return an associative array of templates. The keys are user-defined identifiers, the values are either the template strings or a jquery object containing the template.
     * @return associative array of templates
     */
	_templates: function () {
		return {};
	},
	
    /** Returns all dynamics to be pre-loaded.
     * It should return an associative array of dynamics. The keys are user-defined identifiers, the values are either the template strings or a jquery object containing the template.
     * @return associative array of dynamics
     */
	_dynamics: function () {
		// {"name": "string" or jquery selector}
		return {};
	},
	
	_events: function () {
		// [{"event selector": "function"}]
		return [];
	},
	
	/** Returns all default css classes that should be used for this view. 
	 * They can be overwritten by the parent view or by options.
	 */
	_css: function () {
		// {"identifier": "css-class"}
		return {};
	},
	
	/** Returns css class by identifier. The return strategy has the following priorities: options, parent, defaults.
	 * @param ident identifier of class 
	 */
	css: function (ident) {
		if (this.__css[ident])
			return this.__css[ident];
		if (this.__parent) {
			var css = this.__parent.css(ident);
			if (css)
				return css;
		}
		var css = this._css();
		if (css[ident])
			return css[ident];
		return null;
	},
	
	_render: function () {
		if (this.__render_string)
			this.$el.html(this.__render_string)
		else if (this.__templates["default"])
			this.$el.html(this.evaluateTemplate("default", {}));
		else if (this.__dynamics["default"])
			this.evaluateDynamics("default", this.$el, {}, {name: "default"});
	},
	
	/** Returns a template associated with the view
	 * @param key identifier of template
	 */
	templates: function (key) {
		return this.__templates[key];
	},
	
	__supp: {
		css: function (key) {
			return this.__context.css(key);
		},
		attrs: function (obj) {
			var s = "";
			for (var key in obj)
				s += key + "='" + obj[key] + "' ";
			return s;
		},
		selector: function (name) {
			return "data-selector='" + name + "' ";
		}
	},
	
	templateArguments: function () {
		return BetaJS.Objs.extend({
			supp: BetaJS.Objs.extend({__context: this}, this.__supp)
		}, this.getAll());
	},
	
	evaluateTemplate: function (key, args) {
		return this.__templates[key].evaluate(BetaJS.Objs.extend(args, this.templateArguments()));
	},
	
	evaluateDynamics: function (key, element, args, options) {
		this.__dynamics[key].renderInstance(element, BetaJS.Objs.extend(options || {}, args || {}));
	},

	dynamics: function (key) {
		return this.__dynamics[key];
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
		this._setOption(options, "css", {});
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
			this.__templates[key] = new BetaJS.Templates.Template(BetaJS.Types.is_string(templates[key]) ? templates[key] : templates[key].html())

		var dynamics = BetaJS.Objs.extend(BetaJS.Types.is_function(this._dynamics) ? this._dynamics() : this._dynamics, options["dynamics"] || {});
		if ("dynamic" in options)
			dynamics["default"] = options["dynamic"];
		this.__dynamics = {};
		for (var key in dynamics)
			this.__dynamics[key] = new BetaJS.Views.DynamicTemplate(this, BetaJS.Types.is_string(dynamics[key]) ? dynamics[key] : dynamics[key].html())

		this.setAll(options["properties"] || {});
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
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
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
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.destroy();
		}, this);
		BetaJS.Objs.iter(this.__templates, function (template) {
			template.destroy();
		}, this);
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
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
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



BetaJS.Views.DynamicTemplate = BetaJS.Class.extend("DynamicTemplate", {
	
	constructor: function (parent, template_string) {
		this._inherited(BetaJS.Views.DynamicTemplate, "constructor");
		this.__parent = parent;
		this.__template = new BetaJS.Templates.Template(template_string);
		this.__instances = {};
		this.__instances_by_name = {};
	},
	
	reset: function () {
		BetaJS.Objs.iter(this.__instances, function (instance) {
			this.removeInstance(instance);
		}, this);
	},
	
	destroy: function () {
		this.reset();
		this._inherited(BetaJS.Views.DynamicTemplate, "destroy");
	},
	
	renderInstance: function (binder, options) {
		options = options || {};
		if (options["name"])
			this.removeInstanceByName(options["name"]);
		var instance = new BetaJS.Views.DynamicTemplateInstance(this, binder, options);
		this.__instances[instance.cid()] = instance;
		if (options["name"])
			this.__instances_by_name[name] = instance;
	},
	
	removeInstanceByName: function (name) {
		if (this.__instances_by_name[name])
			this.removeInstance(this.__instances_by_name[name]);
	},
	
	removeInstance: function (instance) {
		delete this.__instances[instance.cid()];
		delete this.__instances_by_name[instance.name()];
		instance.destroy();
	},
	
	view: function () {
		return this.__parent;
	},
	
	template: function () {
		return this.__template;
	}
	
});

BetaJS.Views.DynamicTemplateInstance = BetaJS.Class.extend("DynamicTemplateInstance", [
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Events.ListenMixin, {
		
	__bind: {
		attr: function (attribute, variable) {
			return this.__context.__bind_attribute(attribute, variable);
		},
		attrs: function (attributes) {
			var s = "";
			for (attribute in attributes)
				s += this.attr(attribute, attributes[attribute]) + " ";
			return s;
		},
		value: function (variable) {
			return this.__context.__bind_value(variable);
		},
		inner: function (variable) {
			return this.__context.__bind_inner(variable);
		}
	},
	
	__new_element: function (base) {
		var id = BetaJS.Ids.uniqueId();
		this.__elements[id] = BetaJS.Objs.extend({
			id: id,
			$el: null
		}, base);
		return this.__elements[id];
	},
	
	__decompose_variable: function (variable) {
		var parts = variable.split(".");
		return {
			object: parts.length == 1 ? this.__parent.view() : this.__args[parts[0]],
			key: parts.length == 1 ? variable : parts[1]
		};
	},
	
	__get_variable: function (variable) {
		var dec = this.__decompose_variable(variable);
		return dec.object.get(dec.key);
	},
	
	__set_variable: function (variable, value) {
		var dec = this.__decompose_variable(variable);
		return dec.object.set(dec.key, value);
	},

	__update_element: function (element) {
		var value = this.__get_variable(element.variable);
		if (element.type == "inner")
			element.$el.html(value)
		else if (element.type == "value")
			element.$el.val(value)
		else if (element.type == "attribute")
			element.$el.attr(element.attribute, value);
	},
	
	__prepare_element: function (element) {
		var self = this;
		element.$el = this.$el.find(element.selector);
		if (element.type == "inner")
			this.__update_element(element);
		else if (element.type == "value")
			element.$el.on("change input keyup paste", function () {
				self.__set_variable(element.variable, element.$el.val());
			});
	},
	
	__bind_attribute: function (attribute, variable) {
		var element = this.__new_element({
			type: "attribute",
			attribute: attribute,
			variable: variable
		});
		var selector = "data-bind-" + attribute + "='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector + " " + attribute + "='" + dec.object.get(dec.key) + "'";
	},
	
	__bind_value: function (variable) {
		var element = this.__new_element({
			type: "value",
			variable: variable
		});
		var selector = "data-bind-value='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector + " value='" + dec.object.get(dec.key) + "'";
	},

	__bind_inner: function (variable) {
		var element = this.__new_element({
			type: "inner",
			variable: variable
		});
		var selector = "data-bind-inner='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector;
	},

	constructor: function (parent, binder, options) {
		this._inherited(BetaJS.Views.DynamicTemplateInstance, "constructor");
		this.__elements = {};
		this.__inners = {};
		options = options || {};
		if (options["name"])
			this.__name = name;
		this.__parent = parent;
		this.$el = binder;
		this.__args = BetaJS.Objs.extend(options["args"] || {}, this.__parent.view().templateArguments());
		this.__args.bind = BetaJS.Objs.extend({__context: this}, this.__bind);
		this.$el.html(parent.template().evaluate(this.__args));
		BetaJS.Objs.iter(this.__elements, function (element) { this.__prepare_element(element); }, this);
	},
	
	destroy: function () {
		BetaJS.Objs.iter(this.__elements, function (element) {
			element.$el.off();
		}, this);
		this._inherited(BetaJS.Views.DynamicTemplateInstance, "destroy");
	}
	
}]);
