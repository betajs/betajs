/*!
betajs - v1.0.0 - 2015-05-15
Copyright (c) Oliver Friedmann,Victor Lingenthal
MIT Software License.
*/
/*!
betajs-scoped - v0.0.1 - 2015-03-26
Copyright (c) Oliver Friedmann
MIT Software License.
*/
var Scoped = (function () {
var Globals = {

	get : function(key) {
		if (typeof window !== "undefined")
			return window[key];
		if (typeof global !== "undefined")
			return global[key];
		return null;
	},

	set : function(key, value) {
		if (typeof window !== "undefined")
			window[key] = value;
		if (typeof global !== "undefined")
			global[key] = value;
		return value;
	},
	
	setPath: function (path, value) {
		var args = path.split(".");
		if (args.length == 1)
			return this.set(path, value);		
		var current = this.get(args[0]) || this.set(args[0], {});
		for (var i = 1; i < args.length - 1; ++i) {
			if (!(args[i] in current))
				current[args[i]] = {};
			current = current[args[i]];
		}
		current[args[args.length - 1]] = value;
		return value;
	},
	
	getPath: function (path) {
		var args = path.split(".");
		if (args.length == 1)
			return this.get(path);		
		var current = this.get(args[0]);
		for (var i = 1; i < args.length; ++i) {
			if (!current)
				return current;
			current = current[args[i]];
		}
		return current;
	}

};
var Helper = {
		
	method: function (obj, func) {
		return function () {
			return func.apply(obj, arguments);
		};
	},
	
	extend: function (base, overwrite) {
		base = base || {};
		overwrite = overwrite || {};
		for (var key in overwrite)
			base[key] = overwrite[key];
		return base;
	},
	
	typeOf: function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]' ? "array" : typeof obj;
	},
	
	isEmpty: function (obj) {
		if (obj === null || typeof obj === "undefined")
			return true;
		if (this.typeOf(obj) == "array")
			return obj.length === 0;
		if (typeof obj !== "object")
			return false;
		for (var key in obj)
			return false;
		return true;
	},
	
	matchArgs: function (args, pattern) {
		var i = 0;
		var result = {};
		for (var key in pattern) {
			if (pattern[key] === true || this.typeOf(args[i]) == pattern[key]) {
				result[key] = args[i];
				i++;
			} else if (this.typeOf(args[i]) == "undefined")
				i++;
		}
		return result;
	},
	
	stringify: function (value) {
		if (this.typeOf(value) == "function")
			return "" + value;
		return JSON.stringify(value);
	}	

};
var Attach = {
		
	__namespace: "Scoped",
	
	upgrade: function (namespace) {
		var current = Globals.get(namespace || Attach.__namespace);
		if (current && Helper.typeOf(current) == "object" && current.guid == this.guid && Helper.typeOf(current.version) == "string") {
			var my_version = this.version.split(".");
			var current_version = current.version.split(".");
			var newer = false;
			for (var i = 0; i < Math.min(my_version.length, current_version.length); ++i) {
				newer = my_version[i] > current_version[i];
				if (my_version[i] != current_version[i]) 
					break;
			}
			return newer ? this.attach(namespace) : current;				
		} else
			return this.attach(namespace);		
	},

	attach : function(namespace) {
		if (namespace)
			Attach.__namespace = namespace;
		var current = Globals.get(Attach.__namespace);
		if (current == this)
			return this;
		Attach.__revert = current;
		Globals.set(Attach.__namespace, this);
		return this;
	},
	
	detach: function (forceDetach) {
		if (forceDetach)
			Globals.set(Attach.__namespace, null);
		if (typeof Attach.__revert != "undefined")
			Globals.set(Attach.__namespace, Attach.__revert);
		delete Attach.__revert;
		return this;
	},
	
	exports: function (mod, object, forceExport) {
		mod = mod || (typeof module != "undefined" ? module : null);
		if (typeof mod == "object" && mod && "exports" in mod && (forceExport || mod.exports == this || !mod.exports || Helper.isEmpty(mod.exports)))
			mod.exports = object || this;
		return this;
	}	

};

function newNamespace (options) {
	
	options = Helper.extend({
		tree: false,
		global: false,
		root: {}
	}, options);
	
	function initNode(options) {
		return Helper.extend({
			route: null,
			parent: null,
			children: {},
			watchers: [],
			data: {},
			ready: false,
			lazy: []
		}, options);
	}
	
	var nsRoot = initNode({ready: true});
	
	var treeRoot = null;
	
	if (options.tree) {
		if (options.global) {
			try {
				if (window)
					treeRoot = window;
			} catch (e) { }
			try {
				if (global)
					treeRoot = global;
			} catch (e) { }
		} else
			treeRoot = options.root;
		nsRoot.data = treeRoot;
	}
	
	function nodeDigest(node) {
		if (node.ready)
			return;
		if (node.parent && !node.parent.ready) {
			nodeDigest(node.parent);
			return;
		}
		if (node.route in node.parent.data) {
			node.data = node.parent.data[node.route];
			node.ready = true;
			for (var i = 0; i < node.watchers.length; ++i)
				node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
			node.watchers = [];
			for (var key in node.children)
				nodeDigest(node.children[key]);
		}
	}
	
	function nodeEnforce(node) {
		if (node.ready)
			return;
		if (node.parent && !node.parent.ready)
			nodeEnforce(node.parent);
		node.ready = true;
		if (options.tree && typeof node.parent.data == "object")
			node.parent.data[node.route] = node.data;
		for (var i = 0; i < node.watchers.length; ++i)
			node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
		node.watchers = [];
	}
	
	function nodeSetData(node, value) {
		if (typeof value == "object") {
			for (var key in value) {
				node.data[key] = value[key];
				if (node.children[key])
					node.children[key].data = value[key];
			}
		} else
			node.data = value;
		nodeEnforce(node);
		for (var k in node.children)
			nodeDigest(node.children[k]);
	}
	
	function nodeClearData(node) {
		if (node.ready && node.data) {
			for (var key in node.data)
				delete node.data[key];
		}
	}
	
	function nodeNavigate(path) {
		if (!path)
			return nsRoot;
		var routes = path.split(".");
		var current = nsRoot;
		for (var i = 0; i < routes.length; ++i) {
			if (routes[i] in current.children)
				current = current.children[routes[i]];
			else {
				current.children[routes[i]] = initNode({
					parent: current,
					route: routes[i]
				});
				current = current.children[routes[i]];
				nodeDigest(current);
			}
		}
		return current;
	}
	
	function nodeAddWatcher(node, callback, context) {
		if (node.ready)
			callback.call(context || this, node.data);
		else {
			node.watchers.push({
				callback: callback,
				context: context
			});
			if (node.lazy.length > 0) {
				var f = function (node) {
					if (node.lazy.length > 0) {
						var lazy = node.lazy.shift();
						lazy.callback.call(lazy.context || this, node.data);
						f(node);
					}
				};
				f(node);
			}
		}
	}

	return {
		
		extend: function (path, value) {
			nodeSetData(nodeNavigate(path), value);
		},
		
		set: function (path, value) {
			var node = nodeNavigate(path);
			if (node.data)
				nodeClearData(node);
			nodeSetData(node, value);
		},
		
		lazy: function (path, callback, context) {
			var node = nodeNavigate(path);
			if (node.ready)
				callback(context || this, node.data);
			else {
				node.lazy.push({
					callback: callback,
					context: context
				});
			}
		},
		
		digest: function (path) {
			nodeDigest(nodeNavigate(path));
		},
		
		obtain: function (path, callback, context) {
			nodeAddWatcher(nodeNavigate(path), callback, context);
		}
		
	};
	
}
function newScope (parent, parentNamespace, rootNamespace, globalNamespace) {
	
	var self = this;
	var nextScope = null;
	var childScopes = [];
	var localNamespace = newNamespace({tree: true});
	var privateNamespace = newNamespace({tree: false});
	
	var bindings = {
		"global": {
			namespace: globalNamespace
		}, "root": {
			namespace: rootNamespace
		}, "local": {
			namespace: localNamespace
		}, "default": {
			namespace: privateNamespace
		}, "parent": {
			namespace: parentNamespace
		}, "scope": {
			namespace: localNamespace,
			readonly: false
		}
	};
	
	var custom = function (argmts, name, callback) {
		var args = Helper.matchArgs(argmts, {
			options: "object",
			namespaceLocator: true,
			dependencies: "array",
			hiddenDependencies: "array",
			callback: true,
			context: "object"
		});
		
		var options = Helper.extend({
			lazy: this.options.lazy
		}, args.options || {});
		
		var ns = this.resolve(args.namespaceLocator);
		
		var execute = function () {
			this.require(args.dependencies, args.hiddenDependencies, function () {
				arguments[arguments.length - 1].ns = ns;
				if (this.options.compile) {
					var params = [];
					for (var i = 0; i < argmts.length; ++i)
						params.push(Helper.stringify(argmts[i]));
					this.compiled += this.options.ident + "." + name + "(" + params.join(", ") + ");\n\n";
				}
				var result = args.callback.apply(args.context || this, arguments);
				callback.call(this, ns, result);
			}, this);
		};
		
		if (options.lazy)
			ns.namespace.lazy(ns.path, execute, this);
		else
			execute.apply(this);

		return this;
	};
	
	return {
		
		getGlobal: Helper.method(Globals, Globals.getPath),
		setGlobal: Helper.method(Globals, Globals.setPath),
		
		options: {
			lazy: false,
			ident: "Scoped",
			compile: false			
		},
		
		compiled: "",
		
		nextScope: function () {
			if (!nextScope)
				nextScope = newScope(this, localNamespace, rootNamespace, globalNamespace);
			return nextScope;
		},
		
		subScope: function () {
			var sub = this.nextScope();
			childScopes.push(sub);
			nextScope = null;
			return sub;
		},
		
		binding: function (alias, namespaceLocator, options) {
			if (!bindings[alias] || !bindings[alias].readonly) {
				var ns;
				if (Helper.typeOf(namespaceLocator) != "string") {
					ns = {
						namespace: newNamespace({
							tree: true,
							root: namespaceLocator
						}),
						path: null	
					};
				} else
					ns = this.resolve(namespaceLocator);
				bindings[alias] = Helper.extend(options, ns);
			}
			return this;
		},
		
		resolve: function (namespaceLocator) {
			var parts = namespaceLocator.split(":");
			if (parts.length == 1) {
				return {
					namespace: privateNamespace,
					path: parts[0]
				};
			} else {
				var binding = bindings[parts[0]];
				if (!binding)
					throw ("The namespace '" + parts[0] + "' has not been defined (yet).");
				return {
					namespace: binding.namespace,
					path : binding.path && parts[1] ? binding.path + "." + parts[1] : (binding.path || parts[1])
				};
			}
		},
		
		define: function () {
			return custom.call(this, arguments, "define", function (ns, result) {
				ns.namespace.set(ns.path, result);
			});
		},
		
		extend: function () {
			return custom.call(this, arguments, "extend", function (ns, result) {
				ns.namespace.extend(ns.path, result);
			});
		},
		
		condition: function () {
			return custom.call(this, arguments, "condition", function (ns, result) {
				if (result)
					ns.namespace.set(ns.path, result);
			});
		},
		
		require: function () {
			var args = Helper.matchArgs(arguments, {
				dependencies: "array",
				hiddenDependencies: "array",
				callback: "function",
				context: "object"
			});
			args.callback = args.callback || function () {};
			var dependencies = args.dependencies || [];
			var allDependencies = dependencies.concat(args.hiddenDependencies || []);
			var count = allDependencies.length;
			var deps = [];
			var environment = {};
			if (count) {
				var f = function (value) {
					if (this.i < deps.length)
						deps[this.i] = value;
					count--;
					if (count === 0) {
						deps.push(environment);
						args.callback.apply(args.context || this.ctx, deps);
					}
				};
				for (var i = 0; i < allDependencies.length; ++i) {
					var ns = this.resolve(allDependencies[i]);
					if (i < dependencies.length)
						deps.push(null);
					ns.namespace.obtain(ns.path, f, {
						ctx: this,
						i: i
					});
				}
			} else {
				deps.push(environment);
				args.callback.apply(args.context || this, deps);
			}
			return this;
		},
		
		digest: function (namespaceLocator) {
			var ns = this.resolve(namespaceLocator);
			ns.namespace.digest(ns.path);
			return this;
		}		
		
	};
	
}
var globalNamespace = newNamespace({tree: true, global: true});
var rootNamespace = newNamespace({tree: true});
var rootScope = newScope(null, rootNamespace, rootNamespace, globalNamespace);

var Public = Helper.extend(rootScope, {
		
	guid: "4b6878ee-cb6a-46b3-94ac-27d91f58d666",
	version: '9.1427403679672',
		
	upgrade: Attach.upgrade,
	attach: Attach.attach,
	detach: Attach.detach,
	exports: Attach.exports
	
});

