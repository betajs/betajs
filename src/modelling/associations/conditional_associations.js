BetaJS.Modelling.Associations.Association.extend("BetaJS.Modelling.Associations.ConditionalAssociation", {

	constructor: function (model, options) {
		this._inherited(BetaJS.Modelling.Associations.ConditionalAssociation, "constructor");
		this._model = model;
		this._options = options || {};
		this.__cache = null;
		if (options["delete_cascade"])
			model.on("remove", function () {
				this.__delete_cascade();
			}, this);
		if (!options["ignore_change_id"])
			model.on("change_id", function (new_id, old_id) {
				this._change_id(new_id, old_id);
			}, this);
	},
	
	_yield: function () {
		return this._model.assocs[this._options.conditional(this._model)];
	}

});