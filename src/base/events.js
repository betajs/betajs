Scoped.define("module:Events.EventsMixin", [
    "module:Timers.Timer",
    "module:Async",
    "module:Lists.LinkedList",
    "module:Functions",
    "module:Types",
    "module:Objs"
], function(Timer, Async, LinkedList, Functions, Types, Objs) {

    /**
     * Events Mixin
     * 
     * @mixin BetaJS.Events.EventsMixin
     */
    return {

        _implements: "3d63b44f-c9f0-4aa7-b39e-7cbf195122b4",

        _notifications: {
            "construct": function() {
                this.__suspendedEvents = 0;
                this.__suspendedEventsQueue = [];
            },
            "destroy": function() {
                this.off(null, null, null);
            }
        },

        EVENT_SPLITTER: /\s+/,

        __create_event_object: function(callback, context, options) {
            options = options || {};
            var obj = {
                callback: callback,
                context: context
            };
            if (options.eventually)
                obj.eventually = options.eventually;
            if (options.off_on_destroyed)
                obj.off_on_destroyed = options.off_on_destroyed;
            if (options.min_delay) {
                obj.min_delay = new Timer({
                    delay: options.min_delay,
                    once: true,
                    start: false,
                    context: this,
                    fire: function() {
                        if (obj.max_delay)
                            obj.max_delay.stop();
                        this.__invokeCallback(obj);
                    }
                });
            }
            if (options.max_delay) {
                obj.max_delay = new Timer({
                    delay: options.max_delay,
                    once: true,
                    start: false,
                    context: this,
                    fire: function() {
                        if (obj.min_delay)
                            obj.min_delay.stop();
                        this.__invokeCallback(obj);
                    }
                });
            }
            if (options.norecursion)
                obj.no_recursion = true;
            return obj;
        },

        __destroy_event_object: function(object) {
            if (object.min_delay)
                object.min_delay.destroy();
            if (object.max_delay)
                object.max_delay.destroy();
        },

        __invokeCallback: function(obj, params) {
            if (obj.off_on_destroyed && obj.context && obj.context.destroyed()) {
                this.off(null, null, obj);
                return;
            }
            if (obj.no_recursion && obj.in_recursion)
                return;
            obj.in_recursion = true;
            try {
                this._invokeCallback(obj.callback, obj.context || this, params || obj.params);
            } finally {
                obj.in_recursion = false;
            }
        },

        /**
         * @protected
         *
         * Invoke event callback
         *
         * @param {function} callback event callback function
         * @param {object} context callback context
         * @param {array} params parameters
         */
        _invokeCallback: function(callback, context, params) {
            callback.apply(context, params);
        },

        __call_event_object: function(object, params) {
            if (object.min_delay)
                object.min_delay.restart();
            if (object.max_delay)
                object.max_delay.start();
            if (!object.min_delay && !object.max_delay) {
                if (object.eventually) {
                    Async.eventually(function() {
                        this.__invokeCallback(object, params);
                    }, this, object.eventually === true ? 0 : object.eventually);
                } else
                    this.__invokeCallback(object, params);
            } else
                object.params = params;
        },

        /**
         * Listen to an event(s).
         * 
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         * @param {object} context optional callback context
         * @param {object} options optional options
         */
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
                var event_object = this.__create_event_object(callback, context, options);
                this.__events_mixin_events[event].add(event_object);
                if (this.__events_mixin_persistent_events && this.__events_mixin_persistent_events[event]) {
                    var argss = this.__events_mixin_persistent_events[event];
                    for (var i = 0; i < argss.length; ++i)
                        this.__call_event_object(event_object, argss[i]);
                }
                if (options && options.initcall)
                    this.__call_event_object(event_object, []);
            }
            return this;
        },

        /**
         * Stop listening to an event(s).
         * 
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         * @param {object} context optional callback context
         */
        off: function(events, callback, context) {
            this.__events_mixin_events = this.__events_mixin_events || {};
            if (events) {
                events = events.split(this.EVENT_SPLITTER);
                Objs.iter(events, function(event) {
                    if (this.__events_mixin_events[event]) {
                        this.__events_mixin_events[event].remove_by_filter(function(object) {
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
                Objs.iter(this.__events_mixin_events, function(evntobj, evnt) {
                    evntobj.remove_by_filter(function(object) {
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

        /**
         * Listen to an event(s) once.
         * 
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         * @param {object} context optional callback context
         * @param {object} options optional options
         */
        once: function(events, callback, context, options) {
            var self = this;
            var once = Functions.once(function() {
                self.off(events, once);
                callback.apply(this, arguments);
            });
            once._callback = callback;
            return this.on(events, once, context, options);
        },

        /**
         * Trigger an event(s) asynchronously.
         * 
         * @param {string} events events to be triggered
         */
        trigger: function(events) {
            if (this.__suspendedEvents > 0) {
                this.__suspendedEventsQueue.push(arguments);
                return this;
            }
            var self = this;
            events = events.split(this.EVENT_SPLITTER);
            var rest = Functions.getArguments(arguments, 1);
            var event;
            if (!this.__events_mixin_events)
                return this;
            Objs.iter(events, function(event) {
                if (this.__events_mixin_events[event])
                    this.__events_mixin_events[event].iterate(function(object) {
                        self.__call_event_object(object, rest);
                    });
                if (this.__events_mixin_events && "all" in this.__events_mixin_events)
                    this.__events_mixin_events.all.iterate(function(object) {
                        self.__call_event_object(object, [event].concat(rest));
                    });
            }, this);
            return this;
        },

        /**
         * Trigger an event(s) asynchronously.
         * 
         * @param {string} events events to be triggered
         */
        triggerAsync: function() {
            var self = this;
            var args = Functions.getArguments(arguments);
            var timeout = setTimeout(function() {
                clearTimeout(timeout);
                self.trigger.apply(self, args);
            }, 0);
            return this;
        },

        /**
         * Persistenly trigger an event(s).
         * 
         * @param {string} events events to be triggered
         */
        persistentTrigger: function(events) {
            var rest = Functions.getArguments(arguments, 1);
            this.__events_mixin_persistent_events = this.__events_mixin_persistent_events || [];
            Objs.iter(events.split(this.EVENT_SPLITTER), function(event) {
                this.__events_mixin_persistent_events[event] = this.__events_mixin_persistent_events[event] || [];
                this.__events_mixin_persistent_events[event].push(rest);
            }, this);
            this.trigger.apply(this, arguments);
            return this;
        },

        /**
         * Delegate certain events to this event object.
         * 
         * @param {string} events events to be delegated
         * @param {object} source source event object
         * @param {string} prefix optional event prefix for delegation
         * @param {array} params optional additional event params
         */
        delegateEvents: function(events, source, prefix, params) {
            params = params || [];
            prefix = prefix ? prefix + ":" : "";
            if (events === null) {
                source.on("all", function(event) {
                    var rest = Functions.getArguments(arguments, 1);
                    this.trigger.apply(this, [prefix + event].concat(params).concat(rest));
                }, this);
            } else {
                if (!Types.is_array(events))
                    events = [events];
                Objs.iter(events, function(event) {
                    source.on(event, function() {
                        var rest = Functions.getArguments(arguments);
                        this.trigger.apply(this, [prefix + event].concat(params).concat(rest));
                    }, this);
                }, this);
            }
            return this;
        },

        /**
         * Returns the parent event object in the chain.
         * 
         * @return {object} parent event object
         * 
         * @protected
         * @abstract
         */
        _eventChain: function() {},

        /**
         * Trigger an event locally and up the chain.
         * 
         * @param {string} eventName name of event
         * @param data event data
         */
        chainedTrigger: function(eventName, data) {
            data = Objs.extend({
                source: this,
                bubbles: true
            }, data);
            this.trigger(eventName, data);
            if (data.bubbles) {
                var chain = this._eventChain();
                if (chain && chain.chainedTrigger)
                    chain.chainedTrigger(eventName, data);
            }
            return this;
        },

        /**
         * Suspend all events until resumed.
         */
        suspendEvents: function() {
            this.__suspendedEvents++;
            return this;
        },

        /**
         * Resume all events.
         */
        resumeEvents: function() {
            this.__suspendedEvents--;
            if (this.__suspendedEvents !== 0)
                return this;
            Objs.iter(this.__suspendedEventsQueue, function(ev) {
                this.trigger.apply(this, ev);
            }, this);
            this.__suspendedEventsQueue = [];
            return this;
        }

    };
});


Scoped.define("module:Events.Events", ["module:Class", "module:Events.EventsMixin"], function(Class, Mixin, scoped) {
    /**
     * Events Class
     * 
     * @class BetaJS.Events.Events
     * @implements BetaJS.Events.EventsMixin
     */
    return Class.extend({
        scoped: scoped
    }, Mixin);
});


Scoped.define("module:Events.ListenMixin", [
    "module:Ids",
    "module:Objs",
    "module:Types"
], function(Ids, Objs, Types) {
    /**
     * Listen Mixin, automatically de-registering all listeners on destruction.
     * 
     * @mixin BetaJS.Events.ListenMixin
     */
    return {

        _notifications: {
            "destroy": "listenOff"
        },

        /**
         * Listen to an event.
         * 
         * @param {object} targets target(s) event emitter
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         * @param {object} options optional listener options
         */
        listenOn: function(targets, events, callback, options) {
            if (!this.__listen_mixin_listen)
                this.__listen_mixin_listen = {};
            if (!Types.is_array(targets))
                targets = [targets];
            targets.forEach(function(target) {
                this.__listen_mixin_listen[Ids.objectId(target)] = target;
                target.on(events, callback, this, options);
            }, this);
            return this;
        },

        /**
         * Listen to an event once.
         *
         * @param {object} targets target(s) event emitter
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         * @param {object} options optional listener options
         */
        listenOnce: function(targets, events, callback, options) {
            if (!this.__listen_mixin_listen)
                this.__listen_mixin_listen = {};
            if (!Types.is_array(targets))
                targets = [targets];
            targets.forEach(function(target) {
                this.__listen_mixin_listen[Ids.objectId(target)] = target;
                target.once(events, callback, this, options);
            }, this);
            return this;
        },

        /**
         * Stop Listenning to an event.
         *
         * @param {object} targets target(s) event emitter
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         */
        listenOff: function(targets, events, callback) {
            if (!this.__listen_mixin_listen)
                return this;
            if (!Types.is_array(targets))
                targets = [targets];
            targets.forEach(function(target) {
                if (target && !target.destroyed()) {
                    target.off(events, callback, this);
                    if (!events && !callback)
                        delete this.__listen_mixin_listen[Ids.objectId(target)];
                } else {
                    Objs.iter(this.__listen_mixin_listen, function(obj) {
                        if (obj && "off" in obj && !obj.destroyed())
                            obj.off(events, callback, this);
                        if (!events && !callback)
                            delete this.__listen_mixin_listen[Ids.objectId(obj)];
                    }, this);
                }
            }, this);
            return this;
        }

    };
});


Scoped.define("module:Events.Listen", ["module:Class", "module:Events.ListenMixin"], function(Class, Mixin, scoped) {
    /**
     * Listen Class
     * 
     * @class BetaJS.Events.Listen
     * @implements BetaJS.Events.ListenMixin
     */
    return Class.extend({
        scoped: scoped
    }, Mixin);
});