Public = Public.upgrade();
Public.exports();
	return Public;
}).call(this);
/*!
betajs - v1.0.0 - 2015-05-15
Copyright (c) Oliver Friedmann,Victor Lingenthal
MIT Software License.
*/
(function () {

var Scoped = this.subScope();

Scoped.binding("module", "global:BetaJS");

Scoped.define("module:", function () {
	return {
		guid: "71366f7a-7da3-4e55-9a0b-ea0e4e2a9e79",
		version: '369.1431722054265'
	};
});

Scoped.require(["module:"], function (mod) {
	this.exports(typeof module != "undefined" ? module : null, mod);
}, this);

Scoped.define("module:Types", function () {
	/** Type-Testing and Type-Parsing
	 * @module BetaJS.Types
	 */
	return {
		/**
		 * Returns whether argument is an object
		 * 
		 * @param x
		 *            argument
		 * @return true if x is an object
		 */
		is_object : function(x) {
			return typeof x == "object";
		},

		/**
		 * Returns whether argument is an array
		 * 
		 * @param x
		 *            argument
		 * @return true if x is an array
		 */
		is_array : function(x) {
			return Object.prototype.toString.call(x) === '[object Array]';
		},

		/**
		 * Returns whether argument is undefined (which is different from being
		 * null)
		 * 
		 * @param x
		 *            argument
		 * @return true if x is undefined
		 */
		is_undefined : function(x) {
			return typeof x == "undefined";
		},

		/**
		 * Returns whether argument is null (which is different from being
		 * undefined)
		 * 
		 * @param x
		 *            argument
		 * @return true if x is null
		 */
		is_null : function(x) {
			return x === null;
		},

		/**
		 * Returns whether argument is undefined or null
		 * 
		 * @param x
		 *            argument
		 * @return true if x is undefined or null
		 */
		is_none : function(x) {
			return this.is_undefined(x) || this.is_null(x);
		},

		/**
		 * Returns whether argument is defined (could be null)
		 * 
		 * @param x
		 *            argument
		 * @return true if x is defined
		 */
		is_defined : function(x) {
			return typeof x != "undefined";
		},

		/**
		 * Returns whether argument is empty (undefined, null, an empty array or
		 * an empty object)
		 * 
		 * @param x
		 *            argument
		 * @return true if x is empty
		 */
		is_empty : function(x) {
			if (this.is_none(x))
				return true;
			if (this.is_array(x))
				return x.length === 0;
			if (this.is_object(x)) {
				for ( var key in x)
					return false;
				return true;
			}
			return false;
		},

		/**
		 * Returns whether argument is a string
		 * 
		 * @param x
		 *            argument
		 * @return true if x is a a string
		 */
		is_string : function(x) {
			return typeof x == "string";
		},

		/**
		 * Returns whether argument is a function
		 * 
		 * @param x
		 *            argument
		 * @return true if x is a function
		 */
		is_function : function(x) {
			return typeof x == "function";
		},

		/**
		 * Returns whether argument is boolean
		 * 
		 * @param x
		 *            argument
		 * @return true if x is boolean
		 */
		is_boolean : function(x) {
			return typeof x == "boolean";
		},

		/**
		 * Compares two values
		 * 
		 * If values are booleans, we compare them directly. If values are
		 * arrays, we compare them recursively by their components. Otherwise,
		 * we use localeCompare which compares strings.
		 * 
		 * @param x
		 *            left value
		 * @param y
		 *            right value
		 * @return 1 if x > y, -1 if x < y and 0 if x == y
		 */
		compare : function(x, y) {
			if (this.is_boolean(x) && this.is_boolean(y))
				return x == y ? 0 : (x ? 1 : -1);
			if (this.is_array(x) && this.is_array(y)) {
				var len_x = x.length;
				var len_y = y.length;
				var len = Math.min(len_x, len_y);
				for (var i = 0; i < len; ++i) {
					var c = this.compare(x[i], y[i]);
					if (c !== 0)
						return c;
				}
				return len_x == len_y ? 0 : (len_x > len_y ? 1 : -1);
			}
			return x.localeCompare(y);
		},

		/**
		 * Parses a boolean string
		 * 
		 * @param x
		 *            boolean as a string
		 * @return boolean value
		 */
		parseBool : function(x) {
			if (this.is_boolean(x))
				return x;
			if (x == "true")
				return true;
			if (x == "false")
				return false;
			return null;
		},

		/**
		 * Returns the type of a given expression
		 * 
		 * @param x
		 *            expression
		 * @return type string
		 */
		type_of : function(x) {
			if (this.is_array(x))
				return "array";
			return typeof x;
		},

		parseType : function(x, type) {
			if (!this.is_string(x))
				return x;
			type = type.toLowerCase();
			if (type == "bool" || type == "boolean")
				return this.parseBool(x);
			if (type == "int" || type == "integer")
				return parseInt(x, 10);
			if (type == "date" || type == "time" || type == "datetime")
				return parseInt(x, 10);
			return x;
		}
	};
});

Scoped.define("module:Functions", ["module:Types"], function (Types) {
	/** Function and Function Argument Support
	 * @module BetaJS.Functions
	 */
	return {
	
	    /** Takes a function and an instance and returns the method call as a function
	     * 
	     * @param func function
	     * @param instance instance
	     * @return method call 
	     */
		as_method: function (func, instance) {
			return function() {
				return func.apply(instance, arguments);
			};
		},
		
	    /** Takes a function and returns a function that calls the original function on the first call and returns the return value on all subsequent call. In other words a lazy function cache.
	     * 
	     * @param func function
	     * @return cached function 
	     */
		once: function (func) {
			var result = false;
			var executed = false;
			return function () {
				if (executed)
					return result;
				executed = true;
				result = func.apply(this, arguments);
				func = null;
				return result;
			};
		},
		
	    /** Converts some other function's arguments to an array
	     * 
	     * @param args function arguments
	     * @param slice number of arguments to be omitted (default: 0)
	     * @return arguments as array 
	     */	
		getArguments: function (args, slice) {
			return Array.prototype.slice.call(args, slice || 0);
		},
		
	    /** Matches functions arguments against some pattern
	     * 
	     * @param args function arguments
	     * @param pattern typed pattern
	     * @return matched arguments as associative array 
	     */	
		matchArgs: function (args, skip, pattern) {
			if (arguments.length < 3) {
				pattern = skip;
				skip = 0;
			}
			var i = skip;
			var result = {};
			for (var key in pattern) {
				var config = pattern[key];
				if (config === true)
					config = {required: true};
				else if (typeof config == "string")
					config = {type: config};
				if (config.required || (config.type && Types.type_of(args[i]) == config.type)) {
					result[key] = args[i];
					i++;
				} else if (config.def) {
					result[key] = Types.is_function(config.def) ? config.def(result) : config.def;
				}				
			}
			return result;
		},
		
		/** @suppress {checkTypes} */
		newClassFunc: function (cls) {
			return function () {
				var args = arguments;
				function F() {
					return cls.apply(this, args);
				}
				F.prototype = cls.prototype;
				return new F();
			};
		},
		
		newClass: function (cls) {
			return this.newClassFunc(cls).apply(this, this.getArguments(arguments, 1));
		}
	
	};
});

Scoped.define("module:Ids", function () {
	/** Id Generation
	 * @module BetaJS.Ids
	 */
	return {
	
		__uniqueId: 0,
		
	    /** Returns a unique identifier
	     * 
	     * @param prefix a prefix string for the identifier (optional)
	     * @return unique identifier
	     */
		uniqueId: function (prefix) {
			return (prefix || "") + (this.__uniqueId++);
		},
		
	    /** Returns the object's unique identifier or sets it
	     * 
	     * @param object the object
	     * @param id (optional)
	     * @return object's unique identifier
	     */
		objectId: function (object, id) {
			if (typeof id != "undefined")
				object.__cid = id;
			else if (!object.__cid)
				object.__cid = this.uniqueId("cid_");
			return object.__cid;
		}
	
	};
});
Scoped.define("module:Tokens", function() {
	/**
	 * Unique Token Generation
	 * 
	 * @module BetaJS.Tokens
	 */
	return {

		/**
		 * Returns a new token
		 * 
		 * @param length
		 *            optional length of token, default is 16
		 * @return token
		 */
		generate_token : function(length) {
			length = length || 16;
			var s = "";
			while (s.length < length)
				s += Math.random().toString(36).substr(2);
			return s.substr(0, length);
		},

		// http://jsperf.com/string-hashing-methods
		simple_hash : function(s) {
			var nHash = 0;
			if (!s.length)
				return nHash;
			for (var i = 0, imax = s.length, n; i < imax; ++i) {
				n = s.charCodeAt(i);
				nHash = ((nHash << 5) - nHash) + n;
				nHash = nHash & nHash;
			}
			return Math.abs(nHash);
		}

	};
});
Scoped.define("module:Objs", ["module:Types"], function (Types) {
	return {
		
		ithKey: function (obj, i) {
			i = i || 0;
			for (var key in obj) {
				if (i <= 0)
					return key;
				i--;
			}
			return null;
		},
		
		count: function (obj) {
			if (Types.is_array(obj))
				return obj.length;
			else {
				var c = 0;
				for (var key in obj)
					c++;
				return c;
			}
		},
		
		clone: function (item, depth) {
			if (!depth || depth === 0)
				return item;
			if (Types.is_array(item))
				return item.slice(0);
			else if (Types.is_object(item))
				return this.extend({}, item, depth-1);
			else
				return item;
		},
		
		acyclic_clone: function (object, def) {
			if (object === null || ! Types.is_object(object))
				return object;
			var s = "__acyclic_cloned";
			if (object[s])
				return def || "CYCLE";
			object[s] = true;
			var result = {};
			for (var key in object) {
				if (key != s)
					result[key] = this.acyclic_clone(object[key], def);
			}
			delete object[s];
			return result;
		},
		
		extend: function (target, source, depth) {
			target = target || {};
			if (source) {
				for (var key in source)
					target[key] = this.clone(source[key], depth);
			}
			return target;
		},
		
		weak_extend: function (target, source, depth) {
			target = target || {};
			if (source) {
				for (var key in source) {
					if (!(key in target))
						target[key] = this.clone(source[key], depth);
				}
			}
			return target;
		},
		
		tree_extend: function (target, source, depth) {
			target = target || {};
			if (source) {
				for (var key in source) {
					if (key in target && Types.is_object(target[key]) && Types.is_object(source[key]))
						target[key] = this.tree_extend(target[key], source[key], depth);
					else
						target[key] = this.clone(source[key], depth);
				}
			}
			return target;
		},
			
		merge: function (secondary, primary, options) {
			secondary = secondary || {};
			primary = primary || {};
			var result = {};
			var keys = this.extend(this.keys(secondary, true), this.keys(primary, true));
			for (var key in keys) {
				var opt = key in options ? options[key] : "primary";
				if (opt == "primary" || opt == "secondary") {
					if (key in primary || key in secondary) {
						if (opt == "primary")
							result[key] = key in primary ? primary[key] : secondary[key];
						else
							result[key] = key in secondary ? secondary[key] : primary[key];
					}			
				}
				else if (Types.is_function(opt))
					result[key] = opt(secondary[key], primary[key]);
				else if (Types.is_object(opt))
					result[key] = this.merge(secondary[key], primary[key], opt);
			}
			return result;
		},
		
		tree_merge: function (secondary, primary) {
			secondary = secondary || {};
			primary = primary || {};
			var result = {};
			var keys = this.extend(this.keys(secondary, true), this.keys(primary, true));
			for (var key in keys) {
				if (Types.is_object(primary[key]) && secondary[key])
					result[key] = this.tree_merge(secondary[key], primary[key]);
				else
					result[key] = key in primary ? primary[key] : secondary[key];
			}
			return result;
		},
	
		keys: function(obj, mapped) {
			var result = null;
			var key = null;
			if (Types.is_undefined(mapped)) {
				result = [];
				for (key in obj)
					result.push(key);
				return result;
			} else {
				result = {};
				for (key in obj)
					result[key] = mapped;
				return result;
			}
		},
		
		map: function (obj, f, context) {
			var result = null;
			if (Types.is_array(obj)) {
				result = [];
				for (var i = 0; i < obj.length; ++i)
					result.push(context ? f.apply(context, [obj[i], i]) : f(obj[i], i));
				return result;
			} else {
				result = {};
				for (var key in obj)
					result[key] = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
				return result;
			}
		},
		
		values: function (obj) {
			var result = [];
			for (var key in obj)
				result.push(obj[key]);
			return result;
		},
		
		filter: function (obj, f, context) {
			var ret = null;
			if (Types.is_array(obj)) {
				ret = [];
				for (var i = 0; i < obj.length; ++i) {
					if (context ? f.apply(context, [obj[i], i]) : f(obj[i], i))
						ret.push(obj[i]);
				}
				return ret;
			} else {
				ret = {};
				for (var key in obj) {
					if (context ? f.apply(context, [obj[key], key]) : f(obj[key], key))
						ret[key] = obj[key];
				}
				return ret;
			}
		},
		
		equals: function (obj1, obj2, depth) {
			var key = null;
			if (depth && depth > 0) {
				for (key in obj1) {
					if (!(key in obj2) || !this.equals(obj1[key], obj2[key], depth-1))
						return false;
				}
				for (key in obj2) {
					if (!(key in obj1))
						return false;
				}
				return true;
			} else
				return obj1 == obj2;
		},
		
		iter: function (obj, f, context) {
			var result = null;
			if (Types.is_array(obj)) {
				for (var i = 0; i < obj.length; ++i) {
					result = context ? f.apply(context, [obj[i], i]) : f(obj[i], i);
					if (Types.is_defined(result) && !result)
						return false;
				}
			} else {
				for (var key in obj) {
					result = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
					if (Types.is_defined(result) && !result)
						return false;
				}
			}
			return true;
		},
		
		intersect: function (a, b) {
			var c = {};
			for (var key in a) {
				if (key in b)
					c[key] = a[key];
			}
			return c;
		},
		
		contains_key: function (obj, key) {
			if (Types.is_array(obj))
				return Types.is_defined(obj[key]);
			else
				return key in obj;
		},
		
		contains_value: function (obj, value) {
			if (Types.is_array(obj)) {
				for (var i = 0; i < obj.length; ++i) {
					if (obj[i] === value)
						return true;
				}
			} else {
				for (var key in obj) {
					if (obj[key] === value)
						return true;
				}
			}
			return false;
		},
		
		exists: function (obj, f, context) {
			var success = false;
			this.iter(obj, function () {
				success = success || f.apply(this, arguments);
				return !success;
			}, context);
			return success;
		},
		
		all: function (obj, f, context) {
			var success = true;
			this.iter(obj, function () {
				success = success && f.apply(this, arguments);
				return success;
			}, context);
			return success;
		},
		
		objectify: function (arr, f, context) {
			var result = {};
			var is_function = Types.is_function(f);
			if (Types.is_undefined(f))
				f = true;
			for (var i = 0; i < arr.length; ++i)
				result[arr[i]] = is_function ? f.apply(context || this, [arr[i], i]) : f;
			return result;
		},
		
		peek: function (obj) {
			if (Types.is_array(obj))
				return obj.length > 0 ? obj[0] : null;
			else {
				for (var key in obj)
					return obj[key];
				return null;
			} 
		},
		
		poll: function (obj) {
			if (Types.is_array(obj))
				return obj.shift();
			else {
				for (var key in obj) {
					var item = obj[key];
					delete obj[key];
					return item;
				}
				return null;
			} 
		},
		
		objectBy: function () {
			var obj = {};
			var count = arguments.length / 2;
			for (var i = 0; i < count; ++i)
				obj[arguments[2 * i]] = arguments[2 * i + 1];
			return obj;
		},
		
		valueByIndex: function (obj, idx) {
			idx = idx || 0;
			if (Types.is_array(obj))
				return obj[idx];
			for (var key in obj) {
				if (idx === 0)
					return obj[key];
				idx--;
			}
			return null;
		},
		
		keyByIndex: function (obj, idx) {
			idx = idx || 0;
			if (Types.is_array(obj))
				return idx;
			for (var key in obj) {
				if (idx === 0)
					return key;
				idx--;
			}
			return null;
		},
		
		pairArrayToObject: function (arr) {
			var result = {};
			for (var i = 0; i < arr.length / 2; i += 2)
				result[arr[i]] = arr[i+1];
			return result;
		},
		
		pairsToObject: function () {
			var result = {};
			for (var i = 0; i < arguments.length; ++i)
				result[arguments[i][0]] = arguments[i][1];
			return result;
		}
	
	};
});


Scoped.define("module:Objs.Scopes", ["module:Types"], function (Types) {
	return {
		
		has: function (key, scope) {
			var keys = key ? key.split(".") : [];
			for (var i = 0; i < keys.length; ++i) {
		       if (!scope || !Types.is_object(scope))
		    	   return false;
		       scope = scope[keys[i]];
		    }
			return Types.is_defined(scope);
		},
		
		get: function (key, scope) {
			var keys = key ? key.split(".") : [];
			for (var i = 0; i < keys.length; ++i) {
		       if (!scope || !Types.is_object(scope))
		    	   return null;
		       scope = scope[keys[i]];
		    }
			return scope;
		},
		
		set: function (key, value, scope) {
			if (!key)
				return;
			var keys = key.split(".");
			for (var i = 0; i < keys.length - 1; ++i) {
				if (!(keys[i] in scope) || !Types.is_object(scope[keys[i]]))
					scope[keys[i]] = {};
		       scope = scope[keys[i]];
		    }
			scope[keys[keys.length - 1]] = value;
		},
		
		unset: function (key, scope) {
			if (!key)
				return;
			var keys = key.split(".");
			for (var i = 0; i < keys.length - 1; ++i) {
		       if (!scope || !Types.is_object(scope))
		    	   return;
		       scope = scope[keys[i]];
		    }
			delete scope[keys[keys.length - 1]];
		},
		
		touch: function (key, scope) {
			if (!key)
				return scope;
			var keys = key.split(".");
			for (var i = 0; i < keys.length; ++i) {
				if (!(keys[i] in scope) || !Types.is_object(scope))
					scope[keys[i]] = {};
		       scope = scope[keys[i]];
		    }
			return scope[keys[keys.length - 1]];
		}

	};
});

Scoped.define("module:Strings", ["module:Objs"], function (Objs) {
	/** String Utilities
	 * @module BetaJS.Strings
	 */
	return {
		
		/** Converts a string new lines to html <br /> tags
		 *
		 * @param s string
		 * @return string with new lines replaced by <br />
		 */
		nl2br : function(s) {
			return (s + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
		},
	
		/** Converts special characters in a string to html entitiy symbols
		 *
		 * @param s string
		 * @return converted string
		 */
		htmlentities : function(s) {
			return (s + "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
		},
	
		JS_ESCAPES : {
			"'" : "'",
			'\\' : '\\',
			'\r' : 'r',
			'\n' : 'n',
			'\t' : 't',
			'\u2028' : 'u2028',
			'\u2029' : 'u2029'
		},
	
		JS_ESCAPER_REGEX : function() {
			if (!this.JS_ESCAPER_REGEX_CACHED)
				this.JS_ESCAPER_REGEX_CACHED = new RegExp(Objs.keys(this.JS_ESCAPES).join("|"), 'g');
			return this.JS_ESCAPER_REGEX_CACHED;
		},
	
		/** Converts string such that it can be used in javascript by escaping special symbols
		 *
		 * @param s string
		 * @return escaped string
		 */
		js_escape : function(s) {
			var self = this;
			return s.replace(this.JS_ESCAPER_REGEX(), function(match) {
				return '\\' + self.JS_ESCAPES[match];
			});
		},
	
		/** Determines whether a string starts with a sub string
		 *
		 * @param s string in question
		 * @param needle sub string
		 * @return true if string in question starts with sub string
		 */
		starts_with : function(s, needle) {
			return s.substring(0, needle.length) == needle;
		},
	
		/** Determines whether a string ends with a sub string
		 *
		 * @param s string in question
		 * @param needle sub string
		 * @return true if string in question ends with sub string
		 */
		ends_with : function(s, needle) {
			return s.indexOf(needle, s.length - needle.length) !== -1;
		},
	
		/** Removes sub string from a string if string starts with sub string
		 *
		 * @param s string in question
		 * @param needle sub string
		 * @return string without sub string if it starts with sub string otherwise it returns the original string
		 */
		strip_start : function(s, needle) {
			return this.starts_with(s, needle) ? s.substring(needle.length) : s;
		},
		
		/** Returns the complete remaining part of a string after a the last occurrence of a sub string
		 *
		 * @param s string in question
		 * @param needle sub string
		 * @return remaining part of the string in question after the last occurrence of the sub string
		 */
		last_after : function(s, needle) {
			return this.splitLast(s, needle).tail;
		},
		
		first_after: function (s, needle) {
			return s.substring(s.indexOf(needle) + 1, s.length);
		},
	
		EMAIL_ADDRESS_REGEX : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	
		/** Determines whether a string is a syntactically valid email address
		 *
		 * @param s string in question
		 * @return true if string looks like an email address
		 */
		is_email_address : function(s) {
			return this.EMAIL_ADDRESS_REGEX.test(s);
		},
	
		STRIP_HTML_TAGS : ["script", "style", "head"],
		STRIP_HTML_REGEX : /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi,
		STRIP_HTML_COMMENT_REGEX : /<![^>]*>/gi,
	
		/** Removes all html from data and returns plain text
		 *
		 * @param html string containing html
		 * @return string containing the plain text part of it
		 */
		strip_html : function(html) {
			var result = html;
			for (var i = 0; i < this.STRIP_HTML_TAGS.length; ++i)
				result = result.replace(new RegExp("<" + this.STRIP_HTML_TAGS[i] + ".*</" + this.STRIP_HTML_TAGS[i] + ">", "i"), '');
			result = result.replace(this.STRIP_HTML_REGEX, '').replace(this.STRIP_HTML_COMMENT_REGEX, '');
			return result;
		},
		
		splitFirst: function (s, delimiter) {
			var i = s.indexOf(delimiter);
			return {
				head: i >= 0 ? s.substring(0, i) : s,
				tail: i >= 0 ? s.substring(i + delimiter.length) : ""
			};
		},
		
		splitLast: function (s, delimiter) {
			var i = s.lastIndexOf(delimiter);
			return {
				head: i >= 0 ? s.substring(0, i) : "",
				tail: i >= 0 ? s.substring(i + delimiter.length) : s
			};
		},
		
		replaceAll: function (s, sub, wth) {
			while (s.indexOf(sub) >= 0)
				s = s.replace(sub, wth);
			return s;
		},
	
		/** Trims all trailing and leading whitespace and removes block indentations
		 *
		 * @param s string
		 * @return string with trimmed whitespaces and removed block indentation
		 */
		nltrim : function(s) {
			var a = s.replace(/\t/g, "  ").split("\n");
			var len = null;
			var i = 0;
			for ( i = 0; i < a.length; ++i) {
				var j = 0;
				while (j < a[i].length) {
					if (a[i].charAt(j) != ' ')
						break;
					++j;
				}
				if (j < a[i].length)
					len = len === null ? j : Math.min(j, len);
			}
			for ( i = 0; i < a.length; ++i)
				a[i] = a[i].substring(len);
			return a.join("\n").trim();
		},
	
		read_cookie_string : function(raw, key) {
			var cookie = "; " + raw;
			var parts = cookie.split("; " + key + "=");
			if (parts.length == 2)
				return parts.pop().split(";").shift();
			return null;
		},
	
		write_cookie_string : function(raw, key, value) {
			var cookie = "; " + raw;
			var parts = cookie.split("; " + key + "=");
			if (parts.length == 2)
				cookie = parts[0] + parts[1].substring(parts[1].indexOf(";"));
			return key + "=" + value + cookie;
		},
	
		capitalize : function(input) {
			return input.replace(/\w\S*/g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		},
	
		email_get_name : function(input) {
		    input = input || "";
			var temp = input.split("<");
			input = temp[0].trim();
			if (!input && temp.length > 1) {
				temp = temp[1].split(">");
				input = temp[0].trim();
			}		
			input = input.replace(/['"]/g, "").replace(/[\\._@]/g, " ");
			return this.capitalize(input);
		},
	
		email_get_email : function(input) {
	        input = input || "";
			var temp = input.split("<");
			input = temp[0].trim();
			if (temp.length > 1) {
				temp = temp[1].split(">");
				input = temp[0].trim();
			}
			input = input.replace(/'/g, "").replace(/"/g, "").trim();
			return input;
		},
	
		email_get_salutatory_name : function(input) {
	        input = input || "";
			return (this.email_get_name(input).split(" "))[0];
		}
	};

});
Scoped.define("module:Locales", function () {
	return {
		
		__data: {},
		
		language: null,
		
		get: function (key) {
		    if (this.language && (this.language + "." + key) in this.__data)
		        return this.__data[this.language + "." + key];
			return key in this.__data ? this.__data[key] : key;
		},
		
		register: function (strings, prefix) {
			prefix = prefix ? prefix + "." : "";
			for (var key in strings)
				this.__data[prefix + key] = strings[key];
		},
		
		view: function (base) {
			return {
				context: this,
				prefix: base,
				get: function (key) {
					return this.context.get(this.prefix + "." + key);
				},
				view: function (key) {
					return this.context.view(this.prefix + "." + key);
				},
				register: function (strings, prefix) {
					this.context.register(strings, this.prefix + (prefix ? "." + prefix : ""));
				}
			};
		}
		
	};
	
});	
Scoped.define("module:Structures.AvlTree", function () {
	return {
	
		empty : function() {
			return null;
		},
	
		singleton : function(data) {
			return {
				data : data,
				left : null,
				right : null,
				height : 1,
				length: 1
			};
		},
	
		min : function(root) {
			return root.left ? this.min(root.left) : root.data;
		},
	
		max : function(root) {
			return root.right ? this.max(root.right) : root.data;
		},
	
		height : function(node) {
			return node ? node.height : 0;
		},
		
		length : function (node){
			return node ? node.length : 0;
		}, 
	
		height_join : function(left, right) {
			return 1 + Math.max(this.height(left), this.height(right));
		},
	
		length_join : function(left, right) {
			return 1 + this.length(left) + this.length(right);
		},

		create : function(data, left, right) {
			return {
				data : data,
				left : left,
				right : right,
				height : this.height_join(left, right),
				length : this.length_join(left, right)
			};
		},
	
		balance : function(data, left, right) {
			if (this.height(left) > this.height(right) + 2) {
				if (this.height(left.left) >= this.height(left.right))
					return this.create(left.data, left.left, this.create(data,
							left.right, right));
				else
					return this.create(left.right.data, this.create(left.data,
							left.left, left.right.left), this.create(data,
							left.right.right, right));
			} else if (this.height(right) > this.height(left) + 2) {
				if (this.height(right.right) >= this.height(right.left))
					return this.create(right.data, this.create(data, left,
							right.left), right.right);
				else
					return this.create(right.left.data, this.create(data, left,
							right.left.left), this.create(right.data,
							right.left.right, right.right));
			} else
				return this.create(data, left, right);
		},
	
		__add_left : function(data, left) {
			return left ? this.balance(left.data, this.__add_left(data, left.left),
					left.right) : this.singleton(data);
		},
	
		__add_right : function(data, right) {
			return right ? this.balance(right.data, right.data, this.__add_right(
					data, right.right)) : this.singleton(data);
		},
	
		join : function(data, left, right) {
			if (!left)
				return this.__add_left(data, right);
			else if (!right)
				return this.__add_right(data, left);
			else if (this.height(left) > this.height(right) + 2)
				return this.balance(left.data, left.left, this.join(data,
						left.right, right));
			else if (this.height(right) > this.height(left) + 2)
				return this.balance(right.data, this.join(data, left, right.left),
						right.right);
			else
				return this.create(data, left, right);
		},
	
		take_min : function(root) {
			if (!root.left)
				return [ root.data, root.right ];
			var result = this.take_min(root.left);
			return [ result[0], this.join(root.data, result[1], root.right) ];
		},
	
		take_max : function(root) {
			if (!root.right)
				return [ root.data, root.left ];
			var result = this.take_max(root.right);
			return [ result[0], this.join(root.data, root.left, result[1]) ];
		},
	
		reroot : function(left, right) {
			if (!left || !right)
				return left || right;
			if (this.height(left) > this.height(right)) {
				var max = this.take_max(left);
				return this.join(max[0], max[1], right);
			}
			var min = this.take_min(right);
			return this.join(min[0], left, min[1]);
	
		},
	
		take_min_iter : function(root) {
			if (!root)
				return null;
			if (!root.left)
				return [ root.data, root.left ];
			return this.take_min_iter(this.create(root.left.data, root.left.left,
					this.create(root.data, root.left.right, root.right)));
		},
	
		take_max_iter : function(root) {
			if (!root)
				return null;
			if (!root.right)
				return [ root.data, root.right ];
			return this.take_max_iter(this.create(root.right.data, this.create(
					root.data, root.left, root.right.left), root.right.right));
		}
	
	};
	
});


Scoped.define("module:Structures.TreeMap", ["module:Structures.AvlTree"], function (AvlTree) {
	return {
	
		empty : function(compare) {
			return {
				root : null,
				compare : compare || function(x, y) {
					return x > y ? 1 : x < y ? -1 : 0;
				}
			};
		},
	
		is_empty : function(t) {
			return !t.root;
		},
	
		length : function(t) {
			return t.root ? t.root.length : 0;
		},
	
		__add : function(key, value, t, node) {
			var kv = {
				key : key,
				value : value
			};
			if (!node) 
				return AvlTree.singleton(kv);
			var c = t.compare(key, node.data.key);
			if (c === 0) {
				node.data = kv;
				return node;
			} else if (c < 0)
				return AvlTree.balance(node.data, this.__add(key, value, t, node.left), node.right);
			else
				return AvlTree.balance(node.data, node.left, this.__add(key, value, t, node.right));
		},
	
		add : function(key, value, t) {
			t.root = this.__add(key, value, t, t.root);
			return t;
		},
	
		singleton : function(key, value, compare) {
			return this.add(key, value, this.empty(compare));
		},
	
		__find : function(key, t, root) {
			if (!root)
				return null;
			var c = t.compare(key, root.data.key);
			return c === 0 ? root.data.value : this.__find(key, t, c < 0 ? root.left : root.right);
		},
	
		find : function(key, t) {
			return this.__find(key, t, t.root);
		},
	
		__iterate : function(t, node, callback, context, reverse) {
			if (!node)
				return true;
			return (
				this.__iterate(t, reverse ? node.right : node.left, callback, context, reverse) &&
				(callback.call(context, node.data.key, node.data.value) !== false) &&
				this.__iterate(t, reverse ? node.left : node.right, callback, context, reverse));
		},
	
		iterate : function(t, callback, context, reverse) {
			this.__iterate(t, t.root, callback, context, reverse);
		},
	
		__iterate_from : function(key, t, node, callback, context, reverse) {
			if (!node)
				return true;
			var c = t.compare(key, node.data.key) * (reverse ? -1 : 1);
			if (c < 0 && !this.__iterate_from(key, t, reverse ? node.right : node.left, callback, context, reverse))
				return false;
			if (c <= 0 && callback.call(context, node.data.key, node.data.value) === false)
				return false;
			return this.__iterate_from(key, t, reverse ? node.left : node.right, callback, context, reverse);
		},
	
		iterate_from : function(key, t, callback, context, reverse) {
			this.__iterate_from(key, t, t.root, callback, context, reverse);
		},
	
		iterate_range : function(from_key, to_key, t, callback, context, reverse) {
			this.iterate_from(from_key, t, function(key, value) {
				return t.compare(key, to_key) * (reverse ? -1 : 1) <= 0 && callback.call(context, key, value) !== false;
			}, this, reverse);
		},
		
		take_min: function (t) {
			var a = AvlTree.take_min(t.root);
			a[1] = {
				compare: t.compare,
				root: a[1]
			};
			return a;
		},
		
		__treeSizeLeft: function (key, t, node) {
			var c = t.compare(key, node.data.key);
			if (c < 0)
				return this.__treeSizeLeft(key, t, node.left);
			return 1 + (node.left ? node.left.length : 0) + (c > 0 ? this.__treeSizeLeft(key, t, node.right) : 0);
		},
		
		__treeSizeRight: function (key, t, node) {
			var c = t.compare(key, node.data.key);
			if (c > 0)
				return this.__treeSizeRight(key, t, node.right);
			return 1 + (node.right ? node.right.length : 0) + (c < 0 ? this.__treeSizeRight(key, t, node.left) : 0);
		},
		
		__distance: function (keyLeft, keyRight, t, node) {
			var cLeft = t.compare(keyLeft, node.data.key);
			var cRight = t.compare(keyRight, node.data.key);
			if (cLeft > 0 || cRight < 0)
				return this.__distance(keyLeft, keyRight, t, cLeft > 0 ? node.right : node.left);
			return 1 + (cRight > 0 ? this.__treeSizeLeft(keyRight, t, node.right) : 0) + (cLeft < 0 ? this.__treeSizeRight(keyLeft, t, node.left) : 0);
		},
		
		treeSizeLeft: function (key, t) {
			return this.__treeSizeLeft(key, t, t.root);
		},
		
		treeSizeRight: function (key, t) {
			return this.__treeSizeRight(key, t, t.root);
		},

		distance: function (keyLeft, keyRight, t) {
			return t.compare(keyLeft, keyRight) < 0 ? this.__distance(keyLeft, keyRight, t, t.root) - 1 : 0;
		}
	
	};

});
Scoped.define("module:Time", ["module:Locales"], function (Locales) {
	return {
			
		/*
		 * All time routines are based on UTC time.
		 * The optional timezone parameter should be used as follows:
		 *    - undefined or false: UTC
		 *    - true: user's local time zone
		 *    - int value: actual time zone bias in minutes
		 */
			
		
		timezoneBias: function (timezone) {
			if (timezone === true)
				timezone = (new Date()).getTimezoneOffset();
			if (typeof timezone == "undefined" || timezone === null || timezone === false)
				timezone = 0;
			return timezone * 60 * 1000;
		},
			
		timeToDate: function (t, timezone) {
			return new Date(t + this.timezoneBias(timezone));
		},
		
		dateToTime: function (d, timezone) {
			return d.getTime() - this.timezoneBias(timezone);
		},
		
		timeToTimezoneBasedDate: function (t, timezone) {
			return new Date(t - this.timezoneBias(timezone));
		},
		
		timezoneBasedDateToTime: function (d, timezone) {
			return d.getTime() + this.timezoneBias(timezone);
		},
	
		__components: {
			"year": {
				"set": function (date, value) { date.setUTCFullYear(value); },
				"get": function (date) { return date.getUTCFullYear(); }
			},
			"month": {
				"set": function (date, value) { date.setUTCMonth(value); },
				"get": function (date) { return date.getUTCMonth(); }
			},
			"day": {
				"dependencies": {"weekday": true},
				"set": function (date, value) { date.setUTCDate(value + 1); },
				"get": function (date) { return date.getUTCDate() - 1; },
				"milliseconds": 24 * 60 * 60 * 1000
			},
			"weekday": {
				"dependencies": {"day": true, "month": true, "year": true},
				"set": function (date, value) { date.setUTCDate(date.getUTCDate() + value - date.getUTCDay()); },
				"get": function (date) { return date.getUTCDay(); }
			},
			"hour": {
				"set": function (date, value) { date.setUTCHours(value); },
				"get": function (date) { return date.getUTCHours(); },
				"max": 23,
				"milliseconds": 60 * 60 * 1000
			},
			"minute": {
				"set": function (date, value) { date.setUTCMinutes(value); },
				"get": function (date) { return date.getUTCMinutes(); },
				"max": 59,
				"milliseconds": 60 * 1000
			},
			"second": {
				"set": function (date, value) { date.setUTCSeconds(value); },
				"get": function (date) { return date.getUTCSeconds(); },
				"max": 59,
				"milliseconds": 1000
			},
			"millisecond": {
				"set": function (date, value) { date.setUTCMilliseconds(value); },
				"get": function (date) { return date.getUTCMilliseconds(); },
				"max": 999,
				"milliseconds": 1
			}
		},
		
		decodeTime: function (t, timezone) {
			var d = this.timeToTimezoneBasedDate(t, timezone);
			var result = {};
			for (var key in this.__components)
				result[key] = this.__components[key].get(d);
			return result;
		},
	
		encodeTime: function (data, timezone) {
			return this.updateTime(this.now(), data, timezone);
		},
		
		encodePeriod: function (data) {
			return this.incrementTime(0, data);
		},
		
		updateTime: function (t, data, timezone) {
			var d = this.timeToTimezoneBasedDate(t, timezone);
			for (var key in data)
				this.__components[key].set(d, data[key]);
			return this.timezoneBasedDateToTime(d, timezone);
		},
		
		now: function (timezone) {
			return this.dateToTime(new Date(), timezone);
		},
		
		incrementTime: function (t, data) {
			var d = this.timeToDate(t);
			for (var key in data) 
				this.__components[key].set(d, this.__components[key].get(d) + data[key]);
			return this.dateToTime(d);
		},
		
		floorTime: function (t, key, timezone) {
			var d = this.timeToTimezoneBasedDate(t, timezone);
			var found = false;
			for (var comp in this.__components) {
				var c = this.__components[comp];
				found = found || comp == key;
				if (found && (!c.dependencies || !c.dependencies[key]))
					c.set(d, 0);
			}
			return this.timezoneBasedDateToTime(d, timezone);
		},
		
		ago: function (t, timezone) {
			return this.now(timezone) - t;
		},
		
		timeComponent: function (t, key, round) {
			return Math[round || "floor"](t / this.__components[key].milliseconds);
		},
		
		timeModulo: function (t, key, round) {
			return this.timeComponent(t, key, round) % (this.__components[key].max + 1);
		},
		
		formatTimePeriod: function (t, options) {
			options = options || {};
			var components = options.components || ["day", "hour", "minute", "second"];
			var component = "";
			var timeComponent = 0;
			for (var i = 0; i < components.length; ++i) {
				component = components[i];
				timeComponent = this.timeComponent(t, component, options.round || "round");
				if (timeComponent)
					break;
			}
			return timeComponent + " " + Locales.get(component + (timeComponent == 1 ? "" : "s"));
		},
		
		formatTime: function(t, s) {
			var components = ["hour", "minute", "second"];
			s = s || "hhh:mm:ss";
			var replacers = {};
			for (var i = 0; i < components.length; ++i) {
				var c = components[i].charAt(0);
				replacers[c + c + c] = this.timeComponent(t, components[i], "floor");
				var temp = this.timeModulo(t, components[i], "floor");
				replacers[c + c] = temp < 10 ? "0" + temp : temp; 
				replacers[c] = temp;
			}
			for (var key in replacers)
				s = s.replace(key, replacers[key]);
			return s;
		}
		
	};

});
Scoped.define("module:Async", ["module:Types", "module:Functions"], function (Types, Functions) {
	return {		
		
		waitFor: function () {
			var args = Functions.matchArgs(arguments, {
				condition: true,
				conditionCtx: "object",
				callback: true,
				callbackCtx: "object",
				interval: "int"
			});
			var h = function () {
				try {
					return !!args.condition.apply(args.conditionCtx || args.callbackCtx || this);
				} catch (e) {
					
					return false;
				}
			};
			if (h())
				args.callback.apply(args.callbackCtx || this);
			else {
				var timer = setInterval(function () {
					if (h()) {
						clearInterval(timer);
						args.callback.apply(args.callbackCtx || this);
					}
				}, args.interval || 1);
			}
		},
		
		eventually: function (func, params, context) {
			var timer = setTimeout(function () {
				clearTimeout(timer);
				if (!Types.is_array(params)) {
					context = params;
					params = [];
				}
				func.apply(context || this, params || []);
			}, 0);
		},
		
		eventuallyOnce: function (func, params, context) {
			var data = {
				func: func,
				params: params,
				context: context
			};
			for (var key in this.__eventuallyOnce) {
				var record = this.__eventuallyOnce[key];
				if (record.func == func && record.params == params && record.context == context)
					return;
			}
			this.__eventuallyOnceIdx++;
			var index = this.__eventuallyOnceIdx;
			this.__eventuallyOnce[index] = data;
			this.eventually(function () {
				delete this.__eventuallyOnce[index];
				func.apply(context || this, params || []);
			}, this);
		},
		
		__eventuallyOnce: {},
		__eventuallyOnceIdx: 1
		
	};

});
Scoped.define("module:Promise", ["module:Types", "module:Functions", "module:Async"], function (Types, Functions, Async) {
	return {		
			
		Promise: function (value, error, finished) {
			this.__value = error ? null : (value || null);
			this.__error = error ? error : null;
			this.__isFinished = finished;
			this.__hasError = !!error;
			this.__resultPromise = null;
			this.__callbacks = [];
		},
		
		create: function (value, error) {
			return new this.Promise(value, error, arguments.length > 0);
		},
		
		value: function (value) {
			return this.is(value) ? value : new this.Promise(value, null, true);
		},
		
		eventualValue: function (value) {
			var promise = new this.Promise();
			Async.eventually(function () {
				promise.asyncSuccess(value);
			});
			return promise;
		},
	
		error: function (error) {
			return this.is(error) ? error : new this.Promise(null, error, true);
		},
		
		box: function (f, ctx, params) {
			try {
				var result = f.apply(ctx || this, params || []);
				return this.is(result) ? result : this.value(result);
			} catch (e) {
				return this.error(e);
			}
		},
		
		tryCatch: function (f, ctx) {
			try {
				return this.value(f.apply(ctx || this));
			} catch (e) {
				return this.error(e);
			}
		},
		
		funcCallback: function (ctx, func) {
			var args  = Functions.getArguments(arguments, 1);
			if (Types.is_function(ctx)) {
				args = Functions.getArguments(arguments, 1);
				func = ctx;
				ctx = this;
			} else
				args = Functions.getArguments(arguments, 2);
			var promise = this.create();
			args.push(promise.asyncCallbackFunc());
			func.apply(ctx, args);
			return promise;
		},
		
		and: function (promises) {
			var promise = this.create();
			promise.__promises = [];
			promise.__successCount = 0;
			promise.__values = [];
			promise.__errorPromise = null;
			promise.and = function (promises) {
				promises = promises || [];
				if (this.__ended)
					return this;
				if (!Types.is_array(promises))
					promises = [promises];
				var f = function (error, value) {
					if (error)
						this.__errorPromise = promises[this.idx];
					else {
						this.promise.__successCount++;
						this.promise.__values[this.idx] = value;
					}
					this.promise.results();
				};
				for (var i = 0; i < promises.length; ++i) {
					var last = this.__promises.length;
					this.__promises.push(promises[i]);
					this.__values.push(null);
					if (promises[i].isFinished()) {
						if (promises[i].hasValue()) {
							this.__successCount++;
							this.__values[last] = promises[i].value();
						} else
							this.__errorPromise = promises[i];
					} else {
						promises[i].callback(f, {promise: this, idx: last});					
					}
				}
				return this;
			};
			promise.end = function () {
				if (this.__ended)
					return this;
				this.__ended = true;
				this.results();
				return this;
			};
			promise.results = function () {
				if (this.__ended && this.__errorPromise)
					this.asyncError(this.__errorPromise.err(), this.__errorPromise);
				else if (this.__ended && this.__successCount == this.__promises.length)
					this.asyncSuccess(this.__values);
				return this;
			};
			promise.successUnfold = function (f, context, options) {
				return this.success(function () {
					return f.apply(context, arguments);
				}, context, options);
			};
			promise.and(promises);
			return promise;
		},
		
		func: function (func) {
			var args = Functions.getArguments(arguments, 1);
			var promises = [];
			for (var i = 0; i < args.length; ++i) {
				if (this.is(args[i]))
					promises.push(args[i]);
			}
			var promise = this.create();
			this.and(promises).end().success(function (values) {
				var params = [];
				for (var i = 0; i < args.length; ++i)
					params[i] = this.is(args[i]) ? args[i].value() : args[i];
				var result = func.apply(this, params);
				if (this.is(result))
					result.forwardCallback(promise);
				else
					promise.asyncSuccess(result);
			}, this).forwardError(promise);
			return promise;
		},
		
		methodArgs: function (ctx, func, params) {
			params.unshift(function () {
				return func.apply(ctx, arguments);
			});
			return this.func.apply(this, params);
		},
		
		method: function (ctx, func) {
			return this.methodArgs(ctx, func, Functions.getArguments(arguments, 2));
		},
	
		newClass: function (cls) {
			var params = Functions.getArguments(arguments, 1);
			params.unshift(Functions.newClassFunc(cls));
			return this.func.apply(this, params);
		},
		
		is: function (obj) {
			return obj && Types.is_object(obj) && obj.classGuid == this.Promise.prototype.classGuid;
		} 
		
	};
});


Scoped.extend("module:Promise.Promise.prototype", ["module:Promise", "module:Functions"], function (Promise, Functions) {
	
	return {
		
		classGuid: "7e3ed52f-22da-4e9c-95a4-e9bb877a3935",
		
		success: function (f, context, options) {
			return this.callback(f, context, options, "success");
		},
		
		error: function (f, context, options) {
			return this.callback(f, context, options, "error");
		},
		
		callback: function (f, context, options, type) {
			if ("end" in this)
				this.end();
			var record = {
				type: type || "callback",
				func: f,
				options: options || {},
				context: context
			};
			if (this.__isFinished)
				this.triggerResult(record);
			else
				this.__callbacks.push(record);
			return this;
		},
		
		triggerResult: function (record) {
			if (!this.__isFinished)
				return this;
			if (record) {
				if (record.type == "success" && !this.__hasError)
					record.func.call(record.context || this, this.__value, this.__resultPromise || this);
				else if (record.type == "error" && this.__hasError)
					record.func.call(record.context || this, this.__error, this.__resultPromise || this);
				else if (record.type == "callback")
					record.func.call(record.context || this, this.__error, this.__value, this.__resultPromise || this);
			} else {
				var records = this.__callbacks;
				this.__callbacks = [];
				for (var i = 0; i < records.length; ++i)
					this.triggerResult(records[i]);
			}
			return this;
		},
		
		value: function () {
			return this.__value;
		},

		err: function () {
			return this.__error;
		},

		isFinished: function () {
			return this.__isFinished;
		},

		hasValue: function () {
			return this.__isFinished && !this.__hasError;
		},

		hasError: function () {
			return this.__isFinished && this.__hasError;
		},

		asyncSuccess: function (value, promise) {
			if (this.__isFinished) 
				return this;
			this.__resultPromise = promise;
			this.__error = null;
			this.__isFinished = true;
			this.__hasError = false;
			this.__value = value;
			return this.triggerResult();
		},

		forwardSuccess: function (promise) {
			this.success(promise.asyncSuccess, promise);
			return this;
		},

		asyncError: function (error, promise) {
			if (this.__isFinished) 
				return this;
			this.__resultPromise = promise;
			this.__isFinished = true;
			this.__hasError = true;
			this.__error = error;
			this.__value = null;
			return this.triggerResult();
		},

		forwardError: function (promise) {
			this.error(promise.asyncError, promise);
			return this;
		},

		asyncCallback: function (error, value, promise) {
			if (error)
				return this.asyncError(error, promise);
			else
				return this.asyncSuccess(value, promise);
		},

		asyncCallbackFunc: function () {
			return Functions.as_method(this.asyncCallback, this);
		},

		forwardCallback: function (promise) {
			this.callback(promise.asyncCallback, promise);
			return this;
		},

		mapSuccess: function (func, ctx) {
			var promise = Promise.create();
			this.forwardError(promise).success(function (value, pr) {
				var result = func.call(ctx || promise, value, pr);
				if (Promise.is(result))
					result.forwardCallback(promise);
				else
					promise.asyncSuccess(result);
			});
			return promise;
		},
		
		mapError: function (func, ctx) {
			var promise = Promise.create();
			this.forwardSuccess(promise).error(function (err, pr) {
				var result = func.call(ctx || promise, err, pr);
				if (Promise.is(result))
					result.forwardCallback(promise);
				else
					promise.asyncError(result);
			});
			return promise;
		},

		mapCallback: function (func, ctx) {
			var promise = Promise.create();
			this.callback(function (err, value, pr) {
				var result = func.call(ctx || promise, err, value, pr);
				if (Promise.is(result))
					result.forwardCallback(promise);
				else
					promise.asyncCallback(err ? result : err, err ? value : result, pr);
			});
			return promise;
		},

		and: function (promises) {
			var result = Promise.and(this);
			return result.and(promises);
		}
			
	};
	
});
Scoped.define("module:JavaScript", ["module:Objs"], function (Objs) {
	return {
		
		STRING_SINGLE_QUOTATION_REGEX: /'[^']*'/g,
		STRING_DOUBLE_QUOTATION_REGEX: /"[^"]*"/g,
		
		IDENTIFIER_REGEX: /[a-zA-Z_][a-zA-Z_0-9]*/g,
		IDENTIFIER_SCOPE_REGEX: /[a-zA-Z_][a-zA-Z_0-9\.]*/g,
	
		RESERVED: Objs.objectify(
			["if", "then", "else", "return", "var"],
			true),
		
		isReserved: function (key) {
			return key in this.RESERVED;
		},
		
		isIdentifier: function (key) {
			return !this.isReserved(key);
		},
		
		removeStrings: function (code) {
			return code.replace(this.STRING_SINGLE_QUOTATION_REGEX, "").replace(this.STRING_DOUBLE_QUOTATION_REGEX, "");
		},	
		
		extractIdentifiers: function (code, keepScopes) {
			var regex = keepScopes ? this.IDENTIFIER_SCOPE_REGEX : this.IDENTIFIER_REGEX;
			code = this.removeStrings(code);
			return Objs.filter(code.match(regex), this.isIdentifier, this);
		}
			
	};

});
Scoped.define("module:Class", ["module:Types", "module:Objs", "module:Functions", "module:Ids"], function (Types, Objs, Functions, Ids) {
	var Class = function () {};

	/** @suppress {checkTypes} */
	Class.extend = function (options, objects, statics, class_statics) {
		objects = objects || [];
		if (!Types.is_array(objects))
			objects = [objects];
		statics = statics || [];
		if (!Types.is_array(statics))
			statics = [statics];
		class_statics = class_statics || [];
		if (!Types.is_array(class_statics))
			class_statics = [class_statics];
		
		var parent = this;
		
		objects = Objs.map(objects, function (obj) {
			if (Types.is_function(obj))
				obj = obj(parent.prototype);
			return obj;
		});
		
		var result;
		
		// Setup JavaScript Constructor
		Objs.iter(objects, function (obj) {
			if (obj.hasOwnProperty("constructor"))
				result = obj.constructor;
		});
		var has_constructor = Types.is_defined(result);
		if (!Types.is_defined(result))
			result = function () { parent.apply(this, arguments); };
	
		// Add Parent Statics
		Objs.extend(result, parent);
	
		// Add External Statics
		Objs.iter(statics, function (stat) {
			Objs.extend(result, Types.is_function(stat) ? stat(parent) : stat);
		});
		
		
		// Add Class Statics
		var class_statics_keys = {};
		if (parent.__class_statics_keys) {
			for (var key in parent.__class_statics_keys) 
				result[key] = Objs.clone(parent[key], 1);
		}
		Objs.iter(class_statics, function (stat) {
			Objs.extend(result, stat);
			Objs.extend(class_statics_keys, Objs.keys(stat, true));
		});
		if (parent.__class_statics_keys)
			Objs.extend(class_statics_keys, parent.__class_statics_keys);
		result.__class_statics_keys = class_statics_keys;
		
		// Parent & Children Hierarchy
		result.parent = parent;
		result.children = [];
		result.extend = this.extend;
		if (!parent.children)
			parent.children = [];
		parent.children.push(result);
		
		// Setup Prototype
		var ctor = function () {};
		ctor.prototype = parent.prototype;
		result.prototype = new ctor();
	
		result.prototype.cls = result;
	
		
		options = Objs.extend({
		}, Types.is_string(options) ? {
			classname: options,
			register: true
		} : options);
		
		var classname = options.classname;
		if (options.scoped)
			classname = options.scoped.ns.path;
		
		result.classname = classname;
		if (classname && options.register)
			Scoped.setGlobal(classname, result);
		
		// Setup Prototype
		result.__notifications = {};
		
		if (parent.__notifications)
			Objs.extend(result.__notifications, parent.__notifications, 1);		
	
		Objs.iter(objects, function (object) {
			Objs.extend(result.prototype, object);
	
			// Note: Required for Internet Explorer
			if ("constructor" in object)
				result.prototype.constructor = object.constructor;
	
			if (object._notifications) {
				for (var key in object._notifications) {
					if (!result.__notifications[key])
						result.__notifications[key] = [];
					result.__notifications[key].push(object._notifications[key]);
				}
			}
		});	
		delete result.prototype._notifications;
	
		if (!has_constructor)
			result.prototype.constructor = parent.prototype.constructor;
			
		return result; 
	};
	
	
	/*
	 * 
	 * Extending the Class
	 * 
	 */
	
	Objs.extend(Class, {
		
		classname: "Class",
		
		__class_guid: "0f5499f9-f0d1-4c6c-a561-ef026a1eee05",	
		
		__notifications: {},
		
		ancestor_of: function (cls) {
			return (this == cls) || (this != Class && this.parent.ancestor_of(cls));
		},
		
		is_class: function (cls) {
			return cls && Types.is_object(cls) && ("__class_guid" in cls) && cls.__class_guid == this.__class_guid;
		},
		
		is_class_instance: function (obj) {
			return obj && Types.is_object(obj) && ("__class_instance_guid" in obj) && obj.__class_instance_guid == this.prototype.__class_instance_guid;
		},
		
		is_instance_of: function (obj) {
			return obj && this.is_class_instance(obj) && obj.instance_of(this);
		},
		
		// Legacy Methods
	
		_inherited: function (cls, func) {
			return cls.parent[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
		}	
		
	});
	
	
	
	
	
	
	/*
	 * 
	 * Extending the Object
	 * 
	 */
	
	Class.prototype.__class_instance_guid = "e6b0ed30-80ee-4b28-af02-7d52430ba45f";
	
	Class.prototype.constructor = function () {
		this._notify("construct");
	};
	
	Class.prototype.destroy = function () {
		this._notify("destroy");
		if (this.__auto_destroy_list) {
			for (var i = 0; i < this.__auto_destroy_list.length; ++i) {
				if ("destroy" in this.__auto_destroy_list[i])
					this.__auto_destroy_list[i].destroy();
			}
		}
		var cid = this.cid();
		for (var key in this)
			delete this[key];
		Ids.objectId(this, cid);
		this.destroy = this.__destroyedDestroy;
	};
	
	Class.prototype.destroyed = function () {
		return this.destroy === this.__destroyedDestroy;
	};
	
	Class.prototype.__destroyedDestroy = function () {
		throw ("Trying to destroy destroyed object " + this.cid() + ": " + this.cls.classname + ".");
	};
	
	Class.prototype.cid = function () {
		return Ids.objectId(this);
	};

	Class.prototype.cls = Class;
	
	Class.prototype.as_method = function (s) {
		return Functions.as_method(this[s], this);
	};
	
	Class.prototype.auto_destroy = function (obj) {
		if (!this.__auto_destroy_list)
			this.__auto_destroy_list = [];
		var target = obj;
		if (!Types.is_array(target))
		   target = [target];
		for (var i = 0; i < target.length; ++i)
		   this.__auto_destroy_list.push(target[i]);
		return obj;
	};
	
	Class.prototype._notify = function (name) {
		if (!this.cls.__notifications)
			return;
		var rest = Array.prototype.slice.call(arguments, 1);
		Objs.iter(this.cls.__notifications[name], function (entry) {
			var method = Types.is_function(entry) ? entry : this[entry];
			if (!method)
				throw this.cls.classname  + ": Could not find " + name + " notification handler " + entry;
			method.apply(this, rest);
		}, this);
	};
	
	Class.prototype.instance_of = function (cls) {
		return this.cls.ancestor_of(cls);
	};
	
	// Legacy Methods
	
	Class.prototype._auto_destroy = function(obj) {
		return this.auto_destroy(obj);
	};
	
	Class.prototype._inherited = function (cls, func) {
		return cls.parent.prototype[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
	};
		
	return Class;

});
	
Scoped.define("module:Exceptions.Exception", ["module:Class"], function (Class, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (message) {
				inherited.constructor.call(this);
				this.__message = message;
			},
			
			assert: function (exception_class) {
				if (!this.instance_of(exception_class))
					throw this;
				return this;
			},
			
			message: function () {
				return this.__message;
			},
			
			toString: function () {
				return this.message();
			},
			
			format: function () {
				return this.cls.classname + ": " + this.toString();
			},
			
			json: function () {
				return {
					classname: this.cls.classname,
					message: this.message()
				};
			}
			
		};
	});
});


Scoped.define("module:Exceptions.NativeException", ["module:Exceptions.Exception"], function (Exception, scoped) {
	return Exception.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (object) {
				inherited.constructor.call(this, object ? ("toString" in object ? object.toString() : object) : "null");
				this.__object = object;
			},
			
			object: function () {
				return this.__object;
			}

		};
	});
});


Scoped.extend("module:Exceptions", ["module:Types", "module:Exceptions.Exception", "module:Exceptions.NativeException"], function (Types, Exception, NativeException) {
	return {
		
		ensure: function (e) {
			return Exception.is_instance_of(e) ? e : new NativeException(e);
		}

	};
});

Scoped.extend("module:Exceptions.Exception", ["module:Exceptions"], ["module:Exceptions.ensure"], function (Exceptions) {
	
	return {
		
		ensure: function (e) {
			return Exceptions.ensure(e).assert(this);
		}
		
	};
});

/*
 * Inspired by Underscore's Templating Engine
 * (which itself is inspired by John Resig's implementation)
 */

Scoped.define("module:Templates", ["module:Types", "module:Strings"], function (Types, Strings) {
	return {
		
		tokenize: function (s) {
			// Already tokenized?
			if (Types.is_array(s))
				return s;
			var tokens = [];
			var index = 0;
			var self = this;
			s.replace(self.SYNTAX_REGEX(), function(match, expr, esc, code, offset) {
				if (index < offset) 
					tokens.push({
						type: self.TOKEN_STRING,
						data: Strings.js_escape(s.slice(index, offset))
					});
				if (code)
					tokens.push({type: self.TOKEN_CODE, data: code});
				if (expr)
					tokens.push({type: self.TOKEN_EXPR, data: expr});
				if (esc)
					tokens.push({type: self.TOKEN_ESC, data: esc});
			    index = offset + match.length;
			    return match;
			});
			return tokens;
		},
		
		/*
		 * options
		 *  - start_index: token start index
		 *  - end_index: token end index
		 */
		compile: function(source, options) {
			if (Types.is_string(source))
				source = this.tokenize(source);
			options = options || {};
			var start_index = options.start_index || 0;
			var end_index = options.end_index || source.length;
			var result = "__p+='";
			for (var i = start_index; i < end_index; ++i) {
				switch (source[i].type) {
					case this.TOKEN_STRING:
						result += source[i].data;
						break;
					case this.TOKEN_CODE:
						result += "';\n" + source[i].data + "\n__p+='";
						break;
					case this.TOKEN_EXPR:
						result += "'+\n((__t=(" + source[i].data + "))==null?'':__t)+\n'";
						break;
					case this.TOKEN_ESC:
						result += "'+\n((__t=(" + source[i].data + "))==null?'':Helpers.Strings.htmlentities(__t))+\n'";
						break;
					default:
						break;
				}	
			}
			result += "';\n";
			result = 'with(obj||{}){\n' + result + '}\n';
			result = "var __t,__p='',__j=Array.prototype.join," +
			  "echo=function(){__p+=__j.call(arguments,'');};\n" +
			  result + "return __p;\n";
			/*jslint evil: true */
			var func = new Function('obj', 'Helpers', result);
			var func_call = function(data) {
				return func.call(this, data, {Strings: Strings});
			};
			func_call.source = 'function(obj, Helpers){\n' + result + '}';
			return func_call;
		},
		
		SYNTAX: {
			OPEN: "{%",
			CLOSE: "%}",
			MODIFIER_CODE: "",
			MODIFIER_EXPR: "=",
			MODIFIER_ESC: "-"
		},
		
		SYNTAX_REGEX: function () {
			var syntax = this.SYNTAX;
			if (!this.SYNTAX_REGEX_CACHED) {
				this.SYNTAX_REGEX_CACHED = new RegExp(
					syntax.OPEN + syntax.MODIFIER_EXPR + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
					syntax.OPEN + syntax.MODIFIER_ESC + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
					syntax.OPEN + syntax.MODIFIER_CODE + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
					"$",
				'g');
			}
			return this.SYNTAX_REGEX_CACHED;
		},
		
		TOKEN_STRING: 1,
		TOKEN_CODE: 2,
		TOKEN_EXPR: 3,
		TOKEN_ESC: 4
	
	};
});


Scoped.define("module:Templates.Template", ["module:Class", "module:Templates"], function (Class, Templates, scoped) {	
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (template_string) {
				inherited.constructor.call(this);
				this.__tokens = Templates.tokenize(template_string);
				this.__compiled = Templates.compile(this.__tokens);
			},
			
			evaluate: function (obj) {
				return this.__compiled.apply(this, [obj]);
			}
			
		};
	});	
});


