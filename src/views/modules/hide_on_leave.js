BetaJS.Classes.Module.extend("BetaJS.Views.Modules.HideOnLeave", {
	
	_register: function (object, data) {
		data.bound = false;
		object.on("visibility", function (visible) {
			if (visible)
				this.__bind(object)
			else
				this.__unbind(object);
		}, this);
		if (object.isActive() && object.isVisible())
			this.__bind(object);
	},
	
	_unregister: function (object, data) {
		this.__unbind(object);
	},
	
	__bind: function (object) {
		var data = this._data(object);
		if (data.bound)
			return;
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
		data.bound = true;
	},
	
	__unbind: function (object) {
		var data = this._data(object);
		if (!data.bound)
			return;
		BetaJS.$(document.body).unbind("click", data.hide_on_leave_func);
		data.bound = false;
	}
	
});
