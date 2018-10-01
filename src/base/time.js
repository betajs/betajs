Scoped.define("module:Time", [], function() {
    /**
     * Time Helper Functions
     * 
     * All time routines are based on UTC time.
     * The optional timezone parameter should be used as follows:
     *    - undefined or false: UTC
     *    - true: user's local time zone
     *    - int value: actual time zone bias in minutes
     *    
     * @module BetaJS.Time
     */
    return {

        __components: {
            "year": {
                "set": function(date, value) {
                    date.setUTCFullYear(value);
                },
                "get": function(date) {
                    return date.getUTCFullYear();
                }
            },
            "month": {
                "set": function(date, value) {
                    date.setUTCMonth(value);
                },
                "get": function(date) {
                    return date.getUTCMonth();
                }
            },
            "day": {
                "dependencies": {
                    "weekday": true
                },
                "set": function(date, value) {
                    date.setUTCDate(value + 1);
                },
                "get": function(date) {
                    return date.getUTCDate() - 1;
                },
                "milliseconds": 24 * 60 * 60 * 1000
            },
            "weekday": {
                "dependencies": {
                    "day": true,
                    "month": true,
                    "year": true
                },
                "set": function(date, value) {
                    date.setUTCDate(date.getUTCDate() + value - date.getUTCDay());
                },
                "get": function(date) {
                    return date.getUTCDay();
                }
            },
            "hour": {
                "set": function(date, value) {
                    date.setUTCHours(value);
                },
                "get": function(date) {
                    return date.getUTCHours();
                },
                "max": 23,
                "milliseconds": 60 * 60 * 1000
            },
            "minute": {
                "set": function(date, value) {
                    date.setUTCMinutes(value);
                },
                "get": function(date) {
                    return date.getUTCMinutes();
                },
                "max": 59,
                "milliseconds": 60 * 1000
            },
            "second": {
                "set": function(date, value) {
                    date.setUTCSeconds(value);
                },
                "get": function(date) {
                    return date.getUTCSeconds();
                },
                "max": 59,
                "milliseconds": 1000
            },
            "millisecond": {
                "set": function(date, value) {
                    date.setUTCMilliseconds(value);
                },
                "get": function(date) {
                    return date.getUTCMilliseconds();
                },
                "max": 999,
                "milliseconds": 1
            }
        },

        /**
         * Reads the current timezone offset.
         *
         * @return {int} timezone offset in minutes
         */
        getTimezoneOffset: function() {
            return this.__timezoneOffset === undefined ? (new Date()).getTimezoneOffset() : this.__timezoneOffset;
        },

        /**
         * Overwrites the current timezone offset.
         *
         * @param {int} timezoneOffset timezone offset in minutes (undefined to disable overwrite)
         */
        setTimezoneOffset: function(timezoneOffset) {
            this.__timezoneOffset = timezoneOffset;
        },

        /**
         * Computes the timezone bias in milliseconds from UTC
         * 
         * @param {int} timezone bias in minutes; can be true to use current time zone; can be undefined to use UTC
         * 
         * @return {int} timezone bias in milliseconds
         */
        timezoneBias: function(timezone) {
            if (timezone === true)
                timezone = this.getTimezoneOffset();
            if (typeof timezone == "undefined" || timezone === null || timezone === false)
                timezone = 0;
            return timezone * 60 * 1000;
        },

        /**
         * Given a time in milliseconds, compute a Date object.
         * 
         * @param {int} t time in milliseconds
         * @param {int} timezone timezone (optional)
         * 
         * @return {object} Date object
         */
        timeToDate: function(t, timezone) {
            return new Date(t + this.timezoneBias(timezone));
        },

        /**
         * Given a time as a Date object, return UTC time in milliseconds.
         * 
         * @param {object} d time as Date object
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} UTC time in milliseconds
         */
        dateToTime: function(d, timezone) {
            return d.getTime() - this.timezoneBias(timezone);
        },

        /**
         * Given a time in milliseconds, compute a timezone-based Date object.
         * 
         * @param {int} t time in milliseconds
         * @param {int} timezone timezone (optional)
         * 
         * @return {object} timezone-based Date object
         */
        timeToTimezoneBasedDate: function(t, timezone) {
            return new Date(t - this.timezoneBias(timezone));
        },

        /**
         * Given a time as a timezone-based Date object, return UTC time in milliseconds.
         * 
         * @param {object} d time as a timezone-based Date object
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} UTC time in milliseconds
         */
        timezoneBasedDateToTime: function(d, timezone) {
            return d.getTime() + this.timezoneBias(timezone);
        },

        /**
         * Decode time into its time components
         *
         * @param {int} t time in milliseconds
         * @param {int} timezone timezone (optional)
         * 
         * @return {object} decoded time component
         */
        decodeTime: function(t, timezone) {
            var d = this.timeToTimezoneBasedDate(t || this.now(), timezone);
            var result = {};
            for (var key in this.__components)
                result[key] = this.__components[key].get(d);
            return result;
        },

        /**
         * Encode time from components to UTC time
         * 
         * @param {object} data component data
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} encoded UTC time
         */
        encodeTime: function(data, timezone) {
            return this.updateTime(this.now(), data, timezone);
        },

        /**
         * Encode time period data from components to milliseconds
         * 
         * @param {object} data component data
         * 
         * @return {int} encoded milliseconds
         */
        encodePeriod: function(data) {
            return this.incrementTime(0, data);
        },

        /**
         * Updates a given time with respect to provided component data
         * 
         * @param {int} t UTC time
         * @param {object} data component data
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} updated UTC time
         */
        updateTime: function(t, data, timezone) {
            var d = this.timeToTimezoneBasedDate(t, timezone);
            for (var key in data)
                this.__components[key].set(d, data[key]);
            return this.timezoneBasedDateToTime(d, timezone);
        },

        /**
         * Returns the current time in milliseconds
         * 
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} current time
         */
        now: function(timezone) {
            return this.dateToTime(new Date(), timezone);
        },

        /**
         * Returns the earliest time in the future in milliseconds that has not been queried before.
         *
         * @param {int} delta delta (optional, default 1)
         * @param {int} timezone timezone (optional)
         *
         * @return {int} earliest time in the future
         */
        uniqueAtLeastNow: function(delta, timezone) {
            var candidate = this.now(timezone);
            if (this.__unique_at_least_now && this.__unique_at_least_now >= candidate)
                candidate = this.__unique_at_least_now + (delta || 1);
            this.__unique_at_least_now = candidate;
            return candidate;
        },

        /**
         * Returns the performance time in millseconds
         * 
         * @return {float} performance time
         */
        perfNow: function() {
            return typeof performance === "undefined" ? (new Date()).getTime() : performance.now();
        },

        /**
         * Increments a given time with respect to provided component data
         * 
         * @param {int} t UTC time
         * @param {object} data component data
         * 
         * @return {int} incremented UTC time
         */
        incrementTime: function(t, data) {
            var d = this.timeToDate(t);
            for (var key in data)
                this.__components[key].set(d, this.__components[key].get(d) + data[key]);
            return this.dateToTime(d);
        },

        /**
         * Floors a given time with respect to a component key and all smaller components.
         * 
         * @param {int} t time
         * @param {string} key component key
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} floored time
         */
        floorTime: function(t, key, timezone) {
            var d = this.timeToTimezoneBasedDate(t, timezone);
            var found = false;
            for (var comp in this.__components) {
                var c = this.__components[comp];
                found = found || comp == key;
                if (found && (!c.dependencies || !c.dependencies[key]))
                    c.set(d, 0);
            }
            return this.timezoneBasedDateToTime(d, timezone);
        },

        /**
         * Computes how long a specific time is ago from now.
         * 
         * @param {int} t time
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} milliseconds ago
         */
        ago: function(t, timezone) {
            return this.now(timezone) - t;
        },

        /**
         * Returns the multiplicity of a time component given a time.
         * 
         * @param {int} t time
         * @param {string} key component key
         * @param {function} rounding function (default is floor)
         * 
         * @return {int} multiplicity of time
         */
        timeComponent: function(t, key, round) {
            return Math[round || "floor"](t / this.__components[key].milliseconds);
        },

        /**
         * Returns the value of a time component given a time.
         * 
         * @param {int} t time
         * @param {string} key component key
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} value of time
         */
        timeComponentGet: function(t, key, timezone) {
            return this.__components[key].get(this.timeToTimezoneBasedDate(t, timezone));
        },

        /**
         * Returns the remainder of a time component given a time.
         * 
         * @param {int} t time
         * @param {string} key component key
         * @param {function} rounding function (default is floor)
         * 
         * @return {int} remainder of time
         */
        timeModulo: function(t, key, round) {
            return this.timeComponent(t, key, round) % (this.__components[key].max + 1);
        }

    };

});