Scoped.define("module:Parser.LexerException", ["module:Exceptions.Exception"], function (Exception, scoped) {
	return Exception.extend({scoped: scoped}, function (inherited) {
		return {
			constructor: function (head, tail) {
				inherited.constructor.call(this, "Lexer error: Unrecognized identifier at " + head.length + ".");
				this.__head = head;
				this.__tail = tail;
			}
		};
	});
});


Scoped.define("module:Parser.Lexer", ["module:Class", "module:Types", "module:Objs", "module:Parser.LexerException"], function (Class, Types, Objs, LexerException, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (patterns) {
				inherited.constructor.call(this);
				this.__patterns = [];
				Objs.iter(patterns, function (value, key) {
					this.__patterns.push({
						regex: new RegExp("^" + key, "m"),
						data: Types.is_string(value) ? {token: value} : value
					});
				}, this);
			},
			
			lex: function (source) {
				var result = [];
				var head = "";
				var tail = source;
				while (tail) {
					var match = null;
					var data = null;
					for (var i = 0; i < this.__patterns.length; ++i) {
						match = this.__patterns[i].regex.exec(tail);
						if (match) { 
							data = Objs.clone(this.__patterns[i].data, 1);
							break;
						}
					}
					if (!match)
						throw new LexerException(head, tail);
					head += match[0];
					tail = tail.substring(match[0].length);
					if (!data)
						continue;
					for (var key in data) {
						if (Types.is_string(data[key])) {
							for (var j = 0; j < match.length; ++j)
								data[key] = data[key].replace("$" + j, match[j]);
						}
					}
					result.push(data);
				}
				return result;
			}			
			
		};
	});
});


