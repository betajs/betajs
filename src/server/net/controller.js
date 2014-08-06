BetaJS.Class.extend("BetaJS.Server.Net.Controller", {}, {

	dispatch : function(method, request, response, next) {
		var self = this;
		self[method](request, response, {
			success : function() {
				if (BetaJS.Types.is_defined(next))
					next();
			},
			exception : function(e) {
				e = BetaJS.Server.Net.ControllerException.ensure(e);
				response.status(e.code()).send(JSON.stringify(e.data()));
			}
		});
	}
	
});

BetaJS.Exceptions.Exception.extend("BetaJS.Server.Net.ControllerException", {
	
	constructor: function (code, data) {
		data = data || {};
		this.__data = data;
		this.__code = code;
		this._inherited(BetaJS.Server.Net.ControllerException, "constructor", BetaJS.Net.HttpHeader.format(code, true));
	},
	
	code: function () {
		return this.__code;
	},
	
	data: function () {
		return this.__data;
	}
	
});
