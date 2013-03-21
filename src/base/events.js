BetaJS.Events = {};

BetaJS.Events.EVENT_SPLITTER = /\s+/;

BetaJS.Events.EventsMixin = {
	
	on: function(events, callback, context) {
		this.__events = this.__events || {};
		events = events.split(BetaJS.Events.EVENT_SPLITTER);
		var event;
		while (event = events.shift()) {
			this.__events[event] = this.__events[event] || new BetaJS.Lists.LinkedList();
			this.__events[event].add({
				callback: callback,
				context: context
			});
		}
		return this;
	},
	
	off: function(events, callback, context) {
		this.__events = this.__events || {};
		events = events.split(BetaJS.Events.EVENT_SPLITTER);
		var event;
		while (event = events.shift())
			if (this.__events[event]) {
				this.__events[event].remove_by_filter(function (object) {
					return (!callback || object.callback == callback) && (!context || object.context == context);
				});
				if (this.__events[event].count() == 0) {
					this.__events[event].destroy();
					delete this.__events[event];
				}
			}
		return this;
	},

    trigger: function(events) {
    	var self = this;
    	events = events.split(BetaJS.Events.EVENT_SPLITTER);
    	var rest = Array.prototype.slice.call(arguments, 1);
		var event;
		if (!this.__events)
			return;
    	while (event = events.shift()) {
    		if (this.__events[event])
    			this.__events[event].iterate(function (object) {
    				object.callback.apply(object.context || self, rest);
    			});
    		if (this.__events["all"])
    			this.__events["all"].iterate(function (object) {
    				object.callback.apply(object.context || self, rest);
    			});
    	};
    	return this;
    },
    
    once: function (events, callback, context) {
        var self = this;
        var once = BetaJS.Functions.once(function() {
          self.off(events, once);
          callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    }    
	
};

BetaJS.Events.Events = BetaJS.Class.extend("Events", BetaJS.Events.EventsMixin);



BetaJS.Events.ListenMixin = {
		
	listenOn: function (target, events, callback) {
		if (!this.__listen) this.__listen = {};
		this.__listen[BetaJS.Ids.objectId(target)] = target;
		target.on(events, callback, this);
	},
	
	listenOnce: function (target, events, callback) {
		if (!this.__listen) this.__listen = {};
		this.__listen[BetaJS.Ids.objectId(target)] = target;
		target.once(events, callback, this);
	},
	
	listenOff: function (target, events, callback) {
		if (!this.__listen)
			return;
		if (target) {
			target.off(events, callback, this);
			if (!events && !callback)
				delete this.__listen[BetaJS.Ids.objectId(target)];
		}
		else
			BetaJS.Objs.iter(this.__listen, function (obj) {
				obj.off(events, callback, this);
				if (!events && !callback)
					delete this.__listen[BetaJS.Ids.objectId(obj)];
			}, this);
	}
	
}

BetaJS.Events.Listen = BetaJS.Class.extend("Listen", BetaJS.Events.ListenMixin)


BetaJS.Events.PropertiesMixin = BetaJS.Objs.extend({
	
	get: function (key) {
		return this.__properties ? this.__properties[key] : null;
	},
	
	set: function (key, value) {
		if (!this.__properties) 
			this.__properties = {};
		if ((! key in this.__properties) || (this.__properties[key] != value)) {
			this.__properties[key] = value;
			this.trigger("change");
			this.trigger("change:" + key);
		}
	},
	
	getAll: function () {
		return BetaJS.Objs.clone(this.__properties || {}, 1);
	},
	
	setAll: function (obj) {
		for (var key in obj)
			this.set(key, obj[key]);
	}
	
}, BetaJS.Events.EventsMixin);

BetaJS.Events.Properties = BetaJS.Class.extend("Properties", [BetaJS.Events.PropertiesMixin, {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Events.Properties, "constructor");
		if (obj)
			this.setAll(obj);
	}
	
}]);