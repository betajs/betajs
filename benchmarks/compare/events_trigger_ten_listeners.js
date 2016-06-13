var s = function (BetaJS) {
	var events = new BetaJS.Events.Events();
	for (var i = 0; i < 10; ++i)
		events.on("test", function () {});
	return events;
};

var events = s(BetaJS);
var eventsOld = s(BetaJSOld);

var f = function (events) {
	events.trigger("test");
};

module.exports = {
	name : 'Events Trigger Ten Listeners',
	tests : {
		'Old Events Trigger Ten Listeners' : function () {
			f(eventsOld);
		},
		'New Events Trigger Ten Listeners' : function() {
			f(events);
		}
	}
};
