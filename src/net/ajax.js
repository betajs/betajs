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

Scoped.define("module:Net.AbstractAjax", ["module:Class", "module:Objs", "module:Net.AjaxException", "module:Net.Uri"], function (Class, Objs, AjaxException, Uri, scoped) {
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
          if (this._shouldMap(options)) {
            options = this._mapPutToPost(options);
          }

					return this._syncCall(Objs.extend(Objs.clone(this.__options, 1), options));
				} catch (e) {
					throw AjaxException.ensure(e);
				}
			},
			
			asyncCall: function (options) {

        if (this._shouldMap(options)) {
          options = this._mapPutToPost(options);
        }

				return this._asyncCall(Objs.extend(Objs.clone(this.__options, 1), options));
			},
			
			_syncCall: function (options) {
				throw "Unsupported";
			},
		
			_asyncCall: function (options) {
				throw "Unsupported";
			},

      /**
       * @method _shouldMap
       *
       * Check if should even attempt a mapping. Important to not assume
       * that the method option is always specified.
       *
       * @return Boolean
       */
      _shouldMap: function (options) {
        return this.__options.mapPutToPost &&
          options.method && options.method.toLowerCase === "put";

      },

      /**
       * @method _mapPutToPost
       *
       * Some implementations of PUT to not supporting sending data with the PUT
       * request. This fix converts the Request to use POST, so the data is
       * sent, but the server still thinks it is receiving a PUT request.
       *
       * @param {object} options
       *
       * @return {object}
       */
      _mapPutToPost: function(options) {
        options.method = "POST";
        options.uri = Uri.appendUriParams(
          options.uri, {
          _method: "PUT"
        });

        return options;
      }
		};
	});
});

