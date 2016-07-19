Scoped.define("module:Workers.PseudoWorker", [
    "module:Class",
    "module:Events.EventsMixin"
], function (Class, EventsMixin, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, {
		
		bind: function (peerWorker) {
			this.__peer = peerWorker;
		},
		
		postMessage: function (data) {
			this.__peer.triggerAsync("message", data);
		},
		
		addEventListener: function (event, callback) {
			if (event === "message") {
				this.on(event, function (data) {
					callback.call(this, {data : data});
				}, this);
			} else {
				this.on(event, callback);
			}
		}

	}], {		
		
		createWorker: function (url) {
			try {
				return new Worker(url);
			} catch (e) {
				return null;
			}
		},
		
		createPseudoWorker: function (workerFactory, workerFactoryCtx) {
			var clientWorker = new this();
			var serverWorker = clientWorker.auto_destroy(new this());
			clientWorker.bind(serverWorker);
			serverWorker.bind(clientWorker);
			workerFactory.call(workerFactoryCtx || this, serverWorker);
			return clientWorker;
		},
		
		createAsFallback: function (url, workerFactory, workerFactoryCtx) {
			return this.createWorker(url) || this.createPseudoWorker(workerFactory, workerFactoryCtx);
		}
		
	});
});