BetaJS.Views.FormControlView.extend("BetaJS.Views.FormCheckBoxView", {
	
	_createControl: function (model, property, options) {
		return new BetaJS.Views.CheckBoxView(BetaJS.Objs.extend(options, {
			checked: model.binding(property)
		}));
	}
	
});
