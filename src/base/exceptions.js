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
