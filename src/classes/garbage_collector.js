Scoped.define("module:Classes.AbstractGarbageCollector", [
    "module:Class"    
], function (Class, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function () {
				inherited.constructor.call(this);
				this.__classes = {};
				this.__queue = [];
			},
			
			queue: function (obj) {
				if (!obj || obj.destroyed() || this.__classes[obj.cid()])
					return;
				this.__queue.push(obj);
				this.__classes[obj.cid()] = obj;
			},
			
			hasNext: function () {
				return this.__queue.length > 0;
			},
			
			destroyNext: function () {
				var obj = this.__queue.shift();
				delete this.__classes[obj.cid()];
				if (!obj.destroyed())
					obj.destroy();
				delete obj.__gc;
			}

		};
	});
});


Scoped.define("module:Classes.DefaultGarbageCollector", [
    "module:Classes.AbstractGarbageCollector",
    "module:Timers.Timer",
    "module:Time"
], function (Class, Timer, Time, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (delay, duration) {
				inherited.constructor.call(this);
				this.__duration = duration || 5;
				this.auto_destroy(new Timer({
					fire: this.__fire,
					context: this,
					delay: delay || 100
				}));
			},
			
			__fire: function () {
				var t = Time.now() + this.__duration;
				while (Time.now() < t && this.hasNext())
					this.destroyNext();
			}		

		};
	});
});
