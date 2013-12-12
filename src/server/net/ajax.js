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
		var post_data = null;
		if (options.data) {
			if (opts.method == "GET") {
				opts.path = opts.path + "?" + this.cls.querystring().stringify(options.data);
			} else {
				post_data = this.cls.querystring().stringify(options.data);
				if (post_data.length > 0)
					opts.headers = {
			          'Content-Type': 'application/x-www-form-urlencoded',
			          'Content-Length': post_data.length
				    };
			}			
		}
		var request = this.cls.http().request(opts, function (result) {
			var data = "";
			result.on("data", function (chunk) {
				data += chunk;
			}).on("end", function () {
				if (result.statusCode >= 200 && result.statusCode < 300) {
					if (options) {
						if (options.success)
							options.success(data);
						else
							callbacks(data);
					}
				} else {
					if (options.failure)
						options.failure(data);
				}
			});
		});
		if (post_data && post_data.length > 0)
			request.write(post_data);
		request.end();
	}

}, {
	
	__http: null,
	
	http: function () {
		if (!this.__http)
			this.__http = require("http");
		return this.__http;
	},	
	
	__querystring: null,
	
	querystring: function () {
		if (!this.__querystring)
			this.__querystring = require("querystring");
		return this.__querystring;
	}	

});
