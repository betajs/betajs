/*!
  betajs - v0.0.1 - 2013-04-16
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*
 * Inspired by Underscore's Templating Engine
 * (which itself is inspired by John Resig's implementation)
 */

BetaJS.Templates = {
	
	tokenize: function (s) {
		// Already tokenized?
		if (BetaJS.Types.is_array(s))
			return s;
		var tokens = [];
		var index = 0;
		s.replace(BetaJS.Templates.SYNTAX_REGEX(), function(match, expr, esc, code, offset) {
			if (index < offset) 
				tokens.push({
					type: BetaJS.Templates.TOKEN_STRING,
					data: BetaJS.Strings.js_escape(s.slice(index, offset))
				});
			if (code)
				tokens.push({type: BetaJS.Templates.TOKEN_CODE, data: code});
			if (expr)
				tokens.push({type: BetaJS.Templates.TOKEN_EXPR, data: expr});
			if (esc)
				tokens.push({type: BetaJS.Templates.TOKEN_ESC, data: esc});
		    index = offset + match.length;
		    return match;
		});
		return tokens;
	},
	
	/*
	 * options
	 *  - start_index: token start index
	 *  - end_index: token end index
	 */
	compile: function(source, options) {
		if (BetaJS.Types.is_string(source))
			source = this.tokenize(source);
		options = options || {};
		var start_index = options.start_index || 0;
		var end_index = options.end_index || source.length;
		var result = "__p+='";
		for (var i = start_index; i < end_index; ++i) {
			switch (source[i].type) {
				case BetaJS.Templates.TOKEN_STRING:
					result += source[i].data;
					break;
				case BetaJS.Templates.TOKEN_CODE:
					result += "';\n" + source[i].data + "\n__p+='";
					break;
				case BetaJS.Templates.TOKEN_EXPR:
					result += "'+\n((__t=(" + source[i].data + "))==null?'':__t)+\n'";
					break;
				case BetaJS.Templates.TOKEN_ESC:
					result += "'+\n((__t=(" + source[i].data + "))==null?'':BetaJS.Strings.htmlentities(__t))+\n'";
					break;
			}	
		}
		result += "';\n";
		result = 'with(obj||{}){\n' + result + '}\n';
		result = "var __t,__p='',__j=Array.prototype.join," +
		  "echo=function(){__p+=__j.call(arguments,'');};\n" +
		  result + "return __p;\n";
		var func = new Function('obj', result);
		var func_call = function(data) {
			return func.call(this, data);
		};
		func_call.source = 'function(obj){\n' + result + '}';
		return func_call;
	}
		
};

BetaJS.Templates.SYNTAX = {
	OPEN: "{%",
	CLOSE: "%}",
	MODIFIER_CODE: "",
	MODIFIER_EXPR: "=",
	MODIFIER_ESC: "-"
};

BetaJS.Templates.SYNTAX_REGEX = function () {
	var syntax = BetaJS.Templates.SYNTAX;
	if (!BetaJS.Templates.SYNTAX_REGEX_CACHED)
		BetaJS.Templates.SYNTAX_REGEX_CACHED = new RegExp(
			syntax.OPEN + syntax.MODIFIER_EXPR + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_ESC + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_CODE + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			"$",
		'g');
	return BetaJS.Templates.SYNTAX_REGEX_CACHED;
}

BetaJS.Templates.TOKEN_STRING = 1;
BetaJS.Templates.TOKEN_CODE = 2;
BetaJS.Templates.TOKEN_EXPR = 3;
BetaJS.Templates.TOKEN_ESC = 4;

BetaJS.Templates = BetaJS.Templates || {};


