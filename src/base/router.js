Scoped.define("module:Router.Router", [
	    "module:Class",
	    "module:Events.EventsMixin",
	    "module:Events.Events",
	    "module:Functions",
	    "module:Types",
	    "module:Objs"
	], function (Class, EventsMixin, Events, Functions, Types, Objs, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		/**
		 * A routing class
		 * @module BetaJS.Router
		 */
		return {
		
			/** Specifies all routes. Can either be an associative array, an array of associative arrays or a function returning one of those.
			 * 
			 * <p>A route is a mapping from a regular expression to a route descriptor. A route descriptor is either a name of a callback function or a route descriptor associative array.</p>
			 * <p>The callback function should accept the parameters given by the capturing groups of the regular expression</p>
			 * The route descriptor object may contain the following options:
			 * <ul>
			 *   <li>
			 *     action: the callback function; either a string or a function (mandatory)
			 *   </li>
			 *   <li>
			 *     path: name of the route; can be used to look up route (optional)
			 *   </li>
			 *   <li>
			 *     applicable: array of strings or functions or string or function to determine whether the route is applicable; if it is not, it will be skipped (optional)
			 *   </li>
			 *   <li>
			 *     valid: array of strings or functions or string or function to determine whether an applicable route is valid; if it is not, the routing fails (optional)
			 *   </li>
			 * </ul>
			 * @return routes
			 * @example
			 * return {
			 * 	"users/(\d+)/post/(\d+)" : "users_post",
			 *  "users/(\d+)/account": {
			 * 	  action: "users_account",
			 *    path: "users_account_path",
			 *    applicable: "is_user",
			 *    valid: "is_admin"
			 *  }
			 * }
			 */	
			/** @suppress {checkTypes} */
			routes: [],
			
			/** Creates a new router with options
			 * <ul>
			 *  <li>routes: adds user defined routes</li> 
			 *  <li>actions: extends the object by user-defined actions</li>
			 * </ul>
			 * @param options options
			 */
			constructor: function (options) {
				inherited.constructor.call(this);
				var routes = Types.is_function(this.routes) ? this.routes() : this.routes;
				if (!Types.is_array(routes))
					routes = [routes];
				if ("routes" in options) {
					if (Types.is_array(options.routes))
						routes = routes.concat(options.routes);
					else
						routes.push(options.routes);
				}
				this.__routes = [];
				this.__paths = {};
				this.__current = null;
				Objs.iter(routes, function (assoc) {
					Objs.iter(assoc, function (obj, key) {
						if (Types.is_string(obj))
							obj = {action: obj};
						obj.key = key;
						obj.route = new RegExp("^" + key + "$");
						if (!("applicable" in obj))
							obj.applicable = [];
						else if (!Types.is_array(obj.applicable))
							obj.applicable = [obj.applicable];
						if (!("valid" in obj))
							obj.valid = [];
						else if (!Types.is_array(obj.valid))
							obj.valid = [obj.valid];
						if (!("path" in obj))
							obj.path = obj.key;
						this.__routes.push(obj);
						this.__paths[obj.path] = obj;
					}, this);
				}, this);
				if (options.actions)
					Objs.iter(options.actions, function (action, key) {
						this[key] = action;
					}, this);
			},
			
			destroy: function() {
				this.__leave();
				inherited.destroy.call(this);
			},
			
			/** Parse a given route and map it to the first applicable object that is valid
			 * @param route the route given as a strings
			 * @return either null if nothing applicable and valid could be matched or an associative array with params and routing object as attributes.
			 */
			parse: function (route) {
				for (var i = 0; i < this.__routes.length; ++i) {
					var obj = this.__routes[i];
					var result = obj.route.exec(route);
					if (result !== null) {
						result.shift(1);
						var applicable = true;
						for (var j = 0; j < obj.applicable.length; ++j) {
							var s = obj.applicable[j];
							var f = Types.is_string(s) ? this[s] : s;
							applicable = applicable && f.apply(this, result);
						}
						if (!applicable)
							continue;
						var valid = true;
						for (var k = 0; k < obj.valid.length; ++k) {
							var t = obj.valid[k];
							var g = Types.is_string(t) ? this[t] : t;
							valid = valid && g.apply(this, result);
						}
						if (!valid)
							return null;
						return {
							object: obj,
							params: result
						};
					}
				}
				return null;
			},
			
			/** Looks up the routing object given a path descriptor
		 	 * @param path the path descriptor
		 	 * @return the routing object
			 */
			object: function (path) {
				return this.__paths[path];
			},
			
			/** Returns the route of a path description
			 * @param pth the path descriptor
			 * param parameters parameters that should be attached to the route (capturing groups)
			 */
			path: function (pth) {
				var key = this.object(pth).key;
				var args = Array.prototype.slice.apply(arguments, [1]);
				var regex = /\(.*?\)/;
				while (true) {
					var arg = args.shift();
					if (!arg)
						break;
					key = key.replace(regex, arg);
				}
				return key;
			},
			
			/** Navigate to a given route, invoking the matching action.
		 	 * @param route the route
			 */
			navigate: function (route) {
				this.trigger("navigate", route);
				var result = this.parse(route);
				if (result === null) {
					this.trigger("navigate-fail", route);
					return false;
				}
				this.trigger("navigate-success", result.object, result.params);
				return this.invoke(result.object, result.params, route);
			},
			
			/** Invoke a routing object with parameters
			 * <p>
			 *   Invokes the protected method _invoke
			 * </p>
			 * @param object the routing object
			 * @param params (optional) the parameters that should be attached to the route
			 * @param route (optional) an associated route that should be saved
			 */
			invoke: function (object, params, route) {
				route = route || this.path(object.key, params);
				this.trigger("before_invoke", object, params, route);
				this.__enter(object, params, route);
				this.trigger("after_invoke", object, params, route);
				var result = this._invoke(object, params);
				return result;
			},
			
			/** Invokes a routing object with parameters.
			 * <p>
			 *   Can be overwritten and does the invoking.
			 * </p>
			 * @param object the routing object
			 * @param params (optional) the parameters that should be attached to the route
			 */
			_invoke: function (object, params) {
				var f = object.action;
				if (Types.is_string(f))
					f = this[f];
				return f ? f.apply(this, params) : false;
			},
			
			__leave: function () {
				if (this.__current !== null) {
					this.trigger("leave", this.__current);
					this.__current.destroy();
					this.__current = null;
				}
			},
			
			__enter: function (object, params, route) {
				this.__leave();
				this.__current = new Events();
				this.__current.route = route;
				this.__current.object = object;
				this.__current.params = params;
				this.trigger("enter", this.__current);
			},
			
			/** Returns the current route object.
			 * <ul>
			 *  <li>route: the route as string</li>
			 *  <li>object: the routing object</li>
			 *  <li>params: the params</li>
			 * </ul>
			 */
			current: function () {
				return this.__current;
			}
	
		};
	}]);
});


