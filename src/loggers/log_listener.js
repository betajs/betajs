Scoped.define("module:Loggers.LogListener", [
	"module:Class"
], function (Class, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			message: function (source, msg) {}
			
		};
	});
});