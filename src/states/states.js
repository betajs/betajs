Scoped.define("module:States.Host", [
    "module:Properties.Properties", "module:Events.EventsMixin", "module:States.State", "module:Types", "module:Strings", "module:Classes.ClassRegistry"
], function(Class, EventsMixin, State, Types, Strings, ClassRegistry, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

        /**
         * State Machine Host Class
         * 
         * @class BetaJS.States.Host
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} options options for state host
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                options = options || {};
                this._stateRegistry = options.stateRegistry;
                this._baseState = options.baseState;
                this._enabled = true;
            },

            /**
             * Initialize state machine.
             * 
             * @param initial_state initial state as string or class
             * @param {object} initial_args initial arguments for state
             * 
             */
            initialize: function(initial_state, initial_args) {
                if (!this._stateRegistry) {
                    var s = null;
                    if (Types.is_string(initial_state) && initial_state.indexOf(".") >= 0) {
                        var split = Strings.splitLast(initial_state, ".");
                        initial_state = split.tail;
                        s = split.head;
                    } else if (!Types.is_string(initial_state))
                        s = Strings.splitLast(initial_state.classname, ".").head;
                    else
                        s = Strings.splitLast(this.cls.classname, ".").head;
                    this._stateRegistry = this._auto_destroy(new ClassRegistry(Scoped.getGlobal(s)));
                }
                this._createState(initial_state, initial_args).start();
                this._baseState = this._baseState || this._state.cls;
                return this;
            },

            /**
             * Creates a new state.
             * 
             * @protected
             * 
             * @param state state as string or class
             * @param {object} args arguments for state
             * @param {object} transitionals transitional arguments for state
             * 
             * @return {object} created state
             */
            _createState: function(state, args, transitionals) {
                return this._stateRegistry.create(state, this, args || {}, transitionals || {});
            },

            /**
             * Finalize current state.
             */
            finalize: function() {
                if (this._state)
                    this._state.end();
                this._state = null;
                return this;
            },

            /**
             * @override
             */
            destroy: function() {
                this.finalize();
                inherited.destroy.call(this);
            },

            /**
             * Enable the state machine.
             */
            enable: function() {
                this._enabled = true;
                return this;
            },

            /**
             * Disable the state machine.
             */
            disable: function() {
                this._enabled = false;
                return this;
            },

            /**
             * Returns the current state.
             * 
             * @return {object} current state
             */
            state: function() {
                return this._state;
            },

            /**
             * Returns the current state name.
             * 
             * @return {string} state name
             */
            state_name: function() {
                return this.state().state_name();
            },

            /**
             * Transitions to the next state
             * 
             * @return {object} next state
             */
            next: function() {
                return this.state() ? this.state().next.apply(this.state(), arguments) : this.initialize.apply(this, arguments);
            },

            /**
             * Weakly transitions to the next state
             * 
             * @return {object} next state
             */
            weakNext: function() {
                return this.state() ? this.state().weakNext.apply(this.state(), arguments) : this.initialize.apply(this, arguments);
            },

            /**
             * Starts a new state.
             * 
             * @protected
             * 
             * @param {object} state state to start
             */
            _start: function(state) {
                this._stateEvent(state, "before_start");
                this._state = state;
                this.set("name", state.state_name());
            },

            /**
             * Called after an event was started.
             * 
             * @protected
             * 
             * @param {object} state state in question
             */
            _afterStart: function(state) {
                this._stateEvent(state, "start");
            },

            /**
             * End a state.
             * 
             * @protected
             * 
             * @param {object} state state in question
             */
            _end: function(state) {
                this._stateEvent(state, "end");
                this._state = null;
            },

            /**
             * Called after an event was ended.
             * 
             * @protected
             * 
             * @param {object} state state in question
             */
            _afterEnd: function(state) {
                this._stateEvent(state, "after_end");
            },

            /**
             * Called when a transition to a state is taking place.
             * 
             * @protected
             * 
             * @param {object} state state in question
             */
            _next: function(state) {
                this._stateEvent(state, "next");
            },

            /**
             * Called after transitioning to a state.
             * 
             * @protected
             * 
             * @param {object} state state in question
             */
            _afterNext: function(state) {
                this._stateEvent(state, "after_next");
            },

            /**
             * Determines whether we can transition to a state
             * 
             * @protected
             * 
             * @param {object} state state in question
             * @return {boolean} true if we can transition
             */
            _can_transition_to: function(state) {
                return this._enabled;
            },

            /**
             * Triggers a state event.
             * 
             * @protected
             * 
             * @param {object} state state in question
             * @param {string} s name of event
             * @fires BetaJS.States.Host#event
             */
            _stateEvent: function(state, s) {
                /**
                 * @event BetaJS.States.Host#event
                 */
                this.trigger("event", s, state.state_name(), state.description());
                this.trigger(s, state.state_name(), state.description());
                this.trigger(s + ":" + state.state_name(), state.description());
            },

            /**
             * Registers a new state.
             * 
             * @param {string} state_name name of new state
             * @param {object} parent_state class of parent state we should inherit from
             * @param {object} extend extension of state class
             * 
             * @return {object} new state class
             */
            register: function(state_name, parent_state, extend) {
                if (!Types.is_string(parent_state)) {
                    extend = parent_state;
                    parent_state = null;
                }
                if (!this._stateRegistry)
                    this._stateRegistry = this._auto_destroy(new ClassRegistry(Strings.splitLast(this.cls.classname).head));
                var base = this._baseState ? (Strings.splitLast(this._baseState.classname, ".").head + "." + state_name) : (state_name.indexOf(".") >= 0 ? state_name : null);
                var cls = (this._stateRegistry.get(parent_state) || this._baseState || State).extend(base, extend);
                if (!base)
                    cls.classname = state_name;
                this._stateRegistry.register(Strings.last_after(state_name, "."), cls);
                return this;
            }

        };
    }]);
});