Scoped.define("module:Timers.Timer", ["module:Class", "module:Objs"], function (Class, Objs, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			/*
			 * int delay (mandatory): number of milliseconds until it fires
			 * bool once (optional, default false): should it fire infinitely often
			 * func fire (optional): will be fired
			 * object context (optional): for fire
			 * bool start (optional, default true): should it start immediately
			 * 
			 */
			constructor: function (options) {
				inherited.constructor.call(this);
				options = Objs.extend({
					once: false,
					start: true,
					fire: null,
					context: this,
					destroy_on_fire: false
				}, options);
				this.__delay = options.delay;
				this.__destroy_on_fire = options.destroy_on_fire;
				this.__once = options.once;
				this.__fire = options.fire;
				this.__context = options.context;
				this.__started = false;
				if (options.start)
					this.start();
			},
			
			destroy: function () {
				this.stop();
				inherited.destroy.call(this);
			},
			
			fire: function () {
				if (this.__once)
					this.__started = false;
				if (this.__fire)
					this.__fire.apply(this.__context, [this]);
				if (this.__destroy_on_fire)
					this.destroy();
			},
			
			stop: function () {
				if (!this.__started)
					return;
				if (this.__once)
					clearTimeout(this.__timer);
				else
					clearInterval(this.__timer);
				this.__started = false;
			},
			
			start: function () {
				if (this.__started)
					return;
				var self = this;
				if (this.__once)
					this.__timer = setTimeout(function () {
						self.fire();
					}, this.__delay);
				else
					this.__timer = setInterval(function () {
						self.fire();
					}, this.__delay);
				this.__started = true;
			},
			
			restart: function () {
				this.stop();
				this.start();
			}
			
			
		};
	});
});

