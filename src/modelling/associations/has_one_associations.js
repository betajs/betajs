BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.HasOneAssociation", {

	_yield: function (callbacks, id) {
		var query = {};
		if (id)
			query[this._foreign_key] = id;
		else if (this._primary_key) 
			query[this._foreign_key] = this._model.get(this._primary_key);
		else
			query[this._foreign_key] = this._model.id();
		return this.then(this._foreign_table, this._foreign_table.findBy, [query], callbacks, function (model, callbacks) {
			if (model)
				model.on("destroy", function () {
					this.invalidate();
				}, this);
			this.callback(callbacks, "success", model);
		});
	},
	
	_change_id: function (new_id, old_id) {
		this._yield({
			context: this,
			success: function (object) {
				if (object) {
					object.set(this._foreign_key, new_id);
					object.save();
				}
			}
		}, old_id);
	}

});