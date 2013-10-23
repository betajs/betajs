BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.UniqueValidator", {
	
	constructor: function (key, error_string) {
		this._inherited(BetaJS.Modelling.Validators.UniqueValidator, "constructor");
		this.__key = key;
		this.__error_string = error_string ? error_string : "Key already present";
	},

	validate: function (value, context) {
		var query = {};
		query[this.__key] = value;
		var item = context.table().findBy(query);
		return (!item || (!context.isNew() && context.id() == item.id())) ? null : this.__error_string;
	}

});