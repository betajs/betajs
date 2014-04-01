BetaJS.Modelling.Associations.Association.extend("BetaJS.Modelling.Associations.PolymorphicHasOneAssociation", {

	constructor: function (model, foreign_table_key, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.PolymorphicHasOneAssociation, "constructor", model, options);
		this._foreign_table_key = foreign_table_key;
		this._foreign_key = foreign_key;
		if (options["primary_key"])
			this._primary_key = options.primary_key;
	},

	_yield: function (callbacks, id) {
		var query = {};
		if (id)
			query[this._foreign_key] = id;
		else if (this._primary_key) 
			query[this._foreign_key] = this._model.get(this._primary_key);
		else
			query[this._foreign_key] = this._model.id();
		var foreign_table = BetaJS.Scopes.resolve(this._model.get(this._foreign_table_key));
		return this.then(foreign_table, foreign_table.findBy, [query], callbacks, function (model, callbacks) {
			if (model)
				model.on("destroy", function () {
					this.invalidate();
				}, this);
			this.callback(callbacks, "success", model);
		});
	},
	
	_change_id: function (new_id, old_id) {
		this._yield({
			success: function (object) {
				if (object) {
					object.set(this._foreign_key, new_id);
					object.save();
				}
			}
		}, old_id);
	}

});