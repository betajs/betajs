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
					real_time: false
				}, options);
				this.__delay = options.delay;
				this.__destroy_on_fire = options.destroy_on_fire;
				this.__once = options.once;
				this.__fire = options.fire;
				this.__context = options.context;
				this.__started = false;
				this.__real_time = options.real_time;
				if (options.start)
					this.start();
			},
			
			destroy: function () {
				this.stop();
				inherited.destroy.call(this);
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
				if (this.__destroy_on_fire)
					this.destroy();
			},
			
			stop: function () {
				if (!this.__started)
					return;
				if (this.__once)
					clearTimeout(this.__timer);
				else
					clearInterval(this.__timer);
				this.__started = false;
			},
			
			start: function () {
				if (this.__started)
					return;
				var self = this;
				if (this.__real_time)
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