Scoped.define("module:States.State", [
    "module:Class", "module:Types", "module:Strings", "module:Async", "module:Objs"
], function(Class, Types, Strings, Async, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract State Class
         * 
         * @class BetaJS.States.State
         */
        return {

            _locals: [],
            _persistents: [],
            _defaults: {},
            _clonedDefaults: {},

            _white_list: null,

            _starting: false,
            _started: false,
            _stopped: false,
            _transitioning: false,
            __next_state: null,
            __suspended: 0,

            /**
             * Creates a new instance.
             * 
             * @param {object} host state host
             * @param {object} args arguments for creating the state
             * @param {object} transitionals transitionals variables
             */
            constructor: function(host, args, transitionals) {
                inherited.constructor.call(this);
                this.host = host;
                this.transitionals = transitionals;
                args = Objs.extend(Objs.extend(Objs.clone(this._clonedDefaults || {}, -1), Objs.clone(this._defaults || {}, 1)), args);
                this._locals = Types.is_function(this._locals) ? this._locals() : this._locals;
                var used = {};
                for (var i = 0; i < this._locals.length; ++i) {
                    this["_" + this._locals[i]] = args[this._locals[i]];
                    used[this._locals[i]] = true;
                }
                this._persistents = Types.is_function(this._persistents) ? this._persistents() : this._persistents;
                for (i = 0; i < this._persistents.length; ++i) {
                    this["_" + this._persistents[i]] = args[this._persistents[i]];
                    used[this._locals[i]] = true;
                }
                host.suspendEvents();
                this.__hostArgs = {};
                Objs.iter(args, function(value, key) {
                    if (!used[key]) {
                        this.__hostArgs[key] = true;
                        host.set(key, value);
                    }
                }, this);
                host.resumeEvents();
            },

            /**
             * Returns all attributes of the state.
             * 
             * @return {object} all attributes
             */
            allAttr: function() {
                var result = Objs.clone(this.host.data(), 1);
                Objs.iter(this._locals, function(key) {
                    result[key] = this["_" + key];
                }, this);
                Objs.iter(this._persistents, function(key) {
                    result[key] = this["_" + key];
                }, this);
                return result;
            },

            /**
             * Returns the name of state.
             * 
             * @return {string} name of state
             */
            state_name: function() {
                return Strings.last_after(this.cls.classname, ".");
            },

            /**
             * Returns the description of state.
             * 
             * @return {string} description of state
             */
            description: function() {
                return this.state_name();
            },

            /**
             * Starts the state.
             */
            start: function() {
                if (this._starting)
                    return this;
                this._starting = true;
                this.host._start(this);
                this._start();
                if (this.host) {
                    this.host._afterStart(this);
                    this._started = true;
                }
                return this;
            },

            /**
             * Ends the state.
             */
            end: function() {
                if (this._stopped)
                    return this;
                this._stopped = true;
                this._end();
                this.host._end(this);
                this.host._afterEnd(this);
                this.destroy();
                return this;
            },

            /**
             * Eventually transitions to the next state.
             * 
             * @param {string} state_name name of next state
             * @param {object} args arguments for creating the state
             * @param {object} transitionals transitionals variables
             * 
             * @return {object} next state
             */
            eventualNext: function(state_name, args, transitionals) {
                this.suspend();
                var state = this.next(state_name, args, transitionals);
                this.eventualResume();
                return state;
            },

            /**
             * Eventually transitions to the next state.
             * 
             * @param {string} state_name name of next state
             * @param {object} args arguments for creating the state
             * @param {object} transitionals transitionals variables
             * 
             * @return {object} next state
             */
            next: function(state_name, args, transitionals) {
                if (!this._starting || this._stopped || this.__next_state)
                    return null;
                args = args || {};
                for (var i = 0; i < this._persistents.length; ++i) {
                    if (!(this._persistents[i] in args))
                        args[this._persistents[i]] = this["_" + this._persistents[i]];
                }
                var obj = this.host._createState(state_name, args, transitionals);
                if (!this.can_transition_to(obj)) {
                    obj.destroy();
                    return null;
                }
                if (!this._started) {
                    this.host._afterStart(this);
                    this._started = true;
                }
                this.__next_state = obj;
                this._transitioning = true;
                this._transition();
                if (this.__suspended <= 0)
                    this.__next();
                return obj;
            },

            /**
             * Checks weakly whether a prospective new state is equal to this state.
             * 
             * @param {string} state_name name of next state
             * @param {object} args arguments for creating the state
             * @param {object} transitionals transitionals variables
             * 
             * @return {boolean} true if equal
             */
            weakSame: function(state_name, args, transitionals) {
                var same = true;
                if (state_name !== this.state_name())
                    same = false;
                var all = this.allAttr();
                Objs.iter(args, function(value, key) {
                    if (all[key] !== value)
                        same = false;
                }, this);
                return same;
            },

            /**
             * Weakly transitions to the next state.
             * 
             * @param {string} state_name name of next state
             * @param {object} args arguments for creating the state
             * @param {object} transitionals transitionals variables
             * 
             * @return {object} next state
             */
            weakNext: function(state_name, args, transitionals) {
                return this.weakSame.apply(this, arguments) ? this : this.next.apply(this, arguments);
            },

            __next: function() {
                var host = this.host;
                var obj = this.__next_state;
                host._next(obj);
                var hostArgs = this.__hostArgs;
                this.end();
                obj.start();
                host.suspendEvents();
                obj = host.state();
                if (!obj || obj.destroyed())
                    return;
                Objs.iter(hostArgs, function(dummy, key) {
                    if (!obj.__hostArgs[key])
                        host.unset(key);
                }, this);
                host.resumeEvents();
                host._afterNext(obj);
            },

            _transition: function() {},

            /**
             * Suspends the state.
             */
            suspend: function() {
                this.__suspended++;
                return this;
            },

            /**
             * Eventually resumes the state.
             */
            eventualResume: function() {
                Async.eventually(this.resume, this);
                return this;
            },

            /**
             * Resumes the state.
             */
            resume: function() {
                this.__suspended--;
                if (this.__suspended === 0 && !this._stopped && this.__next_state)
                    this.__next();
                return this;
            },

            /**
             * Determines whether the state can transition to another state.
             * 
             * @param {object} state another state
             * 
             * @return {boolean} true if it can transition
             */
            can_transition_to: function(state) {
                return this.host && this.host._can_transition_to(state) && this._can_transition_to(state);
            },

            _start: function() {},

            _end: function() {},

            _can_transition_to: function(state) {
                return !Types.is_array(this._white_list) || Objs.contains_value(this._white_list, state.state_name());
            }

        };
    }, {

        _extender: {
            _defaults: function(base, overwrite) {
                return Objs.extend(Objs.clone(base, 1), overwrite);
            }
        }

    });
});


