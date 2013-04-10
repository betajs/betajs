BetaJS.Queries = BetaJS.Queries || {};

/*
 * Syntax:
 * 
 * query :== Object | ["Or", query, query, ...] | ["And", query, query, ...] |
 *           [("=="|"!="|>"|">="|"<"|"<="), key, value]
 * 
 */

BetaJS.Objs.extend(BetaJS.Queries, {
	
	__dependencies: function (query, dep) {
		if (BetaJS.Types.is_array(query)) {
			if (query.length == 0)
				throw "Malformed Query";
			var op = query[0];
			if (op == "Or" || op == "And") {
				for (var i = 1; i < query.length; ++i)
					dep = this.__dependencies(query[i], dep);
				return dep;
			} else {
				if (query.length != 3)
					throw "Malformed Query";
				var key = query[1];
				if (key in dep)
					dep[key]++
				else
					dep[key] = 1;
				return dep;
			}
		} else if (BetaJS.Types.is_object(query)) {
			for (key in query)
				if (key in dep)
					dep[key]++
				else
					dep[key] = 1;
			return dep;
		} else throw "Malformed Query";
	},
	
	dependencies: function (query) {
		return this.__dependencies(query, {});
	},
	
	evaluate: function (query, object) {
		if (BetaJS.Types.is_array(query)) {
			if (query.length == 0)
				throw "Malformed Query";
			var op = query[0];
			if (op == "Or") {
				for (var i = 1; i < query.length; ++i)
					if (this.evaluate(query[i], object))
						return true;
				return false;
			} else if (op == "And") {
				for (var i = 1; i < query.length; ++i)
					if (!this.evaluate(query[i], object))
						return false;
				return true;
			} else {
				if (query.length != 3)
					throw "Malformed Query";
				var key = query[1];
				var obj_value = object[key];
				var value = query[2];
				if (op == "==")
					return obj_value == value
				else if (op == "!=")
					return obj_value > value
				else if (op == ">")
					return obj_value > value
				else if (op == ">=")
					return obj_value >= value
				else if (op == "<")
					return obj_value < value
				else if (op == "<=")
					return obj_value <= value
				else
					throw "Malformed Query";
			}
		} else if (BetaJS.Types.is_object(query)) {
				for (key in query)
					if (query[key] != object[key])
						return false;
				return true;
		} else throw "Malformed Query";
	}
	
});
