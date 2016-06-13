var acc = 0;

module.exports = {
	name : 'Maps',
	tests : {
		'Prototype' : function() {
			var map = {};
			for (var i = 1; i < 1000; ++i)
				map["id" + (i + acc++)] = i;
			map = null;
		},
		'Object' : function() {
			var map = Object.create(null);
			for (var i = 1; i < 1000; ++i)
				map["id" + (i + acc++)] = i;
			map = null;
		},
		'Map' : function() {
			var map = new Map();
			for (var i = 1; i < 1000; ++i)
				map.set("id" + (i + acc++), i);
			map = null;
		},
		'TreeMap' : function() {
			var map = BetaJS.Structures.TreeMap.empty();
			for (var i = 1; i < 1000; ++i)
				map = BetaJS.Structures.TreeMap.add("id" + (i + acc++), i, map);
			map = null;
		}
	}
};
