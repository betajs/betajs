BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.BelongsToAssociation", {
	
	_yield: function () {
		if (this._primary_key) {
			var obj = {};
			obj[this._primary_key] = this._model.get(this._foreign_key);
			return this._foreign_table.findBy(obj);
		}
		else
			return this._foreign_table.findById(this._model.get(this._foreign_key));
	},
	
});