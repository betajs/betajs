BetaJS.Stores.BaseStore.extend("BetaJS.Stores.ImapStore", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.ImapStore, "constructor", options);
		this._supportSync = false;
		this.__imap = BetaJS.Objs.extend(BetaJS.Objs.clone(options.base, 1), options.imap);
		this.__smtp = BetaJS.Objs.extend(BetaJS.Objs.clone(options.base, 1), options.smtp);
		this.__imap_opts = options.imap_options || {};
		this.__imap_opts.reconnect_on_error = false;
	},
	
	test: function (callbacks) {
		var imap = new BetaJS.Server.Net.Imap(this.__imap, this.__imap_opts);
		imap.connect({
			success: function () {
				imap.destroy();
				BetaJS.SyncAsync.callback(callbacks, "success");
			},
			exception: function () {
				imap.destroy();
				BetaJS.SyncAsync.callback(callbacks, "exception");
			}
		});
	},
	
	_query_capabilities: function () {
		return {
			skip: true,
			limit: true
		};
	},

	_query: function (query, options, callbacks) {
		var self = this;
		var imap = new BetaJS.Server.Net.Imap(this.__imap, this.__imap_opts);
		imap.connect(BetaJS.SyncAsync.mapSuccess(callbacks, function () {
			var opts = {};
			if ("skip" in options)
				opts.seq_start = options.skip + 1;
			if ("limit" in options)
				opts.seq_count = options.limit;
			opts.reverse = true;
			imap.fetch(opts, BetaJS.SyncAsync.mapSuccess(callbacks, function (mails) {
				self.callback(callbacks, "success", BetaJS.Objs.map(mails, function (mail) {
					return mail;
				}));
				imap.destroy();
			}));
		}));
	},
	
	_insert: function (mail, callbacks) {
		BetaJS.Server.Net.Smtp.send(this.__smtp, {
 			from: mail.from,
 			to: mail.to,
 			subject: mail.subject,
			text_body: mail.text_body
		}, {
			context: callbacks.context,
			success: function (msg) {
				mail.id = msg.header["message-id"];
				BetaJS.SyncAsync.callback(callbacks, "success", mail);
			},
			exception: function (err) {
				BetaJS.SyncAsync.callback(callbacks, "exception", new BetaJS.Stores.StoreException(err));
			}
		});
	}
	
});


BetaJS.Stores.ListenerStore.extend("BetaJS.Stores.ImapListenerStore", {

	constructor: function (options) {
		this._inherited(BetaJS.Stores.ImapListenerStore, "constructor", options);
		var opts = BetaJS.Objs.extend(BetaJS.Objs.clone(options.base, 1), options.imap);
		var imap = new BetaJS.Server.Net.Imap(opts, {reonnect_on_error: true});
		this._auto_destroy(imap);
		imap.on("new_mail", function (count) {
			imap.fetch({seq_count: count, reverse: true}, {
				context: this,
				success: function (mails) {
					BetaJS.Objs.iter(mails, function (mail) {
						this._inserted(mail);
					}, this);
				}
			});
		}, this);
		imap.connect();
	}
	
});