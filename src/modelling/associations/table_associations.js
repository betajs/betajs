BetaJS.Modelling.Associations.TableAssociation = BetaJS.Modelling.Associations.Association.extend("TableAssociation", {

	constructor: function (model, foreign_table, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.TableAssociation, "constructor", model, options);
		this._foreign_table = foreign_table;
		this._foreign_key = foreign_key;
		// TODO: Active Query would be better
		if (this._options["cached"]) 
			this._foreign_table.on("create update remove", function () {
				this.invalidate();
			}, this);
	},
	
	destroy: function () {
		this._foreign_table.off(null, null, this);
		this._inherited(BetaJS.Modelling.Associations.TableAssociation, "destroy");
	}
	
});