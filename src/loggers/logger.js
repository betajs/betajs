Scoped.define("module:Loggers.Logger", [
	"module:Class",
	"module:Objs",
	"module:Functions"
], function (Class, Objs, Functions, scoped) {
	var Cls = Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this);
				options = options || {};
				this.__listeners = {};
				this.__tags = options.tags || [];
				Objs.iter(options.listeners, this.addListener, this);
			},
			
			addListener: function (listener) {
				this.__listeners[listener.cid()] = listener;
				return this;
			},
			
			removeListener: function (listener) {
				delete this.__listeners[listener.cid()];
				return this;
			},
			
			log: function () {
				return this.message(this, {
					type: "log",
					args: Functions.getArguments(arguments, 0)
				});
			},
			
			warn: function () {
				return this.message(this, {
					type: "warn",
					args: Functions.getArguments(arguments, 0)
				});
			},
			
			error: function () {
				return this.message(this, {
					type: "error",
					args: Functions.getArguments(arguments, 0)
				});
			},
			
			taggedlog: function (tags) {
				return this.message(this, {
					type: "log",
					tags: tags,
					args: Functions.getArguments(arguments, 1)
				});
			},
			
			taggedwarn: function (tags) {
				return this.message(this, {
					type: "warn",
					tags: tags,
					args: Functions.getArguments(arguments, 1)
				});
			},

			taggederror: function (tags) {
				return this.message(this, {
					type: "error",
					tags: tags,
					args: Functions.getArguments(arguments, 1)
				});
			},

			message: function (source, msg) {
				Objs.iter(this.__listeners, function (listener) {
					msg.tags = this.__tags.concat(msg.tags || []);
					listener.message(this, msg);
				}, this);
				return this;
			},
			
			tag: function () {
				return new Cls({
					tags: Functions.getArguments(arguments),
					listeners: [this]
				});
			}
			
		};
	}, {
		
		global: function () {
			if (!this.__global)
				this.__global = new Cls();
			return this.__global;
		}
		
	});
	
	return Cls;
});