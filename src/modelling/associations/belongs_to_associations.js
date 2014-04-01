BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.BelongsToAssociation", {
	
	_yield: function (callbacks) {
		var success = function (model, callbacks) {
			if (model)
				model.on("destroy", function () {
					this.invalidate();
				}, this);
			this.callback(callbacks, "success", model);
		};
		if (!this._primary_key)
			return this.then(this._foreign_table, this._foreign_table.findById, [this._model.get(this._foreign_key)], callbacks, success);
		var obj = {};
		obj[this._primary_key] = this._model.get(this._foreign_key);
		return this.then(this._foreign_table, this._foreign_table.findBy, [obj], callbacks, success);
	}
	
});