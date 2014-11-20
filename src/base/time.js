BetaJS.Time = {
	
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

	now: function () {
		var d = new Date();
		return d.getTime();
	},
	
	ago: function (t) {
		return this.now() - t;
	},
	
	floor_day: function (t) {
		var d = new Date(t);
		d.setMilliseconds(0);
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		return d.getTime();
	},
	
	floor_week: function (t) {
		var d = new Date(t);
		d.setDate(d.getDate() - d.getDay());
		d.setMilliseconds(0);
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		return d.getTime();
	},
	
	days_ago: function (t) {
		return this.days(this.ago(t));
	},
	
	inc_day: function (t, inc) {
		inc = typeof inc == 'undefined' ? 1 : inc;
		var d = new Date(t);
		d.setDate(d.getDate() + inc);
		return d.getTime();
	},
	
	inc_week: function (t, inc) {
		return this.inc_day(t, (typeof inc == 'undefined' ? 1 : inc) * 7);
	},
	
	inc_utc_day: function (t, inc) {
		return t + (inc || 1) * 24 * 60 * 60 * 1000;
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
