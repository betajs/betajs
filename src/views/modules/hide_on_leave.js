BetaJS.Views.Modules.BindOnVisible.extend("BetaJS.Views.Modules.HideOnLeave", {
		
	_bind: function (object, data) {
		var el = object.$el.get(0);
		data.hide_on_leave_func = function (e) {
			if (data.hide_on_leave_skip) {
				data.hide_on_leave_skip = false;
				return;
			}
			if (document.contains(e.target) && e.target !== el && !BetaJS.$.contains(el, e.target))
				object.hide();
		};
		data.hide_on_leave_skip = true;
		BetaJS.$(document.body).on("click", data.hide_on_leave_func);
	},
	
	_unbind: function (object, data) {
		BetaJS.$(document.body).unbind("click", data.hide_on_leave_func);
	}
	
});
