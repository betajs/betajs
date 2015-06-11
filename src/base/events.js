Scoped.define("module:Events.EventsMixin", [
                                            "module:Timers.Timer",
                                            "module:Async",
                                            "module:Lists.LinkedList",
                                            "module:Functions",
                                            "module:Types",
                                            "module:Objs"
                                            ], function (Timer, Async, LinkedList, Functions, Types, Objs) {

	return {

		EVENT_SPLITTER: /\s+/,

		__create_event_object: function (callback, context, options) {
			options = options || {};
			var obj = {
					callback: callback,
					context: context
			};
			if (options.eventually)
				obj.eventually = options.eventually;
			if (options.min_delay)
				obj.min_delay = new Timer({
					delay: options.min_delay,
					once: true,
					start: false,
					context: this,
					fire: function () {
						if (obj.max_delay)
							obj.max_delay.stop();
						obj.callback.apply(obj.context || this, obj.params);
					}
				});
			if (options.max_delay)
				obj.max_delay = new Timer({
					delay: options.max_delay,
					once: true,
					start: false,
					context: this,
					fire: function () {
						if (obj.min_delay)
							obj.min_delay.stop();
						obj.callback.apply(obj.context || this, obj.params);
					}
				});
			return obj;
		},

		__destroy_event_object: function (object) {
			if (object.min_delay)
				object.min_delay.destroy();
			if (object.max_delay)
				object.max_delay.destroy();
		},

		__call_event_object: function (object, params) {
			if (object.min_delay)
				object.min_delay.restart();
			if (object.max_delay)
				object.max_delay.start();
			if (!object.min_delay && !object.max_delay) {
				if (object.eventually)
					Async.eventually(object.callback, params, object.context || this);
				else
					object.callback.apply(object.context || this, params);
			} else
				object.params = params;
		},

		on: function(events, callback, context, options) {
			this.__events_mixin_events = this.__events_mixin_events || {};
			events = events.split(this.EVENT_SPLITTER);
			var event;
			while (true) {
				event = events.shift();
				if (!event)
					break;
				if (!this.__events_mixin_events[event])
					this._notify("register_event", event);
				this.__events_mixin_events[event] = this.__events_mixin_events[event] || new LinkedList();
				this.__events_mixin_events[event].add(this.__create_event_object(callback, context, options));
			}
			return this;
		},

		off: function(events, callback, context) {
			this.__events_mixin_events = this.__events_mixin_events || {};
			if (events) {
				events = events.split(this.EVENT_SPLITTER);
				Objs.iter(events, function (event) {
					if (this.__events_mixin_events[event]) {
						this.__events_mixin_events[event].remove_by_filter(function (object) {
							var result = (!callback || object.callback == callback) && (!context || object.context == context);
							if (result && this.__destroy_event_object)
								this.__destroy_event_object(object);
							return result;
						});
						if (this.__events_mixin_events[event].count() === 0) {
							this.__events_mixin_events[event].destroy();
							delete this.__events_mixin_events[event];
							this._notify("unregister_event", event);
						}
					}
				}, this);
			} else {
				Objs.iter(this.__events_mixin_events, function (evntobj, evnt) {
					evntobj.remove_by_filter(function (object) {
						var result = (!callback || object.callback == callback) && (!context || object.context == context);
						if (result && this.__destroy_event_object)
							this.__destroy_event_object(object);
						return result;
					});
					if (evntobj.count() === 0) {
						evntobj.destroy();
						delete this.__events_mixin_events[evnt];
						this._notify("unregister_event", evnt);
					}
				}, this);
			}
			return this;
		},

		triggerAsync: function () {
			var self = this;
			var args = Functions.getArguments(arguments);
			var timeout = setTimeout(function () {
				clearTimeout(timeout);
				self.trigger.apply(self, args);
			}, 0);
		},

		trigger: function(events) {
			var self = this;
			events = events.split(this.EVENT_SPLITTER);
			var rest = Functions.getArguments(arguments, 1);
			var event;
			if (!this.__events_mixin_events)
				return this;
			Objs.iter(events, function (event) {
				if (this.__events_mixin_events[event])
					this.__events_mixin_events[event].iterate(function (object) {
						self.__call_event_object(object, rest);
					});
				if (this.__events_mixin_events && "all" in this.__events_mixin_events)
					this.__events_mixin_events.all.iterate(function (object) {
						self.__call_event_object(object, [event].concat(rest));
					});
			}, this);
			return this;
		},

		once: function (events, callback, context, options) {
			var self = this;
			var once = Functions.once(function() {
				self.off(events, once);
				callback.apply(this, arguments);
			});
			once._callback = callback;
			return this.on(events, once, context, options);
		},

		delegateEvents: function (events, source, prefix, params) {
			params = params || []; 
			prefix = prefix ? prefix + ":" : "";
			if (events === null) {
				source.on("all", function (event) {
					var rest = Functions.getArguments(arguments, 1);
					this.trigger.apply(this, [prefix + event].concat(params).concat(rest));
				}, this);
			} else {
				if (!Types.is_array(events))
					events = [events];
				Objs.iter(events, function (event) {
					source.on(event, function () {
						var rest = Functions.getArguments(arguments);
						this.trigger.apply(this, [prefix + event].concat(params).concat(rest));
					}, this);
				}, this);
			}
		}

	};
});


Scoped.define("module:Events.Events", ["module:Class", "module:Events.EventsMixin"], function (Class, Mixin, scoped) {
	return Class.extend({scoped: scoped}, Mixin);
});


Scoped.define("module:Events.ListenMixin", ["module:Ids", "module:Objs"], function (Ids, Objs) {
	return {

		_notifications: {
			"destroy": "listenOff" 
		},

		listenOn: function (target, events, callback, options) {
			if (!this.__listen_mixin_listen) this.__listen_mixin_listen = {};
			this.__listen_mixin_listen[Ids.objectId(target)] = target;
			target.on(events, callback, this, options);
		},

		listenOnce: function (target, events, callback, options) {
			if (!this.__listen_mixin_listen) this.__listen_mixin_listen = {};
			this.__listen_mixin_listen[Ids.objectId(target)] = target;
			target.once(events, callback, this, options);
		},

		listenOff: function (target, events, callback) {
			if (!this.__listen_mixin_listen)
				return;
			if (target) {
				target.off(events, callback, this);
				if (!events && !callback)
					delete this.__listen_mixin_listen[Ids.objectId(target)];
			}
			else
				Objs.iter(this.__listen_mixin_listen, function (obj) {
					if (obj && "off" in obj)
						obj.off(events, callback, this);
					if (!events && !callback)
						delete this.__listen_mixin_listen[Ids.objectId(obj)];
				}, this);
		}		

	};
});


Scoped.define("module:Events.Listen", ["module:Class", "module:Events.ListenMixin"], function (Class, Mixin, scoped) {
	return Class.extend({scoped: scoped}, Mixin);
});