Scoped.define("module:Router.RouterHistory", ["module:Class", "module:Events.EventsMixin"], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {
			
			constructor: function (router) {
				inherited.constructor.call(this);
				this.__router = router;
				this.__history = [];
				router.on("after_invoke", this.__after_invoke, this);
			},
			
			destroy: function () {
				this.__router.off(null, null, this);
				inherited.destroy.call(this);
			},
			
			__after_invoke: function (object, params) {
				this.__history.push({
					object: object,
					params: params
				});
				this.trigger("change");
			},
			
			last: function (index) {
				index = index || 0;
				return this.get(this.count() - 1 - index);
			},
			
			count: function () {
				return this.__history.length;
			},
			
			get: function (index) {
				index = index || 0;
				return this.__history[index];
			},
			
			getRoute: function (index) {
				var item = this.get(index);
				return this.__router.path(item.object.path, item.params);
			},
			
			back: function (index) {
				if (this.count() < 2)
					return null;
				index = index || 0;
				while (index >= 0 && this.count() > 1) {
					this.__history.pop();
					--index;
				}
				var item = this.__history.pop();
				this.trigger("change");
				return this.__router.invoke(item.object, item.params);
			}
			
		};
	}]);
});


Scoped.define("module:Router.RouteBinder", ["module:Class"], function (Class, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (router) {
				inherited.constructor.call(this);
				this.__router = router;
				this.__router.on("after_invoke", function (object, params, route) {
					if (this._getExternalRoute() != route)
						this._setExternalRoute(route, params, object);
				}, this);
			},
			
			destroy: function () {
				this.__router.off(null, null, this);
				inherited.destroy.call(this);
			},
			
			current: function () {
				return this._getExternalRoute();
			},
			
			_setRoute: function (route) {
				var current = this.__router.current();
				if (current && current.route == route)
					return;
				this.__router.navigate(route);
			},
			
			_getExternalRoute: function () {
				return null;
			},
			
			_setExternalRoute: function (route, params, object) { }
			
		};
	});
});


Scoped.define("module:Router.StateRouteBinder", [
    "module:Router.RouteBinder",
    "module:Objs",
    "module:Types"
], function (RouteBinder, Objs, Types, scoped) {
	return RouteBinder.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (router, host) {
				inherited.constructor.call(this, router);
				this._host = host;
				this._states = {};
				Objs.iter(router.routes, function (route) {
					if (route.state && Types.is_string(route.state))
						this._states[route.state] = route;
					if (route.states) {
						Objs.iter(route.states, function (state) {
							this._states[state] = route;
						}, this);
					}
				}, this);
				host.on("start", function () {
					this._setRoute(this._getExternalRoute());
				}, this);
			},
			
			destroy: function () {
				this._host.off(null, null, this);
				inherited.destroy.call(this);
			},
			
			_getExternalRoute: function () {
				var state = this._host.state();
				var data = this._states[state.state_name()];
				if (!data)
					return null;
				var regex = /\(.*?\)/;
				var route = data.key;
				Objs.iter(data.mapping, function (arg) {
					route = route.replace(regex, state["_" + arg]);
				}, this);
				return route;
			},
			
			_setExternalRoute: function (route, params, object) {
				var args = {};
				Objs.iter(object.mapping, function (key, i) {
					args[key] = params[i];
				});
				var state = Types.is_function(object.state) ? object.state(params) : object.state;
				this._host.next(state, args);
			}
			
		};
	});
});
