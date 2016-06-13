var s = function (BetaJS) {
	var events = new BetaJS.Events.Events();
	return events;
};

var events = s(BetaJS);
var eventsOld = s(BetaJSOld);

var func = function () {};
var ctx = {};

var f = function (events) {
	events.on("test", func, ctx);
	events.off("test", null, ctx);
};

module.exports = {
	name : 'Events On Off One With Context',
	tests : {
		'Old Events On Off One With Context' : function () {
			f(eventsOld);
		},
		'New Events On Off One With Context' : function() {
			f(events);
		}
	}
};
