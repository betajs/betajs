Scoped.define("module:Scheduling.DefaultScheduler", [
    "module:Scheduling.AbstractScheduler",
    "module:Time",
    "module:Objs",
    "module:Timers.Timer"
], function(AbstractScheduler, Time, Objs, Timer, scoped) {
    return AbstractScheduler.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(options) {
                inherited.constructor.call(this);
                this._current = null;
                this._last = null;
                this._first = null;
                this._map = {};
                this._resources = 0;
                this._options = Objs.extend({
                    penaltyFactor: 0.5,
                    rewardFactor: 0.5,
                    defaultResources: 10,
                    defaultLimit: 10,
                    autoTimer: null
                }, options);
                if (this._options.autoTimer) {
                    this.auto_destroy(new Timer({
                        start: true,
                        delay: this._options.autoTimer,
                        context: this,
                        fire: this.run
                    }));
                }
            },

            _register: function(context, options) {
                var id = context.cid();
                if (!this._map[id]) {
                    options = options || {};
                    var entry = {
                        context: context,
                        resources: options.resources || this._options.defaultResources,
                        scheduled: [],
                        allocatedTime: 0,
                        usedTime: 0,
                        prev: this._last,
                        next: null
                    };
                    this._map[id] = entry;
                    this._last = entry;
                    if (!this._first)
                        this._first = entry;
                }
            },

            _unregister: function(ctx) {
                var id = context.cid();
                if (this._map[id]) {
                    var entry = this._map[id];
                    if (this._current === entry)
                        this._current = entry.next;
                    if (entry.prev)
                        entry.prev.next = entry.next;
                    else
                        this._first = entry.next;
                    if (entry.next)
                        entry.next.prev = entry.prev;
                    else
                        this._last = entry.prev;
                    if (entry.scheduled)
                        this._resources -= entry.resources;
                    delete this._map[id];
                }
            },

            _schedulable: function(context, callback, initialSteps) {
                var id = context.cid();
                var obj = this._map[id];
                if (obj) {
                    obj.scheduled.push({
                        callback: callback,
                        initialSteps: initialSteps,
                        totalTime: 0,
                        totalSteps: 0
                    });
                    if (obj.scheduled.length === 1)
                        this._resources += obj.resources;
                }
            },

            run: function(limit) {
                limit = limit || this._options.defaultLimit;
                var endTime = Time.perfNow() + limit;
                while (this._resources > 0 && this._first) {
                    var nowTime = Time.perfNow();
                    var timeLeft = endTime - nowTime;
                    if (timeLeft <= 0)
                        break;
                    var current = this._current || this._first;
                    if (current.scheduled.length > 0) {
                        var resources = current.resources;
                        if (current.allocatedTime > current.usedTime)
                            resources += current.usedTime / current.allocatedTime * this._options.rewardFactor;
                        if (current.allocatedTime < current.usedTime)
                            resources -= current.allocatedTime / current.usedTime * this._options.penaltyFactor;
                        var currentEndTime = Math.min(nowTime + limit * resources / this._resources, endTime);
                        do {
                            var deltaTime = currentEndTime - nowTime;
                            var head = current.scheduled.shift();
                            var steps = Math.max(1, head.totalSteps > 0 ? head.totalSteps / (head.totalTime || 1) * deltaTime : head.initialSteps);
                            var result = head.callback.call(current.context, steps);
                            if (result === false)
                                current.scheduled.unshift(head);
                            else if (current.scheduled.length === 0)
                                this._resources -= current.resources;
                            var nextTime = Time.perfNow();
                            current.allocatedTime += deltaTime;
                            current.usedTime += nextTime - nowTime;
                            nowTime = nextTime;
                        } while (nowTime < currentEndTime && current.scheduled.length > 0);
                    }
                    this._current = current.next;
                }
            }

        };
    });
});