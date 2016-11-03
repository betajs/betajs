Scoped.define("module:Router.RouteParser", [
    "module:Class", "module:Strings", "module:Objs"
], function (Class, Strings, Objs, scoped) {
	return Class.extend({ scoped : scoped }, function(inherited) {
		
		/**
		 * Route Parser Class
		 * 
		 * @class BetaJS.Router.RouteParser
		 */
		return {

			/**
			 * Create a new instance.
			 * 
			 * @param {object} routes routes mapping
			 */
			constructor : function(routes) {
				inherited.constructor.call(this);
				this.routes = {};
				Objs.iter(routes, function(route, key) {
					this.bind(key, route);
				}, this);
			},

			/**
			 * Return parses a route and returns the parsed result.
			 * 
			 * @param {string} route route to be parsed
			 * @return {object} parsed route
			 */
			parse : function(route) {
				for ( var key in this.routes) {
					var entry = this.routes[key];
					var result = entry.captureRegex.exec(route);
					if (result) {
						return {
							name : entry.name,
							args : result
						};
					}
				}
				return null;
			},

			/**
			 * Recreates a full route from an abstract route descriptor and route arguments.
			 * 
			 * @param {string} name route descriptor
			 * @param {array} args arguments for route
			 * 
			 * @return {string} full route
			 * 
			 */
			format : function(name, args) {
				args = args || {};
				var entry = this.routes[name];
				return Strings.regexReplaceGroups(entry.regex,
						entry.captureRegex.mapBack(args));
			},

			/**
			 * Bind a new route.
			 * 
			 * @param {string} key route descriptor
			 * @param {string} route route regex string
			 */
			bind : function(key, route) {
				this.routes[key] = {
						name : key,
						regex : route,
						captureRegex : Strings.namedCaptureRegex("^" + route + "$")
				};
				return this;
			}

		};
	});
});

Scoped.define("module:Router.RouteMap", [
	"module:Class", "module:Strings", "module:Objs"
], function(Class, Strings, Objs, scoped) {
	return Class.extend({ scoped : scoped }, function(inherited) {
		
		/**
		 * RouteMap Class, mapping routes to routes.
		 * 
		 * @class BetaJS.Router.RouteMap
		 */
		return {

			/**
			 * Creates new instance.
			 * 
			 * @param {object} options initialization options
			 */
			constructor : function(options) {
				inherited.constructor.call(this);
				options = options || {};
				this._defaultMap = options.map;
				this._context = options.context || this;
				this._bindings = options.bindings || {};
			},

			/**
			 * Maps a route.
			 * 
			 * @param {string} name route name
			 * @param {array} args route arguments
			 * 
			 * @return {object} mapped route
			 */
			map : function(name, args) {
				var binding = this._bindings[name];
				if (binding)
					return binding.call(this._context, name, args);
				if (this._defaultMap)
					return this._defaultMap.call(this._context, name, args);
				return {
					name : name,
					args : args
				};
			},

			/**
			 * Binds a route.
			 * 
			 * @param {string} name name of route
			 * @param {function} func function to bind the route to
			 */
			bind : function(name, func) {
				this._bindings[name] = func;
				return this;
			}

		};
	});
});

