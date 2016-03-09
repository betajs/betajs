/*!
betajs-scoped - v0.0.6 - 2016-02-03
Copyright (c) Oliver Friedmann
Apache 2.0 Software License.
*/
var Scoped = function () {
	var Globals = {

		get: function (key /* : string */) {
			if (typeof window !== "undefined") return window[key];
			if (typeof global !== "undefined") return global[key];
			return null;
		},

		set: function (key /* : string */, value) {
			if (typeof window !== "undefined") window[key] = value;
			if (typeof global !== "undefined") global[key] = value;
			return value;
		},

		setPath: function (path /* : string */, value) {
			var args = path.split(".");
			if (args.length == 1) return this.set(path, value);
			var current = this.get(args[0]) || this.set(args[0], {});
			for (var i = 1; i < args.length - 1; ++i) {
				if (!(args[i] in current)) current[args[i]] = {};
				current = current[args[i]];
			}
			current[args[args.length - 1]] = value;
			return value;
		},

		getPath: function (path /* : string */) {
			var args = path.split(".");
			if (args.length == 1) return this.get(path);
			var current = this.get(args[0]);
			for (var i = 1; i < args.length; ++i) {
				if (!current) return current;
				current = current[args[i]];
			}
			return current;
		}

	};
	/*::
 declare module Helper {
 	declare function extend<A, B>(a: A, b: B): A & B;
 }
 */

	var Helper = {

		method: function (obj, func) {
			return function () {
				return func.apply(obj, arguments);
			};
		},

		extend: function (base, overwrite) {
			base = base || {};
			overwrite = overwrite || {};
			for (var key in overwrite) base[key] = overwrite[key];
			return base;
		},

		typeOf: function (obj) {
			return Object.prototype.toString.call(obj) === '[object Array]' ? "array" : typeof obj;
		},

		isEmpty: function (obj) {
			if (obj === null || typeof obj === "undefined") return true;
			if (this.typeOf(obj) == "array") return obj.length === 0;
			if (typeof obj !== "object") return false;
			for (var key in obj) return false;
			return true;
		},

		matchArgs: function (args, pattern) {
			var i = 0;
			var result = {};
			for (var key in pattern) {
				if (pattern[key] === true || this.typeOf(args[i]) == pattern[key]) {
					result[key] = args[i];
					i++;
				} else if (this.typeOf(args[i]) == "undefined") i++;
			}
			return result;
		},

		stringify: function (value) {
			if (this.typeOf(value) == "function") return "" + value;
			return JSON.stringify(value);
		}

	};
	var Attach = {

		__namespace: "Scoped",
		__revert: null,

		upgrade: function (namespace /* : ?string */) {
			var current = Globals.get(namespace || Attach.__namespace);
			if (current && Helper.typeOf(current) == "object" && current.guid == this.guid && Helper.typeOf(current.version) == "string") {
				var my_version = this.version.split(".");
				var current_version = current.version.split(".");
				var newer = false;
				for (var i = 0; i < Math.min(my_version.length, current_version.length); ++i) {
					newer = parseInt(my_version[i], 10) > parseInt(current_version[i], 10);
					if (my_version[i] != current_version[i]) break;
				}
				return newer ? this.attach(namespace) : current;
			} else return this.attach(namespace);
		},

		attach: function (namespace /* : ?string */) {
			if (namespace) Attach.__namespace = namespace;
			var current = Globals.get(Attach.__namespace);
			if (current == this) return this;
			Attach.__revert = current;
			if (current) {
				try {
					var exported = current.__exportScoped();
					this.__exportBackup = this.__exportScoped();
					this.__importScoped(exported);
				} catch (e) {
					// We cannot upgrade the old version.
				}
			}
			Globals.set(Attach.__namespace, this);
			return this;
		},

		detach: function (forceDetach /* : ?boolean */) {
			if (forceDetach) Globals.set(Attach.__namespace, null);
			if (typeof Attach.__revert != "undefined") Globals.set(Attach.__namespace, Attach.__revert);
			delete Attach.__revert;
			if (Attach.__exportBackup) this.__importScoped(Attach.__exportBackup);
			return this;
		},

		exports: function (mod, object, forceExport) {
			mod = mod || (typeof module != "undefined" ? module : null);
			if (typeof mod == "object" && mod && "exports" in mod && (forceExport || mod.exports == this || !mod.exports || Helper.isEmpty(mod.exports))) mod.exports = object || this;
			return this;
		}

	};

	function newNamespace(opts /* : {tree ?: boolean, global ?: boolean, root ?: Object} */) {

		var options /* : {
              tree: boolean,
              global: boolean,
              root: Object
              } */ = {
			tree: typeof opts.tree === "boolean" ? opts.tree : false,
			global: typeof opts.global === "boolean" ? opts.global : false,
			root: typeof opts.root === "object" ? opts.root : {}
		};

		/*::
  type Node = {
  	route: ?string,
  	parent: ?Node,
  	children: any,
  	watchers: any,
  	data: any,
  	ready: boolean,
  	lazy: any
  };
  */

		function initNode(options) /* : Node */{
			return {
				route: typeof options.route === "string" ? options.route : null,
				parent: typeof options.parent === "object" ? options.parent : null,
				ready: typeof options.ready === "boolean" ? options.ready : false,
				children: {},
				watchers: [],
				data: {},
				lazy: []
			};
		}

		var nsRoot = initNode({ ready: true });

		if (options.tree) {
			if (options.global) {
				try {
					if (window) nsRoot.data = window;
				} catch (e) {}
				try {
					if (global) nsRoot.data = global;
				} catch (e) {}
			} else nsRoot.data = options.root;
		}

		function nodeDigest(node /* : Node */) {
			if (node.ready) return;
			if (node.parent && !node.parent.ready) {
				nodeDigest(node.parent);
				return;
			}
			if (node.route && node.parent && node.route in node.parent.data) {
				node.data = node.parent.data[node.route];
				node.ready = true;
				for (var i = 0; i < node.watchers.length; ++i) node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
				node.watchers = [];
				for (var key in node.children) nodeDigest(node.children[key]);
			}
		}

		function nodeEnforce(node /* : Node */) {
			if (node.ready) return;
			if (node.parent && !node.parent.ready) nodeEnforce(node.parent);
			node.ready = true;
			if (node.parent) {
				if (options.tree && typeof node.parent.data == "object") node.parent.data[node.route] = node.data;
			}
			for (var i = 0; i < node.watchers.length; ++i) node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
			node.watchers = [];
		}

		function nodeSetData(node /* : Node */, value) {
			if (typeof value == "object" && node.ready) {
				for (var key in value) node.data[key] = value[key];
			} else node.data = value;
			if (typeof value == "object") {
				for (var ckey in value) {
					if (node.children[ckey]) node.children[ckey].data = value[ckey];
				}
			}
			nodeEnforce(node);
			for (var k in node.children) nodeDigest(node.children[k]);
		}

		function nodeClearData(node /* : Node */) {
			if (node.ready && node.data) {
				for (var key in node.data) delete node.data[key];
			}
		}

		function nodeNavigate(path /* : ?String */) {
			if (!path) return nsRoot;
			var routes = path.split(".");
			var current = nsRoot;
			for (var i = 0; i < routes.length; ++i) {
				if (routes[i] in current.children) current = current.children[routes[i]];else {
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

		function nodeAddWatcher(node /* : Node */, callback, context) {
			if (node.ready) callback.call(context || this, node.data);else {
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

		function nodeUnresolvedWatchers(node /* : Node */, base, result) {
			node = node || nsRoot;
			result = result || [];
			if (!node.ready) result.push(base);
			for (var k in node.children) {
				var c = node.children[k];
				var r = (base ? base + "." : "") + c.route;
				result = nodeUnresolvedWatchers(c, r, result);
			}
			return result;
		}

		return {

			extend: function (path, value) {
				nodeSetData(nodeNavigate(path), value);
			},

			set: function (path, value) {
				var node = nodeNavigate(path);
				if (node.data) nodeClearData(node);
				nodeSetData(node, value);
			},

			get: function (path) {
				var node = nodeNavigate(path);
				return node.ready ? node.data : null;
			},

			lazy: function (path, callback, context) {
				var node = nodeNavigate(path);
				if (node.ready) callback(context || this, node.data);else {
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
			},

			unresolvedWatchers: function (path) {
				return nodeUnresolvedWatchers(nodeNavigate(path), path);
			},

			__export: function () {
				return {
					options: options,
					nsRoot: nsRoot
				};
			},

			__import: function (data) {
				options = data.options;
				nsRoot = data.nsRoot;
			}

		};
	}
	function newScope(parent, parentNS, rootNS, globalNS) {

		var self = this;
		var nextScope = null;
		var childScopes = [];
		var parentNamespace = parentNS;
		var rootNamespace = rootNS;
		var globalNamespace = globalNS;
		var localNamespace = newNamespace({ tree: true });
		var privateNamespace = newNamespace({ tree: false });

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
						for (var i = 0; i < argmts.length; ++i) params.push(Helper.stringify(argmts[i]));
						this.compiled += this.options.ident + "." + name + "(" + params.join(", ") + ");\n\n";
					}
					var result = this.options.compile ? {} : args.callback.apply(args.context || this, arguments);
					callback.call(this, ns, result);
				}, this);
			};

			if (options.lazy) ns.namespace.lazy(ns.path, execute, this);else execute.apply(this);

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
				if (!nextScope) nextScope = newScope(this, localNamespace, rootNamespace, globalNamespace);
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
					} else ns = this.resolve(namespaceLocator);
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
					if (!binding) throw "The namespace '" + parts[0] + "' has not been defined (yet).";
					return {
						namespace: binding.namespace,
						path: binding.path && parts[1] ? binding.path + "." + parts[1] : binding.path || parts[1]
					};
				}
			},

			define: function () {
				return custom.call(this, arguments, "define", function (ns, result) {
					if (ns.namespace.get(ns.path)) throw "Scoped namespace " + ns.path + " has already been defined. Use extend to extend an existing namespace instead";
					ns.namespace.set(ns.path, result);
				});
			},

			assume: function () {
				var args = Helper.matchArgs(arguments, {
					assumption: true,
					dependencies: "array",
					callback: true,
					context: "object",
					error: "string"
				});
				var dependencies = args.dependencies || [];
				dependencies.unshift(args.assumption);
				this.require(dependencies, function (assumptionValue) {
					if (!args.callback.apply(args.context || this, arguments)) throw "Scoped Assumption '" + args.assumption + "' failed, value is " + assumptionValue + (args.error ? ", but assuming " + args.error : "");
				});
			},

			assumeVersion: function () {
				var args = Helper.matchArgs(arguments, {
					assumption: true,
					dependencies: "array",
					callback: true,
					context: "object",
					error: "string"
				});
				var dependencies = args.dependencies || [];
				dependencies.unshift(args.assumption);
				this.require(dependencies, function () {
					var argv = arguments;
					var assumptionValue = argv[0];
					argv[0] = assumptionValue.split(".");
					for (var i = 0; i < argv[0].length; ++i) argv[0][i] = parseInt(argv[0][i], 10);
					if (Helper.typeOf(args.callback) === "function") {
						if (!args.callback.apply(args.context || this, args)) throw "Scoped Assumption '" + args.assumption + "' failed, value is " + assumptionValue + (args.error ? ", but assuming " + args.error : "");
					} else {
						var version = (args.callback + "").split(".");
						for (var j = 0; j < Math.min(argv[0].length, version.length); ++j) if (parseInt(version[j], 10) > argv[0][j]) throw "Scoped Version Assumption '" + args.assumption + "' failed, value is " + assumptionValue + ", but assuming at least " + args.callback;
					}
				});
			},

			extend: function () {
				return custom.call(this, arguments, "extend", function (ns, result) {
					ns.namespace.extend(ns.path, result);
				});
			},

			condition: function () {
				return custom.call(this, arguments, "condition", function (ns, result) {
					if (result) ns.namespace.set(ns.path, result);
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
						if (this.i < deps.length) deps[this.i] = value;
						count--;
						if (count === 0) {
							deps.push(environment);
							args.callback.apply(args.context || this.ctx, deps);
						}
					};
					for (var i = 0; i < allDependencies.length; ++i) {
						var ns = this.resolve(allDependencies[i]);
						if (i < dependencies.length) deps.push(null);
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
			},

			unresolved: function (namespaceLocator) {
				var ns = this.resolve(namespaceLocator);
				return ns.namespace.unresolvedWatchers(ns.path);
			},

			__export: function () {
				return {
					parentNamespace: parentNamespace.__export(),
					rootNamespace: rootNamespace.__export(),
					globalNamespace: globalNamespace.__export(),
					localNamespace: localNamespace.__export(),
					privateNamespace: privateNamespace.__export()
				};
			},

			__import: function (data) {
				parentNamespace.__import(data.parentNamespace);
				rootNamespace.__import(data.rootNamespace);
				globalNamespace.__import(data.globalNamespace);
				localNamespace.__import(data.localNamespace);
				privateNamespace.__import(data.privateNamespace);
			}

		};
	}
	var globalNamespace = newNamespace({ tree: true, global: true });
	var rootNamespace = newNamespace({ tree: true });
	var rootScope = newScope(null, rootNamespace, rootNamespace, globalNamespace);

	var Public = Helper.extend(rootScope, {

		guid: "4b6878ee-cb6a-46b3-94ac-27d91f58d666",
		version: '35.1454518325486',

		upgrade: Attach.upgrade,
		attach: Attach.attach,
		detach: Attach.detach,
		exports: Attach.exports,

		__exportScoped: function () {
			return {
				globalNamespace: globalNamespace.__export(),
				rootNamespace: rootNamespace.__export(),
				rootScope: rootScope.__export()
			};
		},

		__importScoped: function (data) {
			globalNamespace.__import(data.globalNamespace);
			rootNamespace.__import(data.rootNamespace);
			rootScope.__import(data.rootScope);
		}

	});

	Public = Public.upgrade();
	Public.exports();
	return Public;
}.call(this);
