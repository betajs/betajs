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
    }
	
};

BetaJS.Events.Events = BetaJS.Class.extend("Events", BetaJS.Events.EventsMixin);