BetaJS.Templates.Template = BetaJS.Class.extend("Template", {
	
	constructor: function (template_string) {
		this._inherited(BetaJS.Templates.Template, "constructor");
		this.__tokens = BetaJS.Templates.tokenize(template_string);
		this.__compiled = BetaJS.Templates.compile(this.__tokens);
	},
	
	evaluate: function (obj) {
		return this.__compiled.apply(this, [obj]);
	},
	
}, {
	
	bySelector: function (selector) {
		return new this($(selector).html());
	}
	
});
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
	
	_supp: function () {
		return {
			__context: this,
			css: function (key) {
				return this.__context.css(key);
			},
			attrs: function (obj) {
				var s = "";
				for (var key in obj)
					s += (obj[key] == null ? key : (key + "='" + obj[key] + "'")) + " ";
				return s;
			},
			selector: function (name) {
				return "data-selector='" + name + "' ";
			}
		}
	},
	
	templateArguments: function () {
		var args = this.getAll();
		args.supp = this._supp();
		return args;
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
	
	$subdata: function (elem, selectors) {
		var s = "";
		for (var key in selectors)
			s += "[data-" + key + "='" + selectors[key] + "']";
		return elem.find(s);
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

BetaJS.Templates.Cached = BetaJS.Templates.Cached || {};
BetaJS.Templates.Cached['holygrail-view-template'] = '<div data-selector="right" class=\'holygrail-view-right-container\'></div><div data-selector="left" class=\'holygrail-view-left-container\'></div><div data-selector="center" class=\'holygrail-view-center-container\'></div>';

BetaJS.Templates.Cached['list-container-view-item-template'] = '<div data-view-id="{%= cid %}" class="list-container-item"></div>';

BetaJS.Templates.Cached['button-view-template'] = '<{%= button_container_element %}class="button-view" {%= bind.inner("label") %}></{%= button_container_element %}>';

BetaJS.Templates.Cached['input-view-template'] = '<input class="input-view" {%= bind.value("value") %} {%= bind.attr("placeholder", "placeholder") %} />';

BetaJS.Templates.Cached['label-view-template'] = '<label class="label-view" {%= bind.inner("label") %}></label>';

BetaJS.Templates.Cached['text-area-template'] = '<textarea class="text-area-view" {%= bind.value("value") %} {%= bind.attr("placeholder", "placeholder") %}></textarea>';

BetaJS.Templates.Cached['list-view-template'] = '<{%= list_container_element %} {%= supp.attrs(list_container_attrs) %} {%= supp.css("list-view-function")%} {%= supp.css("list-view-layout")%} {%= supp.css("list-view-styling")%} data-selector="list"></{%= list_container_element %}>';
BetaJS.Templates.Cached['list-view-item-container-template'] = '<{%= item_container_element %} {%= supp.attrs(item_container_attrs) %} {%= supp.list_item_attr(item) %}></{%= item_container_element %}>';
BetaJS.Templates.Cached['list-view-item-template'] = '{%= item.get(item_label) %}';

BetaJS.Views.HolygrailView = BetaJS.Views.View.extend("HolygrailView", {
	_templates: {
		"default": BetaJS.Templates.Cached["holygrail-view-template"]
	},
	constructor: function (options) {
		this._inherited(BetaJS.Views.HolygrailView, "constructor", options);
		this.__left = null;
		this.__center = null;
		this.__right = null;
	},
	getLeft: function () {
		return this.__left;
	},
	setLeft: function (view) {
		this.__setView("left", view);
	},
	getCenter: function () {
		return this.__center;
	},
	setCenter: function (view) {
		this.__setView("center", view);
	},
	getRight: function () {
		return this.__right;
	},
	setRight: function (view) {
		this.__setView("right", view);
	},
	__setView: function(key, view) {
		// Remove old child in case we had one
		this.removeChild(this["__" + key]);
		// Set old child attribute to null
		this["__" + key] = null;
		// If we have a new view (i.e. set view was not called with null)
		if (view) {
			// bind new view to selector
			view.setEl('[data-selector="' + key + '"]');
			// store new view as child attribute and add the view
			this["__" + key] = this.addChild(view);
		}
	},
});
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
		if (this.isActive())
			this.$el.append(this.evaluateTemplate("item", {cid: child.cid()}));
		child.setEl("[data-view-id='" + child.cid() + "']");
	},
	__removeChildContainer: function (child) {
		this.$data("view-id", child.cid()).remove();
	}
});
BetaJS.Views.ButtonView = BetaJS.Views.View.extend("ButtonView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["button-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.ButtonView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "button_container_element", "button");
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click button": "__clickButton"
		}]);
	},
	__clickButton: function () {
		this.trigger("clicked");
	},
});
BetaJS.Views.InputView = BetaJS.Views.View.extend("InputView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["input-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.InputView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
	}
});
BetaJS.Views.LabelView = BetaJS.Views.View.extend("LabelView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["label-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.LabelView, "constructor", options);
		this._setOptionProperty(options, "label", "");
	}
});
BetaJS.Views.TextAreaView = BetaJS.Views.View.extend("TextAreaView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["text-area-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.TextAreaView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
	}
});
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
