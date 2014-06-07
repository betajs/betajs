BetaJS.Server.Net.Smtp = {
	
	send: function (config, message, callbacks) {
		var email = require("emailjs");
		message.from = BetaJS.Strings.email_get_email(message.from);
		message.to = BetaJS.Strings.email_get_email(message.to);
		if (message.text_body) {
			message.text = message.text_body;
			delete message.text_body;
		}
 		email.server.connect(config).send(email.message.create(message), function (err, msg) {
			if (err)
				BetaJS.SyncAsync.callback(callbacks, "failure", err);
			else
				BetaJS.SyncAsync.callback(callbacks, "success", msg);
 		});
	}
	
};