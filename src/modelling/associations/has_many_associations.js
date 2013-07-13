BetaJS.Modelling.Associations.HasManyAssociation = BetaJS.Modelling.Associations.Association.extend("HasManyAssocation", {

	_yield: function () {
		var query = {};
		query[this._foreign_key] = this._model.get("id");
		return this._foreign_table.allBy(query);
	},

	yield: function () {
		if (!this._options["cached"])
			return this._yield();
		if (!this.__cache)
			this.__cache = this._yield().asArray();
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
	},

});