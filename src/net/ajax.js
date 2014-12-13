/*
 * <ul>
 *  <li>uri: target uri</li>
 *  <li>method: get, post, ...</li>
 *  <li>data: data as JSON to be passed with the request</li>
 * </ul>
 * 
 */
BetaJS.Class.extend("BetaJS.Net.AbstractAjax", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Net.AbstractAjax, "constructor");
		this.__options = BetaJS.Objs.extend({
			"method": "GET",
			"data": {}
		}, options);
	},
	
	syncCall: function (options) {
		try {
			return this._syncCall(BetaJS.Objs.extend(BetaJS.Objs.clone(this.__options, 1), options));
		} catch (e) {
			e = BetaJS.Exceptions.ensure(e);
			e.assert(BetaJS.Net.AjaxException);
			throw e;
		}
	},
	
	asyncCall: function (options) {
		return this._asyncCall(BetaJS.Objs.extend(BetaJS.Objs.clone(this.__options, 1), options));
	},
	
	_syncCall: function (options) {
		throw "Unsupported";
	},

	_asyncCall: function (options) {
		throw "Unsupported";
	}
	
});


BetaJS.Exceptions.Exception.extend("BetaJS.Net.AjaxException", {
	
	constructor: function (status_code, status_text, data) {
		this._inherited(BetaJS.Net.AjaxException, "constructor", status_code + ": " + status_text);
		this.__status_code = status_code;
		this.__status_text = status_text;
		this.__data = data;
	},
	
	status_code: function () {
		return this.__status_code;
	},
	
	status_text: function () {
		return this.__status_text;
	},
	
	data: function () {
		return this.__data;
	},
	
	json: function () {
		var obj = this._inherited(BetaJS.Net.AjaxException, "json");
		obj.data = this.data();
		return obj;
	}
	
});