Scoped.define("module:States.StateRouter", [
    "module:Class", "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * State Router Class
         * 
         * @class BetaJS.States.StateRouter
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} host state host
             */
            constructor: function(host) {
                inherited.constructor.call(this);
                this._host = host;
                this._routes = [];
                this._states = {};
            },

            /**
             * Register a route.
             * 
             * @param {string} route route to be registered
             * @param {string} state state to be registered
             * @param {array} mapping optional argument mapping
             */
            registerRoute: function(route, state, mapping) {
                var descriptor = {
                    key: route,
                    route: new RegExp("^" + route + "$"),
                    state: state,
                    mapping: mapping || []
                };
                this._routes.push(descriptor);
                this._states[state] = descriptor;
                return this;
            },

            /**
             * Read a route from a state object.
             * 
             * @param {object} stateObject state object
             * 
             * @return {string} corresponding route
             */
            readRoute: function(stateObject) {
                var descriptor = this._states[stateObject.state_name()];
                if (!descriptor)
                    return null;
                var regex = /\(.*?\)/;
                var route = descriptor.key;
                Objs.iter(descriptor.mapping, function(arg) {
                    route = route.replace(regex, stateObject["_" + arg]);
                }, this);
                return route;
            },

            /**
             * Parses a route.
             * 
             * @param {string} route route to be parsed
             * 
             * @return {object} state and argument descriptor
             */
            parseRoute: function(route) {
                for (var i = 0; i < this._routes.length; ++i) {
                    var descriptor = this._routes[i];
                    var result = descriptor.route.exec(route);
                    if (result === null)
                        continue;
                    var args = {};
                    for (var j = 0; j < descriptor.mapping.length; ++j)
                        args[descriptor.mapping[j]] = result[j + 1];
                    return {
                        state: descriptor.state,
                        args: args
                    };
                }
                return null;
            },

            /**
             * Returns the current route.
             * 
             * @return {string} current route
             */
            currentRoute: function() {
                return this.readRoute(this._host.state());
            },

            /**
             * Navigate to a route.
             * 
             * @param {string} route route to be navigated to
             */
            navigateRoute: function(route) {
                var parsed = this.parseRoute(route);
                if (parsed)
                    this._host.next(parsed.state, parsed.args);
                return this;
            }

        };
    });
});