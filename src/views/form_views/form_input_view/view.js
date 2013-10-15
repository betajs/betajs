BetaJS.Views.FormControlView.extend("BetaJS.Views.FormInputView", {
	
	_createControl: function (model, property, options) {
		return new BetaJS.Views.InputView(BetaJS.Objs.extend(options, {
			value: model.binding(property)
		}));
	}
	
});