Scoped.define("module:Router.Router", [
    "module:Class",
    "module:Events.EventsMixin",
    "module:Objs",
    "module:Router.RouteParser",
    "module:Comparators"
], function(Class, EventsMixin, Objs, RouteParser, Comparators, scoped) {
	return Class.extend({ scoped : scoped }, [EventsMixin, function(inherited) {
		
		/**
		 * Router Class
		 * 
		 * @class BetaJS.Router.Router
		 */
    	return {

    		/**
    		 * Creates new instance.
    		 * 
    		 * @param {object} routes routes mapping for route parser
    		 */
    		constructor : function(routes) {
    			inherited.constructor.call(this);
    			this._routeParser = new RouteParser(routes);
    			this._current = null;
    		},

    		/**
    		 * @override
    		 */
    		destroy : function() {
    			this._routeParser.destroy();
    			inherited.destroy.call(this);
    		},

    		/**
    		 * Bind a new route.
    		 * 
			 * @param {string} key route descriptor
			 * @param {string} route route regex string
			 * @param {function} func optional function to be called when route is dispatched
			 * @param {object} ctx optional function context
    		 */
    		bind : function(key, route, func, ctx) {
    			this._routeParser.bind(key, route);
    			if (func)
    				this.on("dispatch:" + key, func, ctx);
    			return this;
    		},

    		/**
    		 * Returns the current route.
    		 * 
    		 * @return {string} current route
    		 */
    		current : function() {
    			return this._current;
    		},

    		/**
    		 * Navigates to a new route.
    		 * 
    		 * @param {string} route route to navigate to
    		 */
    		navigate : function(route) {
    			this.trigger("navigate", route);
    			this.trigger("navigate:" + route);
    			var parsed = this._routeParser.parse(route);
    			if (parsed)
    				this.dispatch(parsed.name, parsed.args, route);
    			else
    				this.trigger("notfound", route);
    			return this;
    		},

    		/**
    		 * Dispatches a new route.
    		 * 
    		 * @param {string} name name of route
    		 * @param {array} args arguments of new route
    		 * @param {string} route optional route string
    		 * 
    		 */
    		dispatch : function(name, args, route) {
    			if (this._current) {
    				if (this._current.name === name && Comparators.deepEqual(args, this._current.args, 2))
    					return;
    				this.trigger("leave", this._current.name,
    						this._current.args, this._current);
    				this.trigger("leave:" + this._current.name,
    						this._current.args, this._current);
    			}
    			var current = {
					route : route || this.format(name, args),
					name : name,
					args : args
    			};
    			this.trigger("dispatch", name, args, current);
    			this.trigger("dispatch:" + name, args, current);
    			this._current = current;
    			this.trigger("dispatched", name, args, current);
    			this.trigger("dispatched:" + name, args, current);
    			return this;
    		},

			/**
			 * Recreates a full route from an abstract route descriptor and route arguments.
			 * 
			 * @param {string} name route descriptor
			 * @param {array} args arguments for route
			 * 
			 * @return {string} full route
			 * 
			 */
    		format : function(name, args) {
    			return this._routeParser.format(name, args);
    		}

    	};
    } ]);
});



Scoped.define("module:Router.RouteBinder", [
	"module:Class", "module:Types"
], function( Class, Types, scoped) {
	return Class.extend({ scoped : scoped }, function(inherited) {
		
		/**
		 * Abstract Route Binder Class for bidirectionally binding the route to a separate router.
		 * 
		 * @class BetaJS.Router.RouteBinder
		 */
		return {
			
			/**
			 * Overwrite the local route of this binder.
			 * 
			 * @param {string} currentRoute current route
			 */
			_setLocalRoute: function (currentRoute) {},
			
			/**
			 * Read the local route of this binder.
			 * 
			 * @return {string} local route
			 */
			_getLocalRoute: function () {},
			
			/**
			 * Notify the router that the local route has changed.
			 */
			_localRouteChanged: function () {
				this.setGlobalRoute(this._getLocalRoute());
			},

			/**
			 * Creates a new instance.
			 * 
			 * @param {object} router router instance
			 */
			constructor : function(router) {
				inherited.constructor.call(this);
				this._router = router;
				router.on("dispatched", function () {
					this.setLocalRoute(router.current());
				}, this);
				if (router.current())
					this.setLocalRoute(router.current());
				else if (this._getLocalRoute())
					this.setGlobalRoute(this._getLocalRoute());
			},

			/**
			 * @override
			 */
			destroy : function() {
				this._router.off(null, null, this);
				inherited.destroy.call(this);
			},
			
			/**
			 * Sets the local route.
			 * 
			 * @param {string} currentRoute current route
			 */
			setLocalRoute: function (currentRoute) {
				this._setLocalRoute(currentRoute);
				return this;
			},
			
			/**
			 * Sets the global route.
			 * 
			 * @param {string} route new global route
			 */
			setGlobalRoute: function (route) {
				if (Types.is_string(route))
					this._router.navigate(route);
				else
					this._router.dispatch(route.name, route.args);
				return this;
			}

		};
	});
});


