
Scoped.define("module:Timers.Timer", [
    "module:Class",
    "module:Objs",
    "module:Time"
], function (Class, Objs, Time, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			/*
			 * int delay (mandatory): number of milliseconds until it fires
			 * bool once (optional, default false): should it fire infinitely often
			 * func fire (optional): will be fired
			 * object context (optional): for fire
			 * bool start (optional, default true): should it start immediately
			 * bool real_time (default false)
			 * int duration (optional, default null)
<<<<<<< HEAD:src/base/timers.js
=======
			 * int fire_max (optiona, default null)
>>>>>>> d9727dbfc8a6a5bc48673d0c9196fa3e6c4d5084:src/flow/timers.js
			 * 
			 */
			constructor: function (options) {
				inherited.constructor.call(this);
				options = Objs.extend({
					once: false,
					start: true,
					fire: null,
					context: this,
					destroy_on_fire: false,
					destroy_on_stop: false,
					real_time: false,
					duration: null,
					fire_max: null
				}, options);
				this.__delay = options.delay;
				this.__destroy_on_fire = options.destroy_on_fire;
				this.__destroy_on_stop = options.destroy_on_stop;
				this.__once = options.once;
				this.__fire = options.fire;
				this.__context = options.context;
				this.__started = false;
				this.__real_time = options.real_time;
				this.__end_time = options.duration !== null ? Time.now() + options.duration : null;
				this.__fire_max = options.fire_max;
				if (options.start)
					this.start();
			},
			
			destroy: function () {
				this.stop();
				inherited.destroy.call(this);
			},
			
			fire_count: function () {
				return this.__fire_count;
			},
			
			duration: function () {
				return Time.now() - this.__start_time;
			},
			
			fire: function () {
				if (this.__once)
					this.__started = false;
				if (this.__fire) {
					this.__fire.call(this.__context, this);
					this.__fire_count++;
					if (this.__real_time && !this.__destroy_on_fire && !this.__once) {
						while ((this.__fire_count + 1) * this.__delay <= Time.now() - this.__start_time) {
							this.__fire.call(this.__context, this);
							this.__fire_count++;
						}
					}
				}
				if ((this.__end_time !== null && Time.now() + this.__delay > this.__end_time) ||
					(this.__fire_max !== null && this.__fire_max <= this.__fire_count))
					this.stop();
				if (this.__destroy_on_fire)
					this.weakDestroy();
			},
			
			stop: function () {
				if (!this.__started)
					return;
				if (this.__once)
					clearTimeout(this.__timer);
				else
					clearInterval(this.__timer);
				this.__started = false;
				if (this.__destroy_on_stop)
					this.weakDestroy();
			},
			
			start: function () {
				if (this.__started)
					return;
				var self = this;
				this.__start_time = Time.now();
				this.__fire_count = 0;
				if (this.__once)
					this.__timer = setTimeout(function () {
						self.fire();
					}, this.__delay);
				else
					this.__timer = setInterval(function () {
						self.fire();
					}, this.__delay);
				this.__started = true;
			},
			
			restart: function () {
				this.stop();
				this.start();
			}
			
			
		};
	});
});
