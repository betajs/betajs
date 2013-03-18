/*!
  betajs - v0.0.1 - 2013-03-18
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*
 * Inspired by Underscore's Templating Engine
 * (which itself is inspired by John Resig's implementation)
 */

BetaJS.Templates = {
	
	tokenize: function (s) {
		var tokens = [];
		var index = 0;
		s.replace(BetaJS.Templates.SYNTAX_REGEX(), function(match, expr, esc, int, code, offset) {
			if (index + 1 < offset) 
				tokens.push({
					type: BetaJS.Templates.TOKEN_STRING,
					data: s.slice(index, offset).replace(BetaJS.Templates.ESCAPER_REGEX(), function(match) {
						return '\\' + BetaJS.Templates.ESCAPES[match];
					})
				});
			if (code)
				tokens.push({type: BetaJS.Templates.TOKEN_CODE, data: code});
			if (expr)
				tokens.push({type: BetaJS.Templates.TOKEN_EXPR, data: expr});
			if (int)
				tokens.push({type: BetaJS.Templates.TOKEN_INT, data: int});
			if (esc)
				tokens.push({type: BetaJS.Templates.TOKEN_ESC, data: esc});
		    index = offset + match.length;
		    return match;
		});
		return tokens;
	},
	
	/*
	 * options
	 * 	- callbacks (for internal operations)
	 *  - start_index: token start index
	 *  - end_index: token end index
	 */
	compile: function(source, options) {
		if (BetaJS.Types.is_string(source))
			source = this.tokenize(source);
		options = options || {};
		var callbacks = options.callbacks || {};
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
				case BetaJS.Templates.TOKEN_INT:
					with (callbacks) {
						var ret = eval(source[i].data);
						if (BetaJS.Types.is_defined(ret))
							result += ret.replace(BetaJS.Templates.ESCAPER_REGEX(), function(match) {
								return '\\' + BetaJS.Templates.ESCAPES[match];
							});
					}
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
	MODIFIER_ESC: "-",
	MODIFIER_INT: "!"
};

BetaJS.Templates.SYNTAX_REGEX = function () {
	var syntax = BetaJS.Templates.SYNTAX;
	if (!BetaJS.Templates.SYNTAX_REGEX_CACHED)
		BetaJS.Templates.SYNTAX_REGEX_CACHED = new RegExp(
			syntax.OPEN + syntax.MODIFIER_EXPR + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_ESC + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_INT + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_CODE + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			"$",
		'g');
	return BetaJS.Templates.SYNTAX_REGEX_CACHED;
}

BetaJS.Templates.ESCAPES = {
	"'":      "'",
	'\\':     '\\',
	'\r':     'r',
	'\n':     'n',
	'\t':     't',
	'\u2028': 'u2028',
	'\u2029': 'u2029'
};

BetaJS.Templates.ESCAPER_REGEX = function () {
	if (!BetaJS.Templates.ESCAPER_REGEX_CACHED)
		BetaJS.Templates.ESCAPER_REGEX_CACHED = new RegExp(BetaJS.Objs.keys(BetaJS.Templates.ESCAPES).join("|"), 'g');
	return BetaJS.Templates.ESCAPER_REGEX_CACHED;
}

BetaJS.Templates.TOKEN_STRING = 1;
BetaJS.Templates.TOKEN_CODE = 2;
BetaJS.Templates.TOKEN_EXPR = 3;
BetaJS.Templates.TOKEN_ESC = 4;
BetaJS.Templates.TOKEN_INT = 5;

BetaJS.Templates = BetaJS.Templates || {};


BetaJS.Templates.Template = BetaJS.Class.extend("Template", {
	
	constructor: function (template_string) {
		this._inherited(BetaJS.Templates.Template, "constructor");
		this.__tokens = BetaJS.Templates.tokenize(template_string);
		this.__compiled = BetaJS.Templates.compile(this.__tokens);
	},
	
	evaluate: function () {
		return this.__compiled.apply(this, arguments);
	}
	
}, {
	
	bySelector: function (selector) {
		return new BetaJS.Templates.Template($(selector).html());
	}
	
});
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
	
	getParent: function () {
		return this.__parent;
	},
	
	hasChild: function (child) {
		return child.cid() in this.__children;
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
	
	addChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.addChild(child);
		}, this);
	},
	
	addChild: function (child) {
		if (!this.hasChild(child)) {
			this.__children[child.cid()] = child;
			child.setParent(this);
		}
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
		}
	}
	
}]);

BetaJS.Views.BIND_EVENT_SPLITTER = /^(\S+)\s*(.*)$/;
