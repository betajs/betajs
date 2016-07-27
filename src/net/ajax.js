Scoped.define("module:Net.AjaxException", [
    "module:Exceptions.Exception",
    "module:Objs"
], function (Exception, Objs, scoped) {
	return Exception.extend({scoped: scoped}, function (inherited) {
		
		/**
		 * Ajax Exception Class
		 * 
		 * @class BetaJS.Net.AjaxException
		 */
		return {

			/**
			 * Instantiates an Ajax Exception
			 * 
			 * @param status_code Status Code
			 * @param {string} status_text Status Text
			 * @param data Custom Exception Data
			 */
			constructor: function (status_code, status_text, data) {
				inherited.constructor.call(this, status_code + ": " + status_text);
				this.__status_code = status_code;
				this.__status_text = status_text;
				this.__data = data;
			},

			/**
			 * Returns the status code associated with the exception
			 * 
			 * @return status code
			 */
			status_code: function () {
				return this.__status_code;
			},

			/**
			 * Returns the status text associated with the exception
			 * 
			 * @return {string} status text
			 */
			status_text: function () {
				return this.__status_text;
			},

			/**
			 * Returns the custom data associated with the exception 
			 * 
			 * @return custom data
			 */
			data: function () {
				return this.__data;
			},

			/**
			 * Returns a JSON representation of the exception
			 * 
			 * @return {object} Exception JSON representation
			 */
			json: function () {
				return Objs.extend({
					data: this.data(),
					status_code: this.status_code(),
					status_text: this.status_text()
				}, inherited.json.call(this));
			}
			
		};
	});
});



Scoped.define("module:Net.AbstractAjax", [ "module:Class", "module:Objs", "module:Net.Uri" ], function(Class, Objs, Uri, scoped) {
	return Class.extend({ scoped : scoped }, function(inherited) {
		
		/**
		 * Abstract Ajax Class, child classes override this for concrete realizations of Ajax
		 * 
		 * @class BetaJS.Net.AbstractAjax
		 */
		return {

			/**
			 * Instantiates an Abstract Ajax object (should never be instantiated directly)
			 * 
			 * @param {object} options Ajax Options
			 */
			constructor : function (options) {
				inherited.constructor.call(this);
				this.__options = Objs.extend({
					"method" : "GET",
					"data" : {}
				}, options);
			},

			/**
			 * Execute asynchronous ajax call
			 * 
			 * @param {object} options Ajax Call Options
			 * @return {object} Success promise
			 */
			asyncCall : function(options) {
				if (this._shouldMap (options))
					options = this._mapToPost(options);
				return this._asyncCall(Objs.extend(Objs.clone(this.__options, 1), options));
			},

			/**
			 * Abstract Call for executing Ajax.
			 * 
			 * @param {object} options Ajax Call Options
			 * @return {object} Success promise
			 */
			_asyncCall : function(options) {
				throw "Abstract";
			},

			/**
			 * Check if should even attempt a mapping. Important to not assume
			 * that the method option is always specified.
			 * 
			 * @param {object} options Ajax Call Options
			 * @return {boolean} true if it should be mapped
			 */
			_shouldMap : function (options) {
				return (this.__options.mapPutToPost && options.method && options.method.toLowerCase() === "put") ||
				       (this.__options.mapDestroyToPost && options.method && options.method.toLowerCase() === "destroy");
			},

			/**
			 * Some implementations do not supporting sending data with
			 * the non-standard request. This fix converts the Request to use POST, so
			 * the data is sent, but the server still thinks it is receiving a
			 * non-standard request.
			 * 
			 * @param {object} options Ajax Call Options
			 * @return {object} Updated options
			 */
			_mapToPost : function (options) {
				options.uri = Uri.appendUriParams(options.uri, {
					_method : options.method.toUpperCase()
				});
				options.method = "POST";
				return options;
			}
		};
	});
});
