BetaJS.Server.Net.Smtp = {
	
	send: function (config, message, callbacks) {
		var email = require("emailjs");
 		email.server.connect(config).send(email.message.create(message), function (err, msg) {
			if (err)
				BetaJS.SyncAsync.callback(callbacks, "failure", err);
			else
				BetaJS.SyncAsync.callback(callbacks, "success");
 		});
	}
	
};