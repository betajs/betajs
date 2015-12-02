Scoped.define("module:Classes.ConditionalInstance", [
	 "module:Class",
	 "module:Objs"
], function (Class, Objs, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this);
				this._options = this.cls._initializeOptions(options);
			}
			
		};
	}, {
		
		_initializeOptions: function (options) {
			return options;
		},
		
		supported: function (options) {
			return false;
		}
		
	}, {

		__registry: [],
		
		register: function (cls, priority) {
			this.__registry.push({
				cls: cls,
				priority: priority
			});
		},
		
		match: function (options) {
			options = this._initializeOptions(options);
			var bestMatch = null;
			Objs.iter(this.__registry, function (entry) {
				if ((!bestMatch || bestMatch.priority < entry.priority) && entry.cls.supported(options))
					bestMatch = entry;				
			}, this);
			return bestMatch;
		},
		
		create: function (options) {
			var match = this.match(options);
			return match ? new match.cls(options) : null;
		},
		
		anySupport: function (options) {
			return this.match(options) !== null;
		}
		
	});	
});




Scoped.define("module:Classes.OptimisticConditionalInstance", [
	"module:Class",
	"module:Objs",
	"module:Promise"
], function (Class, Objs, Promise, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options, transitionals) {
				inherited.constructor.call(this);
				this._transitionals = {};
			},
			
			_initializer: function () {
				// returns a promise
			},
			
			_initialize: function () {
				return this._initializer().success(function () {
					this._afterInitialize();
				}, this);
			},
			
			transitionals: function () {
				return this._transitionals;
			},
			
			_afterInitialize: function () {
				// setup
			}
		
		};
	}, {}, {
		
		__registry: [],
		
		register: function (cls, priority) {
			this.__registry.push({
				cls: cls,
				priority: priority
			});
		},
		
		create: function (options) {
			var promise = Promise.create();
			var reg = Objs.clone(this.__registry, 1);
			var transitionals = {};
			var next = function () {
				if (!reg.length) {
					promise.asyncError(true);
					return;
				}
				var p = -1;
				var j = -1;
				for (var i = 0; i < reg.length; ++i) {
					if (reg[i].priority > p) {
						p = reg[i].priority;
						j = i;
					}
				}
				var cls = reg[j].cls;
				reg.splice(j, 1);
				var instance = new cls(options, transitionals);
				instance._initialize().error(function () {
					transitionals = instance.transitionals();
					instance.destroy();
					next.call(this);
				}, this).success(function () {
					promise.asyncSuccess(instance);
				});
			};
			next.call(this);
			return promise;
		}
		
	});	
});
