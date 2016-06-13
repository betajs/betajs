var s = function (BetaJS) {
	var events = new BetaJS.Events.Events();
	events.on("test", function () {});
	return events;
};

var events = s(BetaJS);
var eventsOld = s(BetaJSOld);

var f = function (events) {
	events.trigger("test");
};

module.exports = {
	name : 'Events Trigger One Listener',
	tests : {
		'Old Events Trigger One Listener' : function () {
			f(eventsOld);
		},
		'New Events Trigger One Listener' : function() {
			f(events);
		}
	}
};