Scoped.define("module:Router.StateRouteBinder", [ "module:Router.RouteBinder", "module:Objs", "module:Strings",
                                                  "module:Router.RouteMap" ], function(RouteBinder, Objs, Strings, RouteMap, scoped) {
	return RouteBinder.extend({ scoped : scoped
	}, function(inherited) {
		return {

			constructor : function(router, stateHost, options) {
				this._stateHost = stateHost;
				options = Objs.extend({
					capitalizeStates: false
				}, options);
				this._options = options;
				this._routeToState = new RouteMap({
					map : this._options.routeToState || function (name, args) {
						return {
							name: options.capitalizeStates ? Strings.capitalize(name) : name,
							args: args
						};
					},
					context : this._options.context
				});
				this._stateToRoute = new RouteMap({
					map : this._options.stateToRoute || function (name, args) {
						return {
							name: name.toLowerCase(),
							args: args
						};
					},
					context : this._options.context
				});
				inherited.constructor.call(this, router);
				stateHost.on("start", this._localRouteChanged, this);
			},

			destroy : function() {
				this._routeToState.destroy();
				this._stateToRoute.destroy();
				this._stateHost.off(null, null, this);
				inherited.destroy.call(this);
			},

			bindRouteToState : function(name, func) {
				this._routeToState.bind(name, func);
				return this;
			},

			bindStateToRoute : function(name, func) {
				this._stateToRoute.bind(name, func);
				return this;
			},

			register: function (name, route, extension) {
				this._router.bind(name, route);
				this._stateHost.register(this._options.capitalizeStates ? Strings.capitalize(name) : name, extension);
				return this;
			},			

			_setLocalRoute: function (currentRoute) {
				var mapped = this._routeToState.map(currentRoute.name, currentRoute.args);
				if (mapped) {
					this._stateHost.weakNext(mapped.name, mapped.args);
					/*
					Objs.iter(args, function (value, key) {
						this._stateHost.set(key, value);
					}, this);
					*/
				}
			},
			
			_getLocalRoute: function () {
				if (!this._stateHost.state())
					return null;
				var state = this._stateHost.state();
				return this._stateToRoute.map(state.state_name(), state.allAttr());
			}			

		};
	});
});

Scoped.define("module:Router.RouterHistory", [ "module:Class",
                                               "module:Events.EventsMixin" ], function(Class, EventsMixin, scoped) {
	return Class.extend({
		scoped : scoped
	}, [ EventsMixin, function(inherited) {
		return {

			constructor : function(router) {
				inherited.constructor.call(this);
				this._router = router;
				this._history = [];
				router.on("dispatched", function(name, args, current) {
					this._history.push(current);
					this.trigger("change", current);
					this.trigger("insert", current);
				}, this);
			},

			destroy : function() {
				this._router.off(null, null, this);
				inherited.destroy.call(this);
			},

			last : function(index) {
				index = index || 0;
				return this.get(this.count() - 1 - index);
			},

			count : function() {
				return this._history.length;
			},

			get : function(index) {
				index = index || 0;
				return this._history[index];
			},

			back : function(index) {
				if (this.count() < 2)
					return null;
				index = index || 0;
				while (index >= 0 && this.count() > 1) {
					var removed = this._history.pop();
					this.trigger("remove", removed);
					--index;
				}
				var item = this._history.pop();
				this.trigger("change", item);
				return this._router.dispatch(item.name, item.args);
			}

		};
	} ]);
});
