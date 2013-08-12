BetaJS.Modelling.Associations.HasOneAssociation = BetaJS.Modelling.Associations.TableAssociation.extend("HasOneAssocation", {

	_yield: function (id) {
		var query = {};
		query[this._foreign_key] = id || this._model.id();
		return this._foreign_table.findBy(query);
	},
	
	_change_id: function (new_id, old_id) {
		var object = this._yield(old_id);
		if (object) {
			object.set(this._foreign_key, new_id);
			object.save();
		}
	},

});