BetaJS.Classes.Module.extend("BetaJS.Views.Modules.BindOnActivate", {
	
	_register: function (object, data) {
		data.bound = false;
		object.on("activate", function () { this.__bind(object); }, this);
		object.on("deactivate", function () { this.__unbind(object); }, this);
		if (object.isActive())
			this.__bind(object);
	},
	
	_unregister: function (object, data) {
		this.__unbind(object);
	},
	
	__bind: function (object) {
		var data = this._data(object);
		if (data.bound)
			return;
		this._bind(object, data);
		data.bound = true;
	},
	
	__unbind: function (object) {
		var data = this._data(object);
		if (!data.bound)
			return;
		this._unbind(object, data);
		data.bound = false;
	},
	
	_bind: function (object, data) {},
	
	_unbind: function (object, data) {}
	
});
