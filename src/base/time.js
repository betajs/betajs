Scoped.define("module:Time", ["module:Locales"], function (Locales) {
	return {
			
		/*
		 * All time routines are based on UTC time.
		 * The optional timezone parameter should be used as follows:
		 *    - undefined or false: UTC
		 *    - true: user's local time zone
		 *    - int value: actual time zone bias in minutes
		 */
			
		
		timezoneBias: function (timezone) {
			if (timezone === true)
				timezone = (new Date()).getTimezoneOffset();
			if (typeof timezone == "undefined" || timezone === null || timezone === false)
				timezone = 0;
			return timezone * 60 * 1000;
		},
			
		timeToDate: function (t, timezone) {
			return new Date(t + this.timezoneBias(timezone));
		},
		
		dateToTime: function (d, timezone) {
			return d.getTime() - this.timezoneBias(timezone);
		},
		
		timeToTimezoneBasedDate: function (t, timezone) {
			return new Date(t - this.timezoneBias(timezone));
		},
		
		timezoneBasedDateToTime: function (d, timezone) {
			return d.getTime() + this.timezoneBias(timezone);
		},
	
		__components: {
			"year": {
				"set": function (date, value) { date.setUTCFullYear(value); },
				"get": function (date) { return date.getUTCFullYear(); }
			},
			"month": {
				"set": function (date, value) { date.setUTCMonth(value); },
				"get": function (date) { return date.getUTCMonth(); }
			},
			"day": {
				"dependencies": {"weekday": true},
				"set": function (date, value) { date.setUTCDate(value + 1); },
				"get": function (date) { return date.getUTCDate() - 1; },
				"milliseconds": 24 * 60 * 60 * 1000
			},
			"weekday": {
				"dependencies": {"day": true, "month": true, "year": true},
				"set": function (date, value) { date.setUTCDate(date.getUTCDate() + value - date.getUTCDay()); },
				"get": function (date) { return date.getUTCDay(); }
			},
			"hour": {
				"set": function (date, value) { date.setUTCHours(value); },
				"get": function (date) { return date.getUTCHours(); },
				"max": 23,
				"milliseconds": 60 * 60 * 1000
			},
			"minute": {
				"set": function (date, value) { date.setUTCMinutes(value); },
				"get": function (date) { return date.getUTCMinutes(); },
				"max": 59,
				"milliseconds": 60 * 1000
			},
			"second": {
				"set": function (date, value) { date.setUTCSeconds(value); },
				"get": function (date) { return date.getUTCSeconds(); },
				"max": 59,
				"milliseconds": 1000
			},
			"millisecond": {
				"set": function (date, value) { date.setUTCMilliseconds(value); },
				"get": function (date) { return date.getUTCMilliseconds(); },
				"max": 999,
				"milliseconds": 1
			}
		},
		
		decodeTime: function (t, timezone) {
			var d = this.timeToTimezoneBasedDate(t || this.now(), timezone);
			var result = {};
			for (var key in this.__components)
				result[key] = this.__components[key].get(d);
			return result;
		},
	
		encodeTime: function (data, timezone) {
			return this.updateTime(this.now(), data, timezone);
		},
		
		encodePeriod: function (data) {
			return this.incrementTime(0, data);
		},
		
		updateTime: function (t, data, timezone) {
			var d = this.timeToTimezoneBasedDate(t, timezone);
			for (var key in data)
				this.__components[key].set(d, data[key]);
			return this.timezoneBasedDateToTime(d, timezone);
		},
		
		now: function (timezone) {
			return this.dateToTime(new Date(), timezone);
		},
		
		incrementTime: function (t, data) {
			var d = this.timeToDate(t);
			for (var key in data) 
				this.__components[key].set(d, this.__components[key].get(d) + data[key]);
			return this.dateToTime(d);
		},
		
		floorTime: function (t, key, timezone) {
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
		
		ago: function (t, timezone) {
			return this.now(timezone) - t;
		},
		
		timeComponent: function (t, key, round) {
			return Math[round || "floor"](t / this.__components[key].milliseconds);
		},
		
		timeModulo: function (t, key, round) {
			return this.timeComponent(t, key, round) % (this.__components[key].max + 1);
		},
		
		formatTimePeriod: function (t, options) {
			options = options || {};
			var components = options.components || ["day", "hour", "minute", "second"];
			var component = "";
			var timeComponent = 0;
			for (var i = 0; i < components.length; ++i) {
				component = components[i];
				timeComponent = this.timeComponent(t, component, options.round || "round");
				if (timeComponent)
					break;
			}
			return timeComponent + " " + Locales.get(component + (timeComponent == 1 ? "" : "s"));
		},
		
		formatTime: function(t, s) {
			var components = ["hour", "minute", "second"];
			s = s || "hhh:mm:ss";
			var replacers = {};
			for (var i = 0; i < components.length; ++i) {
				var c = components[i].charAt(0);
				replacers[c + c + c] = this.timeComponent(t, components[i], "floor");
				var temp = this.timeModulo(t, components[i], "floor");
				replacers[c + c] = temp < 10 ? "0" + temp : temp; 
				replacers[c] = temp;
			}
			for (var key in replacers)
				s = s.replace(key, replacers[key]);
			return s;
		},
		
		monthString: function (month) {
			var d = new Date();
			d.setMonth(month);
			return d.toDateString().substring(4,7);
		}
		
	};

});
