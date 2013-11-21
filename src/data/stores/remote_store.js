BetaJS.Stores.StoreException.extend("BetaJS.Stores.RemoteStoreException", {
	
	constructor: function (source) {
		source = BetaJS.Browser.AjaxException.ensure(source);
		this._inherited(BetaJS.Stores.RemoteStoreException, "constructor", source.toString());
		this.__source = source;
	},
	
	source: function () {
		return this.__source;
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.RemoteStore", {

	constructor : function(uri, ajax, options) {
		this._inherited(BetaJS.Stores.RemoteStore, "constructor", options);
		this._uri = uri;
		this.__ajax = ajax;
		this.__options = BetaJS.Objs.extend({
			"update_method": "PUT",
			"uri_mappings": {}
		}, options || {});
	},
	
	_supports_async_write: function () {
		return true;
	},

	_supports_async_read: function () {
		return false;
	},

	getUri: function () {
		return this._uri;
	},
	
	prepare_uri: function (action, data) {
		if (this.__options["uri_mappings"][action])
			return this.__options["uri_mappings"][action](data);
		if (action == "remove" || action == "get" || action == "update")
			return this.getUri() + "/" + data[this._id_key];
		return this.getUri();
	},

	_include_callbacks: function (opts, error_callback, success_callback) {
		opts.failure = function (status_code, status_text, data) {
			error_callback(new BetaJS.Stores.RemoteStoreException(new BetaJS.Browser.AjaxException(status_code, status_text, data)));
		};
		opts.success = success_callback;
		return opts;
	},

	_insert : function(data, callbacks) {
		try {
			var opts = {method: "POST", uri: this.prepare_uri("insert", data), data: data};
			if (this._async_write) 
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success));
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
		return true;
	},

	_remove : function(id, callbacks) {
		try {
			var data = {};
			data[this._id_key] = id;
			var opts = {method: "DELETE", uri: this.prepare_uri("remove", data)};
			if (this._async_write) {
				var self = this;
				opts = this._include_callbacks(opts, callbacks.exception, function (response) {
					if (!response) {
						response = {};
						response[self._id_key] = id;
					}
					callbacks.success(response);
				});
				this.__ajax.asyncCall(opts);
			} else {
				var response = this.__ajax.syncCall(opts);
				if (!response) {
					response = {};
					response[this._id_key] = id;
				}
				return response;
			}
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
		return true;
	},

	_get : function(id, callbacks) {
		var data = {};
		data[this._id_key] = id;
		try {
			var opts = {uri: this.prepare_uri("get", data)};
			if (this._async_read)
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success));
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
		return true;
	},

	_update : function(id, data, callbacks) {
		var copy = BetaJS.Objs.clone(data, 1);
		copy[this._id_key] = id;
		try {
			var opts = {method: this.__options.update_method, uri: this.prepare_uri("update", copy), data: data};
			if (this._async_write)
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success));
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
		return true;
	},
	
	_query : function(query, options, callbacks) {
		try {		
			var opts = this._encode_query(query, options);
			if (this._async_read) {
				var self = this;
				opts = this._include_callbacks(opts, callbacks.exception, function (response) {
					callbacks.success(BetaJS.Types.is_string(raw) ? JSON.parse(raw) : raw);
				});
				this.__ajax.asyncCall(opts);
				return true;
			} else {
				var raw = this.__ajax.syncCall(opts);
				return BetaJS.Types.is_string(raw) ? JSON.parse(raw) : raw;
			}
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
	},
	
	_encode_query: function (query, options) {
		return {
			uri: this.prepare_uri("query")
		};		
	}
	
});


BetaJS.Stores.RemoteStore.extend("BetaJS.Stores.QueryGetParamsRemoteStore", {

	constructor : function(uri, ajax, capability_params, options) {
		this._inherited(BetaJS.Stores.QueryGetParamsRemoteStore, "constructor", uri, ajax, options);
		this.__capability_params = capability_params;
	},
	
	_query_capabilities: function () {
		var caps = {};
		if ("skip" in this.__capability_params)
			caps.skip = true;
		if ("limit" in this.__capability_params)
			caps.limit = true;
		return caps;
	},

	_encode_query: function (query, options) {
		options = options || {};
		var uri = this.getUri() + "?"; 
		if (options["skip"] && "skip" in this.__capability_params)
			uri += this.__capability_params["skip"] + "=" + options["skip"] + "&";
		if (options["limit"] && "limit" in this.__capability_params)
			uri += this.__capability_params["limit"] + "=" + options["limit"] + "&";
		return {
			uri: uri
		};		
	}

});