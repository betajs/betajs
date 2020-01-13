Scoped.define("module:Ajax.Support", [
    "module:Ajax.NoCandidateAjaxException",
    "module:Ajax.ReturnDataParseException",
    "module:Ajax.RequestException",
    "module:Ajax.TimeoutException",
    "module:Promise",
    "module:Objs",
    "module:Types",
    "module:Net.Uri",
    "module:Net.HttpHeader",
    "module:Async",
    "module:Time"
], function(NoCandidateAjaxException, ReturnDataParseException, RequestException, TimeoutException, Promise, Objs, Types, Uri, HttpHeader, Async, Time) {

    /**
     * Ajax Support Module
     * 
     * @module BetaJS.Ajax.Support
     */
    return {

        __registry: [],

        /**
         * Registers an ajax execution system 
         * 
         * @param {object} descriptor Descriptor object containing a supports and an execute function
         * @param {int} priority Priority of this execution system to be used if applicable
         */
        register: function(descriptor, priority) {
            this.__registry.push({
                descriptor: descriptor,
                priority: priority
            });
        },

        /**
         * Unwrap the status from return data
         * 
         * @param {object} json Status-encoded return object
         * @param {string} errorDecodeType Decode type for data in case it is an error
         * 
         * @return Unwrapped data in case of a success status
         */
        unwrapStatus: function(json, errorDecodeType) {
            /*
             * Should be:
             * {
             * 	status: XXX,
             *  statusText: XXX, (or empty)
             *  responseText: XXX (or empty)
             * }
             */
            var status = json.status || HttpHeader.HTTP_STATUS_INTERNAL_SERVER_ERROR;
            if (!HttpHeader.isSuccessStatus(status)) {
                var status_text = json.statusText || HttpHeader.format(status);
                var resp = json.responseText;
                try {
                    resp = this.parseReturnData(json.responseText, errorDecodeType);
                } catch (e) {}
                throw new RequestException(status, status_text, resp);
            } else
                return json.responseText;
        },

        /**
         * Parse return data given a decode type.
         * 
         * @param data Return data to be parsed
         * @param {string} decodeType Decode type, e.g. "json"
         * 
         * @return Parsed return data
         */
        parseReturnData: function(data, decodeType) {
            if (decodeType === "json" && Types.is_string(data))
                return JSON.parse(data);
            return data;
        },

        /**
         * Process the return data and forward the result to a promise object.
         * 
         * @param {object} promise Promise object
         * @param {object} options Options for processing the return data
         * @param data Return data
         * @param {string} decodeType Decode type, e.g. "json"
         * 
         */
        promiseReturnData: function(promise, options, data, decodeType) {
            if (options.wrapStatus) {
                try {
                    data = this.parseReturnData(data, "json");
                } catch (e) {
                    promise.asyncError(new ReturnDataParseException(data, decodeType));
                    return;
                }
                try {
                    data = this.unwrapStatus(data, decodeType);
                } catch (e) {
                    promise.asyncError(e);
                    return;
                }
            }
            try {
                promise.asyncSuccess(this.parseReturnData(data, decodeType));
            } catch (e) {
                promise.asyncError(new ReturnDataParseException(data, decodeType));
            }
        },

        /**
         * Process the return data and forward the result as an error to a promise object.
         * 
         * @param {object} promise Promise object
         * @param {int} status Error status
         * @param {string} status_text Optional status text
         * @param data Return data
         * @param {string} decodeType Decode type, e.g. "json"
         * 
         */
        promiseRequestException: function(promise, status, status_text, data, decodeType) {
            status_text = status_text || HttpHeader.format(status);
            try {
                promise.asyncError(new RequestException(status, status_text, this.parseReturnData(data, decodeType)));
            } catch (e) {
                promise.asyncError(new RequestException(status, status_text, data));
            }
        },

        /**
         * Return error to a promise object.
         *
         * @param {object} promise Promise object
         *
         */
        promiseTimeoutException: function(promise) {
            promise.asyncError(new TimeoutException(status, status_text, data));
        },

        /**
         * Preprocess Ajax Options object.
         * 
         * @param {object} options Options object
         * 
         * @return {object} Preprocessed options object
         */
        preprocess: function(options) {
            options = Objs.extend({
                method: "GET",
                mapMethodsKey: "_method",
                wrapStatus: false,
                wrapStatusParam: null,
                context: this,
                query: {},
                jsonp: undefined,
                noCache: undefined,
                noCacheParam: null,
                signingFunction: null,
                signUrl: false,
                postmessage: undefined,
                contentType: "urlencoded", // json
                resilience: 1,
                resilience_filter: null,
                resilience_delay: 1000,
                cors: false,
                sendContentType: true,
                corscreds: false,
                forceJsonp: false,
                forcePostmessage: false
                /*,
                				decodeType: "json"*/
            }, options);
            if (options.params) {
                options.query = Objs.extend(options.query, options.params);
                delete options.params;
            }
            if (!Types.is_empty(options.query)) {
                options.query = Objs.filter(options.query, function(value) {
                    return value !== null && value !== undefined;
                });
            }
            options.method = options.method.toUpperCase();
            options.methodSupportsPayload = options.method === "POST" || options.method === "PATCH" || options.method === "PUT";
            if (options.baseUri)
                options.uri = options.uri ? options.baseUri + options.uri : options.baseUri;
            delete options.baseUri;
            if (options.mapMethods && options.method in options.mapMethods) {
                options.uri = Uri.appendUriParams(options.uri, Objs.objectBy(options.mapMethodsKey, options.method));
                options.method = options.mapMethods[options.method];
            }
            if (options.wrapStatus && options.wrapStatusParam)
                options.uri = Uri.appendUriParams(options.uri, Objs.objectBy(options.wrapStatusParam, "true"));
            if (options.noCache && options.noCacheParam)
                options.uri = Uri.appendUriParams(options.uri, Objs.objectBy(options.noCacheParam, Time.now()));
            delete options.mapMethods;
            delete options.mapMethodsKey;
            if (options.contentType === "urlencoded" && !Types.is_empty(options.data)) {
                options.data = Objs.filter(options.data, function(value) {
                    return value !== null && value !== undefined;
                });
            }
            options.isCorsRequest = typeof document !== "undefined" && Uri.isCrossDomainUri(document.location.href, options.uri);
            return options;
        },

        /**
         * Finalizes a uri via signing if activated
         *
         * @param {object} options Options for the Ajax command
         * @param {string} uri Pre-Final uri
         *
         * @return {string} Final uri
         */
        finalizeUri: function(options, uri) {
            return options.signUrl && options.signingFunction ? options.signingFunction(options, uri) : uri;
        },

        /**
         * Execute an Ajax command.
         * 
         * @param {object} options Options for the Ajax command
         * @param {function} progress Optional progress function
         * @param {object} progressCtx Optional progress context
         * 
         * @return {object} Execution promise
         */
        execute: function(options, progress, progressCtx) {
            options = this.preprocess(options);
            var current = null;
            this.__registry.forEach(function(candidate) {
                if ((!current || current.priority < candidate.priority) && candidate.descriptor.supports.call(candidate.descriptor.context || candidate.descriptor, options))
                    current = candidate;
            }, this);
            if (!current)
                return Promise.error(new NoCandidateAjaxException(options));
            var helper = function(resilience) {
                var promise = current.descriptor.execute.call(current.descriptor.context || current.descriptor, options, progress, progressCtx);
                if (!resilience || resilience <= 1)
                    return promise;
                var returnPromise = Promise.create();
                promise.forwardSuccess(returnPromise).error(function(err) {
                    if (RequestException.is_class_instance(err) && options.resilience_filter && options.resilience_filter(err)) {
                        returnPromise.error(err);
                        return;
                    }
                    Async.eventually(function() {
                        helper(resilience - 1).forwardCallback(returnPromise);
                    }, options.resilience_delay);
                });
                return returnPromise;
            };
            return helper(options.resilience);
        }

    };
});


