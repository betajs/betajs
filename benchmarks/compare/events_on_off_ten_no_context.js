var s = function (BetaJS) {
	var events = new BetaJS.Events.Events();
	return events;
};

var events = s(BetaJS);
var eventsOld = s(BetaJSOld);

var func = [function () {},function () {},function () {},function () {},function () {},function () {},function () {},function () {},function () {},function () {}];

var f = function (events) {
	for (var i = 0; i < func.length; ++i)
		events.on("test", func[i]);
	for (i = 0; i < func.length; ++i)
		events.off("test", func[i]);
};

module.exports = {
	name : 'Events On Off Ten No Context',
	tests : {
		'Old Events On Off Ten No Context' : function () {
			f(eventsOld);
		},
		'New Events On Off Ten No Context' : function() {
			f(events);
		}
	}
};