Scoped.extend("module:Iterators", ["module:Types", "module:Iterators.Iterator", "module:Iterators.ArrayIterator"], function (Types, Iterator, ArrayIterator) {
	return {
		ensure: function (mixed) {
			if (mixed === null)
				return new ArrayIterator([]);
			if (mixed.instance_of(Iterator))
				return mixed;
			if (Types.is_array(mixed))
				return new ArrayIterator(mixed);
			return new ArrayIterator([mixed]);
		}		
	};
});


Scoped.define("module:Iterators.Iterator", ["module:Class", "module:Functions"], function (Class, Functions, scoped) {
	return Class.extend({scoped: scoped}, {

		asArray: function () {
			var arr = [];
			while (this.hasNext())
				arr.push(this.next());
			return arr;
		},
		
		asArrayDelegate: function (f) {
			var arr = [];
			while (this.hasNext()) {
				var obj = this.next();			
				arr.push(obj[f].apply(obj, Functions.getArguments(arguments, 1)));
			}
			return arr;
		},
		
		iterate: function (callback, context) {
			while (this.hasNext())
				callback.call(context || this, this.next());
		}
		
	});
});


Scoped.define("module:Iterators.ArrayIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (arr) {
				inherited.constructor.call(this);
				this.__array = arr;
				this.__i = 0;
			},
			
			hasNext: function () {
				return this.__i < this.__array.length;
			},
			
			next: function () {
				var ret = this.__array[this.__i];
				this.__i++;
				return ret;
			}
		};
	}, {
		
		byIterate: function (iterate_func, iterate_func_ctx) {
			var result = [];
			iterate_func.call(iterate_func_ctx || this, function (item) {
				result.push(item);
			}, this);
			return new this(result);
		}
	});
});


Scoped.define("module:Iterators.ObjectKeysIterator", ["module:Iterators.ArrayIterator", "module:Objs"], function (ArrayIterator, Objs, scoped) {
	return ArrayIterator.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (obj) {
				inherited.constructor.call(this, Objs.keys(obj));
			}
	
		};
	});
});


Scoped.define("module:Iterators.ObjectValuesIterator", ["module:Iterators.ArrayIterator", "module:Objs"], function (ArrayIterator, Objs, scoped) {
	return ArrayIterator.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (obj) {
				inherited.constructor.call(this, Objs.values(obj));
			}
	
		};
	});
});


Scoped.define("module:Iterators.MappedIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {
		
			constructor: function (iterator, map, context) {
				inherited.constructor.call(this);
				this.__iterator = iterator;
				this.__map = map;
				this.__context = context || this;
			},
			
			hasNext: function () {
				return this.__iterator.hasNext();
			},
			
			next: function () {
				return this.hasNext() ? this.__map.call(this.__context, this.__iterator.next()) : null;
			}
	
		};
	});
});


Scoped.define("module:Iterators.FilteredIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (iterator, filter, context) {
				inherited.constructor.call(this);
				this.__iterator = iterator;
				this.__filter = filter;
				this.__context = context || this;
				this.__next = null;
			},
			
			hasNext: function () {
				this.__crawl();
				return this.__next !== null;
			},
			
			next: function () {
				this.__crawl();
				var item = this.__next;
				this.__next = null;
				return item;
			},
			
			__crawl: function () {
				while (!this.__next && this.__iterator.hasNext()) {
					var item = this.__iterator.next();
					if (this.__filter_func(item))
						this.__next = item;
				}
			},
			
			__filter_func: function (item) {
				return this.__filter.apply(this.__context, [item]);
			}

		};
	});
});


Scoped.define("module:Iterators.SkipIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (iterator, skip) {
				inherited.constructor.call(this);
				this.__iterator = iterator;
				while (skip > 0) {
					iterator.next();
					skip--;
				}
			},
			
			hasNext: function () {
				return this.__iterator.hasNext();
			},
			
			next: function () {
				return this.__iterator.next();
			}

		};
	});
});


Scoped.define("module:Iterators.LimitIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {
	
			constructor: function (iterator, limit) {
				inherited.constructor.call(this);
				this.__iterator = iterator;
				this.__limit = limit;
			},
			
			hasNext: function () {
				return this.__limit > 0 && this.__iterator.hasNext();
			},
			
			next: function () {
				if (this.__limit <= 0)
					return null;
				this.__limit--;
				return this.__iterator.next();
			}

		};
	});
});


Scoped.define("module:Iterators.SortedIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {
	
			constructor: function (iterator, compare) {
				inherited.constructor.call(this);
				this.__array = iterator.asArray();
				this.__array.sort(compare);
				this.__i = 0;
			},
			
			hasNext: function () {
				return this.__i < this.__array.length;
			},
			
			next: function () {
				var ret = this.__array[this.__i];
				this.__i++;
				return ret;
			}
	
		};
	});
});


Scoped.define("module:Iterators.LazyIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {
	
			constructor: function () {
				inherited.constructor.call(this);
				this.__finished = false;
				this.__initialized = false;
				this.__current = null;
				this.__has_current = false;
			},
			
			_initialize: function () {},
			
			_next: function () {},
			
			_finished: function () {
				this.__finished = true;
			},
			
			_current: function (result) {
				this.__current = result;
				this.__has_current = true;
			},
			
			__touch: function () {
				if (!this.__initialized)
					this._initialize();
				this.__initialized = true;
				if (!this.__has_current && !this.__finished)
					this._next();
			},
			
			hasNext: function () {
				this.__touch();
				return this.__has_current;
			},
			
			next: function () {
				this.__touch();
				this.__has_current = false;
				return this.__current;
			}
	
		};
	});
});

Scoped.define("module:Iterators.SortedOrIterator", [
    "module:Iterators.LazyIterator",
    "module:Structures.TreeMap",
    "module:Objs"
], function (Iterator, TreeMap, Objs, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {
	
			constructor: function (iterators, compare) {
				this.__iterators = iterators;
				this.__map = TreeMap.empty(compare);
				inherited.constructor.call(this);
			},
			
			__process: function (iter) {
				if (iter.hasNext()) {
					var n = iter.next();
	  				var value = TreeMap.find(n, this.__map);
	  				if (value)
	  					value.push(iter);
	  				else 
	  					this.__map = TreeMap.add(n, [iter], this.__map);
				}
			},
			
			_initialize: function () {
				Objs.iter(this.__iterators, this.__process, this);
				if (TreeMap.is_empty(this.__map))
					this._finished();
			},
			
			_next: function () {
				var ret = TreeMap.take_min(this.__map);
				this._current(ret[0].key);
				this.__map = ret[1];
				Objs.iter(ret[0].value, this.__process, this);
				if (TreeMap.is_empty(this.__map))
					this._finished();
			}
	
		};
	});
});



Scoped.define("module:Iterators.PartiallySortedIterator", ["module:Iterators.Iterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (iterator, compare, partial_same) {
				inherited.constructor.call(this);
				this.__compare = compare;
				this.__partial_same = partial_same;
				this.__iterator = iterator;
				this.__head = [];
				this.__tail = [];
			},
			
			__cache: function () {
				if (this.__head.length > 0 || !this.__iterator.hasNext())
					return;
				this.__head = this.__tail;
				this.__tail = [];
				if (this.__head.length === 0)
					this.__head.push(this.__iterator.next());
				while (this.__iterator.hasNext()) {
					var n = this.__iterator.next();
					if (!this.__partial_same(this.__head[0], n)) {
						this.__tail.push(n);
						break;
					}
				}
				this.__head.sort(this.__compare);
			},
			
			hasNext: function () {
				this.__cache();
				return this.__head.length > 0;
			},
			
			next: function () {
				this.__cache();
				return this.__head.shift();
			}
			
		};
	});		
});


Scoped.define("module:Iterators.LazyMultiArrayIterator", ["module:Iterators.LazyIterator"], function (Iterator, scoped) {
	return Iterator.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (next_callback, next_context) {
				inherited.constructor.call(this);
				this.__next_callback = next_callback;
				this.__next_context = next_context;
				this.__array = null;
				this.__i = 0;
			},
			
			_next: function () {
				if (this.__array === null || this.__i >= this.__array.length) {
					this.__array = this.__next_callback.apply(this.__next_context);
					this.__i = 0;
				}
				if (this.__array !== null) {
					var ret = this.__array[this.__i];
					this.__i++;
					return ret;
				} else
					this._finished();
			}
			
		};
	});
});

Scoped.define("module:Lists.AbstractList", [
		"module:Class",
		"module:Objs",
		"module:Types",
		"module:Iterators.ArrayIterator"
	], function (Class, Objs, Types, ArrayIterator, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			_add: function (object) {},
			_remove: function (ident) {},
			_get: function (ident) {},
			_iterate: function (callback, context) {},
			
			get_ident: function (object) {
				var ident = null;
				this._iterate(function (obj, id) {
					if (obj == object) {
						ident = id;
						return false;
					}
					return true;	
				});
				return ident;
			},
			
			exists: function (object) {
				return object && this.get_ident(object) !== null;
			},
			
			_ident_changed: function (object, new_ident) {},
			
			constructor: function (objects) {
				inherited.constructor.call(this);
				this.__count = 0;
				if (objects) {
					Objs.iter(objects, function (object) {
						this.add(object);
					}, this);
				}
			},
			
			add: function (object) {
				var ident = this._add(object);
				if (Types.is_defined(ident))
					this.__count++;
				return ident;
			},
			
			count: function () {
				return this.__count;
			},
			
			clear: function () {
				this._iterate(function (object, ident) {
					this.remove_by_ident(ident);
					return true;
				}, this);
			},
			
			remove_by_ident: function (ident) {
				var ret = this._remove(ident);
				if (Types.is_defined(ret))
					this.__count--;
				return ret;
			},
			
			remove: function (object) {
				return this.remove_by_ident(this.get_ident(object));
			},
			
			remove_by_filter: function (filter) {
				this._iterate(function (object, ident) {
					if (filter(object))
						this.remove_by_ident(ident);
					return true;
				}, this);
			},
			
			get: function (ident) {
				return this._get(ident);
			},
			
			iterate: function (cb, context) {
				this._iterate(function (object, ident) {
					var ret = cb.apply(this, [object, ident]);
					return Types.is_defined(ret) ? ret : true;
				}, context);
			},
			
			iterator: function () {
				return ArrayIterator.byIterate(this.iterate, this);
			}
			
		};
	});
});


Scoped.define("module:Lists.LinkedList", ["module:Lists.AbstractList"], function (AbstractList, scoped) {
	return AbstractList.extend({scoped: scoped},  {
		
		__first: null,
		__last: null,
		
		_add: function (obj) {
			this.__last = {
				obj: obj,
				prev: this.__last,
				next: null
			};
			if (this.__first)
				this.__last.prev.next = this.__last;
			else
				this.__first = this.__last;
			return this.__last;
		},
		
		_remove: function (container) {
			if (container.next)
				container.next.prev = container.prev;
			else
				this.__last = container.prev;
			if (container.prev)
				container.prev.next = container.next;
			else
				this.__first = container.next;
			return container.obj;
		},
		
		_get: function (container) {
			return container.obj;
		},
		
		_iterate: function (cb, context) {
			var current = this.__first;
			while (current) {
				var prev = current;
				current = current.next;
				if (!cb.apply(context || this, [prev.obj, prev]))
					return;
			}
		}
		
	});
});


Scoped.define("module:Lists.ObjectIdList", ["module:Lists.AbstractList", "module:Ids"], function (AbstractList, Ids, scoped) {
	return AbstractList.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (objects, id_generator) {
				this.__map = {};
				this.__id_generator = id_generator;
				inherited.constructor.call(this, objects);
			},
		
			_add: function (object) {
		        var id = object.__cid;
		        if (!id) {
		        	while (true) {
		                id = this.__id_generator ? Ids.objectId(object, this.__id_generator()) : Ids.objectId(object);
		        		if (!this.__map[id] || !this.__id_generator)
		        			break;
		        	}
	            }
	    		this.__map[id] = object;
	    		return id;
			},
			
			_remove: function (ident) {
				var obj = this.__map[ident];
				delete this.__map[ident];
				return obj;
			},
			
			_get: function (ident) {
				return this.__map[ident];
			},
			
			_iterate: function (callback, context) {
				for (var key in this.__map)
					callback.apply(context || this, [this.__map[key], key]);
			},
			
			get_ident: function (object) {
				var ident = Ids.objectId(object);
				return this.__map[ident] ? ident : null;
			}
			
		};
	});
});



