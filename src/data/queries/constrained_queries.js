BetaJS.Queries.Constrained = {
	
	make: function (query, options) {
		return {
			query: query,
			options: options || {}
		};
	},
	
	format: function (instance) {
		var query = instance.query;
		instance.query = BetaJS.Queries.format(query);
		var result = JSON.stringify(instance);
		instance.query = query;
		return result;
	},
	
	emulate: function (constrained_query, query_capabilities, query_function, query_context) {
		var query = constrained_query.query;
		var options = constrained_query.options;
		var execute_query = {};
		var execute_options = {};
		if ("sort" in options && "sort" in query_capabilities)
			execute_options.sort = options.sort;
		if ("query" in query_capabilities || BetaJS.Types.is_empty(query)) {
			execute_query = query;
			if (!("sort" in options) || "sort" in query_capabilities) {
				if ("skip" in options && "skip" in query_capabilities)
					execute_options.skip = options.skip;
				if ("limit" in options && "limit" in query_capabilities)
					execute_options.limit = options.limit;
			}
		}
		var raw = query_function.apply(query_context || this, [execute_query, execute_options]);
		var iter = raw;
		if (raw == null)
			iter = new BetaJS.Iterators.ArrayIterator([])
		else if (BetaJS.Types.is_array(raw))
			iter = new BetaJS.Iterators.ArrayIterator(raw);		
		if (!("query" in query_capabilities || BetaJS.Types.is_empty(query)))
			iter = new BetaJS.Iterators.FilteredIterator(iter, function(row) {
				return BetaJS.Queries.evaluate(query, row);
			});
		if ("sort" in options && !("sort" in execute_options))
			iter = new BetaJS.Iterators.SortedIterator(iter, BetaJS.Comparators.byObject(options.sort));
		if ("skip" in options && !("skip" in execute_options))
			iter = new BetaJS.Iterators.SkipIterator(iter, options["skip"]);
		if ("limit" in options && !("limit" in execute_options))
			iter = new BetaJS.Iterators.LimitIterator(iter, options["limit"]);
		return iter;
	}
	
	

}; 
