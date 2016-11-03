Scoped.define("module:Loggers.LogListenerFilter", [
	"module:Loggers.LogListener",
	"module:Objs",
	"module:Types"
], function (LogListener, Objs, Types, scoped) {
	return LogListener.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (target, tags) {
				inherited.constructor.call(this);
				this.__target = target;
				this.__tags = tags;
			},

			message: function (source, msg) {
				var tags = Objs.objectify(msg.tags); 
				var result = false;
				if (Types.is_array(this.__tags[0])) {
					result = this.__tags.some(function (sub) {
						return sub.every(function (tag) {
							return tags[tag];
						});
					});
				} else {
					result = this.__tags.every(function (tag) {
						return tags[tag];
					});
				}
				if (result)
					this.__target.message(source, msg);
			}
			
		};
	});
});