Scoped.define("module:Lists.ArrayList", ["module:Lists.AbstractList", "module:Ids", "module:Objs"], function (AbstractList, Ids, Objs, scoped) {
	return AbstractList.extend({scoped: scoped}, function (inherited) {
		return {
	
			constructor: function (objects, options) {
				this.__idToIndex = {};
				this.__items = [];
				options = options || {};
				if ("compare" in options)
					this._compare = options.compare;
				if ("get_ident" in options)
					this._get_ident = options.get_ident;
				inherited.constructor.call(this, objects);
			},
			
			set_compare: function (compare) {
				this._compare = compare;
				if (compare)
					this.sort();
			},
			
			get_compare: function () {
				return this._compare;
			},
			
			sort: function (compare) {
				compare = compare || this._compare;
				if (!compare)
					return;
				this.__items.sort(compare);
				for (var i = 0; i < this.__items.length; ++i)
					this.__ident_changed(this.__items[i], i);
				this._sorted();
			},
			
			_sorted: function () {},
				
			re_index: function (index) {
				if (!this._compare)
					return index;
				var last = this.__items.length - 1;
				var object = this.__items[index];
				var i = index;	
				while (i < last && this._compare(this.__items[i], this.__items[i + 1]) > 0) {
					this.__items[i] = this.__items[i + 1];
					this.__ident_changed(this.__items[i], i);
					this.__items[i + 1] = object;
					++i;
				}
				if (i == index) {
					while (i > 0 && this._compare(this.__items[i], this.__items[i - 1]) < 0) {
						this.__items[i] = this.__items[i - 1];
						this.__ident_changed(this.__items[i], i);
						this.__items[i - 1] = object;
						--i;
					}
				}
				if (i != index) {
					this.__ident_changed(object, i);
					this._re_indexed(object);
				}
				return i;
			},
			
			_re_indexed: function (object) {},
			
			__objectId: function(object) {
				return this._get_ident ? this._get_ident(object) : Ids.objectId(object);
			},
			
			_add: function (object) {
				var last = this.__items.length;
				this.__items.push(object);
				var i = this.re_index(last);
				this.__idToIndex[this.__objectId(object)] = i;
				return i;
			},
			
			_remove: function (ident) {
				var obj = this.__items[ident];
				for (var i = ident + 1; i < this.__items.length; ++i) {
					this.__items[i-1] = this.__items[i];
					this.__ident_changed(this.__items[i-1], i-1);
				}
				this.__items.pop();
				delete this.__idToIndex[this.__objectId(obj)];
				return obj;
			},
			
			_get: function (ident) {
				return this.__items[ident];
			},
			
			_iterate: function (callback, context) {
				var items = Objs.clone(this.__items, 1);
				for (var i = 0; i < items.length; ++i)
					callback.apply(context || this, [items[i], this.get_ident(items[i])]);
			},
		
			__ident_changed: function (object, index) {
				this.__idToIndex[this.__objectId(object)] = index;
				this._ident_changed(object, index);
			},
		
			get_ident: function (object) {
				var id = this.__objectId(object);
				return id in this.__idToIndex ? this.__idToIndex[id] : null;
			},
			
			ident_by_id: function (id) {
				return this.__idToIndex[id];
			}

		};
	});
});

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
Scoped.define("module:Properties.PropertiesMixin", [
    "module:Objs.Scopes",
    "module:Objs",
	"module:Strings",
	"module:Types",
	"module:Functions"
	], function (Scopes, Objs, Strings, Types, Functions) {
	
	return {
			
		_notifications: {
			"construct": function () {
				this.__properties = {
					// hierarchical organization
					data: {},
					// hierarchical organization
					watchers: {
						children: {},
						eventCount: 0,
						parent: null,
						key: null
					},
					// flat organization
					computed: {},
					// flat organization
					bindings: {}
				};
				Objs.iter(this.materializes, function (key) {
					this.materializeAttr(key);
				}, this);
			},
			"destroy": function () {
				Objs.iter(this.__properties.bindings, function (value, key) {
					this.unbind(key);
				}, this);
				this.trigger("destroy");
			},
			"register_event": function (event) {
				Objs.iter(["change", "unset", "deepchange", "deepunset", "strongdeepchange", "strongchange"], function (eventType) {
					if (Strings.starts_with(event, eventType + ":"))
						this.__registerWatcher(Strings.strip_start(event, eventType + ":"), eventType);
				}, this);
			},
			"unregister_event": function (event) {
				Objs.iter(["change", "unset", "deepchange", "deepunset", "strongdeepchange", "strongchange"], function (eventType) {
					if (Strings.starts_with(event, eventType + ":"))
						this.__unregisterWatcher(Strings.strip_start(event, eventType + ":"), eventType);
				}, this);
			}
		},
		
		materializes: [],
		
		get: function (key) {
			return Scopes.get(key, this.__properties.data);
		},
		
		_canSet: function (key, value) {
			return true;
		},
		
		_beforeSet: function (key, value) {
			return value;
		},
		
		_afterSet: function (key, value) {},
		
		has: function (key) {
			return Scopes.has(key, this.__properties.data);
		},
		
		setAll: function (obj) {
			for (var key in obj)
				this.set(key, obj[key]);
			return this;
		},
		
		keys: function (mapped) {
			return Objs.keys(this.__properties.data, mapped);
		},
		
		data: function () {
			return this.__properties.data;
		},
		
		getAll: function () {
			return Objs.clone(this.__properties.data, 1);
		},
		
		materializeAttr: function (attr) {
			this[attr] = function (value) {
				if (arguments.length === 0)
					return this.get(attr);
				this.set(attr, value);
			};
		},
		
		__registerWatcher: function (key, event) {
			var keys = key ? key.split(".") : [];
			var current = this.__properties.watchers;
			for (var i = 0; i < keys.length; ++i) {
				if (!(keys[i] in current.children)) {
					current.children[keys[i]] = {
						parent: current,
						eventCount: 0,
						children: {},
						key: keys[i]
					};
				}
				current = current.children[keys[i]];
			}
			current.eventCount++;
		},
		
		__unregisterWatcher: function (key, event) {
			var keys = key ? key.split(".") : [];
			var current = this.__properties.watchers;
			for (var i = 0; i < keys.length; ++i) {
				if (current)
					current = current.children[keys[i]];
			}
			if (!current)
				return;
			current.eventCount--;
			while (current.eventCount <= 0 && Types.is_empty(current.children) && current.parent) {
				var parent = current.parent;
				delete parent.children[current.key];
				current = parent;
			}
		},
		
		uncompute: function (key) {
			if (key in this.__properties.computed) {
				Objs.iter(this.__properties.computed[key].dependencies, function (dependency) {
					dependency.properties.off("change:" + dependency.key, null, dependency);
				}, this);
				delete this.__properties.computed[key];
			}
			return this;
		},
		
		compute: function (key, func) {
			var args = Functions.matchArgs(arguments, 2, {
				setter: "function",
				context: {
					type: "object",
					def: this
				},
				dependencies: true
			});
			this.uncompute(key);
			var deps = [];
			Objs.iter(args.dependencies, function (dep) {
				if (Types.is_string(dep))
					deps.push({properties: this, key: dep});
				else
					deps.push({properties: dep[0], key: dep[1]});
			}, this);
			var computed = {
				ignore: 0,
				func: func,
				context: args.context,
				setter: args.setter,
				dependencies: deps
			};
			this.__properties.computed[key] = computed;
			var self = this;
			function recompute() {
				if (computed.ignore > 0)
					return;
				var values = Objs.map(deps, function (dep) {
					return dep.properties.get(dep.key);
				});
				self.set(key, func.apply(args.context, values));
			}
			for (var i = 0; i < deps.length; ++i)
				deps[i].properties.on("change:" + deps[i].key, recompute, deps[i]);
			recompute();
			return this;
		},
		
		unbind: function (key, props) {
			if (key in this.__properties.bindings) {
				for (var i = this.__properties.bindings[key].length - 1; i >= 0; --i) {
					var binding = this.__properties.bindings[key][i];
					if (!props || props == binding) {
						if (binding.left) 
							binding.properties.off(null, null, binding);
						if (binding.right)
							this.off(null, null, binding);
						this.__properties.bindings[key].splice(i, 1);
						i--;
					}
				}
				if (this.__properties.bindings[key].length === 0)
					delete this.__properties.bindings[key];
			}
			return this;
		},
		
		bind: function (key, properties, options) {
			options = Objs.extend({
				secondKey: key,
				left: true,
				right: true,
				deep: false
			}, options);
			var binding = {
				key: options.secondKey,
				left: options.left,
				right: options.right,
				deep: options.deep,
				properties: properties
			};
			this.__properties.bindings[key] = this.__properties.bindings[key] || [];
			this.__properties.bindings[key].push(binding);
			if (binding.left) {
				var self = this;
				binding.properties.on("strongchange:" + binding.key, function (value) {
					self.set(key, value);
				}, binding);
				binding.properties.on("unset:" + binding.key, function (value) {
					self.unset(key);
				}, binding);
				if (binding.deep) {
					binding.properties.on("strongdeepchange:" + binding.key, function (value, oldValue, subKey) {
						if (self.get(key ? key + "." + subKey : subKey) === value)
							self.__setChanged(key ? key + "." + subKey : subKey, value, oldValue, true);
						else
							self.set(key ? key + "." + subKey : subKey, value);					
					}, binding);
					binding.properties.on("deepunset:" + binding.key, function (oldValue, subKey) {
						if (!self.has(key ? key + "." + subKey : subKey))
							self.__unsetChanged(key ? key + "." + subKey : subKey, oldValue);
						else
							self.unset(key ? key + "." + subKey : subKey);					
					}, binding);
				}
				if (!binding.right || !this.has(key))
					this.set(key, binding.properties.get(binding.key));
			}
			if (binding.right) {
				this.on("strongchange:" + key, function (value) {
					binding.properties.set(binding.key, value);
				}, binding);
				this.on("unset:" + key, function (value) {
					binding.properties.unset(binding.key);
				}, binding);
				if (binding.deep) {
					this.on("strongdeepchange:" + key, function (value, oldValue, subKey) {
						if (binding.properties.get(binding.key ? binding.key + "." + subKey : subKey) === value)
							binding.properties.__setChanged(binding.key ? binding.key + "." + subKey : subKey, value, oldValue, true);
						else
							binding.properties.set(binding.key ? binding.key + "." + subKey : subKey, value);
					}, binding);
					this.on("deepunset:" + key, function (oldValue, subKey) {
						if (!binding.properties.has(binding.key ? binding.key + "." + subKey : subKey))
							binding.properties.__unsetChanged(binding.key ? binding.key + "." + subKey : subKey, oldValue);
						else
							binding.properties.unset(binding.key ? binding.key + "." + subKey : subKey);
					}, binding);
				}
				if (!binding.left || this.has(key))
					binding.properties.set(binding.key, this.get(key));
			}
			binding.properties.on("destroy", function () {
				this.unbind(key);
			}, binding);
			return this;
		},
		
		__unsetChanged: function (key, oldValue) {
			this.trigger("unset", key, oldValue);
			var keys = key ? key.split(".") : [];
			var current = this.__properties.watchers;
			var head = "";
			var tail = key;
			for (var i = 0; i < keys.length; ++i) {
				if (current.eventCount > 0)
					this.trigger("deepunset:" + head, oldValue, tail);
				if (!(keys[i] in current.children))
					return this;
				current = current.children[keys[i]];
				head = head ? (head + "." + keys[i]) : keys[i];
				tail = Strings.first_after(tail, ".");
			}
			function process_unset(current, key, oldValue) {
				if (Types.is_undefined(oldValue))
					return;
				if (current.eventCount > 0)
					this.trigger("unset:" + key, oldValue);
				Objs.iter(current.children, function (child, subkey) {
					process_unset.call(this, child, key ? (key + "." + subkey) : subkey, oldValue[subkey]);
				}, this);
			}
			process_unset.call(this, current, key, oldValue);
			return this;
		},
		
		__setChanged: function (key, value, oldValue, notStrong) {
			this.trigger("change", key, value, oldValue);
			this._afterSet(key, value);
			var keys = key ? key.split(".") : [];
			var current = this.__properties.watchers;
			var head = "";
			var tail = key;
			for (var i = 0; i < keys.length; ++i) {
				if (current.eventCount > 0) {
					if (!notStrong)
						this.trigger("strongdeepchange:" + head, value, oldValue, tail);
					this.trigger("deepchange:" + head, value, oldValue, tail);
				}
				if (!(keys[i] in current.children))
					return;
				current = current.children[keys[i]];
				head = head ? (head + "." + keys[i]) : keys[i];
				tail = Strings.first_after(tail, ".");
			}
			function process_set(current, key, value, oldValue) {
				if (value == oldValue)
					return;
				if (current.eventCount > 0) {
					if (!notStrong)
						this.trigger("strongchange:" + key, value, oldValue);
					this.trigger("change:" + key, value, oldValue);
				}
				Objs.iter(current.children, function (child, subkey) {
					process_set.call(this, child, key ? (key + "." + subkey) : subkey, Types.is_object(value) && value ? value[subkey] : null, Types.is_object(oldValue) && oldValue ? oldValue[subkey] : null);
				}, this);
			}
			process_set.call(this, current, key, value, oldValue);
		},
		
		unset: function (key) {
			if (this.has(key)) {
				var oldValue = this.get(key);
				Scopes.unset(key, this.__properties.data);
				this.__unsetChanged(key, oldValue);
			}
			return this;
		},
		
		__properties_guid: "ec816b66-7284-43b1-a945-0600c6abfde3",
		
		set: function (key, value, force) {
			if (Types.is_object(value) && value && value.guid == this.__properties_guid) {
				if (value.properties)
					this.bind(key, value.properties, {secondKey: value.key});
				if (value.func)
					this.compute(key, value.func, value.dependencies);
				return this;
			}
			value = this._beforeSet(key, value);
			var oldValue = this.get(key);
			if (oldValue !== value) {
				Scopes.set(key, value, this.__properties.data);
				this.__setChanged(key, value, oldValue);
			} else if (force) {
				this.trigger("change", key, value, oldValue);
				this.trigger("change:" + key, value, oldValue);
			}
			return this;
		},
		
		binding: function (key) {
			return {
				guid: this.__properties_guid,
				properties: this,
				key: key
			};
		},
		
		computed : function (f, dependencies) {
			return {
				guid: this.__properties_guid,
				func: f,
				dependencies: dependencies
			};
		}	
		
	};
});


Scoped.define("module:Properties.Properties", [
	    "module:Class",
	    "module:Objs",
	    "module:Events.EventsMixin",
	    "module:Properties.PropertiesMixin"
	], function (Class, Objs, EventsMixin, PropertiesMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, PropertiesMixin, function (inherited) {
		return {
			constructor: function (obj, materializes) {
				inherited.constructor.call(this);
				if (obj)
					this.setAll(obj);
				if (materializes) {
					Objs.iter(materializes, function (key) {
						this.materializeAttr(key);
					}, this);
				}
			}
		};
	}]);
});
Scoped.define("module:Comparators", ["module:Types", "module:Properties.Properties"], function (Types, Properties) {
	return {		
		
		byObject: function (object) {
			var self = this;
			return function (left, right) {
				for (var key in object) {
					var c = 0;
					if (Properties.is_class_instance(left) && Properties.is_class_instance(right))
						c = self.byValue(left.get(key) || null, right.get(key) || null);
					else
						c = self.byValue(left[key] || null, right[key] || null);
					if (c !== 0)
						return c * object[key];
				}
				return 0;
			};
		},
		
		byValue: function (a, b) {
			if (Types.is_string(a))
				return a.localeCompare(b);
			if (a < b)
				return -1;
			if (a > b)
				return 1;
			return 0;
		},
		
		listEqual: function (a, b) {
			if (Types.is_array(a) && Types.is_array(b)) {
				if (a.length != b.length)
					return false;
				for (var i = 0; i < a.length; ++i) {
					if (a[i] !== b[i])
						return false;
				}
				return true;
			} else if (Types.is_object(a) && Types.is_object(b)) {
				for (var key in a) {
					if (b[key] !== a[key])
						return false;
				}
				for (key in b) {
					if (!(key in a))
						return false;
				}
				return true;
			} else
				return false;
		}
			
	};
});
Scoped.define("module:Sort", [
	    "module:Comparators",	    
	    "module:Types",
	    "module:Objs"
	], function (Comparators, Types, Objs) {
	return {		
	
		sort_object : function(object, f) {
			var a = [];
			for (var key in object)
				a.push({
					key : key,
					value : object[key]
				});
			a.sort(function (x, y) {
				return f(x.key, y.key, x.value, y.value);
			});
			var o = {};
			for (var i = 0; i < a.length; ++i)
				o[a[i].key] = a[i].value;
			return o;
		},
		
		deep_sort: function (object, f) {
			f = f || Comparators.byValue;
			if (Types.is_array(object)) {
				for (var i = 0; i < object.length; ++i)
					object[i] = this.deep_sort(object[i], f);
				return object.sort(f);
			} else if (Types.is_object(object)) {
				for (var key in object)
					object[key] = this.deep_sort(object[key], f);
				return this.sort_object(object, f);
			} else
				return object;
		},
	
		dependency_sort : function(items, identifier, before, after) {
			var identifierf = Types.is_string(identifier) ? function(obj) {
				return obj[identifier];
			} : identifier;
			var beforef = Types.is_string(before) ? function(obj) {
				return obj[before];
			} : before;
			var afterf = Types.is_string(after) ? function(obj) {
				return obj[after];
			} : after;
			var n = items.length;
			var data = [];
			var identifier_to_index = {};
			var todo = {};
			var i = 0;
			for (i = 0; i < n; ++i) {
				todo[i] = true;
				var ident = identifierf(items[i], i);
				identifier_to_index[ident] = i;
				data.push({
					before : {},
					after : {}
				});
			}
			var make_before_iter_func = function (i) {
				return function (before) {
					var before_index = identifier_to_index[before];
					if (Types.is_defined(before_index)) {
						data[i].before[before_index] = true;
						data[before_index].after[i] = true;
					}
				};
			};
			var make_after_iter_func = function (i) {
				return function(after) {
					var after_index = identifier_to_index[after];
					if (Types.is_defined(after_index)) {
						data[i].after[after_index] = true;
						data[after_index].before[i] = true;
					}
				};
			};
			for (i = 0; i < n; ++i) {
				Objs.iter(beforef(items[i], i) || [], make_before_iter_func(i));
				Objs.iter(afterf(items[i]) || [], make_after_iter_func(i));
			}
			var result = [];
			while (!Types.is_empty(todo)) {
				for (i in todo) {
					if (Types.is_empty(data[i].after)) {
						delete todo[i];
						result.push(items[i]);
						for (var bef in data[i].before)
							delete data[bef].after[i];
					}
				}
			}
			return result;
		}
		
	};
});

Scoped.define("module:Trees.TreeNavigator", function () {
	return {		
		
		nodeRoot: function () {},
		nodeId: function (node) {},
		nodeParent: function (node) {},
		nodeChildren: function (node) {},
		nodeWatch: function (node, func, context) {},
		nodeUnwatch: function (node, func, context) {},
		nodeData: function (node) {}
			
	};
});


Scoped.define("module:Trees.TreeQueryEngine", ["module:Class", "module:Parser.Lexer", "module:Trees.TreeQueryObject"], function (Class, Lexer, TreeQueryObject, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (navigator) {
				inherited.constructor.call(this);
				this.__navigator = navigator;
				this.__lexer = this._auto_destroy(new Lexer({
					"<\\+": {token: "Up"},
					"<": {token: "Up", single: true},
					">\\+": {token: "Down"},
					">": {token: "Down", single: true},
					"\\[\s*([a-zA-Z]+)\s*=\s*\'([^']*)\'\s*\\]": {token: "Selector", key: "$1", value: "$2"},
					"\s": null
				}));
			},
			
			query: function (node, query) {
				return new TreeQueryObject(this.__navigator, node, this.__lexer.lex(query));
			}

		};
	});
});


Scoped.define("module:Trees.TreeQueryObject", ["module:Class", "module:Events.EventsMixin", "module:Objs", "module:Types"], function (Class, EventsMixin, Objs, Types, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {
			
			constructor: function (navigator, node, query) {
				inherited.constructor.call(this);
				this.__navigator = navigator;
				this.__node = node;
				this.__query = query;
				this.__result = {};
				this.__partials = {};
				this.__register(node, 0, {});
				this.__ids = 0;
			},
			
			destroy: function () {
				Objs.iter(this.__partials, function (partials) {
					Objs.iter(partials.partials, function (partial) {
						this.__navigator.nodeUnwatch(partials.node, null, partial);
					}, this);			
				}, this);
				inherited.destroy.call(this);
			},
			
			result: function () {
				var result = [];
				Objs.iter(this.__result, function (value) {
					result.push(value.node);
				});
				return result;
			},
			
			__register: function (node, index) {
				var node_id = this.__navigator.nodeId(node);
				if (!this.__partials[node_id]) {
					this.__partials[node_id] = {
						node: node,
						partials: {}
					};
				}
				var partials = this.__partials[node_id];
				this.__ids++;
				var partial = {
					owner: partials,
					id: this.__ids,
					query_index_start: index,
					query_index_next: index,
					query_index_last: index,
					partial_match: false,
					partial_final: index >= this.__query.length,
					partial_data: false,
					partial_children: false,
					partial_parent: false,
					partial_star: false,
					parent: null,
					deps: {}
				};
				partials.partials[partial.id] = partial;
				for (var i = partial.query_index_start; i < this.__query.length; ++i) {
					if (this.__query[i].token == "Selector")
						partial.partial_data = true;
					else {
						if (this.__query[i].token == "Up")
							partial.partial_parent = true;
						else if (this.__query[i].token == "Down")
							partial.partial_children = true;
						partial.partial_star = !this.__query[i].single;
						if (!partial.partial_star)
							partial.query_index_next = i + 1;
						break;
					}
					partial.query_index_next = i + 1;
					partial.partial_final = i + 1 == this.__query.length;
				}
				partial.query_index_last = partial.partial_star ? partial.query_index_next + 1 : partial.query_index_next;
				var self = this;
				this.__navigator.nodeWatch(node, function (action, node) {
					if (action == "data" && partial.partial_data)
						self.__update(partial);
					if (action == "remove")
						self.__unregisterPartial(partial);
					if (action == "addChild" && partial.partial_children && partial.partial_match)
						self.__addDependentPartial(partial, node);
				}, partial);
				this.__update(partial);
				return partial;
			},
			
			__unregisterPartial: function (partial) {
				var owner = partial.owner;
				var node = owner.node;
				var node_id = this.__navigator.nodeId(node);
				if (partial.partial_final && this.__result[node_id]) {
					this.__result[node_id].count--;
					if (this.__result[node_id].count <= 0) {
						delete this.__result[node_id];
						this.trigger("remove", node);
						this.trigger("change");
					}
				}
				Objs.iter(partial.deps, this.__unregisterPartial, this);
				if (partial.parent)
					delete partial.parent.deps[partial.id];
				this.__navigator.nodeUnwatch(node, null, partial);
				delete owner.partials[partial.id];
				if (Types.is_empty(owner.partials))
					delete this.__partials[node_id];
			},
			
			__addDependentPartial: function (partial, node) {
				var partials = [];
				partials.push(this.__register(node, partial.query_index_next));
				if (partial.partial_star)
					partials.push(this.__register(node, partial.query_index_next + 1));
				Objs.iter(partials, function (p) {
					partial.deps[p.id] = p;
					p.parent = partial;
				}, this);
			},
			
			__update: function (partial) {
				var matching = true;
				var node = partial.owner.node;
				var node_id = this.__navigator.nodeId(node);
				var node_data = this.__navigator.nodeData(node);
				for (var i = partial.query_index_start; i < partial.query_index_last; ++i) {
					var q = this.__query[i];
					if (q.token != "Selector")
						break;
					if (node_data[q.key] != q.value) {
						matching = false;
						break;
					}
				}
				if (matching == partial.partial_match)
					return;
				partial.partial_match = matching;
				if (matching) {
					if (partial.partial_final) {
						if (!this.__result[node_id]) {
							this.__result[node_id] = {
								node: node,
								count: 1
							};
							this.trigger("add", node);
							this.trigger("change");
						} else
							this.__result[node_id].count++;
					} else if (partial.partial_parent) {
						this.__addDependentPartial(partial, this.__navigator.nodeParent(node));
					} else if (partial.partial_children) {
						Objs.iter(this.__navigator.nodeChildren(node), function (child) {
							this.__addDependentPartial(partial, child);
						}, this);
					}
				} else {
					if (partial.partial_final) {
						this.__result[node_id].count--;
						if (this.__result[node_id].count <= 0) {
							delete this.__result[node_id];
							this.trigger("remove", node);
							this.trigger("change");
						}
					}
					Objs.iter(partial.deps, this.__unregisterPartial, this);
				}
			}
		};
	}]);
});

Scoped.define("module:Classes.InvokerMixin", ["module:Objs", "module:Types", "module:Functions"], function (Objs, Types, Functions) {
	return {
		
		invoke_delegate : function(invoker, members) {
			if (!Types.is_array(members))
				members = [members];
			invoker = this[invoker];
			var self = this;
			Objs.iter(members, function (member) {
				this[member] = function(member) {
					return function() {
						var args = Functions.getArguments(arguments);
						args.unshift(member);
						return invoker.apply(self, args);
					};
				}.call(self, member);
			}, this);
		}
	};
});


