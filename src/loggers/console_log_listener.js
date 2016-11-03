Scoped.define("module:Loggers.ConsoleLogListener", [
	"module:Loggers.LogListener"
], function (LogListener, scoped) {
	return LogListener.extend({scoped: scoped}, function (inherited) {
		return {
			
			message: function (source, msg) {
				console[msg.type].apply(console, msg.args);
			}

		};
	});
});