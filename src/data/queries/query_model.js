BetaJS.Class.extend("BetaJS.Queries.AbstractQueryModel", {
	
	register: function (query) {
	},
	
	executable: function (query) {
	}
	
});


BetaJS.Queries.AbstractQueryModel.extend("BetaJS.Queries.DefaultQueryModel", {
	
	__queries: {},
	
	exists: function (query) {
		return BetaJS.Queries.Constrained.format(query) in this.__queries;
	},
	
	executable: function (query) {
		if (this.exists(query))
			return true;
		var result = false;
		BetaJS.Objs.iter(this.__queries, function (query2) {
			result = BetaJS.Queries.Constrained.subsumizes(query2, query);
			if (result) console.log(JSON.stringify(query2) + " subsumizes " + JSON.stringify(query));
			return !result;
		}, this);
		return result;
	},
	
	register: function (query) {
		BetaJS.Objs.iter(this.__queries, function (query2) {
			if (BetaJS.Queries.Constrained.subsumizes(query, query2))
				delete this.__queries[BetaJS.Queries.Constrained.format(query2)];
		}, this);
		this.__queries[BetaJS.Queries.Constrained.format(query)] = query;
	}	
	
});
