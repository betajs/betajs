BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.ConditionalValidator", {
	
	constructor: function (condition, validator) {
		this._inherited(BetaJS.Modelling.Validators.ConditionalValidator, "constructor");
		this.__condition = condition;
		this.__validator = BetaJS.Types.is_array(validator) ? validator : [validator];
	},

	validate: function (value, context) {
		if (!this.__condition(value, context))
			return null;
		for (var i = 0; i < this.__validator.length; ++i) {
			var result = this.__validator[i].validate(value, context);
			if (result !== null)
				return result;
		}
		return null;
	}

});