BetaJS.Stores.BaseStore.extend("BetaJS.Stores.SocketStore", {
	
	constructor: function (options, socket, prefix) {
		this._inherited(BetaJS.Stores.SocketStore, "constructor", options);
		this.__socket = socket;
		this.__prefix = prefix;
		this._supportsAsync = false;
	},
	
	__send: function (action, data) {
		this.__socket.emit(this.__prefix + ":" + action, data);
	},
	
	_insert: function (data) {
		this.__send("insert", data);
	},
	
	_remove: function (id) {
		this.__send("remove", id);
	},
	
	_update: function (id, data) {
		this.__send("update", BetaJS.Objs.objectBy(id, data));
	},
	
	bulk: function (commits, optimistic, callbacks) {
		this.__send("bulk", commits);
	}	
	
});


BetaJS.Stores.ListenerStore.extend("BetaJS.Stores.SocketListenerStore", {

	constructor: function (options, socket, prefix) {
		this._inherited(BetaJS.Stores.SocketListenerStore, "constructor", options);
		var self = this;
		this.__prefix = prefix;
		socket.on(this.__prefix + ":insert", function (data) {
			self._perform("insert", data);
		});
		socket.on(this.__prefix + ":remove", function (id) {
			self._perform("remove", id);
		});
		socket.on(this.__prefix + ":update", function (data) {
			self._perform("update", data);
		});
		socket.on(this.__prefix + ":bulk", function (commits) {
			for (var i = 0; i < commits.length; ++i)
				self._perform(BetaJS.Objs.keyByIndex(commits[i]), BetaJS.Objs.valueByIndex(commits[i]));
		});
	},
	
	_perform: function (action, data) {
		if (action == "insert")
			this._inserted(data);
		else if (action == "remove")
			this._removed(data);
		else if (action == "update")
			this._updated(BetaJS.Objs.objectBy(this.id_key(), BetaJS.Objs.keyByIndex(data)), BetaJS.Objs.valueByIndex(data));
		else
			throw new BetaJS.Stores.StoreException("unsupported: perform " + action);
	}

});