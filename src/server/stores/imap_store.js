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
		var imap = BetaJS.Stores.ImapStore.init_imap(this.__imap);
		var self = this;
		this.__count = 0;
		imap.on('mail', function (count) {
			self.__count += count;
		});
		imap.once('ready', function() {
			imap.openBox("INBOX", true, function (err, box) {
				if (err) {
					callbacks.failure(err);
					return;
				}
				BetaJS.Stores.ImapStore.imap_query(imap, options, self.__count, {
					success: function (mails) {
						imap.end();
						BetaJS.SyncAsync.callback(callbacks, "success", mails);
					},
					failure: function (err) {
						imap.end();
						BetaJS.SyncAsync.callback(callbacks, "failure", err);
					}
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
			text: mail.body
		});
		var self = this;
		server.send(message, function (err, msg) {
			if (err)
				self.callback(callbacks, "failure", new BetaJS.Stores.StoreException(err));
			else
				self.callback(callbacks, "success", mail);
		});
	}
	
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
	
	__get_date: function (s) {
		var d = new Date(s);
		return d.getTime();
	},
	
	init_imap: function (opts) {
		var Imap = require("imap");
		return new Imap(BetaJS.Objs.extend({
			tls : true,
			tlsOptions : {
				rejectUnauthorized : false
			}
		}, opts));
	},
	
	imap_query: function (imap, options, count, callbacks) {
		var Imap = require("imap");
		var mails = [];
		var start_mail = options && options.skip ? options.skip + 1 : 1;
		var end_mail = start_mail + (options && options.limit ? options.limit : 100) - 1;
		if (count) {
			end_mail = options && options.skip ? count - options.skip : count;
			start_mail = Math.max(end_mail - (options && options.limit ? options.limit : 100) + 1, 1);
		}
		var f = imap.seq.fetch(start_mail + ":" + end_mail, {
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
						mail.date = BetaJS.Stores.ImapStore.__get_date(header.date[0]);
						mail.body = body;
						mail.read = false;
						mail.preview = "To come soon";
					} catch (e) {
						mail_failed = true;
					}
				});
			});
		  	msg.once('attributes', function(attrs) {
	        	mail.id = attrs.uid;
	      	});
	      	msg.once('end', function() {
				if (!mail_failed)
					mails.push(mail);
			});
		});
		f.once('error', function(err) {
			BetaJS.SyncAsync.callback(callbacks, "failure", err);
		});
		f.once('end', function() {
			console.log(mails);
			BetaJS.SyncAsync.callback(callbacks, "success", mails);
		});			
	}
	
});


BetaJS.Stores.ListenerStore.extend("BetaJS.Stores.ImapListenerStore", {

	constructor: function (options) {
		this._inherited(BetaJS.Stores.ImapListenerStore, "constructor", options);
		this.__imap = BetaJS.Objs.extend(BetaJS.Objs.clone(options.base, 1), options.imap);
		var imap = BetaJS.Stores.ImapStore.init_imap(this.__imap);
		var self = this;
		this.__count = 0;
		imap.on('mail', function (count) {
			self.__count += count;
		});
		imap.once('ready', function() {
			imap.openBox("INBOX", true, function (err, box) {
				if (err) 
					throw err;
				imap.on('mail', function (count) {
					BetaJS.Stores.ImapStore.imap_query(imap, {limit: count}, self.__count, {
						success: function (mails) {
							BetaJS.Objs.iter(mails, function (mail) {
								self._inserted(mail);
							});
						}
					});
				});
			});			
		});
		imap.connect();
		imap.on("error", function () {
			// Ignore for now
		});
	}

});