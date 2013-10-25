BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.PresentValidator", {
	
	constructor: function (error_string) {
		this._inherited(BetaJS.Modelling.Validators.PresentValidator, "constructor");
		this.__error_string = error_string ? error_string : "Field is required";
	},

	validate: function (value, context) {
		return BetaJS.Types.is_null(value) || value == "" ? this.__error_string : null;
	}

});