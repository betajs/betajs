BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.BelongsToAssociation", {
	
	_yield: function () {
		return this._foreign_table.findById(this._model.get(this._foreign_key));
	},
	
});