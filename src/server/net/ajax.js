BetaJS.Net.AbstractAjax.extend("BetaJS.Server.Net.HttpAjax", {

	_syncCall: function (options) {
		throw "Unsupported";
	},
	
	_asyncCall: function (options) {
		var parsed = BetaJS.Net.Uri.parse(options.uri);
		var opts = {
			method: options.method,
			host: parsed.host,
			port: parsed.port,
			path: parsed.path
		};
		this.cls.http().request(opts, function (result) {
			options.success(result);
		});
	}

}, {
	
	__http: null,
	
	http: function () {
		if (!this.__http)
			this.__http = require("http");
		return this.__http;
	}	
	
});
