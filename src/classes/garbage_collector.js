Scoped.define("module:Classes.AbstractGarbageCollector", [
    "module:Class"    
], function (Class, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		/**
		 * Abstract Garbage Collector
		 * 
		 * @class BetaJS.Classes.AbstractGarbageCollector
		 */
		return {
			
			/**
			 * Instantiate garbage collector.
			 * 
			 */
			constructor: function () {
				inherited.constructor.call(this);
				this.__classes = {};
				this.__queue = [];
			},
			
			/**
			 * Add an object to the garbage collection queue.
			 * 
			 * @param {object} obj object to be destroyed
			 */
			queue: function (obj) {
				if (!obj || obj.destroyed() || this.__classes[obj.cid()])
					return this;
				this.__queue.push(obj);
				this.__classes[obj.cid()] = obj;
				return this;
			},
			
			/**
			 * Are there objects in the garbage collection queue?
			 * 
			 * @return {boolean} true if the queue is not empty
			 */
			hasNext: function () {
				return this.__queue.length > 0;
			},
			
			/**
			 * Destroy the next object in the queue.
			 * 
			 */
			destroyNext: function () {
				var obj = this.__queue.shift();
				delete this.__classes[obj.cid()];
				if (!obj.destroyed())
					obj.destroy();
				delete obj.__gc;
				return this;
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
		/**
		 * Default Garbage Collector
		 * 
		 * @class BetaJS.Classes.DefaultGarbageCollector
		 */
		return {
			
			/**
			 * Instantiate garbage collector.
			 * 
			 * @param {integer} delay how long should be the delay between garbage collection
			 * @param {integer} duration how long should garbage collection be executed
			 */
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
