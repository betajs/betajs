BetaJS.Modelling.Associations.HasOneAssociation = BetaJS.Modelling.Associations.Association.extend("HasOneAssocation", {

	_yield: function () {
		var query = {};
		query[this._foreign_key] = this._model.id();
		return this._foreign_table.findBy(query);
	}

});