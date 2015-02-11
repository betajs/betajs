Scoped.define("module:Net.AjaxException", ["module:Exceptions.Exception"], function (Exception, scoped) {
	return Exception.extend({scoped: scoped}, function (inherited) {
		return {
		
			constructor: function (status_code, status_text, data) {
				inherited.constructor.call(this, status_code + ": " + status_text);
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
				var obj = inherited.json.call(this);
				obj.data = this.data();
				return obj;
			}
		
		};
	});
});


/*
 * <ul>
 *  <li>uri: target uri</li>
 *  <li>method: get, post, ...</li>
 *  <li>data: data as JSON to be passed with the request</li>
 * </ul>
 * 
 */

Scoped.define("module:Net.AbstractAjax", ["module:Class", "module:Objs", "module:Net.AjaxException"], function (Class, Objs, AjaxException, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (options) {
				inherited.constructor.call(this);
				this.__options = Objs.extend({
					"method": "GET",
					"data": {}
				}, options);
			},
			
			syncCall: function (options) {
				try {
					return this._syncCall(Objs.extend(Objs.clone(this.__options, 1), options));
				} catch (e) {
					throw AjaxException.ensure(e);
				}
			},
			
			asyncCall: function (options) {
				return this._asyncCall(Objs.extend(Objs.clone(this.__options, 1), options));
			},
			
			_syncCall: function (options) {
				throw "Unsupported";
			},
		
			_asyncCall: function (options) {
				throw "Unsupported";
			}
			
		};
	});
});