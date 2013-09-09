BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.HasOneAssociation", {

	_yield: function (id) {
		var query = {};
		if (id)
			query[this._foreign_key] = id
		else if (this._primary_key) 
			query[this._foreign_key] = this._model.get(this._primary_key)
		else
			query[this._foreign_key] = this._model.id();
		var model = this._foreign_table.findBy(query);
		if (model)
			model.on("destroy", function () {
				this.invalidate();
			}, this);
		return model;
	},
	
	_change_id: function (new_id, old_id) {
		var object = this._yield(old_id);
		if (object) {
			object.set(this._foreign_key, new_id);
			object.save();
		}
	},

});