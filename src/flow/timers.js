Scoped.define("module:Timers.Timer", [
    "module:Class",
    "module:Objs",
    "module:Time"
], function(Class, Objs, Time, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Timer Class
         * 
         * @class BetaJS.Timers.Timer
         */
        return {

            /**
             * Create a new timer instance.
             * 
             * @param {object} options, including
             *   int delay (mandatory): number of milliseconds until it fires
             *   bool once (optional, default false): should it fire infinitely often
             *   func fire (optional): will be fired
             *   object context (optional): for fire
             *   bool start (optional, default true): should it start immediately
             *   bool real_time (default false)
             *   bool immediate (optional, default false): zero time until first fire
             *   int duration (optional, default null)
             *   int fire_max (optional, default null)
             * 
             */
            constructor: function(options) {
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
                    fire_max: null,
                    immediate: false
                }, options);
                this.__immediate = options.immediate;
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

            /**
             * @override
             */
            destroy: function() {
                this.stop();
                inherited.destroy.call(this);
            },

            /**
             * Returns the number of times the timer has fired.
             * 
             * @return {int} fire count
             */
            fire_count: function() {
                return this.__fire_count;
            },

            /**
             * Returns the current duration of timer.
             * 
             * @return {int} duration in milliseconds
             */
            duration: function() {
                return Time.now() - this.__start_time;
            },

            /**
             * Fired when the timer fires.
             */
            fire: function() {
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

            /**
             * Stops the timer.
             * 
             * @return {object}
             */
            stop: function() {
                if (!this.__started)
                    return this;
                if (this.__once)
                    clearTimeout(this.__timer);
                else
                    clearInterval(this.__timer);
                this.__started = false;
                if (this.__destroy_on_stop)
                    this.weakDestroy();
                return this;
            },

            /**
             * Starts the timer.
             * 
             * @return {object} this
             */
            start: function() {
                if (this.__started)
                    return this;
                var self = this;
                this.__start_time = Time.now();
                this.__fire_count = 0;
                if (this.__once)
                    this.__timer = setTimeout(function() {
                        self.fire();
                    }, this.__delay);
                else
                    this.__timer = setInterval(function() {
                        self.fire();
                    }, this.__delay);
                this.__started = true;
                if (this.__immediate)
                    this.fire();
                return this;
            },

            /**
             * Restarts the timer.
             * 
             * @return {object} this
             */
            restart: function() {
                this.stop();
                this.start();
                return this;
            }

        };
    });
});