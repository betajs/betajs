Scoped.define("module:Loggers.ConsoleLogListener", [
	"module:Loggers.LogListener"
], function (LogListener, scoped) {
	return LogListener.extend({scoped: scoped}, function (inherited) {
		
		/**
		 * Console Log Listener Class
		 * 
		 * @class BetaJS.Loggers.ConsoleLogListener
		 */
		return {
			
			/**
			 * @override
			 */
			message: function (source, msg) {
				console[msg.type].apply(console, msg.args);
			}

		};
	});
});