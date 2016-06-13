var s = function (BetaJS) {
	var events = new BetaJS.Events.Events();
	return events;
};

var events = s(BetaJS);
var eventsOld = s(BetaJSOld);

var func = function () {};

var f = function (events) {
	events.on("test", func);
	events.off("test", func);
};

module.exports = {
	name : 'Events On Off One No Context',
	tests : {
		'Old Events On Off One No Context' : function () {
			f(eventsOld);
		},
		'New Events On Off One No Context' : function() {
			f(events);
		}
	}
};
