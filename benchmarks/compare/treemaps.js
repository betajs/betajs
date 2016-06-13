var acc = 0;

var f = function (BetaJS) {
	var map = BetaJS.Structures.TreeMap.empty();
	for (var i = 1; i < 1000; ++i)
		map = BetaJS.Structures.TreeMap.add("id" + (i + acc++), i, map);
	map = null;
};

module.exports = {
	name : 'TreeMaps',
	tests : {
		'Old TreeMap' : function () {
			f(BetaJSOld);
		},
		'New TreeMap' : function() {
			f(BetaJS);
		}
	}
};
