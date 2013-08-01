BetaJS.Stores.RemoteStore = BetaJS.Stores.BaseStore.extend("RemoteStore", {

	constructor : function(uri, ajax, options) {
		this._inherited(BetaJS.Stores.RemoteStore, "constructor", options);
		this._uri = uri;
		this.__ajax = ajax;
		this.__options = BetaJS.Objs.extend({
			"update_method": "PUT",
			"uri_mappings": {}
		}, options || {});
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

	_insert : function(data) {
		try {
			return this.__ajax.syncCall({method: "POST", uri: this.prepare_uri("insert", data), data: data});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},

	_remove : function(id) {
		try {
			var response = this.__ajax.syncCall({method: "DELETE", uri: this.prepare_uri("remove", data)});
			if (response)
				return response;
			response = {};
			response[this._id_key] = id;
			return response;
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},

	_get : function(id) {
		var data = {};
		data[this._id_key] = id;
		try {
			return this.__ajax.syncCall({uri: this.prepare_uri("get", data)});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},

	_update : function(id, data) {
		var copy = BetaJS.Objs.clone(data, 1);
		copy[this._id_key] = id;
		try {
			return this.__ajax.syncCall({method: this.__options.update_method, uri: this.prepare_uri("update", copy), data: data});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},
	
	_query : function(query, options) {
		try {		
			var raw = this.__ajax.syncCall(this._encode_query(query, options));
			if (BetaJS.Types.is_string(raw))	
				return JSON.parse(raw)
			else
				return raw;
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},
	
	_encode_query: function (query, options) {
		return {
			uri: this.prepare_uri("query")
		};		
	}
	
});


BetaJS.Stores.QueryGetParamsRemoteStore = BetaJS.Stores.RemoteStore.extend("QueryGetParamsRemoteStore", {

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