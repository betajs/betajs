BetaJS.Views.Modules.BindOnActivate.extend("BetaJS.Views.Modules.Hotkeys", {
		
	constructor: function (options) {
		this._inherited(BetaJS.Views.Modules.Hotkeys, "constructor", options);
		this.__hotkeys = options.hotkeys;
	},

	_bind: function (object, data) {
		data.hotkeys = {};
		BetaJS.Objs.iter(this.__hotkeys, function (f, hotkey) {
			data.hotkeys[hotkey] = BetaJS.Browser.Hotkeys.register(hotkey, BetaJS.Types.is_function(f) ? f : object[f], object); 
		}, this);
	},
	
	_unbind: function (object, data) {
		BetaJS.Objs.iter(data.hotkeys, function (handle) {
			BetaJS.Browser.Hotkeys.unregister(handle);
		}, this);
		data.hotkeys = {};
	}
	
});