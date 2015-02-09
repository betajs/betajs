/*!
betajs-scoped - v0.0.1 - 2014-12-13
Copyright (c) Oliver Friedmann
MIT Software License.
*/
var Scoped = (function () {
var Globals = {

	get : function(key) {
		try {
			if (window)
				return window[key];
		} catch (e) {
		}
		try {
			if (global)
				return global[key];
		} catch (e) {
		}
		return null;
	},

	set : function(key, value) {
		try {
			if (window)
				window[key] = value;
		} catch (e) {
		}
		try {
			if (global)
				global[key] = value;
		} catch (e) {
		}
	}

};
var Helper = {
		
	method: function (obj, func) {
		return function () {
			func.apply(obj, arguments);
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
	}
	

};
var Scoped = {
		
	__namespace: "Scoped",

	attach : function(namespace) {
		if (namespace)
			Scoped.__namespace = namespace;
		var current = Globals.get(Scoped.__namespace);
		if (current == this)
			return this;
		Scoped.__revert = current;
		Globals.set(namespace, this);
		return this;
	},
	
	detach: function (forceDetach) {
		if (forceDetach)
			Globals.set(Scoped.__namespace, null);
		if (typeof Scoped.__revert != "undefined")
			Globals.set(Scoped.__namespace, Scoped.__revert);
		delete Scoped.__revert;
		return this;
	},
	
	exports: function (object) {
		if (typeof module != "undefined" && "exports" in module)
			module.exports = object;
		return this;
	}	

};
function newNamespace (options) {
	
	options = Helper.extend({
		tree: false,
		global: false
	}, options);
	
	function initNode(options) {
		return Helper.extend({
			route: null,
			parent: null,
			children: {},
			watchers: [],
			data: {},
			ready: false
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
			treeRoot = {};
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
	
	return {
		
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
			if (!bindings[alias] || !bindings[alias].readonly)
				bindings[alias] = Helper.extend(options, this.resolve(namespaceLocator));
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
				return {
					namespace: binding.namespace,
					path : binding.path && parts[1] ? binding.path + "." + parts[1] : (binding.path || parts[1])
				};
			}
		},
		
		define: function () {
			var args = Helper.matchArgs(arguments, {
				namespaceLocator: true,
				dependencies: "array",
				hiddenDependencies: "array",
				callback: true,
				context: "object"
			});
			var ns = this.resolve(args.namespaceLocator);
			this.require(args.dependencies, args.hiddenDependencies, function () {
				ns.namespace.set(ns.path, args.callback.apply(args.context || this, arguments));
			}, this);
			return this;
		},
		
		extend: function () {
			var args = Helper.matchArgs(arguments, {
				namespaceLocator: true,
				dependencies: "array",
				hiddenDependencies: "array",
				callback: true,
				context: "object"
			});
			var ns = this.resolve(args.namespaceLocator);
			this.require(args.dependencies, args.hiddenDependencies, function () {
				ns.namespace.extend(ns.path, args.callback.apply(args.context || this, arguments));
			}, this);
			return this;
		},
		
		condition: function () {
			var args = Helper.matchArgs(arguments, {
				namespaceLocator: true,
				dependencies: "array",
				hiddenDependencies: "array",
				callback: true,
				context: "object"
			});
			var ns = this.resolve(args.namespaceLocator);
			this.require(args.dependencies, args.hiddenDependencies, function () {
				var result = args.callback.apply(args.context || this, arguments);
				if (result)
					ns.namespace.set(ns.path, result);
			}, this);
			return this;
		},
		
		require: function () {
			var args = Helper.matchArgs(arguments, {
				dependencies: "array",
				hiddenDependencies: "array",
				callback: true,
				context: "object"
			});
			var dependencies = args.dependencies || [];
			var allDependencies = dependencies.concat(args.hiddenDependencies || []);
			var count = allDependencies.length;
			var deps = [];
			if (count) {
				for (var i = 0; i < allDependencies.length; ++i) {
					var ns = this.resolve(allDependencies[i]);
					if (i < dependencies.length)
						deps.push(null);
					ns.namespace.obtain(ns.path, function (value) {
						if (this.i < deps.length)
							deps[this.i] = value;
						count--;
						if (count === 0)
							args.callback.apply(args.context || this.ctx, deps);
					}, {
						ctx: this,
						i: i
					});
				}
			} else
				args.callback.apply(args.context || this, deps);
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

var Public = {
		
	attach: Scoped.attach,
	detach: Scoped.detach,
	exports: Scoped.exports,
	
	nextScope: Helper.method(rootScope, rootScope.nextScope),
	subScope: Helper.method(rootScope, rootScope.nextScope),
	binding: Helper.method(rootScope, rootScope.binding),
	condition: Helper.method(rootScope, rootScope.condition),
	define: Helper.method(rootScope, rootScope.define),
	extend: Helper.method(rootScope, rootScope.extend),
	require: Helper.method(rootScope, rootScope.require),
	digest: Helper.method(rootScope, rootScope.digest)	
	
};
Public.attach();
Public.exports(Public);
	return Public;
}).call(this);