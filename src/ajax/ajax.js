Scoped.define("module:Ajax.Support", [
    "module:Ajax.NoCandidateAjaxException",
    "module:Ajax.ReturnDataParseException",
    "module:Ajax.RequestException",
    "module:Promise",
    "module:Objs",
    "module:Types",
    "module:Net.Uri",
    "module:Net.HttpHeader"
], function (NoCandidateAjaxException, ReturnDataParseException, RequestException, Promise, Objs, Types, Uri, HttpHeader) {
	return {
		
		__registry: [],
		
		register: function (descriptor, priority) {
			this.__registry.push({
				descriptor: descriptor,
				priority: priority
			});
		},
		
		parseReturnData: function (data, decodeType) {
			if (decodeType === "json" && Types.is_string(data))
				return JSON.parse(data);
			return data;
		},
		
		promiseReturnData: function (promise, data, decodeType) {
			try {
				promise.asyncSuccess(this.parseReturnData(data, decodeType));
			} catch (e) {
				promise.asyncError(new ReturnDataParseException(data, decodeType));
			}
		},
		
		promiseRequestException: function (promise, status, status_text, data, decodeType) {
			status_text = status_text || HttpHeader.format(status);
			try {
				promise.asyncError(new RequestException(status, status_text, this.parseReturnData(data, decodeType)));
			} catch (e) {
				promise.asyncError(new RequestException(status, status_text, data));
			}
		},
		
		preprocess: function (options) {
			options = Objs.extend({
				method: "GET",
				mapMethodsKey: "_method",
				context: this,
				jsonp: undefined,
				postmessage: undefined,
				contentType: "default",
				cors: false,
				corscreds: false,
				forceJsonp: false,
				forcePostmessage: false/*,
				decodeType: "json"*/
			}, options);
			options.method = options.method.toUpperCase();
			if (options.baseUri)
				options.uri = options.uri ? options.baseUri + options.uri : options.baseUri;
			delete options.baseUri;
			if (options.mapMethods && options.method in options.mapMethods) {
				options.uri = Uri.appendUriParams(options.uri, Objs.objectBy(options.mapMethodsKey, options.method));
				options.method = options.mapMethods[options.method];
			}
			delete options.mapMethods;
			delete options.mapMethodsKey;
			if (options.contentType === "default" && !Types.is_empty(options.data)) {
				var has_non_primitive_value = Objs.exists(options.data, function (value) {
					return Types.is_array(value) || Types.is_object(value);
				});
				if (has_non_primitive_value)
					options.contentType = "json";
			}
			return options;
		},
		
		execute: function (options) {
			options = this.preprocess(options);
			var current = null;		
			this.__registry.forEach(function (candidate) {
				if ((!current || current.priority < candidate.priority) && candidate.descriptor.supports.call(candidate.descriptor.context || candidate.descriptor, options))
					current = candidate;
			}, this);
			return current ? current.descriptor.execute.call(current.descriptor.context || current.descriptor, options) : Promise.error(new NoCandidateAjaxException(options));
		}

	};
});


Scoped.define("module:Ajax.AjaxWrapper", [
    "module:Class",
    "module:Objs",
    "module:Ajax.Support"
], function (Class, Objs, Support, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
		
			constructor: function (options) {
				inherited.constructor.call(this);
				this._options = options;
			},
			
			execute: function (options) {
				return Support.execute(Objs.extend(Objs.clone(this._options, 1), options));
			}
			
		};
	});
});

