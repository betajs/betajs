Scoped.define("module:Exceptions.ErrorCatcher", [
    "module:Class"
], function (Class, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (thrower) {
				inherited.constructor.call(this);
				this.__thrower = thrower;
			},
			
			throwException: function (e) {
				this.__thrower.throwException(e);
			}
			
		};
	});
});


Scoped.define("module:Exceptions.UncaughtErrorCatcher", [
	"module:Exceptions.ErrorCatcher",
	"module:Functions"
], function (ErrorCatcher, Functions, scoped) {
	return ErrorCatcher.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (thrower) {
				inherited.constructor.call(this, thrower);
				this.__listenerFunction = Functions.as_method(this._listenerFunction, this);
				try {
					window.addEventListener("error", this.__listenerFunction);
				} catch (e) {}
				try {
					process.on('uncaughtException', this.__listenerFunction);
				} catch (e) {}
			},
			
			destroy: function () {
				try {
					window.removeEventListener("error", this.__listenerFunction);
				} catch (e) {}
				try {
					process.off('uncaughtException', this.__listenerFunction);
				} catch (e) {}
				inherited.destroy.call(this);
			},
			
			_listenerFunction: function (e) {
				this.throwException(e);
			}

		};
	});
});