BetaJS.Modelling.Validators.PresentValidator = BetaJS.Modelling.Validators.Validator.extend("PresentValidator", {
	
	constructor: function (error_string) {
		this._inherited(BetaJS.Modelling.Validators.PresentValidator, "constructor");
		this.__error_string = error_string ? error_string : "Field is required";
	},

	validate: function (value, context) {
		return BetaJS.Types.is_null(value) ? this.__error_string : null;
	}

});