/*!
  betajs - v0.0.1 - 2013-03-14
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*
 * TODO:
 *   - Templating System
 *   - Partial Invalidation
 *   - Model / Property Dependence
 *   - Partial Templates
 */

BetaJS.Views = BetaJS.Views || {};

BetaJS.Views.View = BetaJS.Class.extend("View", [BetaJS.Events.EventsMixin, BetaJS.Ids.ClientIdMixin, {
	
	_events: function () {
		// [{"event selector": "function"}]
		return [];
	},
	
	_render: function () {
		this.$el.html(this.__render_string);
	},
	

	_setOption: function (options, key, value, prefix) {
		var prefix = prefix ? prefix : "__";
		this[prefix + key] = key in options ? options[key] : value;
	},
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.View, "constructor");
		this._setOption(options, "el", null);
		this._setOption(options, "visible", true);
		this._setOption(options, "attributes", {});
		this._setOption(options, "render_string", "");
		this._setOption(options, "events", []);
		this.__old_attributes = {};
		this.__parent = null;
		this.__children = {};
		this.__active = false;
		this.$el = null;
		this.__events = this._events().concat(this.__events);
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
		if (this.__running)
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
	
	addChild: function (child) {
		if (!this.hasChild(child)) {
			this.__children[child.cid()] = child;
			child.setParent(this);
		}
	},
	
	removeChild: function (child) {
		if (this.hasChild(child)) {
			delete this.__children[child.cid()];
			child.setParent(null);
		}
	}
	
}]);

BetaJS.Views.BIND_EVENT_SPLITTER = /^(\S+)\s*(.*)$/;