Scoped.define("module:Classes.ModuleMixin", ["module:Objs"], function (Objs) {
	return {
	
		_notifications : {
			construct : function() {
				this.__modules = {};
			},
			destroy : function() {
				Objs.iter(this.__modules, this.remove_module, this);
			}
		},
	
		add_module : function(module) {
			if (module.cid() in this.__modules)
				return;
			this.__modules[module.cid()] = module;
			module.register(this);
			this._notify("add_module", module);
		},
	
		remove_module : function(module) {
			if (!(module.cid() in this.__modules))
				return;
			delete this.__modules[module.cid()];
			module.unregister(this);
			this._notify("remove_module", module);
		}
		
	};
});


Scoped.define("module:Classes.Module", ["module:Class", "module:Objs", "module:Ids", "module:Types"], function (Class, Objs, Ids, Types, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor : function(options) {
				inherited.constructor.call(this);
				this._objects = {};
				this.__auto_destroy = "auto_destroy" in options ? options.auto_destroy : true;
			},
		
			destroy : function() {
				Objs.iter(this._objects, this.unregister, this);
				inherited.destroy.call(this);
			},
		
			register : function(object) {
				var id = Ids.objectId(object);
				if ( id in this._objects)
					return;
				var data = {};
				this._objects[id] = {
					object : object,
					data : data
				};
				object.add_module(this);
				this._register(object, data);
			},
		
			_register : function(object) {
			},
		
			unregister : function(object) {
				var id = Ids.objectId(object);
				if (!( id in this._objects))
					return;
				var data = this._objects[id].data;
				this._unregister(object, data);
				delete this._objects[id];
				object.remove_module(this);
				if ("off" in object)
					object.off(null, null, this);
				if (this.__auto_destroy && Types.is_empty(this._objects))
					this.destroy();
			},
		
			_unregister : function(object) {
			},
		
			_data : function(object) {
				return this._objects[Ids.objectId(object)].data;
			}
			
		};
	}, {
	
		__instance : null,
	
		singleton : function() {
			if (!this.__instance)
				this.__instance = new this({
					auto_destroy : false
				});
			return this.__instance;
		}
	
	});
});


Scoped.define("module:Classes.HelperClassMixin", ["module:Objs", "module:Types", "module:Functions", "module:Promise"], function (Objs, Types, Functions, Promise) {
	return {
	
		addHelper: function (helper_class, options) {
			var helper = new helper_class(this, options);
			this.__helpers = this.__helpers || [];
			this.__helpers.push(this._auto_destroy(helper));
			return helper;
		},
		
		_helper: function (options) {
			this.__helpers = this.__helpers || [];
			if (Types.is_string(options)) {
				options = {
					method: options
				};
			}
			options = Objs.extend({
				fold_start: null,
				fold: function (acc, result) {
					return acc || result;
				}
			}, options);
			var args = Functions.getArguments(arguments, 1);
			var acc = options.async ? Promise.create(options.fold_start) : options.fold_start;
			for (var i = 0; i < this.__helpers.length; ++i) {
				var helper = this.__helpers[i];
				if (options.method in helper) {
					if (options.async)
						acc = Promise.func(options.fold, acc, Promise.methodArgs(helper, helper[options.method], args));
					else
						acc = options.fold(acc, helper[options.method].apply(helper, args));
				}
			}
			return acc;
		}
		
	};
});


Scoped.define("module:Classes.IdGenerator", ["module:Class"], function (Class, scoped) {
	return Class.extend({scoped: scoped}, {
	
		generate: function () {}
	
	});
});	


Scoped.define("module:Classes.PrefixedIdGenerator", ["module:Classes.IdGenerator"], function (IdGenerator, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (prefix, generator) {
				inherited.constructor.call(this);
				this.__prefix = prefix;
				this.__generator = generator;
			},
			
			generate: function () {
				return this.__prefix + this.__generator.generate();
			}
			
		};
	});
});


Scoped.define("module:Classes.RandomIdGenerator", ["module:Classes.IdGenerator", "module:Tokens"], function (IdGenerator, Tokens, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (length) {
				inherited.constructor.call(this);
				this.__length = length || 16;
			},
			
			generate: function () {
				return Tokens.generate_token(this.__length);
			}

		};
	});
});


Scoped.define("module:Classes.ConsecutiveIdGenerator", ["module:Classes.IdGenerator"], function (IdGenerator, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (initial) {
				inherited.constructor.call(this);
				this.__current = initial || 0;
			},
			
			generate: function () {
				this.__current++;
				return this.__current;
			}

		};
	});
});

	
Scoped.define("module:Classes.TimedIdGenerator", ["module:Classes.IdGenerator", "module:Time"], function (IdGenerator, Time, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function () {
				inherited.constructor.call(this);
				this.__current = Time.now() - 1;
			},
			
			generate: function () {
				var now = Time.now();
				this.__current = now > this.__current ? now : (this.__current + 1); 
				return this.__current;
			}

		};
	});
});


Scoped.define("module:Classes.PathResolver", ["module:Class", "module:Objs"], function (Class, Objs, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (bindings) {
				inherited.constructor.call(this);
				this._bindings = bindings || {};
			},
			
			extend: function (bindings, namespace) {
				if (namespace) {
					for (var key in bindings) {
						var value = bindings[key];
						var regExp = /\{([^}]+)\}/;
						while (true) {
							var matches = regExp.exec(value);
							if (!matches)
								break;
							value = value.replace(regExp, namespace + "." + matches[1]);
						}
						this._bindings[namespace + "." + key] = value;
					}
				} else
					this._bindings = Objs.extend(this._bindings, bindings);
			},
			
			map: function (arr) {
				var result = [];
				for (var i = 0; i < arr.length; ++i) {
					if (arr[i])
						result.push(this.resolve(arr[i]));
				}
				return result;
			},
			
			resolve : function(path) {
				var regExp = /\{([^}]+)\}/;
				while (true) {
					var matches = regExp.exec(path);
					if (!matches)
						break;
					path = path.replace(regExp, this._bindings[matches[1]]);
				}
				return this.simplify(path);
			},
			
			simplify: function (path) {
				return path.replace(/[^\/]+\/\.\.\//, "").replace(/\/[^\/]+\/\.\./, "");
			}
	
		};
	});
});


Scoped.define("module:Classes.MultiDelegatable", ["module:Class", "module:Objs"], function (Class, Objs, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (objects, methods) {
				inherited.constructor.call(this);
				Objs.iter(methods, function (method) {
					this[method] = function () {
						var args = arguments;
						Objs.iter(objects, function (object) {
							object[method].apply(object, args);
						}, this);
						return this;
					};
				}, this);
			}
			
		};
	});
});


Scoped.define("module:Classes.ClassRegistry", ["module:Class", "module:Types", "module:Functions"], function (Class, Types, Functions, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (classes) {
				inherited.constructor.call(this);
				this._classes = classes || {};
			},
			
			register: function (key, cls) {
				this._classes[key] = cls;
			},
			
			get: function (key) {
				return Types.is_object(key) ? key : this._classes[key];
			},
			
			create: function (key) {
				var cons = Functions.newClassFunc(this.get(key));
				return cons.apply(this, Functions.getArguments(arguments, 1));
			},
			
			classes: function () {
				return this._classes;
			}
			
		};
	});
});


Scoped.define("module:Classes.ObjectIdScopeMixin", function () {
	return {

		__objects: {},

	    get: function (id) {
	        return this.__objects[id];
	    }

	};
});	
	
		
Scoped.define("module:Classes.ObjectIdScope", ["module:Class", "module:Classes.ObjectIdScopeMixin"], function (Class, Mixin, scoped) {
	return Class.extend({scoped: scoped}, Mixin, {
		singleton: function () {
			if (!this.__singleton)
				this.__singleton = new this();
			return this.__singleton;
		}
	});
});


Scoped.define("module:Classes.ObjectIdMixin", ["module:Classes.ObjectIdScope", "module:Objs", "module:Ids"], function (ObjectIdScope, Objs, Ids) {
	return {
	
	    _notifications: {
	        construct: "__register_object_id",
	        destroy: "__unregister_object_id"
	    },
	
	    __object_id_scope: function () {
	        if (this.object_id_scope)
	            return this.object_id_scope;
	        return ObjectIdScope.singleton();
	    },
	
	    __register_object_id: function () {
	        var scope = this.__object_id_scope();
	        scope.__objects[Ids.objectId(this)] = this;
	    },
	
	    __unregister_object_id: function () {
	        var scope = this.__object_id_scope();
	        delete scope.__objects[Ids.objectId(this)];
	    }
	
	};
});
Scoped.define("module:Collections.Collection", [
	    "module:Class",
	    "module:Events.EventsMixin",
	    "module:Objs",
	    "module:Functions",
	    "module:Lists.ArrayList",
	    "module:Ids",
	    "module:Properties.Properties",
	    "module:Iterators.ArrayIterator"
	], function (Class, EventsMixin, Objs, Functions, ArrayList, Ids, Properties, ArrayIterator, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {

			constructor : function(options) {
				inherited.constructor.call(this);
				options = options || {};
				this.__indices = {};
				if (options.indices)
					Objs.iter(options.indices, this.add_secondary_index, this);
				var list_options = {};
				if ("compare" in options)
					list_options.compare = options.compare;
				list_options.get_ident = Functions.as_method(this.get_ident, this);
				this.__data = new ArrayList([], list_options);
				var self = this;
				this.__data._ident_changed = function (object, index) {
					self._index_changed(object, index);
				};
				this.__data._re_indexed = function (object) {
					self._re_indexed(object);
				};
				this.__data._sorted = function () {
					self._sorted();
				};
				if ("objects" in options)
					this.add_objects(options.objects);
			},
			
			add_secondary_index: function (key) {
				this.__indices[key] = {};
				this.iterate(function (object) {
					this.__indices[key][object.get(key)] = object;
				}, this);
			},
			
			get_by_secondary_index: function (key, value) {
				return this.__indices[key][value];
			},
			
			get_ident: function (obj) {
				return Ids.objectId(obj);
			},
			
			set_compare: function (compare) {
				this.__data.set_compare(compare);
			},
			
			get_compare: function () {
				this.__data.get_compare();
			},
		
			destroy: function () {
				this.__data.iterate(function (object) {
					if ("off" in object)
						object.off(null, null, this);
				}, this);
				this.__data.destroy();
				this.trigger("destroy");
				inherited.destroy.call(this);
			},
			
			count: function () {
				return this.__data.count();
			},
			
			_index_changed: function (object, index) {
				this.trigger("index", object, index);
			},
			
			_re_indexed: function (object) {
				this.trigger("reindexed", object);
			},
			
			_sorted: function () {
				this.trigger("sorted");
			},
			
			_object_changed: function (object, key, value) {
				this.trigger("update");
				this.trigger("change", object, key, value);
				this.trigger("change:" + key, object, value);
				this.__data.re_index(this.getIndex(object));
			},
			
			add: function (object) {
				if (!Class.is_class_instance(object))
					object = new Properties(object);
				if (this.exists(object))
					return null;
				var ident = this.__data.add(object);
				if (ident !== null) {
					Objs.iter(this.__indices, function (entry, key) {
						entry[object.get(key)] = object;
					}, this);
					this.trigger("add", object);
					this.trigger("update");
					if ("on" in object)
						object.on("change", function (key, value, oldvalue) {
							this._object_changed(object, key, value, oldvalue);
						}, this);
				}
				return ident;
			},
			
			add_objects: function (objects) {
				var count = 0;
				Objs.iter(objects, function (object) {
					if (this.add(object))
						count++;
				}, this);		
				return count;
			},
			
			exists: function (object) {
				return this.__data.exists(object);
			},
			
			remove: function (object) {
				if (!this.exists(object))
					return null;
				Objs.iter(this.__indices, function (entry, key) {
					delete entry[object.get(key)];
				}, this);
				this.trigger("remove", object);
				this.trigger("update");
				var result = this.__data.remove(object);
				if ("off" in object)
					object.off(null, null, this);
				return result;
			},
			
			getByIndex: function (index) {
				return this.__data.get(index);
			},
			
			getById: function (id) {
				return this.__data.get(this.__data.ident_by_id(id));
			},
			
			getIndex: function (object) {
				return this.__data.get_ident(object);
			},
			
			iterate: function (cb, context) {
				this.__data.iterate(cb, context);
			},
			
			iterator: function () {
				return ArrayIterator.byIterate(this.iterate, this);
			},
			
			clear: function () {
				this.iterate(function (obj) {
					this.remove(obj);
				}, this);
			}
			
		};
	}]);
});


Scoped.define("module:Collections.FilteredCollection", [
	    "module:Collections.Collection"
	], function (Collection, scoped) {
	return Collection.extend({scoped: scoped}, function (inherited) {
		return {

			constructor : function(parent, options) {
				this.__parent = parent;
				options = options || {};
				delete options.objects;
				options.compare = options.compare || parent.get_compare();
				inherited.constructor.call(this, options);
				this.__parent.on("add", this.add, this);
				this.__parent.on("remove", this.remove, this);
				this.setFilter(options.filter, options.context);
			},
			
			filter: function (object) {
				return !this.__filter || this.__filter.call(this.__filterContext || this, object);
			},
			
			setFilter: function (filterFunction, filterContext) {
				this.__filterContext = filterContext;
				this.__filter = filterFunction;
				this.iterate(function (obj) {
					inherited.remove.call(this, obj);
				}, this);
				this.__parent.iterate(function (object) {
					this.add(object);
					return true;
				}, this);
			},
			
			_object_changed: function (object, key, value) {
				inherited._object_changed.call(this, object, key, value);
				if (!this.filter(object))
					this.__selfRemove(object);
			},
			
			destroy: function () {
				this.__parent.off(null, null, this);
				inherited.destroy.call(this);
			},
			
			__selfAdd: function (object) {
				return inherited.add.call(this, object);
			},
			
			add: function (object) {
				if (this.exists(object) || !this.filter(object))
					return null;
				var id = this.__selfAdd(object);
				this.__parent.add(object);
				return id;
			},
			
			__selfRemove: function (object) {
				return inherited.remove.call(this, object);
			},
		
			remove: function (object) {
				if (!this.exists(object))
					return null;
				var result = this.__selfRemove(object);
				if (!result)
					return null;
				return this.__parent.remove(object);
			}
			
		};	
	});
});

Scoped.define("module:Channels.Sender", ["module:Class", "module:Events.EventsMixin"], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, {
		
		send: function (message, data) {
			this.trigger("send", message, data);
			this._send(message, data);
		},
		
		_send: function (message, data) {}
	
	}]);
});


Scoped.define("module:Channels.Receiver", ["module:Class", "module:Events.EventsMixin"], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, {
			
		_receive: function (message, data) {
			this.trigger("receive", message, data);
			this.trigger("receive:" + message, data);
		}
	
	}]);
});


Scoped.define("module:Channels.ReceiverSender", ["module:Channels.Sender"], function (Sender, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (receiver) {
				inherited.constructor.call(this);
				this.__receiver = receiver;
			},
			
			_send: function (message, data) {
				this.__receiver._receive(message, data);
			}
			
		};
	});
});


Scoped.define("module:Channels.SenderMultiplexer", ["module:Channels.Sender"], function (Sender, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (sender, prefix) {
				inherited.constructor.call(this);
				this.__sender = sender;
				this.__prefix = prefix;
			},
			
			_send: function (message, data) {
				this.__sender.send(this.__prefix + ":" + message, data);
			}
			
		};
	});
});


Scoped.define("module:Channels.ReceiverMultiplexer", ["module:Channels.Receiver", "module:Strings"], function (Receiver, Strings, scoped) {
	return Receiver.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (receiver, prefix) {
				inherited.constructor.call(this);
				this.__receiver = receiver;
				this.__prefix = prefix;
				this.__receiver.on("receive", function (message, data) {
					if (Strings.starts_with(message, this.__prefix + ":"))
						this._receive(Strings.strip_start(message, this.__prefix + ":"), data);
				}, this);
			}
		
		};
	});
});



Scoped.define("module:Channels.TransportChannel", [
	    "module:Class",
	    "module:Objs",
	    "module:Timers.Timer",
	    "module:Time",
	    "module:Promise"
	], function (Class, Objs, Timer, Time, Promise, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
					
			constructor: function (sender, receiver, options) {
				inherited.constructor.call(this);
				this.__sender = sender;
				this.__receiver = receiver;
				this.__options = Objs.extend(options, {
					timeout: 10000,
					tries: 1,
					timer: 500
				});
				this.__receiver.on("receive:send", function (data) {
					this.__reply(data);
				}, this);
				this.__receiver.on("receive:reply", function (data) {
					this.__complete(data);
				}, this);
				this.__sent_id = 0;
				this.__sent = {};
				this.__received = {};
				this.__timer = this._auto_destroy(new Timer({
					delay: this.__options.timer,
					context: this,
					fire: this.__maintenance
				}));
			},
			
			// Returns Promise
			_reply: function (message, data) {},
			
			send: function (message, data, options) {
				var promise = Promise.create();
				options = options || {};
				if (options.stateless) {
					this.__sender.send("send", {
						message: message,
						data: data,
						stateless: true
					});
					promise.asyncSuccess(true);
				} else {
					this.__sent_id++;
					this.__sent[this.__sent_id] = {
						message: message,
						data: data,
						tries: 1,
						time: Time.now(),
						id: this.__sent_id,
						promise: promise
					};
					this.__sender.send("send", {
						message: message,
						data: data,
						id: this.__sent_id
					});
				}
				return promise;
			},
			
			__reply: function (data) {
				if (data.stateless) {
					this._reply(data.message, data.data);
					return;
				}
				if (!this.__received[data.id]) {
					this.__received[data.id] = data;
					this.__received[data.id].time = Time.now();
					this.__received[data.id].returned = false;
					this.__received[data.id].success = false;
					this._reply(data.message, data.data).success(function (result) {
						this.__received[data.id].reply = result;
						this.__received[data.id].success = true;
					}, this).error(function (error) {
						this.__received[data.id].reply = error;
					}, this).callback(function () {
						this.__received[data.id].returned = true;
						this.__sender.send("reply", {
							id: data.id,
							reply: data.reply,
							success: data.success
						});
					}, this);			  
				} else if (this.__received[data.id].returned) {
					this.__sender.send("reply", {
						id: data.id,
						reply: data.reply,
						success: data.success
					});
				}
			},
			
			__complete: function (data) {
				if (this.__sent[data.id]) {
					var promise = this.__sent[data.id].promise;
					promise[data.success ? "asyncSuccess" : "asyncError"](data.reply);
					delete this.__sent[data.id];
				}
			},
			
			__maintenance: function () {
				var now = Time.now();
				for (var received_key in this.__received) {
					var received = this.__received[received_key];
					if (received.time + this.__options.tries * this.__options.timeout <= now)
						delete this.__received[received_key];
				}
				for (var sent_key in this.__sent) {
					var sent = this.__sent[sent_key];
					if (sent.time + sent.tries * this.__options.timeout <= now) {
						if (sent.tries < this.__options.tries) {
							sent.tries++;
							this.__sender.send("send", {
								message: sent.message,
								data: sent.data,
								id: sent.id
							});
						} else {
							sent.promise.asyncError({
								message: sent.message,
								data: sent.data
							});
							delete this.__sent[sent_key];
						}
					}
				}
			}
			
		};
	});
});


