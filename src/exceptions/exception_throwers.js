Scoped.define("module:Exceptions.ExceptionThrower", [
    "module:Class"
], function (Class, scoped) {
	return Class.extend({scoped: scoped}, {
		
		throwException: function (e) {
			this._throwException(e);
			return this;
		},
		
		_throwException: function (e) {
			throw e;
		}
			
	});
});


Scoped.define("module:Exceptions.NullExceptionThrower", [
	"module:Exceptions.ExceptionThrower"
], function (ExceptionThrower, scoped) {
	return ExceptionThrower.extend({scoped: scoped},{
			
		_throwException: function (e) {}
		
	});
});


Scoped.define("module:Exceptions.AsyncExceptionThrower", [
	"module:Exceptions.ExceptionThrower",
	"module:Async"
], function (ExceptionThrower, Async, scoped) {
	return ExceptionThrower.extend({scoped: scoped},{
			
		_throwException: function (e) {
			Async.eventually(function () {
				throw e;
			});
		}
		
	});
});


Scoped.define("module:Exceptions.ConsoleExceptionThrower", [
	"module:Exceptions.ExceptionThrower",
	"module:Exceptions.NativeException"
], function (ExceptionThrower, NativeException, scoped) {
	return ExceptionThrower.extend({scoped: scoped}, {
		
		_throwException: function (e) {
			console.log("Exception", NativeException.ensure(e).json());
		}
			
	});
});


Scoped.define("module:Exceptions.EventExceptionThrower", [
	"module:Exceptions.ExceptionThrower",
	"module:Events.EventsMixin"
], function (ExceptionThrower, EventsMixin, scoped) {
	return ExceptionThrower.extend({scoped: scoped}, [EventsMixin, {

		_throwException: function (e) {
			this.trigger("exception", e);
		}
	
	}]);
});
