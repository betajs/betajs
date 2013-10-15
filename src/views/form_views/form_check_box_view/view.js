BetaJS.Views.FormControlView.extend("BetaJS.Views.FormCheckBoxView", {
	
	_createControl: function (model, property, options) {
		return new BetaJS.Views.CheckBox(BetaJS.Objs.extend(options, {
			checked: model.binding(property)
		}));
	}
	
});
