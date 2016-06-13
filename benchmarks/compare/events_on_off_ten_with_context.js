var s = function (BetaJS) {
	var events = new BetaJS.Events.Events();
	return events;
};

var events = s(BetaJS);
var eventsOld = s(BetaJSOld);

var func = function () {};
var ctx = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

var f = function (events) {
	for (var i = 0; i < ctx.length; ++i)
		events.on("test", func, ctx[i]);
	for (i = 0; i < ctx.length; ++i)
		events.off("test", null, ctx[i]);
};

module.exports = {
	name : 'Events On Off Ten With Context',
	tests : {
		'Old Events On Off Ten With Context' : function () {
			f(eventsOld);
		},
		'New Events On Off Ten With Context' : function() {
			f(events);
		}
	}
};
