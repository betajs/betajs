BetaJS.$ = jQuery || null;

/** @class */
BetaJS.Class.extend("BetaJS.Views.View", [
    BetaJS.Events.EventsMixin,                                            
	BetaJS.Events.ListenMixin,
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Properties.PropertiesMixin,
	/** @lends BetaJS.Views.View.prototype */
	{
    
    /** Returns all templates to be pre-loaded.
     * <p>It should return an associative array of templates. The keys are user-defined identifiers, the values are either the template strings or a jquery object containing the template.</p>
     * @return associative array of templates
     * @example
     * return {
     * 	"default": BetaJS.Templates.Cached["my-view-template"],
     *  "inner": $("#inner-template"),
     *  "item": '< p >{%= item.get("text") %}< /p >'
     * }
     */
	_templates: function () {
		return {};
	},
	
    /** Returns all dynamics to be pre-loaded.
     * <p>It should return an associative array of dynamics. The keys are user-defined identifiers, the values are either the template strings or a jquery object containing the template.</p>
     * @return associative array of dynamics
     */
	_dynamics: function () {
		// {"name": "string" or jquery selector}
		return {};
	},
	
	/** Returns all events that the view is listening to.
	 * <p>It should return an associative array of event bindings. The keys are strings composed of the event name and the jquery selector that specifies to which elements the event should be bound to. The value is the name of the method that should be called when the event is fired.</p>
	 * <p>Note: It is also possible to return an array of associative arrays. You should do that if you want to bind more than one method to a single key.</p> 
	 * @return associative array of events
	 * @example
	 * return {
	 * 	"click #button": "_clickButton",
	 *  "change #input": "_inputChanged",
	 *  "blur": "_containerElementBlur"
	 * }  
	 */
	_events: function () {
		// [{"event selector": "function"}]
		return [];
	},
	
	/** Returns all default css classes that should be used for this view. 
	 * <p>They can be overwritten by the parent view or by options.
	 * The keys are internal identifiers that the view uses to lookup the css classed that are to be used.
	 * The values are the actual names of the css classes.</p>
	 * @return associative array of css classes
	 * @example
	 * return {
	 * 	"main-class": "default-main-class",
	 *  "item-class": "default-item-class"
	 * }
	 */
	_css: function () {
		// {"identifier": "css-class"}
		return {};
	},
	
	/** Returns css class by identifier.
	 * <p>The return strategy has the following priorities: options, parent, defaults.</p>
	 * @param ident identifier of class
	 * @example
	 * this.css("main_class")
	 */
	css: function (ident) {
		if (this.__css[ident])
			return this.__css[ident];
		if (this.__parent) {
			var css = this.__parent.css(ident);
			if (css && css != ident)
				return css;
		}
		var css = this._css();
		if (css[ident])
			return css[ident];
		return ident;
	},
	
	/** Is called by the view when the view needs to be rendered.
	 * <p>By default, the function renders the template or dynamic named "default" and passes the default arguments to it.</p>
	 * 
	 */
	_render: function () {
		if (this.__html)
			this.$el.html(this.__html)
		else if (this.__templates["default"])
			this.$el.html(this.evaluateTemplate("default", {}));
		else if (this.__dynamics["default"])
			this.evaluateDynamics("default", this.$el, {}, {name: "default"});
	},
	
	/** Returns a template associated with the view
	 * @param key identifier of template
	 * @return template object
	 */
	templates: function (key) {
		return key in this.__templates ? this.__templates[key] : null;
	},
	
	/** Returns a dynamic associated with the view
	 * @param key identifier of dynamic
	 * @return template object
	 */
	dynamics: function (key) {
		return key in this.__dynamics ? this.__dynamics[key] : null;
	},

	/** Support Routines for Templates and Dynamics
	 * <ul>
	 *  <li>supp.css(key): Returns css class associated with key</li>
	 *  <li>supp.attrs(obj): Returns html code for all html attributes specified by obj</li>
	 *  <li>supp.styles(obj): Returns html code for all styles specified by obj</li>
	 *  <li>supp.selector(name): Returns html code for data-selector='name'</li>
	 * </ul>
	 * @example
	 * < label class="{%= supp.css("main-class") %}" {%= supp.attrs({id: "test", title: "foo"}) %} {%= supp.selector("bar") %} > < /label >
	 * results in
	 * < label class="default-main-class" id="test" title="foo" data-selector="bar" > < /label >
	 */
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
			styles: function (obj) {
				var s = "";
				for (var key in obj)
					s += (key + ":" + obj[key] + "") + ";";
				return s;
			},
			selector: function (name) {
				return "data-selector='" + name + "' ";
			}
		}
	},
	
	/** Returns all arguments that are passed to every template by default.
	 * <p>By default, this function returns the support routines supp and all properties that have been set via this.set or that have been set via this._setOptionProperty</p>
	 * @return associative array of template arguments  
	 */
	templateArguments: function () {
		var args = this.getAll();
		args.supp = this._supp();
		return args;
	},
	
	/** Evaluates a template with used-defined arguments.
	 * 
	 * @param key identifier of template 
	 * @param args arguments to be given to the template (optional)
	 * @return html string of evaluated template
	 */
	evaluateTemplate: function (key, args) {
		args = args || {}
		return this.__templates[key].evaluate(BetaJS.Objs.extend(args, this.templateArguments()));
	},
	
	/** Evaluates a dynamic and binds it to a given element with used-defined arguments and options.
	 * 
	 * @param key identifier of dynamic
	 * @param element jquery element to which the dynamic should be bound to 
	 * @param args arguments to be given to the dynamic (optional)
	 * @param options options to be passed to the dynamic (name is the most important one, see documentation)
	 * @return dynamic instance
	 */
	evaluateDynamics: function (key, element, args, options) {
		return this.__dynamics[key].renderInstance(element, BetaJS.Objs.extend(options || {}, {args: args || {}}));
	},

	/** Sets private variable from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 * @param prefix (optional) per default is "__"
	 */
	_setOption: function (options, key, value, prefix) {
		var prefix = prefix ? prefix : "__";
		this[prefix + key] = (key in options) && (BetaJS.Types.is_defined(options[key])) ? options[key] : value;
	},
	
	/** Sets property variable (that will be passed to templates and dynamics by default) from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 */
	_setOptionProperty: function (options, key, value) {
		this.set(key, (key in options) && (BetaJS.Types.is_defined(options[key])) ? options[key] : value);
	},
	
	/** Creates a new view with options
	 * <ul>
	 *  <li>el: the element to which the view should bind to; either a jquery selector or a jquery element</li> 
	 *  <li>visible: (default true) should the view be visible initially</li>
	 *  <li>html: (default null) string that should be used as default rendering</li>
	 *  <li>events: (default []) events that should be used additionally</li>
	 *  <li>attributes: (default {}) attributes that should be attached to container</li>
	 *  <li>el_classes: (default []) css classes that should be attached to container</li>
	 *  <li>el_styles: (default {}) styles that should be attached to container</li>
	 *  <li>children_classes: (default []) css classes that should be attached to all direct children</li>
	 *  <li>children_styles: (default {}) styles that should be attached to all direct children</li>
	 *  <li>css: (default {}) css classes that should be overwritten</li>
	 *  <li>templates: (default {}) templates that should be overwritten</li>
	 *  <li>dynamics: (default: {}) dynamics that should be overwritten</li>
	 *  <li>properties: (default: {}) properties that should be added (and passed to templates and dynamics)</li>
	 *  <li>invalidate_on_change: (default: false) rerender view on property change</li>
	 *  <li>hide_on_leave: (default: false) hide view if focus leaves</li>
	 *  <li>invalidate_on_show: (default: false) invalidate view on show</li>
	 *  <li>append_to_el: (default: false) append to el instead of replacing content</li>
	 *  <li>vertical_center: (default: false) top:50% + margin-correction</li>
	 *  <li>horizontal_center: (default: false) left:50% + margin-correction</li>
	 * </ul>
	 * @param options options
	 */
	constructor: function (options) {
		options = options || {};
		this._inherited(BetaJS.Views.View, "constructor");
		this._setOption(options, "el", null);
		this._setOption(options, "visible", true);
		this._setOption(options, "html", null);
		this._setOption(options, "events", []);
		this._setOption(options, "attributes", {});
		this._setOption(options, "hide_on_leave", false);
		this._setOption(options, "vertical_center", false);
		this._setOption(options, "horizontal_center", false);
		this._setOption(options, "invalidate_on_show", false);
		this._setOption(options, "append_to_el", false);
		this.__old_attributes = {};
		this._setOption(options, "el_classes", []);
		if (BetaJS.Types.is_string(this.__el_classes))
			this.__el_classes = this.__el_classes.split(" ");
		this.__added_el_classes = [];
		this._setOption(options, "el_styles", {});
		this._setOption(options, "children_styles", {});
		this._setOption(options, "children_classes", []);
		if (BetaJS.Types.is_string(this.__children_classes))
			this.__children_classes = this.__children_classes.split(" ");
		this._setOption(options, "invalidate_on_change", false);
		this.__old_el_styles = {};
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
		if (this.__invalidate_on_change)
			this.on("change", function () {
				this.invalidate();
			}, this);
	},
	
	/** Returns whether this view is active (i.e. bound and rendered) 
	 * @return active  
	 */
	isActive: function () {
		return this.__active;
	},
	
	/** Activates view and all added sub views
	 *  
	 */
	activate: function () {
		if (this.isActive())
			return true;
		if (this.__el == null) 
			return false;
		if (this.__parent && !this.__parent.isActive())
			return false;
		if (this.__parent)
			this.$el = this.__el == "" ? this.__parent.$el : this.__parent.$(this.__el)
		else
			this.$el = BetaJS.$(this.__el);
		if (this.$el.size() == 0)
			this.$el = null;
		if (!this.$el)
			return false;
		if (this.__append_to_el) {
			this.$el.append("<div data-view-id='" + this.cid() + "'></div>");
			this.$el = this.$el.find("[data-view-id='" + this.cid() + "']");
		}
		this.__old_attributes = {};
		for (var key in this.__attributes) {
			var old_value = this.$el.attr(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_attributes[key] = old_value
			else
				this.__old_attributes[key] = null;
			this.$el.attr(key, this.__attributes[key]);
		}
		this.__added_el_classes = [];
		var new_el_classes = BetaJS.Objs.extend(this._el_classes(), this.__el_classes);
		for (var i = 0; i < new_el_classes.length; ++i)
			if (!this.$el.hasClass(new_el_classes[i])) {
				this.$el.addClass(new_el_classes[i]);
				this.__added_el_classes.push(new_el_classes[i]);
			}
		this.__old_el_styles = {};
		var new_el_styles = BetaJS.Objs.extend(this._el_styles(), this.__el_styles);
		for (var key in new_el_styles)  {
			var old_value = this.$el.css(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_el_styles[key] = old_value
			else
				this.__old_el_styles[key] = null;
			this.$el.css(key, new_el_styles[key]);
		}
		this.__bind();
		if (!this.__visible)
			this.$el.css("display", this.__visible ? "" : "none");
		this.__active = true;
		this.__render();
		if (this.__visible)
			this.__bind_hide_on_leave();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.activate();
		});
		if (this.__visible)
			this._after_show();
		if (this.__vertical_center)
			this.$el.css("margin-top", Math.round(-this.$el.height() / 2) + "px");
		if (this.__horizontal_center)
			this.$el.css("margin-left", Math.round(-this.$el.width() / 2) + "px");
		this._notify("activate");
		return true;
	},
	
	/** Deactivates view and all added sub views
	 * 
	 */
	deactivate: function () {
		if (!this.isActive())
			return false;
		this._notify("deactivate");
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.deactivate();
		});
		this.__active = false;
		if (this.__visible)
			this.__unbind_hide_on_leave();
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
		this.__unbind();
		this.$el.html("");
		for (var key in this.__old_attributes) 
			this.$el.attr(key, this.__old_attributes[key]);
		for (var i = 0; i < this.__added_el_classes.length; ++i)
			this.$el.removeClass(this.__added_el_classes[i]);
		for (var key in this.__old_el_styles) 
			this.$el.css(key, this.__old_el_styles[key]);
		if (this.__append_to_el)
			this.$el.remove();
		this.$el = null;
		return true;
	},
	
	/** Returns an associate array of styles that should be attached to the element
	 * @return styles
	 * @example
	 * return {"color": "red"};
	 * or
	 * var styles = {};
	 * styles.color = "red";
	 * return styles; 
	 */
	_el_styles: function () {
		return {};
	},
	
	/** Returns an array of classes that should be attached to the element
	 * @return classes
	 * @example
	 * return ["test-css-class"]
	 */
	_el_classes: function () {
		return [];
	},
	
	/** Finds an element within the container of the view
	 * @param selector a jquery selector
	 * @return the jquery element(s) it matched 
	 */
	$: function(selector) {
		return this.$el.find(selector);
	},
	
	/** Finds an element within a subelement that matches a set of data attributes
	 * 
	 * @param selectors associative array, e.g. {"selector": "container", "view-id": this.cid()}
	 * @param elem (optional, default is $el) the element we search in
	 * @return the jquery element(s) it matched
	 */
	$data: function(selectors, elem) {
		if (!elem)
			elem = this.$el
		var s = "";
		for (var key in selectors)
			s += "[data-" + key + "='" + selectors[key] + "']";
		return elem.find(s);
	},
	
	/** Destroys the view
	 * 
	 */
	destroy: function () {
		this.deactivate();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.destroy();
		});
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.destroy();
		}, this);
		BetaJS.Objs.iter(this.__templates, function (template) {
			template.destroy();
		}, this);
		this.trigger("destroy");
		this._inherited(BetaJS.Views.View, "destroy");
	},
	
	/** Makes the view visible
	 * 
	 */
	show: function () {
		this.setVisibility(true);
	},
	
	/** Makes the view invisible
	 * 
	 */
	hide: function () {
		this.setVisibility(false);
	},
	
	isVisible: function () {
		return this.__visible;
	},
	
	/** Sets the visibility of the view
	 * @param visible visibility
	 */
	setVisibility: function (visible) {
		if (visible == this.__visible)
			return;
		this.__visible = visible;
		if (this.isActive()) {
			this.$el.css("display", this.__visible ? "" : "none");
			if (this.__visible) {
				this.__bind_hide_on_leave();
				this._after_show();
			}
			else
				this.__unbind_hide_on_leave()
		}
		if (this.__parent)
			this.__parent.updateChildVisibility(this);	
	},
	
	updateChildVisibility: function (child) {		
	},
	
	_after_show: function () {	
		if (this.__invalidate_on_show)
			this.invalidate();	
	},
	
	toggle: function () {
		this.setVisibility(!this.isVisible());
	},
	
	__bind: function () {
		var self = this;
		this.__unbind();
		BetaJS.Objs.iter(this.__events, function (obj) {
			BetaJS.Objs.iter(obj, function (value, key) {
				var func = BetaJS.Types.is_function(value) ? value : self[value];
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
		var q = this.$el.children();
		if (!BetaJS.Types.is_empty(this.__children_styles))
			for (var key in this.__children_styles)
				q.css(key, this.__children_styles[key]);
		BetaJS.Objs.iter(this.__children_classes, function (cls) {
			q.addClass(cls);	
		});
	},
	
	/** Manually triggers rerendering of the view
	 * 
	 */
	invalidate: function () {
		if (!this.isActive())
			return;
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.deactivate();
		});
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
		this.__render();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.activate();
		});
	},
	
	/** Sets the container element of the view
	 * @param el new container element
 	 */
	setEl: function (el) {
		if (this.isActive()) {
			this.deactivate();
			this.__el = el;
			this.activate();
		}
		else
			this.__el = el;
	},
	
	/** Returns the parent view
	 * @return parent view
	 */
	getParent: function () {
		return this.__parent;
	},
	
	/** Checks whether a view has been added as a child
	 * 
 	 * @param child view in question
 	 * @return true if view has been added
	 */
	hasChild: function (child) {
		return child && child.cid() in this.__children;
	},
	
	/** Changes the parent view
	 * @param parent the new parent
	 */
	setParent: function (parent) {
		if (parent == this.__parent)
			return;
		this.deactivate();
		if (this.__parent) {
			this._unbindParent(this.__parent);
			var old_parent = this.__parent;
			this.__parent.off(null, null, this);
			this.__parent = null;
			old_parent.removeChild(this);
		}
		if (parent) {
			this.__parent = parent;
			parent.addChild(this);
			this._bindParent(parent);
			if (parent.isActive())
				this.activate();
		}
	},
	
	_bindParent: function () {		
	},

	_unbindParent: function () {		
	},
	
	/** Returns all child views
	 * @return array of child views 
	 */
	children: function () {
		var children = {};
		BetaJS.Objs.iter(this.__children, function (child, key) {
			children[key] = child.view;
		}, this);
		return children;
	},
	
	childOptions: function (child) {
		return this.__children[child.cid()].options;
	},
	
	/** Adds an array of child views
	 * 
 	 * @param children array of views
	 */
	addChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.addChild(child);
		}, this);
	},

	/** Adds a child view
	 * 
 	 * @param child view
	 */	
	addChild: function (child, options) {
		if (!this.hasChild(child)) {
			options = options || {};
			this.__children[child.cid()] = {
				view: child,
				options: options
			};
			this._notify("addChild", child, options);
			child.setParent(this);
			return child;
		}
		return null;
	},
	
	/** Removes an array of child views
	 * 
 	 * @param children array of views
	 */
	removeChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.removeChild(child);
		}, this);
	},
	
	/** Removes a child view
	 * 
 	 * @param child view
	 */	
	removeChild: function (child) {
		if (this.hasChild(child)) {
			delete this.__children[child.cid()];
			child.setParent(null);
			child.off(null, null, this);
			this._notify("removeChild", child);
		}
	},
	
	/** Returns the width (excluding margin, border, and padding) of the view
	 * @return width
	 */
	width: function () {
		return this.$el.width();
	},
	
	/** Returns the inner width (excluding margin, border, but including padding) of the view
	 * @return inner width
	 */
	innerWidth: function () {
		return this.$el.innerWidth();
	},

	/** Returns the outer width (including margin, border, and padding) of the view
	 * @return outer width
	 */
	outerWidth: function () {
		return this.$el.outerWidth();
	},

	/** Returns the height (excluding margin, border, and padding) of the view
	 * @return height
	 */
	height: function () {
		return this.$el.height();
	},
	
	/** Returns the inner height (excluding margin, border, but including padding) of the view
	 * @return inner height
	 */
	innerHeight: function () {
		return this.$el.innerHeight();
	},

	/** Returns the outer height (including margin, border, and padding) of the view
	 * @return outer height
	 */
	outerHeight: function () {
		return this.$el.outerHeight();
	},
	
	__bind_hide_on_leave: function () {
		if (!this.__hide_on_leave || this.__hide_on_leave_func)
			return;
		var el = this.$el.get(0);
		var self = this;
		this.__hide_on_leave_func = function (e) {
			if (self.__hide_on_leave_skip) {
				self.__hide_on_leave_skip = false;
				return;
			}
			if (document.contains(e.target) && e.target !== el && !$.contains(el, e.target))
				self.hide();
		};
		this.__hide_on_leave_skip = true;
		BetaJS.$(document.body).on("click", this.__hide_on_leave_func);
	},
	
	__unbind_hide_on_leave: function () {
		if (!this.__hide_on_leave || !this.__hide_on_leave_func)
			return;
		$(document.body).unbind("click", this.__hide_on_leave_func);
		delete this.__hide_on_leave_func;
	}

}]);

