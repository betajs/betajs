BetaJS.Time = {
		
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
			"get": function (date) { return date.getUTCDate() - 1; }
		},
		"weekday": {
			"dependencies": {"day": true, "month": true, "year": true},
			"set": function (date, value) { date.setUTCDate(date.getUTCDate() + value - date.getUTCDay()); },
			"get": function (date) { return date.getUTCDay(); }
		},
		"hour": {
			"set": function (date, value) { date.setUTCHours(value); },
			"get": function (date) { return date.getUTCHours(); }
		},
		"minute": {
			"set": function (date, value) { date.setUTCMinutes(value); },
			"get": function (date) { return date.getUTCMinutes(); }
		},
		"second": {
			"set": function (date, value) { date.setUTCSeconds(value); },
			"get": function (date) { return date.getUTCSeconds(); }
		},
		"millisecond": {
			"set": function (date, value) { date.setUTCMilliseconds(value); },
			"get": function (date) { return date.getUTCMilliseconds(); }
		}
	},
	
	decodeTime: function (t, timezone) {
		var d = this.timeToTimezoneBasedDate(t, timezone);
		var result = {};
		for (var key in this.__components)
			result[key] = this.__components[key].get(d);
		return result;
	},

	encodeTime: function (data, timezone) {
		return this.updateTime(this.now(), data, timezone);
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
	
	
	/* Legacy Code; please replace over time (no pun intended!) */
	
	make: function (data) {
		var t = 0;
		var multipliers = {
			hours: 60,
			minutes: 60,
			seconds: 60,
			milliseconds: 1000
		};
		for (var key in multipliers) {
			t *= multipliers[key];
			if (key in data)
				t += data[key];
		}
		return t;
	},
	
	seconds: function (t) {
		return Math.floor(t / 1000) % 60;
	},
	
	minutes: function (t) {
		return Math.floor(t / 60 / 1000) % 60;
	},

	hours: function (t) {
		return Math.floor(t / 60 / 60 / 1000) % 24;
	},

	days: function (t) {
		return Math.floor(t / 24 / 60 / 60 / 1000);
	},

	days_ago: function (t) {
		return this.days(this.ago(t));
	},
	
	format_time: function(t, s) {
		var seconds = this.seconds(t);
		var minutes = this.minutes(t);
		var hours = this.hours(t);
		var replacers = {
			"hh": hours < 10 ? "0" + hours : hours, 
			"h": hours, 
			"mm": minutes < 10 ? "0" + minutes : minutes, 
			"m": minutes, 
			"ss": seconds < 10 ? "0" + seconds : seconds, 
			"s": seconds
		};
		for (var key in replacers)
			s = s.replace(key, replacers[key]);
		return s;
	},
	
	format_ago: function (t) {
		if (this.days_ago(t) > 1)
			return this.format(t, {time: false});
		else
			return this.format_period(Math.max(this.ago(t), 0)) + " ago";
	},
	
	format_period: function (t) {
		t = Math.round(t / 1000);
		if (t < 60)
			return t + " " + BetaJS.Locales.get(t == 1 ? "second" : "seconds");
		t = Math.round(t / 60);
		if (t < 60)
			return t + " " + BetaJS.Locales.get(t == 1 ? "minute" : "minutes");
		t = Math.round(t / 60);
		if (t < 24)
			return t + " " + BetaJS.Locales.get(t == 1 ? "hour" : "hours");
		t = Math.round(t / 24);
		return t + " " + BetaJS.Locales.get(t == 1 ? "day" : "days");
	},
	
	format: function (t, options) {
		options = BetaJS.Objs.extend({
			time: true,
			date: true,
			locale: true
		}, options || {});
		var d = new Date(t);
		if (options.locale) {
			if (options.date) {
				if (options.time)
					return d.toLocaleString();
				else
					return d.toLocaleDateString();
			} else
				return d.toLocaleTimeString();
		} else {
			if (options.date) {
				if (options.time) 
					return d.toString();
				else
					return d.toDateString();
			} else
				return d.toTimeString();
		}
	}
	
};
