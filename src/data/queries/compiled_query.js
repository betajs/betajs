BetaJS.Queries.CompiledQuery = BetaJS.Class.extend("CompiledQuery", {
	
	constructor: function (query) {
		this.__query = query;
		this.__dependencies = BetaJS.Query.dependencies(query);
		this.__compiled = BetaJS.Query.compile(query);
	},
	
	query: function () {
		return this.__query;
	},
	
	dependencies: function () {
		return this.__dependencies;
	},
	
	compiled: function () {
		return this.__compiled;
	},
	
	evaluate: function (object) {
		return this.__compiled(object);
	}
	
});
