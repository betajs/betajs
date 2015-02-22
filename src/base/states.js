Scoped.define("module:States.Host", [
	    "module:Class",
	    "module:Events.EventsMixin",
	    "module:States.State",
	    "module:Types",
	    "module:Strings",
	    "module:Classes.ClassRegistry"
	], function (Class, EventsMixin, State, Types, Strings, ClassRegistry, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {
		    	
		    constructor: function (options) {
		    	inherited.constructor.call(this);
		    	options = options || {};
		    	this._stateRegistry = options.stateRegistry;
		    	this._baseState = options.baseState;
		    },
		    	
		    initialize: function (initial_state, initial_args) {
		    	if (!this._stateRegistry) {
		    		if (Types.is_string(initial_state) && initial_state.indexOf(".") >= 0) {
		    			var split = Strings.splitLast(initial_state, ".");
		        		this._stateRegistry = this._auto_destroy(new ClassRegistry(Scoped.getGlobal(split.head)));
		        		initial_state = split.tail;
		    		} else
		    			this._stateRegistry = this._auto_destroy(new ClassRegistry(Scoped.getGlobal(Strings.splitLast(this.cls.classname, ".").head)));
		    	}
		    	this._createState(initial_state, initial_args).start();
				this._baseState = this._baseState || this._state.cls; 
		    },
		    
		    _createState: function (state, args, transitionals) {
		    	return this._stateRegistry.create(state, this, args || {}, transitionals || {});
		    },
		    
		    finalize: function () {
		        if (this._state)
		            this._state.destroy();
				this._state = null;    	
		    },
		    
		    destroy: function () {
		    	this.finalize();
		    	inherited.destroy.call(this);
		    },
		    
		    state: function () {
		        return this._state;
		    },
		    
		    state_name: function () {
		    	return this.state().state_name();
		    },
		    
		    next: function () {
		    	return this.state().next.apply(this.state(), arguments);
		    },
		    
		    _start: function (state) {
		        this._stateEvent(state, "before_start");
		        this._state = state;
		    },
		    
		    _afterStart: function (state) {
		        this._stateEvent(state, "start");
		    },
		    
		    _end: function (state) {
		        this._stateEvent(state, "end");
		        this._state = null;
		    },
		    
		    _afterEnd: function (state) {
		        this._stateEvent(state, "after_end");
		    },
		    
		    _next: function (state) {
		        this._stateEvent(state, "next");
		    },
		    
		    _afterNext: function (state) {
		        this._stateEvent(state, "after_next");
		    },
		    
		    _can_transition_to: function (state) {
		        return true;
		    },
		    
		    _stateEvent: function (state, s) {
		        this.trigger("event", s, state.state_name(), state.description());
		        this.trigger(s, state.state_name(), state.description());
		        this.trigger(s + ":" + state.state_name(), state.description());
		    },
		
			register: function (state_name, parent_state, extend) {
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
 	    "module:Class",
 	    "module:Types",
 	    "module:Strings",
 	    "module:Async",
 	    "module:Objs"
 	], function (Class, Types, Strings, Async, Objs, scoped) {
 	return Class.extend({scoped: scoped}, function (inherited) {
 		return {
                             		    	
		    _locals: [],
		    _persistents: [],
		    
		    _white_list: null,
		
		    constructor: function (host, args, transitionals) {
		    	inherited.constructor.call(this);
		        this.host = host;
		        this.transitionals = transitionals;
		        this._starting = false;
		        this._started = false;
		        this._stopped = false;
		        this._transitioning = false;
		        this.__next_state = null;
		        this.__suspended = 0;
		        args = args || {};
		        this._locals = Types.is_function(this._locals) ? this._locals() : this._locals;
		        for (var i = 0; i < this._locals.length; ++i)
		            this["_" + this._locals[i]] = args[this._locals[i]];
		        this._persistents = Types.is_function(this._persistents) ? this._persistents() : this._persistents;
		        for (i = 0; i < this._persistents.length; ++i)
		            this["_" + this._persistents[i]] = args[this._persistents[i]];
		    },
		
		    state_name: function () {
		        return Strings.last_after(this.cls.classname, ".");
		    },
		    
		    description: function () {
		        return this.state_name();
		    },
		    
		    start: function () {
		    	if (this._starting)
		    		return;
		        this._starting = true;
		        this.host._start(this);
		        this._start();
		        if (this.host) {
		            this.host._afterStart(this);
		            this._started = true;
		        }
		    },
		    
		    end: function () {
		    	if (this._stopped)
		    		return;
		    	this._stopped = true;
		        this._end();
		        this.host._end(this);
		        this.host._afterEnd(this);
		        this.destroy();
		    },
		    
		    eventualNext: function (state_name, args, transitionals) {
		    	this.suspend();
				this.next(state_name, args, transitionals);
				this.eventualResume();
		    },
		    
		    next: function (state_name, args, transitionals) {
		    	if (!this._starting || this._stopped || this.__next_state)
		    		return;
		        args = args || {};
		        for (var i = 0; i < this._persistents.length; ++i) {
		            if (!(this._persistents[i] in args))
		                args[this._persistents[i]] = this["_" + this._persistents[i]];
		        }
		        var obj = this.host._createState(state_name, args, transitionals);
		        if (!this.can_transition_to(obj)) {
		            obj.destroy();
		            return;
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
		    },
		    
		    __next: function () {
		        var host = this.host;
		        var obj = this.__next_state;
		        host._next(obj);
		        this.end();
		        obj.start();
		        host._afterNext(obj);
		    },
		    
		    _transition: function () {
		    },
		    
		    suspend: function () {
		    	this.__suspended++;
		    },
		    
		    eventualResume: function () {
		    	Async.eventually(this.resume, this);
		    },
		    
		    resume: function () {
		    	this.__suspended--;
		    	if (this.__suspended === 0 && !this._stopped && this.__next_state)
		    		this.__next();
		    },
		
		    can_transition_to: function (state) {
		        return this.host && this.host._can_transition_to(state) && this._can_transition_to(state);
		    },
		    
		    _start: function () {},
		    
		    _end: function () {},
		    
		    _can_transition_to: function (state) {
		        return !Types.is_array(this._white_list) || Objs.contains_value(this._white_list, state.state_name());
		    }
		    
 		};
 	});
});



Scoped.define("module:States.CompetingComposite", [
   	    "module:Class",
   	    "module:Objs"
   	], function (Class, Objs, scoped) {
   	return Class.extend({scoped: scoped}, {

	   	_register_host: function (competing_host) {
	        this._hosts = this._hosts || [];
	        this._hosts.push(this._auto_destroy(competing_host));
	    },
	    
	    other_hosts: function (competing_host) {
	        return Objs.filter(this._hosts || [], function (other) {
	            return other != competing_host;
	        }, this);
	    },
	    
	    _next: function (competing_host, state) {
	        var others = this.other_hosts(competing_host);
	        for (var i = 0; i < others.length; ++i) {
	            var other = others[i];
	            var other_state = other.state();
	            if (!other_state.can_coexist_with(state))
	                other_state.retreat_against(state);
	        }
	    }

   });
});


Scoped.define("module:States.CompetingHost", ["module:States.Host"], function (Host, scoped) {
   	return Host.extend({scoped: scoped}, function (inherited) {
   		return {
		
		    constructor: function (composite) {
		    	inherited.constructor.call(this);
		        this._composite = composite;
		        if (composite)
		            composite._register_host(this);
		    },
		    
		    composite: function () {
		        return this._composite;
		    },
		
		    _can_transition_to: function (state) {
		        if (!this._composite)
		            return true;
		        var others = this._composite.other_hosts(this);
		        for (var i = 0; i < others.length; ++i) {
		            var other = others[i];
		            var other_state = other.state();
		            if (!state.can_coexist_with(other_state) && !state.can_prevail_against(other_state))
		                return false;
		        }
		        return true;
		    },
		    
		    _next: function (state) {
		        if (this._composite)
		            this._composite._next(this, state);
		        inherited._next.call(this, state);
		    }
		    
   		};
   	});    
});


Scoped.define("module:States.CompetingState", ["module:States.State"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

	    can_coexist_with: function (foreign_state) {
	        return true;
	    },
	    
	    can_prevail_against: function (foreign_state) {
	        return false;
	    },
	    
	    retreat_against: function (foreign_state) {
	    }
    
   	});
});


Scoped.define("module:States.StateRouter", ["module:Class", "module:Objs"], function (Class, Objs, scoped) {
   	return Class.extend({scoped: scoped}, function (inherited) {
   		return {
			
			constructor: function (host) {
				inherited.constructor.call(this);
				this._host = host;
				this._routes = [];
				this._states = {};
			},
			
			registerRoute: function (route, state, mapping) {
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
			
			readRoute: function (stateObject) {
				var descriptor = this._states[stateObject.state_name()];
				if (!descriptor)
					return null;
				var regex = /\(.*?\)/;
				var route = descriptor.key;
				Objs.iter(descriptor.mapping, function (arg) {
					route = route.replace(regex, stateObject["_" + arg]);
				}, this);
				return route;
			},
			
			parseRoute: function (route) {
				for (var i = 0; i < this._routes.length; ++i) {
					var descriptor = this._routes[i];
					var result = descriptor.route.exec(route);
					if (result === null)
						continue;
					var args = {};
					Objs.iter(descriptor.mapping, function (key, i) {
						args[key] = result[i + 1];
					});
					return {
						state: descriptor.state,
						args: args
					};
				}
				return null;
			},
			
			currentRoute: function () {
				return this.readRoute(this._host.state());
			},
			
			navigateRoute: function (route) {
				var parsed = this.parseRoute(route);
				if (parsed)
					this._host.next(parsed.state, parsed.args);
			}
			
   		};		
	});
});