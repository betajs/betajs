var s = function (BetaJS) {
	return new BetaJS.Events.Events();
};

var events = s(BetaJS);
var eventsOld = s(BetaJSOld);

var f = function (events) {
	events.trigger("test");
};

module.exports = {
	name : 'Events Trigger No Listener',
	tests : {
		'Old Events Trigger No Listener' : function () {
			f(eventsOld);
		},
		'New Events Trigger No Listener' : function() {
			f(events);
		}
	}
};