Scoped.define("module:Ajax.AbstractAjaxWrapper", [
    "module:Class",
    "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract Ajax Wrapper Class
         * 
         * @class BetaJS.Ajax.AbstractAjaxWrapper
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {object} options common options for ajax calls
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                this.options = options;
            },

            /**
             * Execute an ajax call.
             * 
             * @param {object} options options for ajax call
             * @param {function} progress Optional progress function
             * @param {object} progressCtx Optional progress context
             * @return {object} promise for the ajax call
             */
            execute: function(options, progress, progressCtx) {
                return this._execute(Objs.extend(Objs.clone(this.options, 1), options), progress, progressCtx);
            },

            _execute: function(options, progress, progressCtx) {
                throw "Not implemented";
            }

        };
    });
});


Scoped.define("module:Ajax.HookedAjaxWrapper", [
    "module:Ajax.AbstractAjaxWrapper",
    "module:Promise"
], function(AbstractAjaxWrapper, Promise, scoped) {
    return AbstractAjaxWrapper.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Hooked Ajax Wrapper Class
         *
         * @class BetaJS.Ajax.HookedAjaxWrapper
         */
        return {

            /**
             * Creates an instance.
             *
             * @param {object} ajaxWrapper Ajax Wrapper Class
             * @param {function} hookCallback hook callback function
             * @param {object} hookCallbackCtx hook callback ctx
             * @param {object} options common options for ajax calls
             */
            constructor: function(ajaxWrapper, hookCallback, hookCallbackCtx, options) {
                inherited.constructor.call(this, options);
                this.ajaxWrapper = ajaxWrapper;
                this.hookCallback = hookCallback;
                this.hookCallbackCtx = hookCallbackCtx;
                this.online = true;
            },

            _execute: function(options, progress, progressCtx) {
                if (!this.online)
                    return Promise.error("offline");
                return this.ajaxWrapper.execute(this.hookCallback.call(this.hookCallbackCtx || this, options), progress, progressCtx);
            }

        };
    });
});


Scoped.define("module:Ajax.AjaxWrapper", [
    "module:Ajax.AbstractAjaxWrapper",
    "module:Ajax.Support"
], function(AbstractAjaxWrapper, Support, scoped) {
    /**
     * Ajax Wrapper Class
     *
     * @class BetaJS.Ajax.AjaxWrapper
     */
    return AbstractAjaxWrapper.extend({
        scoped: scoped
    }, {
        _execute: function(options, progress, progressCtx) {
            return Support.execute(options, progress, progressCtx);
        }
    });
});