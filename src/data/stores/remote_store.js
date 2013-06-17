BetaJS.Stores.RemoteStore = BetaJS.Stores.BaseStore.extend("RemoteStore", {

	constructor : function(uri, ajax) {
		this._inherited(BetaJS.Stores.RemoteStore, "constructor");
		this.__uri = uri;
		this.__ajax = ajax;
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
			return this.__ajax.syncCall({method: "PUT", uri: this.__uri + "/" + id, data: data});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	},

	_query : function(query, options) {
		try {
			return this.__ajax.syncCall({uri: this.__uri});
		} catch (e) {
			throw new BetaJS.Stores.StoreException(BetaJS.Net.AjaxException.ensure(e).toString()); 			
		}
	}
});
