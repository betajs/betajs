BetaJS.Modelling.Associations.HasManyAssociation.extend("BetaJS.Modelling.Associations.HasManyViaAssociation", {

	constructor: function (model, intermediate_table, intermediate_key, foreign_table, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.HasManyViaAssociation, "constructor", model, foreign_table, foreign_key, options);
		this._intermediate_table = intermediate_table;
		this._intermediate_key = intermediate_key;
	},

	findBy: function (query) {
		var intermediate_query = {};
		intermediate_query[this._intermediate_key] = this._id();
		var intermediate = this._intermediate_table.findBy(intermediate_query);
		if (!intermediate)
			return null;
		query[this._foreign_table.primary_key()] = intermediate.get(this._foreign_key);
		return this._foreign_table.findBy(query);
	},

	allBy: function (query) {
		var intermediate_query = {};
		intermediate_query[this._intermediate_key] = this._id();
		var intermediates = this._intermediate_table.allBy(intermediate_query);
		var results = [];
		while (intermediates.hasNext()) {
			var intermediate = intermediates.next();
			query[this._foreign_table.primary_key()] = intermediate.get(this._foreign_key);
			var foreigns = this._foreign_table.allBy(query);
			while (foreigns.hasNext())
				results.push(foreigns.next());
		}
		return results;
	},

});