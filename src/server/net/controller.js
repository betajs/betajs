BetaJS.Class.extend("BetaJS.Server.Net.Controller", {}, {

	dispatch : function(method, request, response, next) {
		var self = this;
		self[method](request, response, {
			success : function() {
				if (BetaJS.Types.is_defined(next))
					next();
			},
			exception : function(e) {
				e = BetaJS.Exceptions.Exception.ensure(e);
				response.status(e.code()).send(JSON.stringify(e.data()));
			}
		});
	}
	
});