Scoped.define("module:KeyValue.KeyValueStore", ["module:Class", "module:Events.EventsMixin"], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, {

		mem: function (key) {
			return this._mem(key);
		},
		
		get: function (key) {
			return this._get(key);
		},
		
		set: function (key, value) {
			this._set(key, value);
			this.trigger("change:" + key, value);
		},
		
		remove: function (key) {
			this._remove(key);
		}
	
	}]);
});


Scoped.define("module:KeyValue.PrefixKeyValueStore", ["module:KeyValue.KeyValueStore"], function (KeyValueStore, scoped) {
	return KeyValueStore.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (kv, prefix) {
				inherited.constructor.call(this);
				this.__kv = kv;
				this.__prefix = prefix;
			},
			
			_mem: function (key) {
				return this.__kv.mem(this.__prefix + key);
			},
			
			_get: function (key) {
				return this.__kv.get(this.__prefix + key);
			},
			
			_set: function (key, value) {
				this.__kv.set(this.__prefix + key, value);
			},
			
			_remove: function (key) {
				this.__kv.remove(this.__prefix + key);
			}
	
		};
	});
});


Scoped.define("module:KeyValue.MemoryKeyValueStore", ["module:KeyValue.KeyValueStore", "module:Objs"], function (KeyValueStore, Objs, scoped) {
	return KeyValueStore.extend({scoped: scoped}, function (inherited) {
		return {
	
			constructor: function (data, clone) {
				inherited.constructor.call(this);
				this.__data = Objs.clone(data, clone ? 1 : 0);
			},
			
			_mem: function (key) {
				return key in this.__data;
			},
			
			_get: function (key) {
				return this.__data[key];
			},
			
			_set: function (key, value) {
				this.__data[key] = value;
			},
			
			_remove: function (key) {
				delete this.__data[key];
			}

		};
	});
});


Scoped.define("module:KeyValue.DefaultKeyValueStore", ["module:KeyValue.KeyValueStore"], function (KeyValueStore, scoped) {
	return KeyValueStore.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (kv, def) {
				inherited.constructor.call(this);
				this.__kv = kv;
				this.__def = def;
			},
			
			_mem: function (key) {
				return this.__kv.mem(key) || this.__def.mem(key);
			},
			
			_get: function (key) {
				return this.__kv.mem(key) ? this.__kv.get(key) : this.__def.get(key);
			},
			
			_set: function (key, value) {
				this.__kv.set(key, value);
			},
			
			_remove: function (key) {
				this.__kv.remove(key);
			}

		};
	});
});

Scoped.define("module:States.Host", [
	    "module:Properties.Properties",
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
					for (var j = 0; j < descriptor.mapping.length; ++j)
						args[descriptor.mapping[j]] = result[j + 1];
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
Scoped.define("module:RMI.Stub", [
	    "module:Class",
	    "module:Classes.InvokerMixin",
	    "module:Functions"
	], function (Class, InvokerMixin, Functions, scoped) {
	return Class.extend({scoped: scoped}, [InvokerMixin, function (inherited) {
		return {
				
			intf: [],
			
			constructor: function () {
				inherited.constructor.call(this);
				this.invoke_delegate("invoke", this.intf);
			},
			
			destroy: function () {
				this.invoke("_destroy");
				inherited.destroy.call(this);
			},
			
			invoke: function (message) {
				return this.__send(message, Functions.getArguments(arguments, 1));
			}
			
		};
	}]);
});


Scoped.define("module:RMI.StubSyncer", [
  	    "module:Class",
  	    "module:Classes.InvokerMixin",
  	    "module:Functions",
  	    "module:Promise"
  	], function (Class, InvokerMixin, Functions, Promise, scoped) {
  	return Class.extend({scoped: scoped}, [InvokerMixin, function (inherited) {
  		return {
		                          				
			constructor: function (stub) {
				inherited.constructor.call(this);
				this.__stub = stub;
				this.__current = null;
				this.__queue = [];
				this.invoke_delegate("invoke", this.__stub.intf);
			},
			
			invoke: function () {
				var object = {
					args: Functions.getArguments(arguments),
					promise: Promise.create()
				};
				this.__queue.push(object);
				if (!this.__current)
					this.__next();
				return object.promise;		
			},
			
			__next: function () {
				if (this.__queue.length === 0)
					return;
				this.__current = this.__queue.shift();
				this.__stub.invoke.apply(this.__stub, this.__current.args).forwardCallback(this.__current.promise).callback(this.__next, this);
			}
	
		};
	}]);
});


Scoped.define("module:RMI.Skeleton", [
  	    "module:Class",
  	    "module:Objs",
  	    "module:Promise"
  	], function (Class, Objs, Promise, scoped) {
  	return Class.extend({scoped: scoped}, function (inherited) {
  		return {
		                                		                          				
			_stub: null,
			intf: [],
			_intf: {},
			__superIntf: ["_destroy"],
			
			constructor: function (options) {
				this._options = Objs.extend({
					destroyable: false
				}, options);
				inherited.constructor.call(this);
				this.intf = this.intf.concat(this.__superIntf);
				for (var i = 0; i < this.intf.length; ++i)
					this._intf[this.intf[i]] = true;
			},
			
			_destroy: function () {
				if (this._options.destroyable)
					this.destroy();
			},
			
			invoke: function (message, data) {
				if (!(this._intf[message]))
					return Promise.error(message);
				try {
					var result = this[message].apply(this, data);
					return Promise.is(result) ? result : Promise.value(result);
				} catch (e) {
					return Promise.error(e);
				}
			},
			
			_success: function (result) {
				return Promise.value(result);
			},
			
			_error: function (result) {
				return Promise.error(result);
			},
			
			stub: function () {
				if (this._stub)
					return this._stub;
				var stub = this.cls.classname;
				return stub.indexOf("Skeleton") >= 0 ? stub.replace("Skeleton", "Stub") : stub;
			}
	
  		};
  	});
});


Scoped.define("module:RMI.Server", [
	    "module:Class",
	    "module:Events.EventsMixin",
	    "module:Objs",
	    "module:Channels.TransportChannel",
	    "module:Lists.ObjectIdList",
	    "module:Ids",
	    "module:RMI.Skeleton",
	    "module:Promise"
	], function (Class, EventsMixin, Objs, TransportChannel, ObjectIdList, Ids, Skeleton, Promise, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {
			
			constructor: function (sender_or_channel_or_null, receiver_or_null) {
				inherited.constructor.call(this);
				this.__channels = new ObjectIdList();
				this.__instances = {};
				if (sender_or_channel_or_null) {
					var channel = sender_or_channel_or_null;
					if (receiver_or_null)
						channel = this._auto_destroy(new TransportChannel(sender_or_channel_or_null, receiver_or_null));
					this.registerClient(channel);
				}
			},
			
			destroy: function () {
				this.__channels.iterate(this.unregisterClient, this);
				Objs.iter(this.__instances, function (inst) {
					this.unregisterInstance(inst.instance);
				}, this);
				this.__channels.destroy();
				inherited.destroy.call(this);
			},
			
			registerInstance: function (instance, options) {
				options = options || {};
				this.__instances[Ids.objectId(instance, options.name)] = {
					instance: instance,
					options: options
				};
				return instance;
			},
			
			unregisterInstance: function (instance) {
				delete this.__instances[Ids.objectId(instance)];
				instance.destroy();
			},
			
			registerClient: function (channel) {
				var self = this;
				this.__channels.add(channel);
				channel._reply = function (message, data) {
					var components = message.split(":");
					if (components.length == 2)
						return self._invoke(channel, components[0], components[1], data);
					else
						return Promise.error(true);
				};
			},
			
			unregisterClient: function (channel) {
				this.__channels.remove(channel);
				channel._reply = null;
			},
			
			_serializeValue: function (value) {
				if (Skeleton.is_instance_of(value)) {
					var registry = this;
					registry.registerInstance(value);
					return {
						__rmi_meta: true,
						__rmi_stub: value.stub(),
						__rmi_stub_id: Ids.objectId(value)
					};
				} else
					return value;		
			},
			
			_unserializeValue: function (value) {
				if (value && value.__rmi_meta) {
					var receiver = this.client;
					return receiver.acquire(value.__rmi_stub, value.__rmi_stub_id);
				} else
					return value;		
			},
			
			_invoke: function (channel, instance_id, method, data) {
				var instance = this.__instances[instance_id];
				if (!instance) {
					this.trigger("loadInstance", channel, instance_id);
					instance = this.__instances[instance_id];
				}
				if (!instance)
					return Promise.error(instance_id);
				instance = instance.instance;
				data = Objs.map(data, this._unserializeValue, this);
				return instance.invoke(method, data, channel).mapSuccess(function (result) {
					return this._serializeValue(result);
				}, this);
			}
		
		};
	}]);
});


Scoped.define("module:RMI.Client", [
	    "module:Class",
	    "module:Objs",
	    "module:Channels.TransportChannel",
	    "module:Ids",
	    "module:RMI.Skeleton",
	    "module:Types",
	    "module:RMI.Stub"
	], function (Class, Objs, TransportChannel, Ids, Skeleton, Types, Stub, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {			
			
			constructor: function (sender_or_channel_or_null, receiver_or_null) {
				inherited.constructor.call(this);
				this.__channel = null;
				this.__instances = {};
				if (sender_or_channel_or_null) {
					var channel = sender_or_channel_or_null;
					if (receiver_or_null)
						channel = this._auto_destroy(new TransportChannel(sender_or_channel_or_null, receiver_or_null));
					this.__channel = channel;
				}
			},
			
			destroy: function () {
				if (this.__channel)
					this.disconnect();
				inherited.destroy.call(this);
			},
			
			connect: function (channel) {
				if (this.__channel)
					return;
				this.__channel = channel;
			},
			
			disconnect: function () {
				if (!this.__channel)
					return;
				this.__channel = null;
				Objs.iter(this.__instances, function (inst) {
					this.release(inst);
				}, this);
			},
			
			_serializeValue: function (value) {
				if (Skeleton.is_instance_of(value)) {
					var registry = this.server;
					registry.registerInstance(value);
					return {
						__rmi_meta: true,
						__rmi_stub: value.stub(),
						__rmi_stub_id: Ids.objectId(value)
					};
				} else
					return value;		
			},
			
			_unserializeValue: function (value) {
				if (value && value.__rmi_meta) {
					var receiver = this;
					return receiver.acquire(value.__rmi_stub, value.__rmi_stub_id);
				} else
					return value;		
			},
			
			acquire: function (class_type, instance_name) {
				if (this.__instances[instance_name])
					return this.__instances[instance_name];
				if (Types.is_string(class_type))
					class_type = Scoped.getGlobal(class_type);
				if (!class_type || !class_type.ancestor_of(Stub))
					return null;
				var instance = new class_type();
				this.__instances[Ids.objectId(instance, instance_name)] = instance;
				var self = this;
				instance.__send = function (message, data) {
					data = Objs.map(data, self._serializeValue, self);
					return self.__channel.send(instance_name + ":" + message, data).mapSuccess(function (result) {
						return this._unserializeValue(result);
					}, self);
				};
				return instance;		
			},
			
			release: function (instance) {
				var instance_name = Ids.objectId(instance);
				if (!this.__instances[instance_name])
					return;
				instance.off(null, null, this);
				instance.destroy();
				delete this.__instances[instance_name];
			}
			
		};
	});
});


Scoped.define("module:RMI.Peer", [
	    "module:Class",
	    "module:Channels.SenderMultiplexer",
	    "module:Channels.ReceiverMultiplexer",
	    "module:RMI.Client",
	    "module:RMI.Server"
	], function (Class, SenderMultiplexer, ReceiverMultiplexer, Client, Server, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {			
		                            			
			constructor: function (sender, receiver) {
				inherited.constructor.call(this);
				this.__sender = sender;
				this.__receiver = receiver;
				this.__client_sender = this._auto_destroy(new SenderMultiplexer(sender, "client"));
				this.__server_sender = this._auto_destroy(new SenderMultiplexer(sender, "server"));
				this.__client_receiver = this._auto_destroy(new ReceiverMultiplexer(receiver, "server"));
				this.__server_receiver = this._auto_destroy(new ReceiverMultiplexer(receiver, "client"));
				this.client = this._auto_destroy(new Client(this.__client_sender, this.__client_receiver));
				this.server = this._auto_destroy(new Server(this.__server_sender, this.__server_receiver));
				this.client.server = this.server;
				this.server.client = this.client;
			},	
			
			acquire: function (class_type, instance_name) {
				return this.client.acquire(class_type, instance_name);
			},
			
			release: function (instance) {
				this.client.release(instance);
			},
		
			registerInstance: function (instance, options) {
				return this.server.registerInstance(instance, options);
			},
			
			unregisterInstance: function (instance) {
				this.server.unregisterInstance(instance);
			}
			
		};
	});
});

Scoped.define("module:Net.AjaxException", ["module:Exceptions.Exception"], function (Exception, scoped) {
	return Exception.extend({scoped: scoped}, function (inherited) {
		return {
		
			constructor: function (status_code, status_text, data) {
				inherited.constructor.call(this, status_code + ": " + status_text);
				this.__status_code = status_code;
				this.__status_text = status_text;
				this.__data = data;
			},
			
			status_code: function () {
				return this.__status_code;
			},
			
			status_text: function () {
				return this.__status_text;
			},
			
			data: function () {
				return this.__data;
			},
			
			json: function () {
				var obj = inherited.json.call(this);
				obj.data = this.data();
				return obj;
			}
		
		};
	});
});


/*
 * <ul>
 *  <li>uri: target uri</li>
 *  <li>method: get, post, ...</li>
 *  <li>data: data as JSON to be passed with the request</li>
 * </ul>
 * 
 */

Scoped.define("module:Net.AbstractAjax", ["module:Class", "module:Objs", "module:Net.AjaxException"], function (Class, Objs, AjaxException, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (options) {
				inherited.constructor.call(this);
				this.__options = Objs.extend({
					"method": "GET",
					"data": {}
				}, options);
			},
			
			syncCall: function (options) {
				try {
					return this._syncCall(Objs.extend(Objs.clone(this.__options, 1), options));
				} catch (e) {
					throw AjaxException.ensure(e);
				}
			},
			
			asyncCall: function (options) {
				return this._asyncCall(Objs.extend(Objs.clone(this.__options, 1), options));
			},
			
			_syncCall: function (options) {
				throw "Unsupported";
			},
		
			_asyncCall: function (options) {
				throw "Unsupported";
			}
			
		};
	});
});
Scoped.define("module:Net.SocketSenderChannel", ["module:Channels.Sender", "module:Types"], function (Sender, Types, scoped) {
	return Sender.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (socket, message, ready) {
				inherited.constructor.call(this);
				this.__socket = socket;
				this.__message = message;
				this.__ready = Types.is_defined(ready) ? ready : true;
				this.__cache = [];
			},
			
			/** @suppress {missingProperties} */
			_send: function (message, data) {
				if (this.__ready) {
					this.__socket.emit(this.__message, {
						message: message,
						data: data
					});
				} else {
					this.__cache.push({
						message: message,
						data: data
					});
				}
			},
			
			ready: function () {
				this.__ready = true;
				for (var i = 0; i < this.__cache.length; ++i)
					this._send(this.__cache[i].message, this.__cache[i].data);
				this.__cache = [];
			},
			
			unready: function () {
			    this.__ready = false;
			},
			
			socket: function () {
			    if (arguments.length > 0)
			        this.__socket = arguments[0];
			    return this.__socket;
			}
			
		};
	});
});


Scoped.define("module:Net.SocketReceiverChannel", ["module:Channels.Receiver"], function (Receiver, scoped) {
	return Receiver.extend({scoped: scoped}, function (inherited) {
		return {
						
			constructor: function (socket, message) {
				inherited.constructor.call(this);
				this.__message = message;
				this.socket(socket);
			},
			
		    socket: function () {
		        if (arguments.length > 0) {
		            this.__socket = arguments[0];
		            if (this.__socket) {
		                var self = this;
		                this.__socket.on(this.__message, function (data) {
		                    self._receive(data.message, data.data);
		                });
		            }
		        }
		        return this.__socket;
		    }
	
		};
	});
});

Scoped.define("module:Net.HttpHeader", function () {
	return {
		
		HTTP_STATUS_OK : 200,
		HTTP_STATUS_CREATED : 201,
		HTTP_STATUS_PAYMENT_REQUIRED : 402,
		HTTP_STATUS_FORBIDDEN : 403,
		HTTP_STATUS_NOT_FOUND : 404,
		HTTP_STATUS_PRECONDITION_FAILED : 412,
		HTTP_STATUS_INTERNAL_SERVER_ERROR : 500,
		
		format: function (code, prepend_code) {
			var ret = "";
			if (code == this.HTTP_STATUS_OK)
				ret = "OK";
			else if (code == this.HTTP_STATUS_CREATED)
				ret = "Created";
			else if (code == this.HTTP_STATUS_PAYMENT_REQUIRED)
				ret = "Payment Required";
			else if (code == this.HTTP_STATUS_FORBIDDEN)
				ret = "Forbidden";
			else if (code == this.HTTP_STATUS_NOT_FOUND)
				ret = "Not found";
			else if (code == this.HTTP_STATUS_PRECONDITION_FAILED)
				ret = "Precondition Failed";
			else if (code == this.HTTP_STATUS_INTERNAL_SERVER_ERROR)
				ret = "Internal Server Error";
			else
				ret = "Other Error";
			return prepend_code ? (code + " " + ret) : ret;
		}
		
	};
});
Scoped.define("module:Net.Uri", ["module:Objs", "module:Types"], function (Objs, Types) {
	return {
		
		build: function (obj) {
			var s = "";
			if (obj.username)
				s += obj.username + ":";
			if (obj.password)
				s += obj.password + "@";
			s += obj.server;
			if (obj.port)
				s += ":" + obj.port;
			if (obj.path)
				s += "/" + obj.path;
			return s;
		},
		
		encodeUriParams: function (arr, prefix) {
			prefix = prefix || "";
			var res = [];
			Objs.iter(arr, function (value, key) {
				if (Types.is_object(value))
					res = res.concat(this.encodeUriParams(value, prefix + key + "_"));
				else
					res.push(prefix + key + "=" + encodeURI(value));
			}, this);
			return res.join("&");
		},
		
		appendUriParams: function (uri, arr, prefix) {
			return Types.is_empty(arr) ? uri : (uri + (uri.indexOf("?") != -1 ? "&" : "?") + this.encodeUriParams(arr, prefix));
		},
		
		// parseUri 1.2.2
		// (c) Steven Levithan <stevenlevithan.com>
		// MIT License
	
		parse: function (str, strict) {
			var parser = strict ? this.__parse_strict_regex : this.__parse_loose_regex;
			var m = parser.exec(str);
			var uri = {};
			for (var i = 0; i < this.__parse_key.length; ++i)
				uri[this.__parse_key[i]] = m[i] || "";
			uri.queryKey = {};
			uri[this.__parse_key[12]].replace(this.__parse_key_parser, function ($0, $1, $2) {
				if ($1) uri.queryKey[$1] = $2;
			});
	
			return uri;
		},
		
		__parse_strict_regex: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		__parse_loose_regex: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
		__parse_key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
		__parse_key_parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	
	};
});	
}).call(Scoped);