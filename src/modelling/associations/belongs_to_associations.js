BetaJS.Modelling.Associations.BelongsToAssociation = BetaJS.Modelling.Associations.Association.extend("BelongsToAssocation", {
	
	_yield: function () {
		return this._foreign_table.findById(this._model.get(this._foreign_key));
	}
	
});