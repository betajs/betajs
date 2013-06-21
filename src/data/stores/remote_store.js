BetaJS.Stores.RemoteStore = BetaJS.Stores.BaseStore.extend("RemoteStore", {

	constructor : function(uri, ajax, options) {
		this._inherited(BetaJS.Stores.RemoteStore, "constructor");
		this.__uri = uri;
		this.__ajax = ajax;
		this.__options = BetaJS.Objs.extend({
			"update_method": "PUT"
		}, options || {});
	},
	
	getUri: function () {
		return this.__uri;
	},

	_insert : function(data) {
		try {
			return this.__ajax.syncCall({method: "POST", uri: this.__uri, data: data});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},

	_remove : function(id) {
		try {
			var response = this.__ajax.syncCall({method: "DELETE", uri: this.__uri + "/" + id});
			return response ? response : {id:id};
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},

	_get : function(id) {
		try {
			return this.__ajax.syncCall({uri: this.__uri + "/" + id});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},

	_update : function(id, data) {
		try {
			return this.__ajax.syncCall({method: this.__options.update_method, uri: this.__uri + "/" + id, data: data});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},
	
	_query : function(query, options) {
		try {			
			return this.__ajax.syncCall(this._encode_query(query, options));
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},
	
	_encode_query: function (query, options) {
		return {
			uri: this.getUri()
		};		
	}
	
});


BetaJS.Stores.QueryGetParamsRemoteStore = BetaJS.Stores.RemoteStore.extend("QueryGetParamsRemoteStore", {

	constructor : function(uri, ajax, capability_params, options) {
		this._inherited(BetaJS.Stores.RemoteStore, "constructor", options);
		this.__uri = uri;
		this.__ajax = ajax;
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