BetaJS.Views.BIND_EVENT_SPLITTER = /^(\S+)\s*(.*)$/;



BetaJS.Class.extend("BetaJS.Views.DynamicTemplate", {
	
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
		if (name in this.__instances_by_name)
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

BetaJS.Class.extend("BetaJS.Views.DynamicTemplateInstance", [
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
		},
		css_if: function (css, variable) {
			return this.__context.__bind_css_if(css, variable, true);
		},
		css_if_not: function (css, variable) {
			return this.__context.__bind_css_if(css, variable, false);
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
		else if (element.type == "value") {
			if (element.$el.val() != value)
				element.$el.val(value);
		} else if (element.type == "attribute")
			element.$el.attr(element.attribute, value)
		else if (element.type == "css") {
			if (!element.positive)
				value = !value;
			if (value)
				element.$el.addClass(this.__parent.view().css(element.css))
			else
				element.$el.removeClass(this.__parent.view().css(element.css));
		};
	},
	
	__prepare_element: function (element) {
		var self = this;
		element.$el = this.$el.find(element.selector);
		if (element.type == "inner" || element.type == "css")
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
	
	__bind_css_if: function (css, variable, positive) {
		var element = this.__new_element({
			type: "css",
			css: css,
			variable: variable,
			positive: positive
		});
		var selector = "data-bind-css-" + css + "='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector;
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
	},
	
	name: function () {
		return this.__name;
	}
	
}]);
