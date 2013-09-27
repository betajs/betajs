BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.BelongsToAssociation", {
	
	_yield: function () {
		var model = null;
		if (this._primary_key) {
			var obj = {};
			obj[this._primary_key] = this._model.get(this._foreign_key);
			model = this._foreign_table.findBy(obj);
		}
		else
			model = this._foreign_table.findById(this._model.get(this._foreign_key));
		if (model)
			model.on("destroy", function () {
				this.invalidate();
			}, this);
		return model;
	}
	
});