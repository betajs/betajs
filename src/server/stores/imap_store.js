BetaJS.Stores.BaseStore.extend("BetaJS.Stores.ImapStore", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.ImapStore, "constructor", options);
		this._supportSync = false;
		this.__imap = BetaJS.Objs.extend(BetaJS.Objs.clone(options.base, 1), options.imap);
		this.__smtp = BetaJS.Objs.extend(BetaJS.Objs.clone(options.base, 1), options.smtp);
	},
	
	_query_capabilities: function () {
		return {
			skip: true,
			limit: true
		};
	},

	_query: function (query, options, callbacks) {
		var Imap = require("imap");
		var imap = new Imap(BetaJS.Objs.extend({
			tls : true,
			tlsOptions : {
				rejectUnauthorized : false
			}
		}, this.__imap));
		var skip = options && options.skip ? options.skip + 1 : 1;
		var limit = options && options.limit ? options.limit : 100;
		imap.once('ready', function() {
			imap.openBox("INBOX", true, function (err, box) {
				if (err) {
					callbacks.failure(err);
					return;
				}
				var mails = [];
				var f = imap.seq.fetch(skip + ":" + limit, {
					bodies : ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
					struct : true
				});
				f.on('message', function(msg, seqno) {
					var mail = {};
					var mail_failed = false;
					var header_buffer = '';
					var body_buffer = '';
					msg.on('body', function(stream, info) {
						stream.on('data', function(chunk) {
							if (info.which === 'TEXT')
								body_buffer += chunk.toString('utf8');
							else
								header_buffer += chunk.toString('utf8');
						});
						stream.once('end', function() {
							var header = Imap.parseHeader(header_buffer);
							var body = body_buffer;
							try {
								mail.subject = header.subject[0];
								mail.to = BetaJS.Stores.ImapStore.__get_name(header.to[0]);
								mail.from = BetaJS.Stores.ImapStore.__get_name(header.from[0]);
								mail.time = BetaJS.Stores.ImapStore.__get_time(header.date[0]);
								mail.read = false;
								mail.preview = "To come soon";
							} catch (e) {
								mail_failed = true;
							}
						});
					});
					msg.once('end', function() {
						if (!mail_failed)
							mails.push(mail);
					});
				});
				f.once('error', function(err) {
					imap.end();
					callbacks.failure(err);
				});
				f.once('end', function() {
					imap.end();
					callbacks.success(mails);				
				});			
			});			
		});
		imap.connect();
		imap.on("error", function () {
			// Ignore for now
		});
	},
	
	_insert: function (mail, callbacks) {
		var email = require("emailjs");
		var server = email.server.connect(this.__smtp);
 		var message = email.message.create({
 			from: mail.from,
 			to: mail.to,
 			subject: mail.subject,
			text: mail.body,
		});
		var self = this;
		server.send(message, function (err, msg) {
			if (err)
				self.callback(callbacks, "failure", new BetaJS.Stores.StoreException(err));
			else
				self.callback(callbacks, "success", mail);
		});
	},
	
}, {
	
	__get_name: function (s) {
		var temp = s.split("<");
		var name = temp[0].trim();
		if (name)
			return name;
		temp = temp[1].split(">");
		name = temp[0].trim();
		return name;
	},
	
	__get_time: function (s) {
		var date = new Date(s);
		return BetaJS.Time.format_time(date, "hh:mm");
	}
	
});
