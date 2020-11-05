/*!
betajs - v1.0.217 - 2020-11-05
Copyright (c) Oliver Friedmann,Victor Lingenthal
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJS');
Scoped.define("module:", function () {
	return {
    "guid": "71366f7a-7da3-4e55-9a0b-ea0e4e2a9e79",
    "version": "1.0.217",
    "datetime": 1604600138845
};
});
Scoped.require(['module:'], function (mod) {
	this.exports(typeof module != 'undefined' ? module : null, mod);
}, this);
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
Scoped.define("module:Ajax.AjaxException", [
    "module:Exceptions.Exception"
], function(Exception, scoped) {
    return Exception.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract Ajax Exception Class
         * 
         * @class BetaJS.Ajax.AjaxException
         */
        return {

            /**
             * Returns the status code associated with the exception
             * 
             * @return {int} status code
             */
            status_code: function() {
                return 500;
            }

        };
    });
});


Scoped.define("module:Ajax.NoCandidateAjaxException", [
    "module:Ajax.AjaxException"
], function(Exception, scoped) {
    return Exception.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * No Candidate Ajax Exception Class
         * 
         * @class BetaJS.Ajax.NoCandidateAjaxException
         */
        return {

        };
    });
});


Scoped.define("module:Ajax.TimeoutException", [
    "module:Ajax.AjaxException"
], function(Exception, scoped) {
    return Exception.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Timeout Exception Class
         *
         * @class BetaJS.Ajax.Timeout
         */
        return {

        };
    });
});


Scoped.define("module:Ajax.ReturnDataParseException", [
    "module:Ajax.AjaxException"
], function(Exception, scoped) {
    return Exception.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Return Data Parse Exception Class
         * 
         * @class BetaJS.Ajax.ReturnDataParseException 
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param data return data
             * @param {string} decodeType decode type for return data 
             */
            constructor: function(data, decodeType) {
                inherited.constructor.call(this, "Could not decode data with type " + decodeType);
                this.__decodeType = decodeType;
                this.__data = data;
            }

        };
    });
});


Scoped.define("module:Ajax.RequestException", [
    "module:Ajax.AjaxException",
    "module:Objs"
], function(Exception, Objs, scoped) {
    return Exception.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Request Exception Class
         * 
         * @class BetaJS.Ajax.RequestException
         */
        return {

            /**
             * Instantiates a Ajax Request Exception
             * 
             * @param status_code Status Code
             * @param {string} status_text Status Text
             * @param data Custom Exception Data
             */
            constructor: function(status_code, status_text, data) {
                inherited.constructor.call(this, status_code + ": " + status_text);
                this.__status_code = status_code;
                this.__status_text = status_text;
                this.__data = data;
            },

            /**
             * Returns the status code associated with the exception
             * 
             * @return {int} status code
             */
            status_code: function() {
                return this.__status_code;
            },

            /**
             * Returns the status text associated with the exception
             * 
             * @return {string} status text
             */
            status_text: function() {
                return this.__status_text;
            },

            /**
             * Returns the custom data associated with the exception 
             * 
             * @return custom data
             */
            data: function() {
                return this.__data;
            },

            /**
             * Returns a JSON representation of the exception
             * 
             * @return {object} Exception JSON representation
             */
            json: function() {
                return Objs.extend({
                    data: this.data(),
                    status_code: this.status_code(),
                    status_text: this.status_text()
                }, inherited.json.call(this));
            }

        };
    });
});
Scoped.define("module:Class", ["module:Types", "module:Objs", "module:Functions", "module:Ids"], function(Types, Objs, Functions, Ids) {
    var Class = function() {};

    /** @suppress {checkTypes} */
    Class.extend = function(options, objects, statics, class_statics) {
        objects = objects || [];
        if (!Types.is_array(objects))
            objects = [objects];
        statics = statics || [];
        if (!Types.is_array(statics))
            statics = [statics];
        class_statics = class_statics || [];
        if (!Types.is_array(class_statics))
            class_statics = [class_statics];

        var parent = this;

        objects = Objs.map(objects, function(obj) {
            if (Types.is_function(obj))
                obj = obj(parent.prototype);
            return obj;
        });

        var result;

        // Setup JavaScript Constructor
        Objs.iter(objects, function(obj) {
            if (obj.hasOwnProperty("constructor"))
                result = obj.constructor;
        });
        var has_constructor = Types.is_defined(result);
        if (!has_constructor) {
            result = function() {
                parent.prototype.constructor.apply(this, arguments);
            };
        }

        // Add Parent Statics
        Objs.extend(result, parent);

        // Add External Statics
        Objs.iter(statics, function(stat) {
            stat = Types.is_function(stat) ? stat(parent) : stat;
            var extender = result._extender;
            Objs.extend(result, stat);
            if (stat._extender)
                result._extender = Objs.extend(Objs.clone(extender, 1), stat._extender);
        });


        // Add Class Statics
        var class_statics_keys = {};
        if (parent.__class_statics_keys) {
            for (var key in parent.__class_statics_keys)
                result[key] = Objs.clone(parent[key], 1);
        }
        Objs.iter(class_statics, function(stat) {
            Objs.extend(result, stat);
            Objs.extend(class_statics_keys, Objs.keys(stat, true));
        });
        if (parent.__class_statics_keys)
            Objs.extend(class_statics_keys, parent.__class_statics_keys);
        result.__class_statics_keys = class_statics_keys;

        // Parent & Children Hierarchy
        result.parent = parent;
        result.children = [];
        result.extend = this.extend;
        if (!parent.children)
            parent.children = [];
        parent.children.push(result);

        // Setup Prototype
        var ctor = function() {};
        ctor.prototype = parent.prototype;
        result.prototype = new ctor();

        result.prototype.cls = result;


        options = Objs.extend({}, Types.is_string(options) ? {
            classname: options,
            register: true
        } : options);

        var classname = options.classname;
        if (options.scoped)
            classname = options.scoped.ns.path;

        result.classname = classname;
        if (classname && options.register)
            Scoped.setGlobal(classname, result);

        // Setup Prototype
        result.__notifications = {};
        result.__implements = {};

        if (parent.__notifications)
            Objs.extend(result.__notifications, parent.__notifications, 1);
        if (parent.__implements)
            Objs.extend(result.__implements, parent.__implements, 1);

        Objs.iter(objects, function(object) {
            for (var objkey in object)
                result.prototype[objkey] = result._extender && objkey in result._extender ? result._extender[objkey](result.prototype[objkey], object[objkey]) : object[objkey];
            //Objs.extend(result.prototype, object);

            // Note: Required for Internet Explorer
            if ("constructor" in object)
                result.prototype.constructor = object.constructor;

            if (object._notifications) {
                for (var key in object._notifications) {
                    if (!result.__notifications[key])
                        result.__notifications[key] = [];
                    result.__notifications[key].push(object._notifications[key]);
                }
            }
            if (object._implements) {
                Objs.iter(Types.is_string(object._implements) ? [object._implements] : object._implements, function(impl) {
                    result.__implements[impl] = true;
                });
            }
        });
        delete result.prototype._notifications;
        delete result.prototype._implements;

        if (!has_constructor) {
            result.prototype.constructor = function() {
                parent.prototype.constructor.apply(this, arguments);
            };
        }

        return result;
    };


    /*
     * 
     * Extending the Class
     * 
     */

    Objs.extend(Class, {

        classname: "Class",

        __class_guid: "0f5499f9-f0d1-4c6c-a561-ef026a1eee05",

        __notifications: {},

        /**
         * Determines whether this cls is an ancestor of another class.
         * 
         * @param {object} cls in question
         * 
         * @return {boolean} true if ancestor
         */
        ancestor_of: function(cls) {
            return (this == cls) || (this != Class && this.parent.ancestor_of(cls));
        },

        /**
         * Determines whether something is of type class.
         * 
         * @param cls class in question
         * 
         * @return {boolean} true if class
         */
        is_class: function(cls) {
            return cls && Types.is_object(cls) && ("__class_guid" in cls) && cls.__class_guid == this.__class_guid;
        },

        /**
         * Determines whether something is of type class instance.
         * 
         * @param obj instance in question
         * 
         * @return {boolean} true if class instance
         */
        is_class_instance: function(obj) {
            return obj && Types.is_object(obj) && ("__class_instance_guid" in obj) && obj.__class_instance_guid == this.prototype.__class_instance_guid;
        },

        /**
         * Determines whether something is pure json and not a class instance.
         * 
         * @param obj json in question
         * 
         * @return {boolean} true if pure json
         */
        is_pure_json: function(obj) {
            return obj && Types.is_object(obj) && !this.is_class_instance(obj) && Types.is_pure_object(obj);
        },

        /**
         * Determines whether an object is an instance of this class.
         * 
         * @param {object} obj object in question
         * 
         * @return {boolean} true if instance of class
         */
        is_instance_of: function(obj) {
            return obj && this.is_class_instance(obj) && obj.instance_of(this);
        },

        /**
         * Adhoc defines a new class.
         * 
         * @param parent scoped string of parent class or parent class
         * @param current scoped string of new class
         */
        define: function(parent, current) {
            var args = Functions.getArguments(arguments, 2);
            if (Types.is_object(parent)) {
                return Scoped.define(current, [], function(scoped) {
                    args.unshift({
                        scoped: scoped
                    });
                    return parent.extend.apply(parent, args);
                });
            } else {
                return Scoped.define(current, [parent], function(parent, scoped) {
                    args.unshift({
                        scoped: scoped
                    });
                    return parent.extend.apply(parent, args);
                });
            }
        },

        /**
         * Placeholder for an abstract function that should never be called.
         */
        abstractFunction: function() {
            throw "AbstractFunction";
        },

        /**
         * @deprecated
         */
        _inherited: function(cls, func) {
            return cls.parent[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
        }

    });






    /*
     * 
     * Extending the Object
     * 
     */

    Class.prototype.__class_instance_guid = "e6b0ed30-80ee-4b28-af02-7d52430ba45f";

    //Class.prototype.supportsGc = false;

    /**
     * Creates a new instance.
     */
    Class.prototype.constructor = function() {
        this._notify("construct");
    };

    /**
     * Destroys this instance.
     */
    Class.prototype.destroy = function() {
        this._notify("destroy");
        if (this.__auto_destroy_list) {
            this.__auto_destroy_list.forEach(function(obj) {
                if ("destroy" in obj)
                    obj.weakDestroy();
            }, this);
        }
        if (this.__auto_decrease_ref_list) {
            this.__auto_decrease_ref_list.forEach(function(obj) {
                if ("decreaseRef" in obj)
                    obj.decreaseRef(this);
            }, this);
        }
        var cid = this.cid();
        for (var key in this)
            delete this[key];
        Ids.objectId(this, cid);
        this.destroy = this.__destroyedDestroy;
    };

    /**
     * Determines whether this instance has already been destroyed.
     * 
     * @return {boolean} true if this instance has been destroyed
     */
    Class.prototype.destroyed = function() {
        return this.destroy === this.__destroyedDestroy;
    };

    /**
     * Weakly destroy this instance, only destroying it if it hasn't been destroyed already.
     */
    Class.prototype.weakDestroy = function() {
        if (!this.destroyed()) {
            if (this.__gc) {
                this.__gc.queue(this);
                return;
            }
            this.destroy();
        }
    };

    Class.prototype.__destroyedDestroy = function() {
        throw ("Trying to destroy destroyed object " + this.cid() + ": " + this.cls.classname + ".");
    };

    /**
     * Protects a function from being called recursively.
     *
     * @param ident string identifier of function
     * @param func function to be called
     */
    Class.prototype.recursionProtection = function(ident, func) {
        this.__recursionProtection = this.__recursionProtection || {};
        if (this.__recursionProtection[ident])
            return undefined;
        this.__recursionProtection[ident] = true;
        try {
            var result = func.apply(this);
            if (this && this.__recursionProtection)
                delete this.__recursionProtection[ident];
            return result;
        } catch (e) {
            if (this && this.__recursionProtection)
                delete this.__recursionProtection[ident];
            throw e;
        }
    };

    /**
     * Enable garbage collection for this instance.
     */
    Class.prototype.enableGc = function(gc) {
        if (this.supportsGc)
            this.__gc = gc;
        return this;
    };

    /**
     * Destroy another instance depending on this one.
     * 
     * @param {object} other other object that should be destroyed
     */
    Class.prototype.dependDestroy = function(other) {
        if (other.destroyed())
            return;
        if (this.__gc)
            other.enableGc();
        other.weakDestroy();
        return this;
    };

    /**
     * Returns the unique id of the object.
     * 
     * @return {string} unique id
     */
    Class.prototype.cid = function() {
        return Ids.objectId(this);
    };

    Class.prototype.cls = Class;

    /**
     * Generates a context-free function of a method.
     * 
     * @param {string} s name of method
     * 
     * @return {function} context-free function
     */
    Class.prototype.as_method = function(s) {
        return Functions.as_method(this[s], this);
    };

    /**
     * Automatically destroys an object when this object is being destroyed.
     * 
     * @param {object} obj
     * @param {boolean} returnSource return source object instead of obj
     */
    Class.prototype.auto_destroy = function(obj, returnSource) {
        if (obj) {
            if (!this.__auto_destroy_list)
                this.__auto_destroy_list = [];
            var target = obj;
            if (!Types.is_array(target))
                target = [target];
            for (var i = 0; i < target.length; ++i)
                this.__auto_destroy_list.push(target[i]);
        }
        return returnSource ? this : obj;
    };

    /**
     * Automatically decreases an object reference when this object is being destroyed.
     *
     * @param {object} obj
     * @param {boolean} returnSource return source object instead of obj
     */
    Class.prototype.auto_decrease_ref = function(obj, returnSource) {
        if (obj) {
            if (!this.__auto_decrease_ref_list)
                this.__auto_decrease_ref_list = [];
            var target = obj;
            if (!Types.is_array(target))
                target = [target];
            for (var i = 0; i < target.length; ++i)
                this.__auto_decrease_ref_list.push(target[i]);
        }
        return returnSource ? this : obj;
    };

    /**
     * Notify all notifications listeners of an internal notification event.
     * 
     * @param {string} name notification name
     * 
     * @protected
     */
    Class.prototype._notify = function(name) {
        if (!this.cls.__notifications)
            return;
        var rest = Array.prototype.slice.call(arguments, 1);
        Objs.iter(this.cls.__notifications[name], function(entry) {
            var method = Types.is_function(entry) ? entry : this[entry];
            if (!method)
                throw this.cls.classname + ": Could not find " + name + " notification handler " + entry;
            method.apply(this, rest);
        }, this);
    };

    /**
     * Checks whether this instance implements a certain mixin.
     *
     * @param identifier mixin identifier
     * 
     * @return {boolean} true if it implements the mixin
     */
    Class.prototype.impl = function(identifier) {
        return !!(this.cls.__implements && this.cls.__implements[Types.is_string(identifier) ? identifier : identifier._implements]);
    };

    /**
     * Determines whether this instance is an instance of a certain class.
     * 
     * @param {object} cls class in question
     * 
     * @return {boolean} true if instance is instance of class
     */
    Class.prototype.instance_of = function(cls) {
        return this.cls.ancestor_of(cls);
    };

    /**
     * Increases the reference counter of this instance.
     * 
     * @param {object} reference optional reference object
     * @param {boolean} autoDecreaseRef automatically decrease reference upon destruction
     */
    Class.prototype.increaseRef = function(reference, autoDecreaseRef) {
        this.__referenceCount = this.__referenceCount || 0;
        this.__referenceCount++;
        this.__referenceObjects = this.__referenceObjects || {};
        if (reference) {
            if (!this.__referenceObjects[reference.cid()])
                this.__referenceObjects[reference.cid()] = reference;
            else
                this.__referenceCount--;
            if (autoDecreaseRef)
                reference.auto_decrease_ref(this);
        }
        return this;
    };

    /**
     * Decreases the reference counter of this instance.
     * 
     * @param {object} reference optional reference object
     */
    Class.prototype.decreaseRef = function(reference) {
        this.__referenceCount = this.__referenceCount || 0;
        this.__referenceCount--;
        this.__referenceObjects = this.__referenceObjects || {};
        if (reference) {
            if (this.__referenceObjects[reference.cid()])
                delete this.__referenceObjects[reference.cid()];
            else
                this.__referenceCount++;
        }
        if (this.__referenceCount <= 0 && Types.is_empty(this.__referenceObjects))
            this.weakDestroy();
        return this;
    };

    /**
     * Inspects the instance for debugging purposes.
     * 
     * @return {object} json object describing the instance
     */
    Class.prototype.inspect = function() {
        return {
            header: {
                cid: this.cid(),
                classname: this.cls.classname,
                destroyed: this.destroyed()
            },
            attributes: {
                attributes_public: Objs.filter(this, function(value, key) {
                    return !Types.is_function(value) && key.indexOf("_") !== 0;
                }, this),
                attributes_protected: Objs.filter(this, function(value, key) {
                    return !Types.is_function(value) && key.indexOf("_") === 0 && key.indexOf("__") !== 0;
                }, this),
                attributes_private: Objs.filter(this, function(value, key) {
                    return !Types.is_function(value) && key.indexOf("__") === 0;
                }, this)
            },
            methods: {
                methods_public: Objs.filter(this, function(value, key) {
                    return Types.is_function(value) && key.indexOf("_") !== 0;
                }, this),
                methods_protected: Objs.filter(this, function(value, key) {
                    return Types.is_function(value) && key.indexOf("_") === 0 && key.indexOf("__") !== 0;
                }, this),
                method_private: Objs.filter(this, function(value, key) {
                    return Types.is_function(value) && key.indexOf("__") === 0;
                }, this)
            }
        };
    };



    /**
     * @deprecated
     */
    Class.prototype._auto_destroy = function(obj) {
        return this.auto_destroy(obj);
    };

    /**
     * @deprecated
     */
    Class.prototype._inherited = function(cls, func) {
        return cls.parent.prototype[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
    };

    return Class;

});
Scoped.define("module:Classes.InvokerMixin", [
    "module:Objs", "module:Types", "module:Functions"
], function(Objs, Types, Functions) {

    /**
     * Invoker Mixin, delegating method calls to an invocation function.
     * 
     * @mixin BetaJS.Classes.InvokerMixin
     */
    return {

        /**
         * Delegate member functio names to an invoker function.
         * 
         * @param {function} invoker invoker delegation function
         * @param {array} members array of member function names
         */
        invoke_delegate: function(invoker, members) {
            if (!Types.is_array(members))
                members = [members];
            invoker = this[invoker];
            var self = this;
            Objs.iter(members, function(member) {
                this[member] = function(member) {
                    return function() {
                        var args = Functions.getArguments(arguments);
                        args.unshift(member);
                        return invoker.apply(self, args);
                    };
                }.call(self, member);
            }, this);
        }
    };
});




Scoped.define("module:Classes.HelperClassMixin", [
    "module:Objs", "module:Types", "module:Functions", "module:Promise"
], function(Objs, Types, Functions, Promise) {

    /**
     * HelperClass Mixin
     * 
     * @mixin BetaJS.Classes.HelperClassMixin
     */
    return {

        /**
         * Add Helper Class
         * 
         * @param {class} helper_class helper class to add
         * @param {objects} options optional options
         * 
         * @return {object} added helper instance
         */
        addHelper: function(helper_class, options) {
            var helper = new helper_class(this, options);
            this.__helpers = this.__helpers || [];
            this.__helpers.push(this._auto_destroy(helper));
            return helper;
        },

        /**
         * Notify all helpers of a method call.
         * 
         * @param {objects} options method call options
         * @return accumlated return value
         */
        _helper: function(options) {
            this.__helpers = this.__helpers || [];
            if (Types.is_string(options)) {
                options = {
                    method: options
                };
            }
            options = Objs.extend({
                fold_start: null,
                fold: function(acc, result) {
                    return acc || result;
                }
            }, options);
            var args = Functions.getArguments(arguments, 1);
            var acc = options.async ? Promise.create(options.fold_start) : options.fold_start;
            for (var i = 0; i < this.__helpers.length; ++i) {
                var helper = this.__helpers[i];
                if (options.method in helper) {
                    if (options.async)
                        acc = Promise.func(options.fold, acc, Promise.methodArgs(helper, helper[options.method], args));
                    else
                        acc = options.fold(acc, helper[options.method].apply(helper, args));
                }
            }
            return acc;
        }

    };
});



Scoped.define("module:Classes.PathResolver", [
    "module:Class", "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Path Resolver Class
         * 
         * @class BetaJS.Classes.PathResolver
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} bindings path resolution bindings
             */
            constructor: function(bindings) {
                inherited.constructor.call(this);
                this._bindings = bindings || {};
            },

            /**
             * Extend instance by more bindings.
             * 
             * @param {object} bindings bindings to extend
             * @param {string} namespace optional namespace
             * 
             */
            extend: function(bindings, namespace) {
                if (namespace) {
                    for (var key in bindings) {
                        var value = bindings[key];
                        var regExp = /\{([^}]+)\}/;
                        while (true) {
                            var matches = regExp.exec(value);
                            if (!matches)
                                break;
                            value = value.replace(regExp, namespace + "." + matches[1]);
                        }
                        this._bindings[namespace + "." + key] = value;
                    }
                } else
                    this._bindings = Objs.extend(this._bindings, bindings);
            },

            /**
             * Map an array of path expressions to their resolutions.
             * 
             * @param {array} arr list of path expression
             * 
             * @return {array} resolved expressions
             */
            map: function(arr) {
                var result = [];
                for (var i = 0; i < arr.length; ++i) {
                    if (arr[i])
                        result.push(this.resolve(arr[i]));
                }
                return result;
            },

            /**
             * Resolve a path rexpression.
             * 
             * @param {string} path path expression to resolve
             * 
             * @return {string} resolved path expression
             */
            resolve: function(path) {
                var regExp = /\{([^}]+)\}/;
                while (true) {
                    var matches = regExp.exec(path);
                    if (!matches)
                        break;
                    path = path.replace(regExp, this._bindings[matches[1]]);
                }
                return this.simplify(path);
            },

            /**
             * Simplify a path expression.
             * 
             * @param {string} path path expression to simplify
             * 
             * @return {string} simplified path expression
             */
            simplify: function(path) {
                return path.replace(/[^\/]+\/\.\.\//, "").replace(/\/[^\/]+\/\.\./, "");
            }

        };
    });
});


Scoped.define("module:Classes.MultiDelegatable", [
    "module:Class", "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Multi Delegatable Class
         * 
         * @class BetaJS.Classes.MultiDelegatable
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {array} objects list of objects
             * @param {array} methods list of methods
             */
            constructor: function(objects, methods) {
                inherited.constructor.call(this);
                Objs.iter(methods, function(method) {
                    this[method] = function() {
                        var args = arguments;
                        Objs.iter(objects, function(object) {
                            object[method].apply(object, args);
                        }, this);
                        return this;
                    };
                }, this);
            }

        };
    });
});



Scoped.define("module:Classes.ObjectIdScopeMixin", function() {

    /**
     * Object Id Scope Mixin
     * 
     * @mixin BetaJS.Classes.ObjectIdScopeMixin
     */
    return {

        __objects: {},

        /**
         * Return object for specific id
         * 
         * @param {string} id id of object
         * 
         * @return {object} object in question
         */
        get: function(id) {
            return this.__objects[id];
        }

    };
});


Scoped.define("module:Classes.ObjectIdScope", [
    "module:Class", "module:Classes.ObjectIdScopeMixin"
], function(Class, Mixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, Mixin, function(inherited) {

        /**
         * Object Id Scope Class
         * 
         * @class BetaJS.Classes.ObjectIdScope
         */
        return {

            /**
             * Create or return singleton instance of this class.
             * 
             * @return {object} singleton instance
             */
            singleton: function() {
                if (!this.__singleton)
                    this.__singleton = new this();
                return this.__singleton;
            }
        };
    });
});


Scoped.define("module:Classes.SingletonMixin", [], function() {
    /**
     * SingletonMixin
     *
     * @mixin BetaJS.Classes.SingletonMixin
     */
    return {

        _notifications: {
            construct: "__singleton_create",
            destroy: "__singleton_destroy"
        },

        __singleton_create: function() {
            if (this.cls.__singleton)
                throw ("Can only create a single instance of " + this.cls.classname);
            this.cls.__singleton = this;
        },

        __singleton_destroy: function() {
            this.cls.__singleton = null;
        }

    };
});


Scoped.define("module:Classes.SingletonClassMixin", [], function() {
    /**
     * SingletonMixinClass
     *
     * @mixin BetaJS.Classes.SingletonMixinClass
     */
    return {

        singleton: function() {
            this.__singleton = this.__singleton || new this();
            return this.__singleton;
        }

    };
});


Scoped.define("module:Classes.ObjectIdMixin", [
    "module:Classes.ObjectIdScope"
], function(ObjectIdScope) {

    /**
     * Object Id Mixin
     * 
     * @mixin BetaJS.Classes.ObjectIdMixin
     */
    return {

        _notifications: {
            construct: "__register_object_id",
            destroy: "__unregister_object_id"
        },

        __object_id_scope: function() {
            if (!this.object_id_scope)
                this.object_id_scope = ObjectIdScope.singleton();
            return this.object_id_scope;
        },

        __register_object_id: function() {
            var scope = this.__object_id_scope();
            scope.__objects[this.cid()] = this;
        },

        __unregister_object_id: function() {
            var scope = this.__object_id_scope();
            delete scope.__objects[this.cid()];
        }

    };
});


Scoped.define("module:Classes.SharedObjectFactory", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Shared Object Factory Class
         *
         * @class BetaJS.Classes.SharedObjectFactory
         */
        return {

            /**
             * Creates a new factory.
             *
             * @param {function} createCallback callback function for creating an instance
             * @param {object} createContext optional callback context
             */
            constructor: function(createCallback, createContext, createArgs) {
                inherited.constructor.call(this);
                this.__createCallback = createCallback;
                this.__createContext = createContext;
                this.__createArgs = createArgs || [];
                this.__object = null;
            },

            /**
             * @override
             */
            destroy: function() {
                if (this.__object && !this.__object.destroyed())
                    this.__object.destroy();
                inherited.destroy.call(this);
            },

            /**
             * Return object instance.
             *
             * @returns {object} shared object instance
             */
            value: function() {
                return this.__object && !this.__object.destroyed() ? this.__object : null;
            },

            /**
             * Return true if acquired.
             *
             * @returns {boolean} true if acquired
             */
            isAcquired: function() {
                return !!this.value();
            },

            /**
             * Acquire object instance.
             *
             * @param {object} reference optional reference
             * @param {boolean} autoDecreaseRef automatically decrease reference upon destruction
             *
             * @returns {object} shared object instance
             */
            acquire: function(reference, autoDecreaseRef) {
                if (!this.__object || this.__object.destroyed())
                    this.__object = this.__createCallback.apply(this.__createContext || this, this.__createArgs);
                this.__object.increaseRef(reference, autoDecreaseRef);
                return this.__object;
            },

            /**
             * Release object instance.
             *
             * @param {object} obj object instance
             * @param {object} reference optional reference
             */
            release: function(obj, reference) {
                if (obj && obj === this.__object && !obj.destroyed())
                    obj.decreaseRef(obj);
            }

        };
    });
});


Scoped.define("module:Classes.SharedObjectFactoryPool", [
    "module:Class",
    "module:Objs",
    "module:Functions"
], function(Class, Objs, Functions, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Shared Object Factory Pool Class
         *
         * @class BetaJS.Classes.SharedObjectFactoryPool
         */
        return {

            /**
             * Creates a new factory pool.
             *
             * @param {function} createCallback callback function for creating a shared object factory instance
             * @param {object} createContext optional callback context
             */
            constructor: function(createCallback, createContext) {
                inherited.constructor.call(this);
                this.__createCallback = createCallback;
                this.__createContext = createContext;
                this.__cache = {};
            },

            /**
             * @override
             */
            destroy: function() {
                Objs.iter(this.__cache, function(instance) {
                    instance.weakDestroy();
                }, this);
                inherited.destroy.call(this);
            },

            acquire: function() {
                var args = Functions.getArguments(arguments);
                var serialized = JSON.stringify(args);
                if (!this.__cache[serialized] || this.__cache[serialized].destroyed())
                    this.__cache[serialized] = this.__createCallback.apply(this.__createContext || this, args);
                return this.__cache[serialized];
            }

        };
    });
});



Scoped.define("module:Classes.CriticalSectionMixin", [
    "module:Promise"
], function(Promise) {

    return {

        criticalSection: function(name, cb) {
            this.__criticalSections = this.__criticalSections || {};
            this.__criticalSections[name] = this.__criticalSections[name] || [];
            var promise = Promise.create();
            this.__criticalSections[name].push(promise);
            if (this.__criticalSections[name].length === 1)
                promise.asyncSuccess(true);
            return promise.mapSuccess(function() {
                return Promise.box(cb, this).callback(function() {
                    this.__criticalSections[name].shift();
                    if (this.__criticalSections[name].length > 0)
                        this.__criticalSections[name][0].asyncSuccess(true);
                }, this);
            }, this);
        }

    };
});



Scoped.define("module:Classes.CacheHash", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(prefix) {
                inherited.constructor.call(this);
                this.__prefix = prefix || "";
                this.__counter = 0;
                this.__cache = {};
                this.__hash = {};
            },

            hashKey: function(key) {
                if (key in this.__hash)
                    return this.__hash[key];
                var c = this.__prefix + this.__counter++;
                this.__hash[key] = c;
                this.__cache[c] = key;
                return c;
            },

            hash: function() {
                return this.__hash;
            },

            cache: function() {
                return this.__cache;
            }

        };
    });
});
Scoped.define("module:Comparators", ["module:Types", "module:Properties.Properties"], function(Types, Properties) {

    /**
     * Comparator Functions
     * 
     * @module BetaJS.Comparators
     */
    return {


        /**
         * Creates a function that compares two json object w.r.t. a json object, mapping keys to a comparison order,
         * e.g. {'last_name': 1, 'first_name': -1, 'age': -1 }  
         * 
         * @param {json} object comparison object
         * @return {function} function for comparing two objects w.r.t. the comparison object
         */
        byObject: function(object) {
            var self = this;
            return function(left, right) {
                for (var key in object) {
                    var c = 0;
                    if (Properties.is_class_instance(left) && Properties.is_class_instance(right))
                        c = self.byValue(left.get(key) || null, right.get(key) || null);
                    else
                        c = self.byValue(left[key] || null, right[key] || null);
                    if (c !== 0)
                        return c * object[key];
                }
                return 0;
            };
        },


        /**
         * Compares to variables by the natural order in JS.
         * 
         * @param a value A
         * @param b value B
         * @return {int} 1 if a > b, -1 if a < b and 0 otherwise
         */
        byValue: function(a, b) {
            if (Types.is_string(a))
                return a.localeCompare(b);
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
        },


        /**
         * Compares two values a and b recursively.
         * 
         * @param a value A
         * @param b value B
         * @param {int} depth depth limit for the recursion, leave blank for infinite recursion
         * @return {bool} true if both values are equal
         */
        deepEqual: function(a, b, depth) {
            if (depth === 0)
                return true;
            if (depth === 1)
                return a === b;
            if (Types.is_array(a) && Types.is_array(b)) {
                if (a.length !== b.length)
                    return false;
                for (var i = 0; i < a.length; ++i)
                    if (!this.deepEqual(a[i], b[i], depth - 1))
                        return false;
                return true;
            } else if (Types.is_object(a) && Types.is_object(b)) {
                if (!a || !b)
                    return a === b;
                for (var key in a)
                    if (!this.deepEqual(a[key], b[key], depth - 1))
                        return false;
                for (key in b)
                    if (!(key in a))
                        return false;
                return true;
            } else
                return a === b;
        },


        /**
         * Determines whether two lists are equal. Two lists are considered equal if their elements are equal.
         * 
         * @param a list A
         * @param b list B
         * @return {bool} true if both lists are equal
         */
        listEqual: function(a, b) {
            return this.deepEqual(a, b, 2);
        }

    };
});
Scoped.define("module:Compress", function() {

    /**
     * Compress Module
     * 
     * Contains simple and reasonably fast LZW Like Encode / Decode Functions
     * 
     * Differs from standard LZW in the following sense:
     *
     *   - If input contains characters not included in the initial dictionary, output stream sends:
     *       (1) dictionary.size + 1 (2) the input character
     *       
     *   - If dictionary size exceeds 2 bytes, the dictionary is reset
     * 
     * @module BetaJS.Compress
     */
    return {

        /**
         * LZW Like Encode Function
         * 
         * @param {string} input input string
         * @param {int} dict initial dictionary size, default is 1 byte
         * 
         * @param {string} UTF-8 encoded compressed string
         */
        lzw_like_encode: function(input, dict) {
            if (dict === undefined)
                dict = 256;
            var dictionary = new Map();
            var output = [];
            for (var i = 0; i < dict; ++i)
                dictionary.set(String.fromCharCode(i), i);
            var acc = "";
            for (var j = 0; j < input.length; ++j) {
                var c = input.charAt(j);
                if (!dictionary.has(c)) {
                    if (acc)
                        output.push(dictionary.get(acc));
                    dictionary.set(c, dictionary.size);
                    output.push(dictionary.size + 1);
                    output.push(input.charCodeAt(j));
                    acc = "";
                } else if (dictionary.has(acc + c)) {
                    acc += c;
                } else {
                    output.push(dictionary.get(acc));
                    dictionary.set(acc + c, dictionary.size);
                    acc = c;
                    if (dictionary.size >= 256 * 256 - 1) {
                        dictionary = new Map();
                        for (i = 0; i < dict; ++i)
                            dictionary.set(String.fromCharCode(i), i);
                        acc = "";
                        j--;
                    }
                }
            }
            if (acc)
                output.push(dictionary.get(acc));
            return output.map(function(i) {
                return String.fromCharCode(i);
            }).join("");
        },

        /**
         * LZW Like Decode Function
         * 
         * @param {string} input UTF-8 encoded compressed input string
         * @param {int} dict initial dictionary size, default is 1 byte
         * 
         * @param {string} decompressed string
         */
        lzw_like_decode: function(input, dict) {
            if (dict === undefined)
                dict = 256;
            var dictionary = [];
            var output = [];
            for (var i = 0; i < dict; ++i)
                dictionary.push(String.fromCharCode(i));
            var last = "";
            for (var j = 0; j < input.length; ++j) {
                var code = input.charCodeAt(j);
                if (code > dictionary.length) {
                    j++;
                    code = input.charCodeAt(j);
                    output.push(String.fromCharCode(code));
                    dictionary.push(String.fromCharCode(code));
                    last = "";
                } else {
                    var cur = code < dictionary.length ? dictionary[code] : (last + last.charAt(0));
                    output.push(cur);
                    if (last)
                        dictionary.push(last + cur.charAt(0));
                    last = cur;
                    if (dictionary.length >= 256 * 256 - 2) {
                        dictionary = [];
                        for (i = 0; i < dict; ++i)
                            dictionary.push(String.fromCharCode(i));
                        last = "";
                    }
                }
            }
            return output.join("");
        }

    };
});
Scoped.define("module:Events.EventsMixin", [
    "module:Timers.Timer",
    "module:Async",
    "module:Lists.LinkedList",
    "module:Functions",
    "module:Types",
    "module:Objs"
], function(Timer, Async, LinkedList, Functions, Types, Objs) {

    /**
     * Events Mixin
     * 
     * @mixin BetaJS.Events.EventsMixin
     */
    return {

        _implements: "3d63b44f-c9f0-4aa7-b39e-7cbf195122b4",

        _notifications: {
            "construct": function() {
                this.__suspendedEvents = 0;
                this.__suspendedEventsQueue = [];
            },
            "destroy": function() {
                this.off(null, null, null);
            }
        },

        EVENT_SPLITTER: /\s+/,

        __create_event_object: function(callback, context, options) {
            options = options || {};
            var obj = {
                callback: callback,
                context: context
            };
            if (options.eventually)
                obj.eventually = options.eventually;
            if (options.off_on_destroyed)
                obj.off_on_destroyed = options.off_on_destroyed;
            if (options.min_delay) {
                obj.min_delay = new Timer({
                    delay: options.min_delay,
                    once: true,
                    start: false,
                    context: this,
                    fire: function() {
                        if (obj.max_delay)
                            obj.max_delay.stop();
                        this.__invokeCallback(obj);
                    }
                });
            }
            if (options.max_delay) {
                obj.max_delay = new Timer({
                    delay: options.max_delay,
                    once: true,
                    start: false,
                    context: this,
                    fire: function() {
                        if (obj.min_delay)
                            obj.min_delay.stop();
                        this.__invokeCallback(obj);
                    }
                });
            }
            if (options.norecursion)
                obj.no_recursion = true;
            return obj;
        },

        __destroy_event_object: function(object) {
            if (object.min_delay)
                object.min_delay.destroy();
            if (object.max_delay)
                object.max_delay.destroy();
        },

        __invokeCallback: function(obj, params) {
            if (obj.off_on_destroyed && obj.context && obj.context.destroyed()) {
                this.off(null, null, obj);
                return;
            }
            if (obj.no_recursion && obj.in_recursion)
                return;
            obj.in_recursion = true;
            try {
                this._invokeCallback(obj.callback, obj.context || this, params || obj.params);
            } finally {
                obj.in_recursion = false;
            }
        },

        /**
         * @protected
         *
         * Invoke event callback
         *
         * @param {function} callback event callback function
         * @param {object} context callback context
         * @param {array} params parameters
         */
        _invokeCallback: function(callback, context, params) {
            callback.apply(context, params);
        },

        __call_event_object: function(object, params) {
            if (object.min_delay)
                object.min_delay.restart();
            if (object.max_delay)
                object.max_delay.start();
            if (!object.min_delay && !object.max_delay) {
                if (object.eventually) {
                    Async.eventually(function() {
                        this.__invokeCallback(object, params);
                    }, this, object.eventually === true ? 0 : object.eventually);
                } else
                    this.__invokeCallback(object, params);
            } else
                object.params = params;
        },

        /**
         * Listen to an event(s).
         * 
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         * @param {object} context optional callback context
         * @param {object} options optional options
         */
        on: function(events, callback, context, options) {
            this.__events_mixin_events = this.__events_mixin_events || {};
            events = events.split(this.EVENT_SPLITTER);
            var event;
            while (true) {
                event = events.shift();
                if (!event)
                    break;
                if (!this.__events_mixin_events[event])
                    this._notify("register_event", event);
                this.__events_mixin_events[event] = this.__events_mixin_events[event] || new LinkedList();
                var event_object = this.__create_event_object(callback, context, options);
                this.__events_mixin_events[event].add(event_object);
                if (this.__events_mixin_persistent_events && this.__events_mixin_persistent_events[event]) {
                    var argss = this.__events_mixin_persistent_events[event];
                    for (var i = 0; i < argss.length; ++i)
                        this.__call_event_object(event_object, argss[i]);
                }
                if (options && options.initcall)
                    this.__call_event_object(event_object, []);
            }
            return this;
        },

        /**
         * Stop listening to an event(s).
         * 
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         * @param {object} context optional callback context
         */
        off: function(events, callback, context) {
            this.__events_mixin_events = this.__events_mixin_events || {};
            if (events) {
                events = events.split(this.EVENT_SPLITTER);
                Objs.iter(events, function(event) {
                    if (this.__events_mixin_events[event]) {
                        this.__events_mixin_events[event].remove_by_filter(function(object) {
                            var result = (!callback || object.callback == callback) && (!context || object.context == context);
                            if (result && this.__destroy_event_object)
                                this.__destroy_event_object(object);
                            return result;
                        });
                        if (this.__events_mixin_events[event].count() === 0) {
                            this.__events_mixin_events[event].destroy();
                            delete this.__events_mixin_events[event];
                            this._notify("unregister_event", event);
                        }
                    }
                }, this);
            } else {
                Objs.iter(this.__events_mixin_events, function(evntobj, evnt) {
                    evntobj.remove_by_filter(function(object) {
                        var result = (!callback || object.callback == callback) && (!context || object.context == context);
                        if (result && this.__destroy_event_object)
                            this.__destroy_event_object(object);
                        return result;
                    });
                    if (evntobj.count() === 0) {
                        evntobj.destroy();
                        delete this.__events_mixin_events[evnt];
                        this._notify("unregister_event", evnt);
                    }
                }, this);
            }
            return this;
        },

        /**
         * Listen to an event(s) once.
         * 
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         * @param {object} context optional callback context
         * @param {object} options optional options
         */
        once: function(events, callback, context, options) {
            var self = this;
            var once = Functions.once(function() {
                self.off(events, once);
                callback.apply(this, arguments);
            });
            once._callback = callback;
            return this.on(events, once, context, options);
        },

        /**
         * Trigger an event(s) asynchronously.
         * 
         * @param {string} events events to be triggered
         */
        trigger: function(events) {
            if (this.__suspendedEvents > 0) {
                this.__suspendedEventsQueue.push(arguments);
                return this;
            }
            var self = this;
            events = events.split(this.EVENT_SPLITTER);
            var rest = Functions.getArguments(arguments, 1);
            var event;
            if (!this.__events_mixin_events)
                return this;
            Objs.iter(events, function(event) {
                if (this.__events_mixin_events[event])
                    this.__events_mixin_events[event].iterate(function(object) {
                        self.__call_event_object(object, rest);
                    });
                if (this.__events_mixin_events && "all" in this.__events_mixin_events)
                    this.__events_mixin_events.all.iterate(function(object) {
                        self.__call_event_object(object, [event].concat(rest));
                    });
            }, this);
            return this;
        },

        /**
         * Trigger an event(s) asynchronously.
         * 
         * @param {string} events events to be triggered
         */
        triggerAsync: function() {
            var self = this;
            var args = Functions.getArguments(arguments);
            var timeout = setTimeout(function() {
                clearTimeout(timeout);
                self.trigger.apply(self, args);
            }, 0);
            return this;
        },

        /**
         * Persistenly trigger an event(s).
         * 
         * @param {string} events events to be triggered
         */
        persistentTrigger: function(events) {
            var rest = Functions.getArguments(arguments, 1);
            this.__events_mixin_persistent_events = this.__events_mixin_persistent_events || [];
            Objs.iter(events.split(this.EVENT_SPLITTER), function(event) {
                this.__events_mixin_persistent_events[event] = this.__events_mixin_persistent_events[event] || [];
                this.__events_mixin_persistent_events[event].push(rest);
            }, this);
            this.trigger.apply(this, arguments);
            return this;
        },

        /**
         * Delegate certain events to this event object.
         * 
         * @param {string} events events to be delegated
         * @param {object} source source event object
         * @param {string} prefix optional event prefix for delegation
         * @param {array} params optional additional event params
         */
        delegateEvents: function(events, source, prefix, params) {
            params = params || [];
            prefix = prefix ? prefix + ":" : "";
            if (events === null) {
                source.on("all", function(event) {
                    var rest = Functions.getArguments(arguments, 1);
                    this.trigger.apply(this, [prefix + event].concat(params).concat(rest));
                }, this);
            } else {
                if (!Types.is_array(events))
                    events = [events];
                Objs.iter(events, function(event) {
                    source.on(event, function() {
                        var rest = Functions.getArguments(arguments);
                        this.trigger.apply(this, [prefix + event].concat(params).concat(rest));
                    }, this);
                }, this);
            }
            return this;
        },

        /**
         * Returns the parent event object in the chain.
         * 
         * @return {object} parent event object
         * 
         * @protected
         * @abstract
         */
        _eventChain: function() {},

        /**
         * Trigger an event locally and up the chain.
         * 
         * @param {string} eventName name of event
         * @param data event data
         */
        chainedTrigger: function(eventName, data) {
            data = Objs.extend({
                source: this,
                bubbles: true
            }, data);
            this.trigger(eventName, data);
            if (data.bubbles) {
                var chain = this._eventChain();
                if (chain && chain.chainedTrigger)
                    chain.chainedTrigger(eventName, data);
            }
            return this;
        },

        /**
         * Suspend all events until resumed.
         */
        suspendEvents: function() {
            this.__suspendedEvents++;
            return this;
        },

        /**
         * Resume all events.
         */
        resumeEvents: function() {
            this.__suspendedEvents--;
            if (this.__suspendedEvents !== 0)
                return this;
            Objs.iter(this.__suspendedEventsQueue, function(ev) {
                this.trigger.apply(this, ev);
            }, this);
            this.__suspendedEventsQueue = [];
            return this;
        }

    };
});


Scoped.define("module:Events.Events", ["module:Class", "module:Events.EventsMixin"], function(Class, Mixin, scoped) {
    /**
     * Events Class
     * 
     * @class BetaJS.Events.Events
     * @implements BetaJS.Events.EventsMixin
     */
    return Class.extend({
        scoped: scoped
    }, Mixin);
});


Scoped.define("module:Events.ListenMixin", [
    "module:Ids",
    "module:Objs",
    "module:Types"
], function(Ids, Objs, Types) {
    /**
     * Listen Mixin, automatically de-registering all listeners on destruction.
     * 
     * @mixin BetaJS.Events.ListenMixin
     */
    return {

        _notifications: {
            "destroy": "listenOff"
        },

        /**
         * Listen to an event.
         * 
         * @param {object} targets target(s) event emitter
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         * @param {object} options optional listener options
         */
        listenOn: function(targets, events, callback, options) {
            if (!this.__listen_mixin_listen)
                this.__listen_mixin_listen = {};
            if (!Types.is_array(targets))
                targets = [targets];
            targets.forEach(function(target) {
                this.__listen_mixin_listen[Ids.objectId(target)] = target;
                target.on(events, callback, this, options);
            }, this);
            return this;
        },

        /**
         * Listen to an event once.
         *
         * @param {object} targets target(s) event emitter
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         * @param {object} options optional listener options
         */
        listenOnce: function(targets, events, callback, options) {
            if (!this.__listen_mixin_listen)
                this.__listen_mixin_listen = {};
            if (!Types.is_array(targets))
                targets = [targets];
            targets.forEach(function(target) {
                this.__listen_mixin_listen[Ids.objectId(target)] = target;
                target.once(events, callback, this, options);
            }, this);
            return this;
        },

        /**
         * Stop Listenning to an event.
         *
         * @param {object} targets target(s) event emitter
         * @param {string} events event(s) to listen to
         * @param {function} callback event callback function
         */
        listenOff: function(targets, events, callback) {
            if (!this.__listen_mixin_listen)
                return this;
            if (!Types.is_array(targets))
                targets = [targets];
            targets.forEach(function(target) {
                if (target && !target.destroyed()) {
                    target.off(events, callback, this);
                    if (!events && !callback)
                        delete this.__listen_mixin_listen[Ids.objectId(target)];
                } else {
                    Objs.iter(this.__listen_mixin_listen, function(obj) {
                        if (obj && "off" in obj && !obj.destroyed())
                            obj.off(events, callback, this);
                        if (!events && !callback)
                            delete this.__listen_mixin_listen[Ids.objectId(obj)];
                    }, this);
                }
            }, this);
            return this;
        }

    };
});


Scoped.define("module:Events.Listen", ["module:Class", "module:Events.ListenMixin"], function(Class, Mixin, scoped) {
    /**
     * Listen Class
     * 
     * @class BetaJS.Events.Listen
     * @implements BetaJS.Events.ListenMixin
     */
    return Class.extend({
        scoped: scoped
    }, Mixin);
});
Scoped.define("module:Functions", ["module:Types"], function(Types) {

    /**
     * Function and Function Argument Support
     * 
     * @module BetaJS.Functions
     */
    return {

        /**
         * Returns the current stack trace.
         * 
         * @param {int} index optional stack trace start index
         * 
         * @return {array} stack trace array
         */
        getStackTrace: function(index) {
            var stack = (new Error()).stack.split("\n");
            while (stack.length > 0 && stack[0].trim().toLowerCase() === "error")
                stack.shift();
            return index ? stack.slice(index) : stack;
        },

        /**
         * Takes a function and an instance and returns the method call as a function
         * 
         * @param {function} func function
         * @param {object} instance instance
         * @return method call 
         */
        as_method: function(func, instance) {
            return function() {
                return func.apply(instance, arguments);
            };
        },

        /**
         * Takes a function name and returns the method call on the global object as a function
         *
         * @param {function} func function
         * @return method call
         */
        global_method: function(func) {
            var f = Scoped.getGlobal(func);
            return f ? this.as_method(f, Scoped.getGlobal()) : f;
        },


        /**
         * Takes a function and returns a function that calls the original function on the first call and returns the return value on all subsequent call. In other words a lazy function cache.
         * 
         * @param {function} func function
         * @return cached function 
         */
        once: function(func) {
            var result = false;
            var executed = false;
            return function() {
                if (executed)
                    return result;
                executed = true;
                result = func.apply(this, arguments);
                func = null;
                return result;
            };
        },


        /**
         * Converts some other function's arguments to an array
         * 
         * @param args function arguments
         * @param {integer} slice number of arguments to be omitted (default: 0)
         * @return {array} arguments as array 
         */
        getArguments: function(args, slice) {
            return Array.prototype.slice.call(args, slice || 0);
        },


        /**
         * Matches functions arguments against some pattern
         * 
         * @param args function arguments
         * @param {integer} skip number of arguments to be omitted (default: 0) 
         * @param {object} pattern typed pattern
         * @return {object} matched arguments as associative array 
         */
        matchArgs: function(args, skip, pattern) {
            if (arguments.length < 3) {
                pattern = skip;
                skip = 0;
            }
            var i = skip;
            var result = {};
            for (var key in pattern) {
                var config = pattern[key];
                if (config === true)
                    config = {
                        required: true
                    };
                else if (typeof config == "string")
                    config = {
                        type: config
                    };
                if (config.required || (config.type && Types.type_of(args[i]) == config.type)) {
                    result[key] = args[i];
                    i++;
                } else if (config.def) {
                    result[key] = Types.is_function(config.def) ? config.def(result) : config.def;
                }
            }
            return result;
        },


        /**
         * Creates a function for creating new instances of a class.
         *  
         * @param {object} cls Class
         * @return {function} class instantiation function 
         * @suppress {checkTypes}
         */
        newClassFunc: function(cls) {
            return function() {
                var args = arguments;

                function F() {
                    return cls.apply(this, args);
                }
                F.prototype = cls.prototype;
                return new F();
            };
        },


        /**
         * Creates a new class instance with arguments.
         *  
         * @param {object} cls Class
         * @return {function} class instance 
         */
        newClass: function(cls) {
            return this.newClassFunc(cls).apply(this, this.getArguments(arguments, 1));
        },


        /**
         * Call an object method.
         *  
         * @param {object} context object instance
         * @param method function or string of method
         * @return result of function call 
         */
        callWithin: function(context, method) {
            if (Types.is_string(method))
                method = context[method];
            return method.apply(context, this.getArguments(arguments, 2));
        }

    };
});
Scoped.define("module:Events.HooksMixin", [
    "module:Promise",
    "module:Functions"
], function(Promise, Functions) {

    var sequential = function(promise, funcs) {
        if (funcs.length > 0) {
            return promise.mapSuccess(function(result) {
                var func = funcs.shift();
                return sequential(Promise.value(func(result)), funcs);
            });
        } else
            return promise;
    };

    /**
     * Hooks Mixin
     * 
     * @mixin BetaJS.Events.HooksMixin
     */
    return {

        _implements: "e07d77f0-d9d5-41dc-ae4d-20fb8af0a334",

        _notifications: {
            "construct": function() {
                this.__methodHooks = {};
            }
        },

        registerHook: function(method, func, ctx) {
            this.__methodHooks[method] = this.__methodHooks[method] || [];
            this.__methodHooks[method].push(Functions.as_method(func, ctx || this));
        },

        invokeHook: function(method, result) {
            return sequential(Promise.value(result), this.__methodHooks[method] || []);
        }

    };
});
Scoped.define("module:Ids", [
    "module:Types",
    "module:Objs"
], function(Types, Objs) {

    /**
     * Id Generation
     * 
     * @module BetaJS.Ids
     */
    return {

        __uniqueId: 0,


        /**
         * Returns a unique identifier
         * 
         * @param {string} prefix a prefix string for the identifier (optional)
         * @return {string} unique identifier
         */
        uniqueId: function(prefix) {
            return (prefix || "") + (this.__uniqueId++);
        },


        /**
         * Returns the object's unique identifier or sets it
         * 
         * @param {object} object the object
         * @param {string} id (optional)
         * @return {string} object's unique identifier
         */
        objectId: function(object, id) {
            if (!object)
                return undefined;
            if (id !== undefined)
                object.__cid = id;
            else if (!object.__cid)
                object.__cid = this.uniqueId("cid_");
            return object.__cid;
        },

        /**
         * Returns a unique key for any given value of any type.
         * This is not a hash value.
         * 
         * @param value a value to generate a unique key
         * @param {int} depth optional depth for exploring by value instead of by reference
         * @return unique key
         */
        uniqueKey: function(value, depth) {
            if (depth && depth > 0 && (Types.is_object(value) || Types.is_array(value))) {
                return JSON.stringify(Objs.map(value, function(x) {
                    return this.uniqueKey(x, depth - 1);
                }, this));
            }
            if ((value !== null && Types.is_object(value)) || Types.is_array(value) || Types.is_function(value))
                return this.objectId(value);
            return value;
        }

    };
});


Scoped.define("module:IdGenerators.IdGenerator", ["module:Class"], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, {

        generate: function(ctx) {},

        valid: function(id, ctx) {
            return false;
        }

    });
});


Scoped.define("module:IdGenerators.PrefixedIdGenerator", ["module:IdGenerators.IdGenerator"], function(IdGenerator, scoped) {
    return IdGenerator.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(prefix, generator) {
                inherited.constructor.call(this);
                this.__prefix = prefix;
                this.__generator = generator;
            },

            generate: function(ctx) {
                return this.__prefix + this.__generator.generate(ctx);
            },

            valid: function(id, ctx) {
                return id.indexOf(this.__prefix) === 0 && this.__generator.valid(id.substring(this.__prefix.length), ctx);
            }

        };
    });
});


Scoped.define("module:IdGenerators.RandomIdGenerator", ["module:IdGenerators.IdGenerator", "module:Tokens"], function(IdGenerator, Tokens, scoped) {
    return IdGenerator.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(length) {
                inherited.constructor.call(this);
                this.__length = length || 16;
            },

            generate: function(ctx) {
                return Tokens.generate_token(this.__length);
            },

            valid: function(id, ctx) {
                return id.length === this.__length;
            }

        };
    });
});


Scoped.define("module:IdGenerators.ConsecutiveIdGenerator", ["module:IdGenerators.IdGenerator"], function(IdGenerator, scoped) {
    return IdGenerator.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(initial) {
                inherited.constructor.call(this);
                this.__current = initial || 0;
            },

            generate: function(ctx) {
                this.__current++;
                return this.__current;
            },

            valid: function(id, ctx) {
                return !isNaN(id);
            }

        };
    });
});


Scoped.define("module:IdGenerators.TimedIdGenerator", ["module:IdGenerators.IdGenerator", "module:Time"], function(IdGenerator, Time, scoped) {
    return IdGenerator.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function() {
                inherited.constructor.call(this);
                this.__current = Time.now() - 1;
            },

            generate: function(ctx) {
                var now = Time.now();
                this.__current = now > this.__current ? now : (this.__current + 1);
                return this.__current;
            },

            valid: function(id, ctx) {
                return !isNaN(id);
            }

        };
    });
});
Scoped.define("module:KeyValue.KeyValueStore", [
    "module:Class",
    "module:Events.EventsMixin"
], function(Class, EventsMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

        /**
         * Abstract Key Value Store
         * 
         * @class BetaJS.KeyValue.KeyValueStore
         */
        return {

            /**
             * Determines whether a key exists in the store.
             * 
             * @param {string} key key to check
             * 
             * @return {boolean} true if key exists
             */
            mem: function(key) {
                return this._mem(key);
            },

            /**
             * Returns the value for a key in the store.
             * 
             * @param {string} key key to get the value for
             * 
             * @return value of key
             */
            get: function(key) {
                return this._get(key);
            },

            /**
             * Sets the value of a key in the store.
             * 
             * @param {string} key key to set the value for
             * @param value new value for key
             * @fires BetaJS.KeyValue.KeyValueStore#change
             */
            set: function(key, value) {
                this._set(key, value);
                /**
                 * @event BetaJS.KeyValue.KeyValueStore#change
                 */
                this.trigger("change:" + key, value);
            },

            /**
             * Removes a key from the store
             * 
             * @param {string} key key to be removed
             */
            remove: function(key) {
                this._remove(key);
            }

        };
    }]);
});


Scoped.define("module:KeyValue.PrefixKeyValueStore", [
    "module:KeyValue.KeyValueStore"
], function(KeyValueStore, scoped) {
    return KeyValueStore.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated Key-Value-Store by automatically prefixing keys.
         * 
         * @class BetaJS.KeyValue.PrefixKeyValueStore
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} kv Underlying Key-Value store
             * @param {string} prefix prefix string to be used for all keys
             */
            constructor: function(kv, prefix) {
                inherited.constructor.call(this);
                this.__kv = kv;
                this.__prefix = prefix;
            },

            /**
             * @override
             */
            _mem: function(key) {
                return this.__kv.mem(this.__prefix + key);
            },

            /**
             * @override
             */
            _get: function(key) {
                return this.__kv.get(this.__prefix + key);
            },

            /**
             * @override
             */
            _set: function(key, value) {
                this.__kv.set(this.__prefix + key, value);
            },

            /**
             * @override
             */
            _remove: function(key) {
                this.__kv.remove(this.__prefix + key);
            }

        };
    });
});


Scoped.define("module:KeyValue.MemoryKeyValueStore", [
    "module:KeyValue.KeyValueStore",
    "module:Objs"
], function(KeyValueStore, Objs, scoped) {
    return KeyValueStore.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A Memory-based Key-Value-Store.
         * 
         * @class BetaJS.KeyValue.MemoryKeyValueStore
         */
        return {

            /**
             * Creates a new Memory KV-Store
             * 
             * @param {object} data Initial data object
             * @param {boolean} clone Should the initial data object be cloned or used directly (default: false)
             */
            constructor: function(data, clone) {
                inherited.constructor.call(this);
                this.__data = Objs.clone(data, clone ? 1 : 0);
            },

            /**
             * @override
             */
            _mem: function(key) {
                return key in this.__data;
            },

            /**
             * @override
             */
            _get: function(key) {
                return this.__data[key];
            },

            /**
             * @override
             */
            _set: function(key, value) {
                this.__data[key] = value;
            },

            /**
             * @override
             */
            _remove: function(key) {
                delete this.__data[key];
            }

        };
    });
});


Scoped.define("module:KeyValue.DefaultKeyValueStore", [
    "module:KeyValue.KeyValueStore"
], function(KeyValueStore, scoped) {
    return KeyValueStore.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated KV-Store falling back to a default KV-Store if a key is not defined.
         * 
         * @class BetaJS.KeyValue.DefaultKeyValueStore
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} kv The main underlying key value store
             * @param {object} def The default key value store that we fallback to if a key is not defined in the main key value store
             */
            constructor: function(kv, def) {
                inherited.constructor.call(this);
                this.__kv = kv;
                this.__def = def;
            },

            /**
             * @override
             */
            _mem: function(key) {
                return this.__kv.mem(key) || this.__def.mem(key);
            },

            /**
             * @override
             */
            _get: function(key) {
                return this.__kv.mem(key) ? this.__kv.get(key) : this.__def.get(key);
            },

            /**
             * @override
             */
            _set: function(key, value) {
                this.__kv.set(key, value);
            },

            /**
             * @override
             */
            _remove: function(key) {
                this.__kv.remove(key);
            }

        };
    });
});
Scoped.define("module:Lists.AbstractList", [
    "module:Class",
    "module:Objs",
    "module:Types",
    "module:Iterators.ArrayIterator"
], function(Class, Objs, Types, ArrayIterator, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract List Class
         * 
         * @class BetaJS.Lists.AbstractList
         */
        return {

            /**
             * Add an object to the list.
             * 
             * @param {object} object Object to be added
             * @return {string} ident of object
             */
            _add: function(object) {},

            /**
             * Remove an object from the list.
             * 
             * @param {string} ident Ident of object to be removed.
             * @return {object} removed object
             */
            _remove: function(ident) {},

            /**
             * Get an object by ident.
             * 
             * @param {string} ident Ident of object
             * @return {object} object matching the ident
             */
            _get: function(ident) {},

            /**
             * Iterate over all objects in the list.
             * 
             * @param {function} callback callback function for iteration
             * @param {object} context optional context for callback function
             */
            _iterate: function(callback, context) {},

            /**
             * Given an object, return the ident of the object.
             * 
             * @param {object} object object in question
             * @return {string} ident of object
             */
            get_ident: function(object) {
                var ident = null;
                this._iterate(function(obj, id) {
                    if (obj == object) {
                        ident = id;
                        return false;
                    }
                    return true;
                });
                return ident;
            },

            /**
             * Determines whether an object exists in the list.
             * 
             * @param {object} object object in question
             * @return {boolean} true if object is contained in list
             */
            exists: function(object) {
                return object && this.get_ident(object) !== null;
            },

            /**
             * Notification when an object obtains a new ident.
             * 
             * @param {object} object object in question
             * @param {string} new_ident new identifier of object
             */
            _ident_changed: function(object, new_ident) {},

            /**
             * Creates a new instance.
             * 
             * @param {array} objects optional array of initial objects to be added to the list
             */
            constructor: function(objects) {
                inherited.constructor.call(this);
                this.__count = 0;
                if (objects) {
                    Objs.iter(objects, function(object) {
                        this.add(object);
                    }, this);
                }
            },

            /**
             * Add an object to the list.
             * 
             * @param {object} object Object to be added
             * @return {string} ident of object
             */
            add: function(object) {
                var ident = this._add(object);
                if (Types.is_defined(ident))
                    this.__count++;
                return ident;
            },

            /**
             * Returns the number of objects contained in the list.
             * 
             * @return {int} number of objects
             */
            count: function() {
                return this.__count;
            },

            /**
             * Removes all objects from the list.
             * 
             */
            clear: function() {
                this._iterate(function(object, ident) {
                    this.remove_by_ident(ident);
                    return true;
                }, this);
            },

            /**
             * Remove an object from the list by identifier.
             * 
             * @param {string} ident Ident of object to be removed.
             * @return {object} removed object
             */
            remove_by_ident: function(ident) {
                var ret = this._remove(ident);
                if (Types.is_defined(ret))
                    this.__count--;
                return ret;
            },

            /**
             * Remove an object from the list.
             * 
             * @param {object} object object in question
             * @return {object} removed object
             */
            remove: function(object) {
                return this.remove_by_ident(this.get_ident(object));
            },

            /**
             * Remove objects from the list that match a filter function.
             * 
             * @param {function} filter filter function for object
             */
            remove_by_filter: function(filter) {
                this._iterate(function(object, ident) {
                    if (filter(object))
                        this.remove_by_ident(ident);
                    return true;
                }, this);
            },

            /**
             * Get an object by ident.
             * 
             * @param {string} ident Ident of object
             * @return {object} object matching the ident
             */
            get: function(ident) {
                return this._get(ident);
            },

            /**
             * Iterate over all objects in the list.
             * 
             * @param {function} callback callback function for iteration
             * @param {object} context optional context for callback function
             */
            iterate: function(cb, context) {
                this._iterate(function(object, ident) {
                    var ret = cb.call(this, object, ident);
                    return Types.is_defined(ret) ? ret : true;
                }, context);
            },

            /**
             * Creates an iterator for the list.
             * 
             * @return {object} iterator for list
             */
            iterator: function() {
                return ArrayIterator.byIterate(this.iterate, this);
            }

        };
    });
});


Scoped.define("module:Lists.LinkedList", [
    "module:Lists.AbstractList"
], function(AbstractList, scoped) {
    return AbstractList.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Linked List Implementation of List
         * 
         * @class BetaJS.Lists.LinkedList
         */
        return {

            __first: null,
            __last: null,

            /**
             * @override
             */
            _add: function(obj) {
                this.__last = {
                    obj: obj,
                    prev: this.__last,
                    next: null
                };
                if (this.__first)
                    this.__last.prev.next = this.__last;
                else
                    this.__first = this.__last;
                return this.__last;
            },

            /**
             * @override
             */
            _remove: function(container) {
                if (container.next)
                    container.next.prev = container.prev;
                else
                    this.__last = container.prev;
                if (container.prev)
                    container.prev.next = container.next;
                else
                    this.__first = container.next;
                return container.obj;
            },

            /**
             * @override
             */
            _get: function(container) {
                return container.obj;
            },

            /**
             * @override
             */
            _iterate: function(cb, context) {
                var current = this.__first;
                while (current) {
                    var prev = current;
                    current = current.next;
                    if (!cb.apply(context || this, [prev.obj, prev]))
                        return;
                }
            }

        };
    });
});


Scoped.define("module:Lists.ObjectIdList", [
    "module:Lists.AbstractList",
    "module:Ids"
], function(AbstractList, Ids, scoped) {
    return AbstractList.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Object Id List Class
         * 
         * @class BetaJS.Lists.ObjectIdList
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {array} objects optional initial set of objects
             * @param {function} id_generator optional id generating function
             */
            constructor: function(objects, id_generator) {
                this.__map = {};
                this.__id_generator = id_generator;
                inherited.constructor.call(this, objects);
            },

            /**
             * @override
             */
            _add: function(object) {
                var id = object.__cid;
                if (!id) {
                    while (true) {
                        id = this.__id_generator ? Ids.objectId(object, this.__id_generator()) : Ids.objectId(object);
                        if (!this.__map[id] || !this.__id_generator)
                            break;
                    }
                }
                this.__map[id] = object;
                return id;
            },

            /**
             * @override
             */
            _remove: function(ident) {
                var obj = this.__map[ident];
                delete this.__map[ident];
                return obj;
            },

            /**
             * @override
             */
            _get: function(ident) {
                return this.__map[ident];
            },

            /**
             * @override
             */
            _iterate: function(callback, context) {
                for (var key in this.__map)
                    callback.apply(context || this, [this.__map[key], key]);
            },

            /**
             * @override
             */
            get_ident: function(object) {
                var ident = Ids.objectId(object);
                return this.__map[ident] ? ident : null;
            }

        };
    });
});



Scoped.define("module:Lists.ArrayList", ["module:Lists.AbstractList", "module:Ids", "module:Objs"], function(AbstractList, Ids, Objs, scoped) {
    return AbstractList.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Array List Class
         * 
         * @class BetaJS.Lists.ArrayList
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {array} objects optional initial set of objects
             * @param {options} options optional options parameter
             */
            constructor: function(objects, options) {
                this.__idToIndex = {};
                this.__items = [];
                options = options || {};
                if ("compare" in options)
                    this._compare = options.compare;
                if ("get_ident" in options)
                    this._get_ident = options.get_ident;
                inherited.constructor.call(this, objects);
            },

            /**
             * Set current compare function.
             * 
             * @param {function} compare compare function
             */
            set_compare: function(compare) {
                this._compare = compare;
                if (compare)
                    this.sort();
            },

            /**
             * Get current compare function.
             * 
             * @return {function} current compare function
             */
            get_compare: function() {
                return this._compare;
            },

            /**
             * Sort list using a compare function.
             * 
             * @param {function} compare compare function
             */
            sort: function(compare) {
                compare = compare || this._compare;
                if (!compare)
                    return;
                this.__items.sort(compare);
                for (var i = 0; i < this.__items.length; ++i)
                    this.__ident_changed(this.__items[i], i);
                this._sorted();
            },

            _sorted: function() {},

            /**
             * Reindex the index of an item.
             * 
             * @param {int} index index of the item
             * 
             * @return {int} new index of the item
             */
            re_index: function(index) {
                if (!this._compare)
                    return index;
                var last = this.__items.length - 1;
                var object = this.__items[index];
                var i = index;
                while (i < last && this._compare(this.__items[i], this.__items[i + 1]) > 0) {
                    this.__items[i] = this.__items[i + 1];
                    this.__ident_changed(this.__items[i], i);
                    this.__items[i + 1] = object;
                    ++i;
                }
                if (i == index) {
                    while (i > 0 && this._compare(this.__items[i], this.__items[i - 1]) < 0) {
                        this.__items[i] = this.__items[i - 1];
                        this.__ident_changed(this.__items[i], i);
                        this.__items[i - 1] = object;
                        --i;
                    }
                }
                if (i != index) {
                    this.__ident_changed(object, i);
                    this._re_indexed(object);
                }
                return i;
            },

            _re_indexed: function(object) {},

            __objectId: function(object) {
                return this._get_ident ? this._get_ident(object) : Ids.objectId(object);
            },

            /**
             * @override
             */
            _add: function(object) {
                var last = this.__items.length;
                this.__items.push(object);
                var i = this.re_index(last);
                this.__idToIndex[this.__objectId(object)] = i;
                return i;
            },

            /**
             * @override
             */
            _remove: function(ident) {
                var obj = this.__items[ident];
                for (var i = ident + 1; i < this.__items.length; ++i) {
                    this.__items[i - 1] = this.__items[i];
                    this.__ident_changed(this.__items[i - 1], i - 1);
                }
                this.__items.pop();
                delete this.__idToIndex[this.__objectId(obj)];
                return obj;
            },

            /**
             * @override
             */
            _get: function(ident) {
                return this.__items[ident];
            },

            /**
             * @override
             */
            _iterate: function(callback, context) {
                var items = Objs.clone(this.__items, 1);
                for (var i = 0; i < items.length; ++i)
                    callback.apply(context || this, [items[i], this.get_ident(items[i])]);
            },

            __ident_changed: function(object, index) {
                this.__idToIndex[this.__objectId(object)] = index;
                this._ident_changed(object, index);
            },

            /**
             * @override
             */
            get_ident: function(object) {
                var id = this.__objectId(object);
                return id in this.__idToIndex ? this.__idToIndex[id] : null;
            },

            /**
             * Returns the identifier given an id.
             * 
             * @param {string} id id
             * 
             * @return {string} identifier
             */
            ident_by_id: function(id) {
                return this.__idToIndex[id];
            }

        };
    });
});
Scoped.define("module:Objs", [
    "module:Types",
    "module:Functions"
], function(Types, Functions) {

    /**
     * Object and Array Manipulation Routines
     * 
     * @module BetaJS.Objs
     */
    return {

        /**
         * Return the i-th key of an object.
         * 
         * @param {object} obj the object
         * @param {int} i index of the i-th key (default: 0)
         * 
         * @return {string} i-th key
         */
        ithKey: function(obj, i) {
            i = i || 0;
            for (var key in obj) {
                if (i <= 0)
                    return key;
                else
                    --i;
            }
            return null;
        },

        /**
         * Return the i-th value of an object.
         * 
         * @param {object} obj the object
         * @param {int} i index of the i-th value (default: 0)
         * 
         * @return {string} i-th value
         */
        ithValue: function(obj, i) {
            i = i || 0;
            for (var key in obj) {
                if (i <= 0)
                    return obj[key];
                else
                    --i;
            }
            return null;
        },

        /**
         * Return the i-th value of an object or array.
         * 
         * @param obj the object or array
         * @param {int} idx index of the i-th value (default: 0)
         * 
         * @return {string} i-th value
         */
        valueByIndex: function(obj, idx) {
            return Types.is_array(obj) ? obj[idx || 0] : this.ithValue(obj, idx);
        },

        /**
         * Return the i-th key of an object or array.
         * 
         * @param obj the object or array
         * @param {int} idx index of the i-th key (default: 0)
         * 
         * @return i-th key
         */
        keyByIndex: function(obj, idx) {
            return Types.is_array(obj) ? idx || 0 : this.ithKey(obj, idx);
        },

        /**
         * Returns the number of elements of an object or array.
         * 
         * @param obj object or array
         * 
         * @return {int} number of elements
         */
        count: function(obj) {
            if (Types.is_array(obj))
                return obj.length;
            else {
                var c = 0;
                for (var key in obj)
                    c++;
                return c;
            }
        },

        /**
         * Clone an object or array up to a certain depth.
         * 
         * @param item object or array
         * @param {int} depth depth until to clone it (default 0)
         * 
         * @return cloned object or array
         */
        clone: function(item, depth) {
            if (!item || !depth || depth === 0)
                return item;
            if (Types.is_array(item))
                return item.slice(0);
            else if (Types.is_object(item))
                return this.extend({}, item, depth - 1);
            else
                return item;
        },

        /**
         * Acyclicly clone an object.
         * 
         * @param {object} object source object
         * 
         * @return acyclic cloned object
         */
        acyclic_clone: function(object) {
            if (object === null || !Types.is_object(object))
                return object;
            var s = "__acyclic_cloned";
            if (object[s])
                return object[s];
            var result = {};
            object[s] = result;
            for (var key in object)
                if (key !== s)
                    result[key] = this.acyclic_clone(object[key]);
            delete object[s];
            return result;
        },

        /**
         * Extend target object by source object, modifying target object in-place.
         * 
         * @param {object} target target object
         * @param {object} source source object
         * @param {int} depth optional depth for cloning source values
         * 
         * @return {object} target object
         */
        extend: function(target, source, depth) {
            target = target || {};
            if (source) {
                for (var key in source)
                    target[key] = this.clone(source[key], depth);
            }
            return target;
        },

        /**
         * Extend target object by source objects, modifying target object in-place.
         *
         */
        multi_extend: function() {
            var args = Functions.getArguments(arguments);
            var depth;
            if (!Types.is_object(args[args.length - 1])) {
                depth = args[args.length - 1];
                args.pop();
            }
            while (args.length > 1) {
                args[1] = this.extend(args[0], args[1], depth);
                args.shift();
            }
            return args[0];
        },

        /**
         * Weakly extend target object by source object, modifying target object in-place.
         * If a key already exists within the target object, it is not overwritten by source.
         * 
         * @param {object} target target object
         * @param {object} source source object
         * @param {int} depth optional depth for cloning source values
         * 
         * @return {object} target object
         */
        weak_extend: function(target, source, depth) {
            target = target || {};
            if (source) {
                for (var key in source) {
                    if (!(key in target))
                        target[key] = this.clone(source[key], depth);
                }
            }
            return target;
        },

        /**
         * Extend target object by source object recursively, modifying target object in-place.
         * 
         * @param {object} target target object
         * @param {object} source source object
         * @param {int} depth optional depth for cloning source values
         * 
         * @return {object} target object
         */
        tree_extend: function(target, source, depth) {
            target = target || {};
            if (source) {
                for (var key in source) {
                    if (key in target && Types.is_object(target[key]) && Types.is_object(source[key]) && !Types.is_array(target[key]) && !Types.is_array(source[key]))
                        target[key] = this.tree_extend(target[key], source[key], depth);
                    else
                        target[key] = this.clone(source[key], depth);
                }
            }
            return target;
        },

        /**
         * Returns the keys of an object.
         * If mapped is given, an object is returned with all keys mapped to mapped. Otherwise, an array is returned.
         * 
         * @param {object} object source object
         * @param mapped optional value
         * 
         * @return keys as array or as an object
         */
        keys: function(obj, mapped) {
            var result = null;
            var key = null;
            if (Types.is_undefined(mapped)) {
                result = [];
                for (key in obj)
                    result.push(key);
                return result;
            } else {
                result = {};
                for (key in obj)
                    result[key] = mapped;
                return result;
            }
        },

        /**
         * Returns true if all key-value-pairs of the first object are contained in the second object.
         * 
         * @param a first object or array
         * @param b second object or array
         * 
         * @return {boolean} true if first contained in second
         */
        subset_of: function(a, b) {
            a = Types.is_array(a) ? this.objectify(a) : a;
            b = Types.is_array(b) ? this.objectify(b) : b;
            for (var key in a)
                if (a[key] != b[key])
                    return false;
            return true;
        },

        /**
         * Returns true if all key-value-pairs of the second object are contained in the first object.
         * 
         * @param a first object or array
         * @param b second object or array
         * 
         * @return {boolean} true if second contained in first
         */
        superset_of: function(a, b) {
            return this.subset_of(b, a);
        },

        /**
         * Converts an array into an object by pairing together odd and even items.
         * 
         * @param {array} arr array with pairs
         * 
         * @return {object} created object
         */
        pairArrayToObject: function(arr) {
            var result = {};
            for (var i = 0; i < arr.length / 2; i += 2)
                result[arr[i]] = arr[i + 1];
            return result;
        },

        /**
         * Converts a list of arguments into an object by pairing together odd and even arguments.
         * 
         * @return {object} created object
         */
        pairsToObject: function() {
            var result = {};
            for (var i = 0; i < arguments.length; ++i)
                result[arguments[i][0]] = arguments[i][1];
            return result;
        },

        /**
         * Inverses the key-value pairs in an object.
         * 
         * @param {object} obj object to be reversed
         * @return {object} object with reversed key-value-pairs
         */
        inverseKeyValue: function(obj) {
            var result = {};
            this.iter(obj, function(value, key) {
                result[value] = key;
            });
            return result;
        },

        /**
         * Returns true if an entry in an object or array exists.
         * 
         * @param obj object or array
         * @param {function} f function to check for an entry to exist
         * @param {object} context optional context for the function
         * 
         * @return {boolean} returns true if an entry exists
         * 
         */
        exists: function(obj, f, context) {
            var success = false;
            this.iter(obj, function() {
                success = success || f.apply(this, arguments);
                return !success;
            }, context);
            return success;
        },

        /**
         * Returns true if all entries in an object or array satisfy a condition
         * 
         * @param obj object or array
         * @param {function} f function to check for the condition
         * @param {object} context optional context for the function
         * 
         * @return {boolean} returns true if all entries satisfy the condition
         * 
         */
        all: function(obj, f, context) {
            var success = true;
            this.iter(obj, function() {
                success = success && f.apply(this, arguments);
                return success;
            }, context);
            return success;
        },

        /**
         * Returns the first entry of an object or array.
         * 
         * @param obj object or array
         * 
         * @return first entry
         */
        peek: function(obj) {
            if (Types.is_array(obj))
                return obj.length > 0 ? obj[0] : null;
            for (var key in obj)
                return obj[key];
            return null;
        },

        /**
         * Returns and removes the first entry of an object or array.
         * 
         * @param obj object or array
         * 
         * @return first entry
         */
        poll: function(obj) {
            if (Types.is_array(obj))
                return obj.shift();
            for (var key in obj) {
                var item = obj[key];
                delete obj[key];
                return item;
            }
            return null;
        },

        /**
         * Iterates over an object or array, calling a callback function for each item.
         * 
         * @param obj object or array
         * @param {function} f callback function
         * @param {object} context optional callback context
         * 
         */
        iter: function(obj, f, context) {
            var result = null;
            if (Types.is_array(obj)) {
                for (var i = 0; i < obj.length; ++i) {
                    result = context ? f.apply(context, [obj[i], i]) : f(obj[i], i);
                    if (Types.is_defined(result) && !result)
                        return false;
                }
            } else {
                for (var key in obj) {
                    result = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
                    if (Types.is_defined(result) && !result)
                        return false;
                }
            }
            return true;
        },

        /**
         * Creates the intersection object of two objects.
         * 
         * @param {object} a object one
         * @param {object} b object two
         * 
         * @return {object} intersection object
         */
        intersect: function(a, b) {
            var c = {};
            for (var key in a) {
                if (key in b)
                    c[key] = a[key];
            }
            return c;
        },

        /**
         * Determines whether two objects have the same set of keys.
         *
         * @param {object} a object one
         * @param {object} b object two
         *
         * @return {boolean} true if same keys
         */
        keyEquals: function(a, b) {
            for (var key in a)
                if (!(key in b))
                    return false;
            for (key in b)
                if (!(key in a))
                    return false;
            return true;
        },

        /**
         * Splits an object into two according to a callback function
         *
         * @param {object} obj object to split
         * @param {function} f function to determine how to split
         * @param {object} ctx optional context
         *
         * @return {array} two element array of two split objects
         */
        splitObject: function(obj, f, ctx) {
            var x = {};
            var y = {};
            this.iter(obj, function(value, key) {
                if (f.apply(this, arguments))
                    x[key] = value;
                else
                    y[key] = value;
            }, ctx);
            return [x, y];
        },

        /**
         * Creates the difference object of two objects.
         * 
         * @param {object} a object one
         * @param {object} b object two
         * 
         * @return {object} difference object
         */
        diff: function(a, b) {
            var c = {};
            for (var key in a)
                if (!(key in b) || a[key] !== b[key])
                    c[key] = a[key];
            return c;
        },

        /**
         * Determines whether a key exists in an array or object.
         * 
         * @param obj object or array
         * @param key search key
         * 
         * @return {boolean} true if key is contained in obj
         */
        contains_key: function(obj, key) {
            if (Types.is_array(obj))
                return Types.is_defined(obj[key]);
            else
                return key in obj;
        },

        /**
         * Determines whether a value exists in an array or object.
         * 
         * @param obj object or array
         * @param value search value
         * 
         * @return {boolean} true if value is contained in obj
         */
        contains_value: function(obj, value) {
            if (Types.is_array(obj)) {
                for (var i = 0; i < obj.length; ++i) {
                    if (obj[i] === value)
                        return true;
                }
            } else {
                for (var key in obj) {
                    if (obj[key] === value)
                        return true;
                }
            }
            return false;
        },

        /**
         * Maps an array of object, mapping values using a function.
         * 
         * @param obj object or array
         * @param {function} f function for mapping values
         * @param {object} context function context
         * 
         * @return object or array with mapped values
         * 
         */
        map: function(obj, f, context) {
            var result = null;
            context = context || this;
            if (Types.is_array(obj)) {
                result = [];
                for (var i = 0; i < obj.length; ++i)
                    result.push(f.call(context, obj[i], i));
                return result;
            } else {
                result = {};
                for (var key in obj)
                    result[key] = f.call(context, obj[key], key);
                return result;
            }
        },

        /**
         * Maps the keys of an object using a function.
         * 
         * @param {object} obj object
         * @param {function} f function for mapping keys
         * @param {object} context function context
         * 
         * @return {object} object with mapped keys
         */
        keyMap: function(obj, f, context) {
            result = {};
            context = context || this;
            for (var key in obj)
                result[f.call(context, obj[key], key)] = obj[key];
            return result;
        },

        /**
         * Returns all values of an object as an array.
         * 
         * @param {object} obj object
         * 
         * @return {array} values of object as array
         */
        values: function(obj) {
            var result = [];
            for (var key in obj)
                result.push(obj[key]);
            return result;
        },

        /**
         * Filters all values of an object or array.
         * 
         * @param obj object or array
         * @param {function} f filter function
         * @param {object} context filter function context
         * 
         * @return object or array with filtered items
         */
        filter: function(obj, f, context) {
            f = f || function(x) {
                return !!x;
            };
            if (Types.is_array(obj))
                return obj.filter(f, context);
            var ret = {};
            for (var key in obj) {
                if (context ? f.apply(context, [obj[key], key]) : f(obj[key], key))
                    ret[key] = obj[key];
            }
            return ret;
        },

        /**
         * Tests two objects for deep equality up to a certain depth.
         * 
         * @param {object} obj1 first object
         * @param {object} obj2 second object
         * @param {int} depth depth until deep comparison should be done
         * 
         * @return {boolean} true if both objects are equal 
         */
        equals: function(obj1, obj2, depth) {
            var key = null;
            if (depth && depth > 0) {
                for (key in obj1) {
                    if (!(key in obj2) || !this.equals(obj1[key], obj2[key], depth - 1))
                        return false;
                }
                for (key in obj2) {
                    if (!(key in obj1))
                        return false;
                }
                return true;
            } else
                return obj1 == obj2;
        },

        /**
         * Converts an array into object using the array values as keys.
         * 
         * @param {array} arr array to be converted
         * @param f a function mapping the value of an array to a value of the object, or a constant value, or undefined (then true is used)
         * @param {object} context optional function context
         * 
         * @return {object} converted object
         */
        objectify: function(arr, f, context) {
            var result = {};
            var is_function = Types.is_function(f);
            if (Types.is_undefined(f))
                f = true;
            for (var i = 0; i < arr.length; ++i)
                result[arr[i]] = is_function ? f.apply(context || this, [arr[i], i]) : f;
            return result;
        },

        /**
         * Converts an object into an array using a function to merge value and key.
         *
         * @param {object} obj obj to be converted
         * @param f a function mapping the value and key to an item instance of the array
         * @param {object} context optional function context
         *
         * @return {array} converted array
         */
        arrayify: function(obj, f, context) {
            var result = [];
            this.iter(obj, function(value, key) {
                result.push(f.call(this, value, key));
            }, context);
            return result;
        },

        /**
         * Creates an object by pairing up the arguments to key value pairs.
         * 
         * @return {object} created object
         */
        objectBy: function() {
            var obj = {};
            var count = arguments.length / 2;
            for (var i = 0; i < count; ++i)
                obj[arguments[2 * i]] = arguments[2 * i + 1];
            return obj;
        },

        /**
         * Extracts all key-value pairs from an object instance not matching default key-value pairs in another instance.
         * 
         * @param {object} ordinary object with default key-value pairs
         * @param {object} concrete object with a concrete list of key-value pairs
         * @param {boolean} keys if true, iterating over the ordinary keys, otherwise iterating over the conrete keys (default)
         * 
         * @return {object} specialized key-value pairs
         */
        specialize: function(ordinary, concrete, keys) {
            var result = {};
            var iterateOver = keys ? ordinary : concrete;
            for (var key in iterateOver)
                if (!(key in ordinary) || ordinary[key] != concrete[key])
                    result[key] = concrete[key];
            return result;
        },

        /**
         * Merges to objects.
         * 
         * @param {object} secondary Secondary object
         * @param {object} primary Primary object
         * @param {object} options Key-based options for merging
         * 
         * @return {object} Merged object
         */
        merge: function(secondary, primary, options) {
            secondary = secondary || {};
            primary = primary || {};
            var result = {};
            var keys = this.extend(this.keys(secondary, true), this.keys(primary, true));
            for (var key in keys) {
                var opt = key in options ? options[key] : "primary";
                if (opt == "primary" || opt == "secondary") {
                    if (key in primary || key in secondary) {
                        if (opt == "primary")
                            result[key] = key in primary ? primary[key] : secondary[key];
                        else
                            result[key] = key in secondary ? secondary[key] : primary[key];
                    }
                } else if (Types.is_function(opt))
                    result[key] = opt(secondary[key], primary[key]);
                else if (Types.is_object(opt))
                    result[key] = this.merge(secondary[key], primary[key], opt);
            }
            return result;
        },

        /**
         * Recursively merges one object into another without modifying the source objects.
         * 
         * @param {object} secondary Object to be merged into.
         * @param {object} primary Object to be merged in
         * 
         * @return {object} Recursively merged object
         */
        tree_merge: function(secondary, primary) {
            secondary = secondary || {};
            primary = primary || {};
            var result = {};
            var keys = this.extend(this.keys(secondary, true), this.keys(primary, true));
            for (var key in keys) {
                if (Types.is_object(primary[key]) && secondary[key])
                    result[key] = this.tree_merge(secondary[key], primary[key]);
                else
                    result[key] = key in primary ? primary[key] : secondary[key];
            }
            return result;
        },

        /**
         * Serializes an object in such a way that all subscopes appear in a flat notation.
         * 
         * @param {object} obj source object
         * @param {string} head prefix header, usually empty
         * 
         * @return {array} serialized object
         */
        serializeFlatJSON: function(obj, head) {
            var result = [];
            if (Types.is_array(obj) && obj) {
                obj.forEach(function(value) {
                    result = result.concat(this.serializeFlatJSON(value, head + "[]"));
                }, this);
            } else if (Types.is_object(obj) && obj) {
                this.iter(obj, function(value, key) {
                    result = result.concat(this.serializeFlatJSON(value, head ? head + "[" + key + "]" : key));
                }, this);
            } else {
                result = [{
                    key: head,
                    value: obj
                }];
            }
            return result;
        },

        /**
         * Converts an object into an array by calling a custom function for combining key and value.
         *
         * @param {object} obj source object
         * @param f a function for combining key and value
         * @param {object} context optional function context
         *
         * @return {array} resulint arrayarray
         */
        objectToArray: function(obj, f, ctx) {
            var a = [];
            this.iter(obj, function(value, key) {
                a.push(f.call(this, key, value));
            }, ctx);
            return a;
        },

        /**
         * Initializes an array with pre-computed values using a callback function.
         *
         * @param {int} count number of elements to be generated
         * @param {function} callback function for computing the elements
         * @param {object} context optional context
         * @returns {array} generated array
         */
        initArray: function(count, callback, context) {
            var result = [];
            for (var i = 0; i < count; ++i)
                result.push(callback.call(context || this, i));
            return result;
        },

        /**
         * Merge key / values from two objects; merge value with callback function on intersection of both objects
         *
         * @param {object} obj1 first object
         * @param {object} obj2 second object
         * @param {function} merger merging function
         * @param {object} mergerCtx optional context
         */
        customMerge: function(obj1, obj2, merger, mergerCtx) {
            var result = {};
            for (var key1 in obj1)
                result[key1] = key1 in obj2 ? merger.call(mergerCtx, key1, obj1[key1], obj2[key1]) : obj1[key1];
            for (var key2 in obj2)
                if (!(key2 in obj1))
                    result[key2] = obj2[key2];
            return result;
        },

        indexizeArray: function(arr, keyName) {
            var result = {};
            arr.forEach(function(value) {
                result[value[keyName]] = value;
            });
            return result;
        },

        filterOutValues: function(obj, values) {
            return this.filter(obj, function(value) {
                return !values.includes(value);
            });
        },

        mergeSortedArrays: function(arr1, arr2, compare) {
            compare = compare || function(a, b) {
                return a > b ? 1 : (a < b ? -1 : 0);
            };
            var result = [];
            var i = 0;
            arr1.forEach(function(el1) {
                while (i < arr2.length && compare(el1, arr2[i]) > 0) {
                    result.push(arr2[i]);
                    i++;
                }
                result.push(el1);
                while (i < arr2.length && compare(el1, arr2[i]) === 0)
                    i++;
            });
            while (i < arr2.length) {
                result.push(arr2[i]);
                i++;
            }
            return result;
        }

    };
});


Scoped.define("module:Objs.Scopes", ["module:Types"], function(Types) {
    /**
     * Scoped access of keys within objects.
     * 
     * @module BetaJS.Objs.Scopes
     */
    return {

        /**
         * Determines whether a scoped key exists within a scope.
         * 
         * @param {string} key key within scope
         * @param {object} name scope context
         * 
         * @return {boolean} true if key exists within scope
         */
        has: function(key, scope) {
            var keys = key ? key.split(".") : [];
            for (var i = 0; i < keys.length; ++i) {
                if (!scope || !Types.is_object(scope))
                    return false;
                scope = scope[keys[i]];
            }
            return Types.is_defined(scope);
        },

        /**
         * Returns the value of a key within a scope.
         * 
         * @param {string} key key within scope
         * @param {object} name scope context
         * 
         * @return Value for key in scope
         */
        get: function(key, scope) {
            var keys = key ? key.split(".") : [];
            for (var i = 0; i < keys.length; ++i) {
                if (!scope || !Types.is_object(scope))
                    return null;
                scope = scope[keys[i]];
            }
            return scope;
        },

        /**
         * Sets the value of a key within a scope.
         * 
         * @param {string} key key within scope
         * @param name value to be set
         * @param {object} name scope context
         */
        set: function(key, value, scope) {
            if (!key)
                return;
            var keys = key.split(".");
            for (var i = 0; i < keys.length - 1; ++i) {
                if (!(keys[i] in scope) || !Types.is_object(scope[keys[i]]))
                    scope[keys[i]] = {};
                scope = scope[keys[i]];
            }
            scope[keys[keys.length - 1]] = value;
        },

        /**
         * Unsets a key within a scope.
         * 
         * @param {string} key key within scope
         * @param {object} name scope context
         */
        unset: function(key, scope) {
            if (!key)
                return;
            var keys = key.split(".");
            for (var i = 0; i < keys.length - 1; ++i) {
                if (!scope || !Types.is_object(scope))
                    return;
                scope = scope[keys[i]];
            }
            delete scope[keys[keys.length - 1]];
        },

        /**
         * Makes sure that a certain key is accessible within a scope.
         * 
         * @param {string} key key within scope
         * @param {object} name scope context
         * 
         * @return Touched value
         */
        touch: function(key, scope) {
            if (!key)
                return scope;
            var keys = key.split(".");
            for (var i = 0; i < keys.length; ++i) {
                if (!(keys[i] in scope) || !Types.is_object(scope))
                    scope[keys[i]] = {};
                scope = scope[keys[i]];
            }
            return scope[keys[keys.length - 1]];
        }

    };
});
Scoped.define("module:Parser.LexerException", [
    "module:Exceptions.Exception"
], function(Exception, scoped) {
    return Exception.extend({
        scoped: scoped
    }, function(inherited) {
        /**
         * Lexer Exception Class
         * 
         * @class BetaJS.Parser.LexerException
         */
        return {

            /**
             * Instantiates a Lexer Exception
             * 
             * @param {string} head head string that has been parsed
             * @param {string} tail tail string that is not parsed yet
             * 
             */
            constructor: function(head, tail) {
                inherited.constructor.call(this, "Lexer error: Unrecognized identifier at " + head.length + ".");
                this.__head = head;
                this.__tail = tail;
            }

        };
    });
});


Scoped.define("module:Parser.Lexer", [
    "module:Class", "module:Types", "module:Objs", "module:Parser.LexerException"
], function(Class, Types, Objs, LexerException, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Simple Lexer Class for Parsing Strings
         * 
         * @class BetaJS.Parser.Lexer
         */
        return {

            /**
             * Instantiates a Lexer
             * 
             * @param {object} patterns a mapping from regular expressions to token identifiers or value preservers
             */
            constructor: function(patterns) {
                inherited.constructor.call(this);
                this.__patterns = [];
                Objs.iter(patterns, function(value, key) {
                    this.__patterns.push({
                        regex: new RegExp("^" + key, "m"),
                        data: Types.is_string(value) ? {
                            token: value
                        } : value
                    });
                }, this);
            },

            /**
             * Lexes a string w.r.t. the initialised patterns.
             * 
             * @param {string} source source string
             * @return {array} array of parsed tokens
             */
            lex: function(source) {
                var result = [];
                var head = "";
                var tail = source;
                while (tail) {
                    var match = null;
                    var data = null;
                    for (var i = 0; i < this.__patterns.length; ++i) {
                        match = this.__patterns[i].regex.exec(tail);
                        if (match) {
                            data = Objs.clone(this.__patterns[i].data, 1);
                            break;
                        }
                    }
                    if (!match)
                        throw new LexerException(head, tail);
                    head += match[0];
                    tail = tail.substring(match[0].length);
                    if (!data)
                        continue;
                    for (var key in data) {
                        if (Types.is_string(data[key])) {
                            for (var j = 0; j < match.length; ++j)
                                data[key] = data[key].replace("$" + j, match[j]);
                        }
                    }
                    result.push(data);
                }
                return result;
            }

        };
    });
});
Scoped.define("module:Properties.ObservableMixin", [], function() {

    /**
     * Properties Observable Mixin
     *
     * @mixin BetaJS.Properties.ObservableMixin
     */
    return {

        __observable_guid: "48994ac3-7e0b-4ed5-8995-f146215dc795",

        /**
         * Returns the value associated with a key.
         *
         * @param {string} key key to read value for
         *
         * @return value for key
         */
        get: function(key) {},

        /**
         * Checks whether a key is set.
         *
         * @param {string} key key in question
         *
         * @return {boolean} true if key is set
         */
        hasKey: function(key) {}

    };
});


Scoped.define("module:Properties.PropertiesMixin", [
    "module:Objs.Scopes",
    "module:Objs",
    "module:Strings",
    "module:Types",
    "module:Functions"
], function(Scopes, Objs, Strings, Types, Functions) {

    /**
     * Properties Mixin
     * 
     * @mixin BetaJS.Properties.PropertiesMixin
     */
    return {

        __properties_guid: "ec816b66-7284-43b1-a945-0600c6abfde3",

        _notifications: {
            "construct": function() {
                this.__properties = {
                    // hierarchical organization
                    data: {},
                    // hierarchical organization
                    watchers: {
                        children: {},
                        eventCount: 0,
                        parent: null,
                        key: null
                    },
                    // flat organization
                    computed: {},
                    // flat organization
                    bindings: {}
                };
                Objs.iter(this.materializes, function(key) {
                    this.materializeAttr(key);
                }, this);
            },
            "destroy": function() {
                Objs.iter(this.__properties.bindings, function(value, key) {
                    this.unbind(key);
                }, this);
                Objs.iter(this.__properties.computed, function(value, key) {
                    this.uncompute(key);
                }, this);
                /**
                 * @event BetaJS.Properties.PropertiesMixin#destroy
                 */
                this.trigger("destroy");
            },
            "register_event": function(event) {
                Objs.iter(["change", "unset", "deepchange", "deepunset", "strongdeepchange", "strongchange"], function(eventType) {
                    if (Strings.starts_with(event, eventType + ":"))
                        this.__registerWatcher(Strings.strip_start(event, eventType + ":"), eventType);
                }, this);
            },
            "unregister_event": function(event) {
                Objs.iter(["change", "unset", "deepchange", "deepunset", "strongdeepchange", "strongchange"], function(eventType) {
                    if (Strings.starts_with(event, eventType + ":"))
                        this.__unregisterWatcher(Strings.strip_start(event, eventType + ":"), eventType);
                }, this);
            }
        },

        __registerWatcher: function(key, event) {
            var keys = key ? key.split(".") : [];
            var current = this.__properties.watchers;
            for (var i = 0; i < keys.length; ++i) {
                if (!(keys[i] in current.children)) {
                    current.children[keys[i]] = {
                        parent: current,
                        eventCount: 0,
                        children: {},
                        key: keys[i]
                    };
                }
                current = current.children[keys[i]];
            }
            current.eventCount++;
        },

        __unregisterWatcher: function(key, event) {
            var keys = key ? key.split(".") : [];
            var current = this.__properties.watchers;
            for (var i = 0; i < keys.length; ++i) {
                if (current)
                    current = current.children[keys[i]];
            }
            if (!current)
                return;
            current.eventCount--;
            while (current.eventCount <= 0 && Types.is_empty(current.children) && current.parent) {
                var parent = current.parent;
                delete parent.children[current.key];
                current = parent;
            }
        },

        __unsetChanged: function(key, oldValue) {
            /**
             * @event BetaJS.Properties.PropertiesMixin#unset
             */
            this.trigger("unset", key, oldValue);
            var keys = key ? key.split(".") : [];
            var current = this.__properties.watchers;
            var head = "";
            var tail = key;
            for (var i = 0; i < keys.length; ++i) {
                if (current.eventCount > 0) {
                    /**
                     * @event BetaJS.Properties.PropertiesMixin#deepunset
                     */
                    this.trigger("deepunset:" + head, oldValue, tail);
                }
                if (!(keys[i] in current.children))
                    return this;
                current = current.children[keys[i]];
                head = head ? (head + "." + keys[i]) : keys[i];
                tail = Strings.first_after(tail, ".");
            }

            function process_unset(current, key, oldValue) {
                if (Types.is_undefined(oldValue))
                    return;
                if (current.eventCount > 0) {
                    /**
                     * @event BetaJS.Properties.PropertiesMixin#unset
                     */
                    this.trigger("unset:" + key, oldValue);
                }
                Objs.iter(current.children, function(child, subkey) {
                    process_unset.call(this, child, key ? (key + "." + subkey) : subkey, oldValue[subkey]);
                }, this);
            }
            process_unset.call(this, current, key, oldValue);
            return this;
        },

        __setChanged: function(key, value, oldValue, notStrong) {
            /**
             * @event BetaJS.Properties.PropertiesMixin#change
             */
            this.trigger("change", key, value, oldValue);
            this._afterSet(key, value);
            if (this.destroyed())
                return;
            var keys = key ? key.split(".") : [];
            var current = this.__properties.watchers;
            var head = "";
            var tail = key;
            for (var i = 0; i < keys.length; ++i) {
                if (current.eventCount > 0) {
                    if (!notStrong) {
                        /**
                         * @event BetaJS.Properties.PropertiesMixin#strongdeepchange
                         */
                        this.trigger("strongdeepchange:" + head, value, oldValue, tail);
                    }
                    /**
                     * @event BetaJS.Properties.PropertiesMixin#deepchange
                     */
                    this.trigger("deepchange:" + head, value, oldValue, tail);
                }
                if (!(keys[i] in current.children))
                    return;
                current = current.children[keys[i]];
                head = head ? (head + "." + keys[i]) : keys[i];
                tail = Strings.first_after(tail, ".");
            }

            function process_set(current, key, value, oldValue) {
                if (value == oldValue)
                    return;
                if (current.eventCount > 0) {
                    if (!notStrong) {
                        /**
                         * @event BetaJS.Properties.PropertiesMixin#strongchange
                         */
                        this.trigger("strongchange:" + key, value, oldValue);
                    }
                    /**
                     * @event BetaJS.Properties.PropertiesMixin#change
                     */
                    this.trigger("change:" + key, value, oldValue);
                }
                Objs.iter(current.children, function(child, subkey) {
                    process_set.call(this, child, key ? (key + "." + subkey) : subkey, Types.is_object(value) && value ? value[subkey] : null, Types.is_object(oldValue) && oldValue ? oldValue[subkey] : null);
                }, this);
            }
            process_set.call(this, current, key, value, oldValue);
        },

        /**
         * Attributes that will be materialized upon initialization.
         */
        materializes: [],

        /**
         * Resolve the scope associated with a key.
         * 
         * @param {string} key key to resolve
         * @return associated scope
         * 
         * @protected
         */
        _resolveProps: function(key) {
            var result = {
                props: this,
                key: key
            };
            var scope = this.data();
            while (key) {
                if (!scope || !Types.is_object(scope))
                    return result;
                if (scope.__properties_guid === this.__properties_guid)
                    return scope._resolveProps(key);
                var spl = Strings.splitFirst(key, ".");
                if (!(spl.head in scope))
                    return result;
                key = spl.tail;
                scope = scope[spl.head];
            }
            return result;
        },

        /**
         * Check whether a key can be set to a value.
         * 
         * @param {string} key key in question
         * @param value value in question
         * 
         * @return {boolean} true if can be set
         * 
         * @protected
         */
        _canSet: function(key, value) {
            return true;
        },

        /**
         * Called before setting a value.
         * 
         * @param {string} key key in question
         * @param value value in question
         * @param oldValue oldValue in question
         * 
         * @return value, possibly altered
         * 
         * @protected
         */
        _beforeSet: function(key, value, oldValue) {
            return value;
        },

        /**
         * Called after setting a value.
         * 
         * @param {string} key key in question
         * @param value value in question
         * 
         * @protected
         */
        _afterSet: function(key, value) {},

        /**
         * Get value for key, resolving intermediate properties instances.
         * 
         * @param {string} key key to read
         * 
         * @return associated value
         */
        getProp: function(key) {
            var resolved = this._resolveProps(key);
            return resolved.props.get(resolved.key);
        },

        /**
         * Set value for key, resolving intermediate properties instances.
         * 
         * @param {string} key to read
         * @param value value to write
         */
        setProp: function(key, value) {
            var resolved = this._resolveProps(key);
            resolved.props.set(resolved.key, value);
            return this;
        },

        /**
         * Remove computation of a key.
         * 
         * @param {string} key key to remove computation for
         */
        uncomputeProp: function(key) {
            var resolved = this._resolveProps(key);
            return resolved.props.uncompute(resolved.key);
        },

        /**
         * Add computation of a key.
         * 
         * @param {string} key key to add computation for
         * @param {function} func function to compute the key
         */
        computeProp: function(key, func) {
            var resolved = this._resolveProps(key);
            var args = Functions.getArguments(arguments);
            args[0] = resolved.key;
            return resolved.props.compute.apply(resolved.props.compute, args);
        },

        /**
         * Returns the value associated with a key.
         * 
         * @param {string} key key to read value for
         * 
         * @return value for key
         */
        get: function(key) {
            return Scopes.get(key, this.__properties.data);
        },

        /**
         * Checks whether a key is set.
         * 
         * @param {string} key key in question
         * 
         * @return {boolean} true if key is set
         */
        has: function(key) {
            return Scopes.has(key, this.__properties.data);
        },

        /**
         * Checks whether a key is set.
         *
         * @param {string} key key in question
         *
         * @return {boolean} true if key is set
         */
        hasKey: function(key) {
            return this.has(key);
        },

        /**
         * Sets all attributes in a JSON object.
         * 
         * @param {object} obj JSON object data
         * 
         */
        setAll: function(obj) {
            for (var key in obj)
                this.set(key, obj[key]);
            return this;
        },

        /**
         * Returns all keys of the instance, possibly mapped.
         * 
         * @param {function} mapped optional key mapping
         * 
         * @return {array} all keys
         */
        keys: function(mapped) {
            return Objs.keys(this.__properties.data, mapped);
        },

        /**
         * Returns a data pointer to the raw data. Read only.
         * 
         * @return {object} data pointer
         */
        data: function() {
            return this.__properties.data;
        },

        /**
         * Returns a raw data copy.
         * 
         * @return {object} raw data copy
         */
        getAll: function() {
            return Objs.clone(this.__properties.data, 1);
        },

        clone: function() {
            return new(this.cls)(this.getAll());
        },

        /**
         * Iterates over all key-value pairs.
         *
         * @param {function} cb callback function
         * @param {object} ctx optional context
         *
         */
        iterate: function(cb, ctx) {
            Objs.iter(this.getAll(), cb, ctx);
            return this;
        },

        /**
         * Materializes an attribute as a function.
         * 
         * @param {string} attr attribute to be materialized
         * 
         */
        materializeAttr: function(attr) {
            this[attr] = function(value) {
                if (arguments.length === 0)
                    return this.get(attr);
                this.set(attr, value);
            };
            return this;
        },

        /**
         * Remove the computation of a key.
         * 
         * @param {string} key key for which the computation should be removed
         */
        uncompute: function(key) {
            if (key in this.__properties.computed) {
                Objs.iter(this.__properties.computed[key].dependencies, function(dependency) {
                    dependency.properties.off("change:" + dependency.key, null, dependency);
                    if (dependency.value && !dependency.value.destroyed())
                        dependency.value.off("change update", null, dependency);
                }, this);
                delete this.__properties.computed[key];
            }
            return this;
        },

        bicompute: function(left, right, leftToRight, rightToLeft) {
            leftToRight.call(this);
            var exclusive = false;
            [
                [left, leftToRight],
                [right, rightToLeft]
            ].forEach(function(direction) {
                direction[0].forEach(function(key) {
                    this.on("change:" + key, function() {
                        if (exclusive)
                            return;
                        try {
                            exclusive = true;
                            direction[1].call(this);
                            exclusive = false;
                        } catch (e) {
                            exclusive = false;
                            throw e;
                        }
                    }, this);
                }, this);
            }, this);
            return this;
        },

        /**
         * Add a computation for a key.
         * 
         * @param {string} key key to add computation for
         * @param {function} func function to compute the key
         */
        compute: function(key, func) {
            var args = Functions.matchArgs(arguments, 2, {
                setter: "function",
                context: {
                    type: "object",
                    def: this
                },
                dependencies: true
            });
            this.uncompute(key);
            var deps = [];
            Objs.iter(args.dependencies, function(dep) {
                if (Types.is_string(dep))
                    deps.push({
                        properties: this,
                        key: dep
                    });
                else
                    deps.push({
                        properties: dep[0],
                        key: dep[1]
                    });
            }, this);
            var computed = {
                ignore: 0,
                func: func,
                context: args.context,
                setter: args.setter,
                dependencies: deps
            };
            this.__properties.computed[key] = computed;
            var self = this;

            function recompute() {
                if (computed.ignore > 0)
                    return;
                var values = Objs.map(deps, function(dep) {
                    return dep.properties.get(dep.key);
                });
                self.set(key, func.apply(args.context, values));
            }
            Objs.iter(deps, function(dep) {
                var value = dep.properties.get(dep.key);
                // Ugly way of checking whether an EventsMixin is present - please improve in the future on this
                if (value && typeof value == "object" && "on" in value && "off" in value && "trigger" in value) {
                    dep.value = value;
                    value.on("change update", function() {
                        recompute();
                    }, dep);
                }
                dep.properties.on("change:" + dep.key, function(value, oldValue) {
                    dep.value = null;
                    if (oldValue && typeof oldValue == "object" && "on" in oldValue && "off" in oldValue && "trigger" in oldValue) {
                        oldValue.off("change update", null, dep);
                    }
                    if (value && typeof value == "object" && "on" in value && "off" in value && "trigger" in value) {
                        dep.value = value;
                        value.on("change update", function() {
                            recompute();
                        }, dep);
                    }
                    recompute();
                }, dep);
            }, this);
            recompute();
            return this;
        },

        /**
         * Removes a binding for a key and another properties instance.
         * 
         * @param {string} key key for which the binding should be removed
         * @param {object} props other properties instance
         */
        unbind: function(key, props) {
            if (key in this.__properties.bindings) {
                for (var i = this.__properties.bindings[key].length - 1; i >= 0; --i) {
                    var binding = this.__properties.bindings[key][i];
                    if (!props || props == binding) {
                        if (binding.left)
                            binding.properties.off(null, null, binding);
                        if (binding.right)
                            this.off(null, null, binding);
                        this.__properties.bindings[key].splice(i, 1);
                        i--;
                    }
                }
                if (this.__properties.bindings[key].length === 0)
                    delete this.__properties.bindings[key];
            }
            return this;
        },

        /**
         * Adds a binding for a key and another properties instance.
         * 
         * @param {string} key key for which the binding should be added
         * @param {object} props other properties instance
         * @param {object} options optional options
         */
        bind: function(key, properties, options) {
            options = Objs.extend({
                secondKey: key,
                left: true,
                right: true,
                deep: false
            }, options);
            var binding = {
                key: options.secondKey,
                left: options.left,
                right: options.right,
                deep: options.deep,
                properties: properties
            };
            this.__properties.bindings[key] = this.__properties.bindings[key] || [];
            this.__properties.bindings[key].push(binding);
            var self = this;
            if (binding.left) {
                binding.properties.on("strongchange:" + binding.key, function(value) {
                    self.set(key, value);
                }, binding);
                binding.properties.on("unset:" + binding.key, function(value) {
                    self.unset(key);
                }, binding);
                if (binding.deep) {
                    binding.properties.on("strongdeepchange:" + binding.key, function(value, oldValue, subKey) {
                        if (self.get(key ? key + "." + subKey : subKey) === value)
                            self.__setChanged(key ? key + "." + subKey : subKey, value, oldValue, true);
                        else
                            self.set(key ? key + "." + subKey : subKey, value);
                    }, binding);
                    binding.properties.on("deepunset:" + binding.key, function(oldValue, subKey) {
                        if (!self.has(key ? key + "." + subKey : subKey))
                            self.__unsetChanged(key ? key + "." + subKey : subKey, oldValue);
                        else
                            self.unset(key ? key + "." + subKey : subKey);
                    }, binding);
                }
                if (!binding.right || !this.has(key))
                    this.set(key, binding.properties.get(binding.key));
                if (key === "") {
                    Objs.iter(binding.properties.data(), function(value, k) {
                        this.set(k, value);
                    }, this);
                }
            }
            if (binding.right) {
                this.on("strongchange:" + key, function(value) {
                    binding.properties.set(binding.key, value);
                }, binding);
                this.on("unset:" + key, function(value) {
                    binding.properties.unset(binding.key);
                }, binding);
                if (binding.deep) {
                    this.on("strongdeepchange:" + key, function(value, oldValue, subKey) {
                        if (binding.properties.get(binding.key ? binding.key + "." + subKey : subKey) === value)
                            binding.properties.__setChanged(binding.key ? binding.key + "." + subKey : subKey, value, oldValue, true);
                        else
                            binding.properties.set(binding.key ? binding.key + "." + subKey : subKey, value);
                    }, binding);
                    this.on("deepunset:" + key, function(oldValue, subKey) {
                        if (!binding.properties.has(binding.key ? binding.key + "." + subKey : subKey))
                            binding.properties.__unsetChanged(binding.key ? binding.key + "." + subKey : subKey, oldValue);
                        else
                            binding.properties.unset(binding.key ? binding.key + "." + subKey : subKey);
                    }, binding);
                }
                if (!binding.left || this.has(key))
                    binding.properties.set(binding.key, this.get(key));
                if (key === "") {
                    Objs.iter(this.data(), function(value, k) {
                        binding.properties.set(k, value);
                    }, this);
                }
            }
            binding.properties.on("destroy", function() {
                if (!self.destroyed())
                    self.unbind(key);
            }, binding);
            return this;
        },

        /**
         * Removes a key from the properties instance.
         * 
         * @param {string} key key to be removed
         */
        unset: function(key) {
            if (this.has(key)) {
                var oldValue = this.get(key);
                Scopes.unset(key, this.__properties.data);
                this.__unsetChanged(key, oldValue);
            }
            return this;
        },

        /**
         * Sets a key in the properties instance.
         * 
         * @param {string} key key to be set
         * @param value value to be set
         * @param {boolean} force optional force argument
         */
        set: function(key, value, force) {
            if (Types.is_object(value) && value && value.guid == this.__properties_guid) {
                if (value.properties)
                    this.bind(key, value.properties, {
                        secondKey: value.key
                    });
                if (value.func)
                    this.compute(key, value.func, value.dependencies);
                return this;
            }
            var oldValue = this.get(key);
            value = this._beforeSet(key, value, oldValue);
            if (oldValue !== value) {
                Scopes.set(key, value, this.__properties.data);
                this.__setChanged(key, value, oldValue);
            } else if (force) {
                /**
                 * @event BetaJS.Properties.PropertiesMixin#change
                 */
                this.trigger("change", key, value, oldValue, true);
                /**
                 * @event BetaJS.Properties.PropertiesMixin#change
                 */
                this.trigger("change:" + key, value, oldValue, true);
            }
            return this;
        },

        /**
         * @deprecated
         */
        binding: function(key) {
            return {
                guid: this.__properties_guid,
                properties: this,
                key: key
            };
        },

        /**
         * @deprecated
         */
        computed: function(f, dependencies) {
            return {
                guid: this.__properties_guid,
                func: f,
                dependencies: dependencies
            };
        },

        /**
         * Returns the properties unique id.
         * 
         * @return {string} unique properties id
         */
        pid: function() {
            return this.cid();
        },

        /**
         * Checks whether this properties instance is a subset of another properties instance.
         *  
         * @param {object} props another properties instance or JSON object
         * 
         * @return {boolean} true if this instance is a subset of the other properties object
         */
        isSubsetOf: function(props) {
            return Objs.subset_of(this.data(), props.data ? props.data() : props);
        },

        /**
         * Checks whether this properties instance is a superset of another properties instance.
         *  
         * @param {object} props another properties instance or JSON object
         * 
         * @return {boolean} true if this instance is a superset of the other properties object
         */
        isSupersetOf: function(props) {
            return Objs.superset_of(this.data(), props.data ? props.data() : props);
        },

        /**
         * ES5 only
         */
        getProxy: function() {
            var self = this;
            return new Proxy(this.__properties.data, {
                get: function(target, prop, receiver) {
                    return self.get(prop);
                },
                set: function(target, prop, value) {
                    self.set(prop, value);
                }
            });
        }

    };
});


Scoped.define("module:Properties.Properties", [
    "module:Class",
    "module:Objs",
    "module:Events.EventsMixin",
    "module:Properties.ObservableMixin",
    "module:Properties.PropertiesMixin"
], function(Class, Objs, EventsMixin, ObservableMixin, PropertiesMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, ObservableMixin, PropertiesMixin, function(inherited) {

        /**
         * Properties Class
         * 
         * @class BetaJS.Properties.Properties
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} obj optional initial attributes
             * @param {array} materializes optional initial attributes that should be materialized
             */
            constructor: function(obj, materializes) {
                inherited.constructor.call(this);
                if (obj)
                    this.setAll(obj);
                if (materializes) {
                    Objs.iter(materializes, function(key) {
                        this.materializeAttr(key);
                    }, this);
                }
            }

        };
    }]);
});
Scoped.define("module:Sort", [
    "module:Comparators",
    "module:Types",
    "module:Objs"
], function(Comparators, Types, Objs) {

    /**
     * Sort objects and arrays.
     * 
     * @module BetaJS.Sort
     */
    return {

        /**
         * Sort keys in an object according to a comparator. 
         * 
         * @param {object} object object to be sorted
         * @param {function} f comparator comparator for sorting, accepting keys first and then optionally values
         * 
         * @return {object} sorted object
         */
        sort_object: function(object, f) {
            var a = [];
            for (var key in object)
                a.push({
                    key: key,
                    value: object[key]
                });
            a.sort(function(x, y) {
                return f(x.key, y.key, x.value, y.value);
            });
            var o = {};
            for (var i = 0; i < a.length; ++i)
                o[a[i].key] = a[i].value;
            return o;
        },

        /**
         * Deep sorting an object according to a comparator. 
         * 
         * @param {object} object object to be sorted
         * @param {function} f comparator comparator for sorting, accepting keys first and then optionally values
         * 
         * @return {object} sorted object
         */
        deep_sort: function(object, f) {
            f = f || Comparators.byValue;
            if (Types.is_array(object)) {
                for (var i = 0; i < object.length; ++i)
                    object[i] = this.deep_sort(object[i], f);
                return object.sort(f);
            } else if (Types.is_object(object)) {
                for (var key in object)
                    object[key] = this.deep_sort(object[key], f);
                return this.sort_object(object, f);
            } else
                return object;
        },

        /**
         * Sort an array of items with inter-dependency specifiers s.t. every item in the resulting array has all its dependencies come before.
         * 
         * @param {array} items list of items with inter-dependency specifiers
         * @param {string|function} identifier function / key mapping an item to its unique identifier
         * @param {string|function} before function / key mapping an item to its array of dependencies
         * @param {string|function} after function / key mapping an item to its array of depending items
         * 
         * @return {array} sorted array
         */
        dependency_sort: function(items, identifier, before, after) {
            var identifierf = Types.is_string(identifier) ? function(obj) {
                return obj[identifier];
            } : identifier;
            var beforef = Types.is_string(before) ? function(obj) {
                return obj[before];
            } : before;
            var afterf = Types.is_string(after) ? function(obj) {
                return obj[after];
            } : after;
            var n = items.length;
            var data = [];
            var identifier_to_index = {};
            var todo = {};
            var i = 0;
            for (i = 0; i < n; ++i) {
                todo[i] = true;
                var ident = identifierf(items[i], i);
                identifier_to_index[ident] = i;
                data.push({
                    before: {},
                    after: {}
                });
            }
            var make_before_iter_func = function(i) {
                return function(before) {
                    var before_index = identifier_to_index[before];
                    if (Types.is_defined(before_index)) {
                        data[i].before[before_index] = true;
                        data[before_index].after[i] = true;
                    }
                };
            };
            var make_after_iter_func = function(i) {
                return function(after) {
                    var after_index = identifier_to_index[after];
                    if (Types.is_defined(after_index)) {
                        data[i].after[after_index] = true;
                        data[after_index].before[i] = true;
                    }
                };
            };
            for (i = 0; i < n; ++i) {
                Objs.iter(beforef(items[i], i) || [], make_before_iter_func(i));
                Objs.iter(afterf(items[i]) || [], make_after_iter_func(i));
            }
            var result = [];
            while (!Types.is_empty(todo)) {
                for (i in todo) {
                    if (Types.is_empty(data[i].after)) {
                        delete todo[i];
                        result.push(items[i]);
                        for (var bef in data[i].before)
                            delete data[bef].after[i];
                    }
                }
            }
            return result;
        }

    };
});
Scoped.define("module:Strings", ["module:Objs"], function(Objs) {
    /**
     * String Utilities
     *
     * @module BetaJS.Strings
     */
    return {

        /**
         * Uppercases first character in string.
         *
         * @param {string} s string in question
         *
         * @return {string} uppercased string
         */
        ucFirst: function(s) {
            s += '';
            return s.charAt(0).toUpperCase() + s.substr(1);
        },

        /**
         * Escapes a string to be used as an exact match in a regular expression.
         *
         * @param {string} s string in question
         *
         * @return {string} escaped string
         *
         * @link http://stackoverflow.com/a/3561711
         */
        regexEscape: function(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        },

        /**
         * Transforms a string with asterisks as placeholders to a regular expression
         *
         * @param {string} s string in question
         *
         * @return {string} escaped string
         */
        asteriskPatternToRegex: function(s) {
            return s.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');
        },

        /**
         * Pads a string from the left with characters if necessary.
         *
         * @param {string} s string that should be padded
         * @param {string} padding padding string that should be used (e.g. whitespace)
         * @param {int} length minimum length of result string
         *
         * @return {string} padded string
         */
        padLeft: function(s, padding, length) {
            while (s.length < length)
                s = padding + s;
            return s;
        },

        /**
         * Pads a string from the left with zeros ('0') if necessary.
         *
         * @param {string} s string that should be padded
         * @param {int} length minimum length of result string
         *
         * @return {string} zero-padded string
         */
        padZeros: function(s, length) {
            return this.padLeft(s + "", "0", length);
        },

        /** Converts a string new lines to html <br /> tags
         *
         * @param s string
         * @return string with new lines replaced by <br />
         */
        nl2br: function(s) {
            return (s + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
        },

        /** Converts special characters in a string to html entitiy symbols
         *
         * @param s string
         * @return converted string
         */
        htmlentities: function(s) {
            return (s + "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
        },

        JS_ESCAPES: {
            "'": "'",
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        },

        JS_ESCAPER_REGEX: function() {
            if (!this.JS_ESCAPER_REGEX_CACHED)
                this.JS_ESCAPER_REGEX_CACHED = new RegExp(Objs.keys(this.JS_ESCAPES).join("|"), 'g');
            return this.JS_ESCAPER_REGEX_CACHED;
        },

        /** Converts string such that it can be used in javascript by escaping special symbols
         *
         * @param s string
         * @return escaped string
         */
        js_escape: function(s) {
            var self = this;
            return s.replace(this.JS_ESCAPER_REGEX(), function(match) {
                return '\\' + self.JS_ESCAPES[match];
            });
        },

        /** Determines whether a string starts with a sub string
         *
         * @param s string in question
         * @param needle sub string
         * @return true if string in question starts with sub string
         */
        starts_with: function(s, needle) {
            return s.substring(0, needle.length) == needle;
        },

        /** Determines whether a string ends with a sub string
         *
         * @param s string in question
         * @param needle sub string
         * @return true if string in question ends with sub string
         */
        ends_with: function(s, needle) {
            return s.indexOf(needle, s.length - needle.length) !== -1;
        },

        /** Removes sub string from a string if string starts with sub string
         *
         * @param s string in question
         * @param needle sub string
         * @return string without sub string if it starts with sub string otherwise it returns the original string
         */
        strip_start: function(s, needle) {
            return this.starts_with(s, needle) ? s.substring(needle.length) : s;
        },

        /** Removes sub string from a string if string ends with sub string
         *
         * @param s string in question
         * @param needle sub string
         * @return string without sub string if it ends with sub string otherwise it returns the original string
         */
        strip_end: function(s, needle) {
            return this.ends_with(s, needle) ? s.substring(0, s.length - needle.length) : s;
        },

        /**
         * Returns the complete remaining part of a string after the last occurrence of a sub string
         *
         * @param s string in question
         * @param needle sub string
         * @return remaining part of the string in question after the last occurrence of the sub string
         */
        last_after: function(s, needle) {
            return this.splitLast(s, needle).tail;
        },

        /**
         * Returns the complete remaining part of a string after the first occurrence of a sub string
         *
         * @param s string in question
         * @param needle sub string
         * @return remaining part of the string in question after the first occurrence of the sub string
         */
        first_after: function(s, needle) {
            return s.substring(s.indexOf(needle) + 1, s.length);
        },

        EMAIL_ADDRESS_REGEX: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

        STRICT_URL_REGEX: /^\w+:\/\/[^\s]+$/,

        PERMISSIVE_URL_REGEX: /^[\w\.]+\.(com|de|co\.uk|fr|net|org|edu)[^\s]*$/,

        /** Determines whether a string is a syntactically valid email address
         *
         * @param s string in question
         * @return true if string looks like an email address
         */
        is_email_address: function(s) {
            return this.EMAIL_ADDRESS_REGEX.test(s);
        },

        STRIP_HTML_TAGS: ["script", "style", "head"],
        STRIP_HTML_REGEX: /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi,
        STRIP_HTML_COMMENT_REGEX: /<![^>]*>/gi,

        /** Removes all html from data and returns plain text
         *
         * @param html string containing html
         * @return string containing the plain text part of it
         */
        strip_html: function(html) {
            var result = html;
            for (var i = 0; i < this.STRIP_HTML_TAGS.length; ++i)
                result = result.replace(new RegExp("<" + this.STRIP_HTML_TAGS[i] + ".*</" + this.STRIP_HTML_TAGS[i] + ">", "i"), '');
            result = result.replace(this.STRIP_HTML_REGEX, '').replace(this.STRIP_HTML_COMMENT_REGEX, '');
            return result;
        },

        /** Trims all trailing and leading whitespace and removes block indentations
         *
         * @param s string
         * @return string with trimmed whitespaces and removed block indentation
         */
        nltrim: function(s) {
            var a = s.replace(/\t/g, "  ").split("\n");
            var len = null;
            var i = 0;
            for (i = 0; i < a.length; ++i) {
                var j = 0;
                while (j < a[i].length) {
                    if (a[i].charAt(j) != ' ')
                        break;
                    ++j;
                }
                if (j < a[i].length)
                    len = len === null ? j : Math.min(j, len);
            }
            for (i = 0; i < a.length; ++i)
                a[i] = a[i].substring(len);
            return a.join("\n").trim();
        },

        /**
         * Replaces all occurrences of a substring with something else.
         *
         * @param {string} s input string
         * @param {string} sub search string
         * @param {string} wth replacement string
         *
         * @return {string} input with all occurrences of the search string replaced by the replacement string
         */
        replaceAll: function(s, sub, wth) {
            while (s.indexOf(sub) >= 0)
                s = s.replace(sub, wth);
            return s;
        },

        /**
         * Capitalizes all first characters of all words in a string.
         *
         * @param {string} input input string
         *
         * @return {string} input with all first characters capitalized
         */
        capitalize: function(input) {
            return input.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        },

        /**
         * Converts string to pascal case
         *
         * @param {string} s input string
         *
         * @return {string} input in pascal case
         */
        pascalCase: function(s) {
            return s.replace(/[A-Z][a-z0-9]/g, function(txt) {
                return " " + txt;
            }).replace(/[A-Za-z0-9]+/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }).replace(/[-_\s]/g, "");
        },

        /**
         * Converts string to camel case
         *
         * @param {string} s input string
         *
         * @return {string} input in camel case
         */
        camelCase: function(s) {
            var txt = this.pascalCase(s);
            return txt.charAt(0).toLowerCase() + txt.substr(1);
        },

        /**
         * Converts string to train case
         *
         * @param {string} s input string
         *
         * @return {string} input in train case
         */
        trainCase: function(s) {
            var txt = this.pascalCase(s);
            return txt.replace(/[A-Z]/g, function(txt) {
                return "-" + txt;
            }).substring(1);
        },

        /**
         * Converts string to snake case
         *
         * @param {string} s input string
         *
         * @return {string} input in snake case
         */
        snakeCase: function(s) {
            return this.trainCase(s).replace(/-/g, "_").toLowerCase();
        },

        /**
         * Converts string to kebab case
         *
         * @param {string} s input string
         *
         * @return {string} input in kebab case
         */
        kebabCase: function(s) {
            return this.trainCase(s).toLowerCase();
        },

        /**
         * Extracts the name from an email address name string (e.g. 'Foo Bar <foobar@domain.com>')
         *
         * @param {string} input email address name input string
         *
         * @return {string} name included in the string
         */
        email_get_name: function(input) {
            input = input || "";
            var temp = input.split("<");
            input = temp[0].trim();
            if (!input || temp.length < 2) {
                temp = temp[temp.length - 1].split("@");
                input = temp[0].trim();
            }
            input = input.replace(/['"]/g, "").replace(/[\\._@]/g, " ");
            return this.capitalize(input);
        },

        /**
         * Extracts the email from an email address name string (e.g. 'Foo Bar <foobar@domain.com>')
         *
         * @param {string} input email address name input string
         *
         * @return {string} email included in the string
         */
        email_get_email: function(input) {
            input = input || "";
            var temp = input.split("<");
            input = temp[0].trim();
            if (temp.length > 1) {
                temp = temp[1].split(">");
                input = temp[0].trim();
            }
            input = input.replace(/'/g, "").replace(/"/g, "").trim();
            return input;
        },

        /**
         * Extracts the salutatory name from an email address name string (normally the first name)
         *
         * @param {string} input email address name input string
         *
         * @return {string} salutatory name
         */
        email_get_salutatory_name: function(input) {
            return (this.email_get_name(input || "").split(" "))[0];
        },

        /**
         * Splits a string into two by the first occurrence of a delimiter
         *
         * @param {string} s input string
         * @param {string} delimiter delimiter string
         *
         * @return {object} a json object, mapping 'head' to the region left and 'tail' to region right to the delimiter
         */
        splitFirst: function(s, delimiter) {
            var i = s.indexOf(delimiter);
            return {
                head: i >= 0 ? s.substring(0, i) : s,
                tail: i >= 0 ? s.substring(i + delimiter.length) : ""
            };
        },

        /**
         * Splits a string into two by the last occurrence of a delimiter
         *
         * @param {string} s input string
         * @param {string} delimiter delimiter string
         *
         * @return {object} a json object, mapping 'head' to the region left and 'tail' to region right to the delimiter
         */
        splitLast: function(s, delimiter) {
            var i = s.lastIndexOf(delimiter);
            return {
                head: i >= 0 ? s.substring(0, i) : "",
                tail: i >= 0 ? s.substring(i + delimiter.length) : s
            };
        },

        /**
         * Replace all groups in a regular expression string by string parameters.
         *
         * @param {string} regex regular expression with groups as a string
         * @param {array} args array of string parameters
         *
         * @return {string} regular expression with groups being replaced by string parameters
         */
        regexReplaceGroups: function(regex, args) {
            var findGroup = /\(.*?\)/;
            var f = function(captured) {
                if (arg)
                    return arg;
                return captured.substring(1, captured.length - 1);
            };
            while (args.length > 0) {
                var arg = args.shift();
                regex = regex.replace(findGroup, f);
            }
            return regex;
        },

        /**
         * Given a regular expression with named capture groups (e.g. '(foobar:\d+)'), compute a normal regular expression with mappings to the named groups.
         *
         * @param {string} regex regular expression with named capture groups
         *
         * @return {object} mapping object
         */
        namedCaptureRegex: function(regex) {
            var groupMap = {};
            var groupIdx = 0;
            var newRegex = new RegExp(regex.replace(/\([^)]+\)/ig, function(group) {
                if (group.charAt(1) != "?" && group.indexOf(":") > 0) {
                    var delimiter = group.indexOf(":");
                    groupMap[group.substring(1, delimiter)] = groupIdx;
                    group = "(" + group.substring(delimiter + 1, group.length - 1) + ")";
                }
                groupIdx++;
                return group;
            }));
            var map = function(groups) {
                return Objs.map(groupMap, function(idx) {
                    return groups[idx + 1];
                });
            };
            var exec = function(test) {
                var result = newRegex.exec(test);
                return result ? map(result) : null;
            };
            var mapBack = function(args) {
                var result = [];
                for (var i = 0; i < groupIdx; ++i)
                    result.push(null);
                for (var key in args)
                    if (key in groupMap)
                        result[groupMap[key]] = args[key];
                return result;
            };
            return {
                regex: newRegex,
                map: map,
                exec: exec,
                mapBack: mapBack
            };
        },

        /**
         * Given an int, returns the short form of its ordinal value
         *
         * @param {int} i An integer
         *
         * @return {string} The ordinal value of the number
         */
        ordinalSuffix: function(i) {
            var j = i % 10,
                k = i % 100;
            if (j === 1 && k !== 11) {
                return i + "st";
            }
            if (j === 2 && k !== 12) {
                return i + "nd";
            }
            if (j === 3 && k !== 13) {
                return i + "rd";
            }
            return i + "th";
        },

        __cachedRegExp: {},

        /**
         * Returns a reg exp object for a reg exp string from a cache.
         *
         * @param {string} regexString reg exp string
         * @param {string} regexOptions reg exp options string
         *
         * @returns {object} RegExp object
         */
        cachedRegExp: function(regexString, regexOptions) {
            regexOptions = regexOptions || "";
            if (!this.__cachedRegExp[regexString])
                this.__cachedRegExp[regexString] = {};
            if (!this.__cachedRegExp[regexString][regexOptions])
                this.__cachedRegExp[regexString][regexOptions] = new RegExp(regexString, regexOptions);
            return this.__cachedRegExp[regexString][regexOptions];
        },

        IP_ADDRESS_REGEXP: /^\d+\.\d+\.\d+\.\d+$/,

        /**
         * Checks whether a given string is an IP address.
         *
         * @param {string} str potential ip address
         *
         * @returns {boolean} true if ip address
         */
        isIPAddress: function(str) {
            return this.IP_ADDRESS_REGEXP.test(str);
        },

        NORMALIZE_SEARCH_TEXT_MAPS: {
            "\\u00dc": "Ue",
            "\\u00fc": "ue",
            "\\u00c4": "Ae",
            "\\u00e4": "ae",
            "\\u00d6": "Oe",
            "\\u00f6": "oe",
            "\\u00df": "ss",
            /*
            "Ue": "U",
            "ue": "u",
            "Ae": "A",
            "ae": "a",
            "Oe": "O",
            "oe": "o",
             */
            "\\W": " ",
            "\\s+": " "
        },

        NORMALIZE_SEARCH_TEXT_MAPS_REGEX: function() {
            if (!this.NORMALIZE_SEARCH_TEXT_MAPS_CACHED) {
                this.NORMALIZE_SEARCH_TEXT_MAPS_CACHED = [];
                Objs.iter(this.NORMALIZE_SEARCH_TEXT_MAPS, function(value, key) {
                    this.NORMALIZE_SEARCH_TEXT_MAPS_CACHED.push({
                        search: new RegExp(key, "g"),
                        replace: value
                    });
                }, this);
            }
            return this.NORMALIZE_SEARCH_TEXT_MAPS_CACHED;
        },

        /**
         * Normalizes a search text in regards to umlauts etc.
         *
         * @param {string} text search text to be normalized
         * @returns {string} normalized search text
         */
        normalizeSearchText: function(text) {
            Objs.iter(this.NORMALIZE_SEARCH_TEXT_MAPS_REGEX(), function(searchReplace) {
                text = text.replace(searchReplace.search, searchReplace.replace);
            });
            return text.trim();
        }

    };

});
Scoped.define("module:Structures.AvlTree", function() {

    /**
     * Abstract AvlTree Structure
     * 
     * @module BetaJS.Structures.AvlTree
     */
    return {

        /**
         * Returns an empty avl tree.
         * 
         * @return {object} empty avl tree
         */
        empty: function() {
            return null;
        },

        /**
         * Returns a singleton avl tree.
         * 
         * @param data data for singleton node
         * 
         * @return {object} singleton avl tree
         */
        singleton: function(data) {
            return {
                data: data,
                left: null,
                right: null,
                height: 1,
                length: 1
            };
        },

        /**
         * Returns the smallest data item in an avl tree.
         * 
         * @param {object} root tree root
         * @return smallest data item
         */
        min: function(root) {
            return root.left ? this.min(root.left) : root.data;
        },

        /**
         * Returns the largest data item in an avl tree.
         * 
         * @param {object} root tree root
         * @return largest data item
         */
        max: function(root) {
            return root.right ? this.max(root.right) : root.data;
        },

        /**
         * Returns the height of an avl tree.
         * 
         * @param {object} root tree root
         * @return {int} height
         */
        height: function(node) {
            return node ? node.height : 0;
        },

        /**
         * Returns the number of nodes in an avl tree.
         * 
         * @param {object} root tree root
         * @return {int} number of nodes
         */
        length: function(node) {
            return node ? node.length : 0;
        },

        /**
         * @private
         */
        __height_join: function(left, right) {
            return 1 + Math.max(this.height(left), this.height(right));
        },

        /**
         * @private
         */
        length_join: function(left, right) {
            return 1 + this.length(left) + this.length(right);
        },

        /**
         * @private
         */
        __create: function(data, left, right) {
            return {
                data: data,
                left: left,
                right: right,
                height: this.__height_join(left, right),
                length: this.length_join(left, right)
            };
        },

        /**
         * Creates a new balanced tree from a tree of small elements, a tree of large elements and a data item inbetween.
         * 
         * @param data data item
         * @param {object} left avl tree of small elements
         * @param {object} right avl tree of large elements
         * 
         * @return {object} avl tree containing all data
         */
        balance: function(data, left, right) {
            if (this.height(left) > this.height(right) + 2) {
                if (this.height(left.left) >= this.height(left.right))
                    return this.__create(left.data, left.left, this.__create(data,
                        left.right, right));
                else
                    return this.__create(left.right.data, this.__create(left.data,
                        left.left, left.right.left), this.__create(data,
                        left.right.right, right));
            } else if (this.height(right) > this.height(left) + 2) {
                if (this.height(right.right) >= this.height(right.left))
                    return this.__create(right.data, this.__create(data, left,
                        right.left), right.right);
                else
                    return this.__create(right.left.data, this.__create(data, left,
                        right.left.left), this.__create(right.data,
                        right.left.right, right.right));
            } else
                return this.__create(data, left, right);
        },

        /**
         * @private
         */
        __add_left: function(data, left) {
            return left ? this.balance(left.data, this.__add_left(data, left.left),
                left.right) : this.singleton(data);
        },

        /**
         * @private
         */
        __add_right: function(data, right) {
            return right ? this.balance(right.data, right.data, this.__add_right(
                data, right.right)) : this.singleton(data);
        },

        /**
         * @private
         */
        __join: function(data, left, right) {
            if (!left)
                return this.__add_left(data, right);
            else if (!right)
                return this.__add_right(data, left);
            else if (this.height(left) > this.height(right) + 2)
                return this.balance(left.data, left.left, this.__join(data,
                    left.right, right));
            else if (this.height(right) > this.height(left) + 2)
                return this.balance(right.data, this.__join(data, left, right.left),
                    right.right);
            else
                return this.__create(data, left, right);
        },

        /**
         * Returns and removes the smallest item from the tree.
         * 
         * @param {object} root avl tree
         * 
         * @return {array} array, containing the smallest element and the remaining tree
         */
        take_min: function(root) {
            if (!root.left)
                return [root.data, root.right];
            var result = this.take_min(root.left);
            return [result[0], this.__join(root.data, result[1], root.right)];
        },

        /**
         * Returns and removes the largest item from the tree.
         * 
         * @param {object} root avl tree
         * 
         * @return {array} array, containing the largest element and the remaining tree
         */
        take_max: function(root) {
            if (!root.right)
                return [root.data, root.left];
            var result = this.take_max(root.right);
            return [result[0], this.__join(root.data, root.left, result[1])];
        },

        /*
        reroot : function(left, right) {
        	if (!left || !right)
        		return left || right;
        	if (this.height(left) > this.height(right)) {
        		var max = this.take_max(left);
        		return this.__join(max[0], max[1], right);
        	}
        	var min = this.take_min(right);
        	return this.__join(min[0], left, min[1]);
        },
        */

        /**
         * Returns and removes the smallest item from the tree, denaturalizing the tree in an iterative fashion.
         * 
         * @param {object} root avl tree
         * 
         * @return {array} array, containing the smallest element and the remaining denaturalized tree
         */
        take_min_iter: function(root) {
            if (!root)
                return null;
            if (!root.left)
                return [root.data, root.left];
            return this.take_min_iter(this.__create(root.left.data, root.left.left,
                this.__create(root.data, root.left.right, root.right)));
        },

        /**
         * Returns and removes the largest item from the tree, denaturalizing the tree in an iterative fashion.
         * 
         * @param {object} root avl tree
         * 
         * @return {array} array, containing the largest element and the remaining denaturalized tree
         */
        take_max_iter: function(root) {
            if (!root)
                return null;
            if (!root.right)
                return [root.data, root.right];
            return this.take_max_iter(this.__create(root.right.data, this.__create(
                root.data, root.left, root.right.left), root.right.right));
        }

    };

});


Scoped.define("module:Structures.TreeMap", ["module:Structures.AvlTree"], function(AvlTree) {

    /**
     * TreeMap Structure, based on AvlTree
     * 
     * @module BetaJS.Structures.TreeMap
     */
    return {

        /**
         * Returns an empty Tree Map.
         * 
         * @param {function} compare data comparison function
         * @return {object} empty tree map
         */
        empty: function(compare) {
            return {
                root: null,
                compare: compare || function(x, y) {
                    return x > y ? 1 : x < y ? -1 : 0;
                }
            };
        },

        /**
         * Determines whether a tree map is empty.
         * 
         * @param {object} t tree map
         * @return {boolean} true if empty
         */
        is_empty: function(t) {
            return !t.root;
        },

        /**
         * Returns the number of elements in the map.
         * 
         * @param {object} t tree map
         * @return {int} number of elements
         */
        length: function(t) {
            return t.root ? t.root.length : 0;
        },

        /**
         * @private
         */
        __add: function(key, value, t, node) {
            var kv = {
                key: key,
                value: value
            };
            if (!node)
                return AvlTree.singleton(kv);
            var c = t.compare(key, node.data.key);
            if (c === 0) {
                node.data = kv;
                return node;
            } else if (c < 0)
                return AvlTree.balance(node.data, this.__add(key, value, t, node.left), node.right);
            else
                return AvlTree.balance(node.data, node.left, this.__add(key, value, t, node.right));
        },

        /**
         * Add a key value mapping to the map.
         * 
         * @param key key
         * @param value value
         * @param {object} t tree map
         * 
         * @return {object} updated tree map
         */
        add: function(key, value, t) {
            t.root = this.__add(key, value, t, t.root);
            return t;
        },

        /**
         * Creates a singleton tree map.
         * 
         * @param key key
         * @param value value
         * @param {function} compare comparison function
         * 
         * @return {object} singleton tree map
         */
        singleton: function(key, value, compare) {
            return this.add(key, value, this.empty(compare));
        },

        /**
         * @private
         */
        __find: function(key, t, root) {
            if (!root)
                return null;
            var c = t.compare(key, root.data.key);
            return c === 0 ? root.data.value : this.__find(key, t, c < 0 ? root.left : root.right);
        },

        /**
         * Finds a value for a key in the map.
         * 
         * @param key key
         * @param {object} t tree map
         * @return value for key
         */
        find: function(key, t) {
            return this.__find(key, t, t.root);
        },

        /**
         * @private
         */
        __iterate: function(t, node, callback, context, reverse) {
            if (!node)
                return true;
            return (
                this.__iterate(t, reverse ? node.right : node.left, callback, context, reverse) &&
                (callback.call(context, node.data.key, node.data.value) !== false) &&
                this.__iterate(t, reverse ? node.left : node.right, callback, context, reverse));
        },

        /**
         * Iterates over the tree map.
         * 
         * @param {object} t tree map
         * @param {function} callback callback function
         * @param {object} context optional callback context
         * @param {boolean} reverse optional reverse direction flag
         */
        iterate: function(t, callback, context, reverse) {
            this.__iterate(t, t.root, callback, context, reverse);
        },

        /**
         * @private
         */
        __iterate_from: function(key, t, node, callback, context, reverse) {
            if (!node)
                return true;
            var c = t.compare(key, node.data.key) * (reverse ? -1 : 1);
            if (c < 0 && !this.__iterate_from(key, t, reverse ? node.right : node.left, callback, context, reverse))
                return false;
            if (c <= 0 && callback.call(context, node.data.key, node.data.value) === false)
                return false;
            return this.__iterate_from(key, t, reverse ? node.left : node.right, callback, context, reverse);
        },

        /**
         * Iterates over the tree map starting with a key.
         * 
         * @param key key to start with
         * @param {object} t tree map
         * @param {function} callback callback function
         * @param {object} context optional callback context
         * @param {boolean} reverse optional reverse direction flag
         */
        iterate_from: function(key, t, callback, context, reverse) {
            this.__iterate_from(key, t, t.root, callback, context, reverse);
        },

        /**
         * Iterates over the tree map between two keys.
         * 
         * @param from_key key to start with
         * @param to_key key to end with
         * @param {object} t tree map
         * @param {function} callback callback function
         * @param {object} context optional callback context
         * @param {boolean} reverse optional reverse direction flag
         */
        iterate_range: function(from_key, to_key, t, callback, context, reverse) {
            this.iterate_from(from_key, t, function(key, value) {
                return t.compare(key, to_key) * (reverse ? -1 : 1) <= 0 && callback.call(context, key, value) !== false;
            }, this, reverse);
        },

        /*
        __downpath: function (current, reverse, path) {
        	path = path || [];
        	while (current) {
        		path.push(current);
        		current = reverse ? current.right : current.left
        	}
        	return path;
        },
		
        iteratorInit: function (t, reverse) {
        	return {
        		path: this.__downpath(t.root, reverse),
        		reverse: reverse
        	};
        },
		
        iteratorHasNext: function (iter) {
        	return iter.path.length > 0;
        },
		
        iteratorNext: function (iter) {
        	var current = iter.path[iter.path.length - 1];
        	var data = current.data;
        	var next = iter.reverse ? current.left : current.right;
        	if (next)
        		iter.path = this.__downpath(next, iter.reverse, iter.path);
        	else {
        		while (iter.path.length > 0) {
        			var child = iter.path.pop();
        			current = iter.path[iter.path.length - 1];
        			next = iter.reverse ? current.left : current.right;
        			if (current !== next)
        				break;
        		}
        	}
        	return data;
        },
        */

        /**
         * Returns and removes the smallest element from the tree.
         * 
         * @param {object} tree map
         * @return {object} smalles key value pair
         */
        take_min: function(t) {
            var a = AvlTree.take_min(t.root);
            a[1] = {
                compare: t.compare,
                root: a[1]
            };
            return a;
        },

        /**
         * @private
         */
        __treeSizeLeft: function(key, t, node) {
            var c = t.compare(key, node.data.key);
            if (c < 0)
                return this.__treeSizeLeft(key, t, node.left);
            return 1 + (node.left ? node.left.length : 0) + (c > 0 ? this.__treeSizeLeft(key, t, node.right) : 0);
        },

        /**
         * @private
         */
        __treeSizeRight: function(key, t, node) {
            var c = t.compare(key, node.data.key);
            if (c > 0)
                return this.__treeSizeRight(key, t, node.right);
            return 1 + (node.right ? node.right.length : 0) + (c < 0 ? this.__treeSizeRight(key, t, node.left) : 0);
        },

        /**
         * @private
         */
        __distance: function(keyLeft, keyRight, t, node) {
            var cLeft = t.compare(keyLeft, node.data.key);
            var cRight = t.compare(keyRight, node.data.key);
            if (cLeft > 0 || cRight < 0)
                return this.__distance(keyLeft, keyRight, t, cLeft > 0 ? node.right : node.left);
            return 1 + (cRight > 0 ? this.__treeSizeLeft(keyRight, t, node.right) : 0) + (cLeft < 0 ? this.__treeSizeRight(keyLeft, t, node.left) : 0);
        },

        /**
         * Counts the number of keys smaller than a given key.
         * 
         * @param key key
         * @param {object} t tree map
         * @return {int} number of keys smaller than given key
         */
        treeSizeLeft: function(key, t) {
            return this.__treeSizeLeft(key, t, t.root);
        },

        /**
         * Counts the number of keys larger than a given key.
         * 
         * @param key key
         * @param {object} t tree map
         * @return {int} number of keys larger than given key
         */
        treeSizeRight: function(key, t) {
            return this.__treeSizeRight(key, t, t.root);
        },

        /**
         * Counts the number of keys between two keys.
         * 
         * @param keyLeft first key
         * @param keyRight second key
         * @param {object} t tree map
         * @return {int} number of keys in-between
         */
        distance: function(keyLeft, keyRight, t) {
            return t.compare(keyLeft, keyRight) < 0 ? this.__distance(keyLeft, keyRight, t, t.root) - 1 : 0;
        }

    };

});
/*
 * Inspired by Underscore's Templating Engine
 * (which itself is inspired by John Resig's implementation)
 */

Scoped.define("module:Templates", ["module:Types", "module:Strings"], function(Types, Strings) {
    /**
     * A very simple templating engine.
     *
     * @module BetaJS.Templates
     */
    return {

        /**
         * Tokenizes a string comprised of escaped javascript code and normal text.
         * 
         * @param {string} s input string
         *
         * @return {array} array of token objects
         */
        tokenize: function(s) {
            // Already tokenized?
            if (Types.is_array(s))
                return s;
            var tokens = [];
            var index = 0;
            var self = this;
            s.replace(self.SYNTAX_REGEX(), function(match, expr, esc, code, offset) {
                if (index < offset)
                    tokens.push({
                        type: self.TOKEN_STRING,
                        data: Strings.js_escape(s.slice(index, offset))
                    });
                if (code)
                    tokens.push({
                        type: self.TOKEN_CODE,
                        data: code
                    });
                if (expr)
                    tokens.push({
                        type: self.TOKEN_EXPR,
                        data: expr
                    });
                if (esc)
                    tokens.push({
                        type: self.TOKEN_ESC,
                        data: esc
                    });
                index = offset + match.length;
                return match;
            });
            return tokens;
        },

        /**
         * Compiles a template string into a function that evaluates the template w.r.t. a given environment.
         * 
         * @param {string} s input string
         * @param {object} options options hash, allowing to specify start_index and end_index within the input string (optional)
         * @return {function} evaluation function
         */
        compile: function(source, options) {
            if (Types.is_string(source))
                source = this.tokenize(source);
            options = options || {};
            var start_index = options.start_index || 0;
            var end_index = options.end_index || source.length;
            var result = "__p+='";
            for (var i = start_index; i < end_index; ++i) {
                switch (source[i].type) {
                    case this.TOKEN_STRING:
                        result += source[i].data;
                        break;
                    case this.TOKEN_CODE:
                        result += "';\n" + source[i].data + "\n__p+='";
                        break;
                    case this.TOKEN_EXPR:
                        result += "'+\n((__t=(" + source[i].data + "))==null?'':__t)+\n'";
                        break;
                    case this.TOKEN_ESC:
                        result += "'+\n((__t=(" + source[i].data + "))==null?'':Helpers.Strings.htmlentities(__t))+\n'";
                        break;
                    default:
                        break;
                }
            }
            result += "';\n";
            result = 'with(obj||{}){\n' + result + '}\n';
            result = "var __t,__p='',__j=Array.prototype.join," +
                "echo=function(){__p+=__j.call(arguments,'');};\n" +
                result + "return __p;\n";
            /*jslint evil: true */
            var func = new Function('obj', 'Helpers', result);
            var func_call = function(data) {
                return func.call(this, data, {
                    Strings: Strings
                });
            };
            func_call.source = 'function(obj, Helpers){\n' + result + '}';
            return func_call;
        },

        SYNTAX: {
            OPEN: "{%",
            CLOSE: "%}",
            MODIFIER_CODE: "",
            MODIFIER_EXPR: "=",
            MODIFIER_ESC: "-"
        },

        SYNTAX_REGEX: function() {
            var syntax = this.SYNTAX;
            if (!this.SYNTAX_REGEX_CACHED) {
                this.SYNTAX_REGEX_CACHED = new RegExp(
                    syntax.OPEN + syntax.MODIFIER_EXPR + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
                    syntax.OPEN + syntax.MODIFIER_ESC + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
                    syntax.OPEN + syntax.MODIFIER_CODE + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
                    "$",
                    'g');
            }
            return this.SYNTAX_REGEX_CACHED;
        },

        TOKEN_STRING: 1,
        TOKEN_CODE: 2,
        TOKEN_EXPR: 3,
        TOKEN_ESC: 4

    };
});


Scoped.define("module:Templates.Template", ["module:Class", "module:Templates"], function(Class, Templates, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(template_string) {
                inherited.constructor.call(this);
                this.__tokens = Templates.tokenize(template_string);
                this.__compiled = Templates.compile(this.__tokens);
            },

            evaluate: function(obj) {
                return this.__compiled.apply(this, [obj]);
            }

        };
    });
});
Scoped.define("module:TimeFormat", ["module:Time", "module:Strings", "module:Objs"], function(Time, Strings, Objs) {
    /**
     * Module for formatting Time / Date
     * 
     * @module BetaJS.TimeFormat
     */
    return {

        /*
        	HH	Hours; leading zero for single-digit hours (24-hour clock).
        	H	Hours; no leading zero for single-digit hours (24-hour clock).
        	h+  Hours; hours as absolute number
        	hh	Hours; leading zero for single-digit hours (12-hour clock).
        	h	Hours; no leading zero for single-digit hours (12-hour clock).
        	M+  Minutes; minutes as absolute number
        	MM	Minutes; leading zero for single-digit minutes.
        	M	Minutes; no leading zero for single-digit minutes.
        	s+	Seconds; seconds as absolute number
        	ss	Seconds; leading zero for single-digit seconds.
        	s	Seconds; no leading zero for single-digit seconds.
        	mmm	Month as a three-letter abbreviation.
        	mm	Month as digits; leading zero for single-digit months.
        	m	Month as digits; no leading zero for single-digit months.
        	d+	Days; days as absolute number
        	ddddDay of the week as string.
        	ddd	Day of the week as a three-letter abbreviation.
        	dd	Day of the month as digits; leading zero for single-digit days.
        	d	Day of the month as digits; no leading zero for single-digit days.
        	yy	Year as last two digits; leading zero for years less than 10.
        	yyyyYear represented by four digits.
        	l+  Milliseconds; absolute
        	l   Milliseconds 3 digits
        	L   Milliseconds 2 digits
        	t	Lowercase, single-character time marker string: a or p.
        	tt	Lowercase, two-character time marker string: am or pm.
        	T	Uppercase, single-character time marker string: A or P.
        	TT	Uppercase, two-character time marker string: AM or PM.
        	o	GMT/UTC timezone offset, e.g. -0500 or +0230.
        	
        */

        formatMappings: {
            "HH": function(t) {
                return Strings.padZeros(Time.timeModulo(t, "hour", "floor"), 2);
            },
            "H": function(t) {
                return Time.timeModulo(t, "hour", "floor");
            },
            "h+": function(t) {
                return Time.timeComponent(t, "hour", "floor");
            },
            "hh": function(t) {
                var h = Time.timeModulo(t, "hour", "floor");
                h = h === 0 ? 12 : (h > 12 ? h - 12 : h);
                return Strings.padZeros(h, " ", 2);
            },
            "h": function(t) {
                var h = Time.timeModulo(t, "hour", "floor");
                h = h === 0 ? 12 : (h > 12 ? h - 12 : h);
                return h;
            },
            "M+": function(t) {
                return Time.timeComponent(t, "minute", "floor");
            },
            "MM": function(t) {
                return Strings.padZeros(Time.timeModulo(t, "minute", "floor"), 2);
            },
            "M": function(t) {
                return Time.timeModulo(t, "minute", "floor");
            },
            "s+": function(t) {
                return Time.timeComponent(t, "second", "floor");
            },
            "ss": function(t) {
                return Strings.padZeros(Time.timeModulo(t, "second", "floor"), 2);
            },
            "s": function(t) {
                return Time.timeModulo(t, "second", "floor");
            },
            "mmm": function(t) {
                return ((new Date(t)).toUTCString().split(" "))[2];
            },
            "mm": function(t) {
                return Strings.padZeros(Time.timeComponentGet(t, "month") + 1, 2);
            },
            "m": function(t) {
                return Time.timeComponentGet(t, "month") + 1;
            },
            "d+": function(t) {
                return Time.timeComponent(t, "day", "floor");
            },
            "dddd": function(t) {
                var map = {
                    2: "s",
                    3: "nes",
                    4: "rs",
                    6: "ur"
                };
                return (new Date(t)).toUTCString().substring(0, 3) + (map[Time.timeComponentGet(t, "weekday")] || "") + "day";
            },
            "ddd": function(t) {
                return (new Date(t)).toUTCString().substring(0, 3);
            },
            "dd": function(t) {
                return Strings.padZeros(Time.timeComponentGet(t, "day") + 1, 2);
            },
            "d": function(t) {
                return Time.timeComponentGet(t, "day") + 1;
            },
            "yyyy": function(t) {
                return Time.timeComponentGet(t, "year");
            },
            "yy": function(t) {
                return Time.timeComponentGet(t, "year") % 100;
            },
            "l+": function(t) {
                return t.getTime();
            },
            "l": function(t) {
                return Time.timeComponentGet(t, "millisecond");
            },
            "L": function(t) {
                return Math.floor(Time.timeComponentGet(t, "millisecond") / 10);
            },
            "tt": function(t) {
                return Time.timeModulo(t, "hour", "floor") < 12 ? 'am' : 'pm';
            },
            "t": function(t) {
                return Time.timeModulo(t, "hour", "floor") < 12 ? 'a' : 'p';
            },
            "TT": function(t) {
                return Time.timeModulo(t, "hour", "floor") < 12 ? 'AM' : 'PM';
            },
            "T": function(t) {
                return Time.timeModulo(t, "hour", "floor") < 12 ? 'A' : 'P';
            },
            "o": function(t, bias) {
                bias = Math.floor(bias / 1000 / 60);
                return (bias > 0 ? "-" : "+") + Strings.padZeros(Math.floor(Math.abs(bias) / 60) * 100 + Math.abs(bias) % 60, 4);
            }

        },

        ELAPSED_HOURS_MINUTES_SECONDS: "h+:MM:ss",
        ELAPSED_MINUTES_SECONDS: "M+:ss",
        FULL_YEAR: "yyyy",
        LETTER_MONTH: "mmm",
        LETTER_MONTH_AND_DAY: "mmm d",
        WEEKDAY: "ddd",
        HOURS_MINUTES_TT: "hh:MM tt",


        /**
         * Format a given time w.r.t. a given time format
         * 
         * @param {string} timeFormat a time format string
         * @param {int} time time as integer to be formatted
         * @param {int} timezone timezone bias (optional)
         * @return {string} formatted time
         * 
         */
        format: function(timeFormat, time, timezone) {
            time = time || Time.now();
            var timezoneTime = Time.timeToTimezoneBasedDate(time, timezone);
            var bias = Time.timezoneBias(timezone);
            var result = timeFormat;
            var replacers = [];
            Objs.iter(this.formatMappings, function(formatter, key) {
                if (result.indexOf(key) >= 0) {
                    var i = replacers.length;
                    replacers.push(formatter(timezoneTime, bias));
                    result = result.replace(key, "$" + i + "$");
                }
            }, this);
            for (var i = 0; i < replacers.length; ++i)
                result = result.replace("$" + i + "$", replacers[i]);
            return result;
        },

        /**
         * Format the month as a three letter string
         * 
         * @param {int} month month as an int
         * @return {string} three letter month string
         */
        monthString: function(month) {
            return this.format("mmm", Time.encodePeriod({
                month: month
            }));
        },

        /**
         * Format the weekday as a three letter string
         * 
         * @param {int} weekday weekday as an int
         * @return {string} three letter weekday string
         */
        weekdayString: function(weekday) {
            return this.format("ddd", Time.encodePeriod({
                weekday: weekday
            }));
        },

        /**
         * Returns the week number
         *
         * @param {int} time time
         * @param {int} timezone timezone
         * @return {int} number of the week in a year
         */
        weekNumber: function(time, timezone) {
            var base = new Date(time + Time.timezoneBias(timezone));
            var d = new Date(Date.UTC(base.getFullYear(), base.getMonth(), base.getDate()));
            var dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        },

        // /**
        //  * Format most significant part of date / time relative to current time
        //  *
        //  * @param {int} time date/time to be formatted
        //  * @param {int} currentTime relative to current time (optional)
        //  * @param {int} timezone time zone bias (optional)
        //  * @return {string} formatted time
        //  */
        // formatRelativeMostSignificant: function(time, currentTime, timezone) {
        //     currentTime = currentTime || Time.now();
        //     var t = Time.decodeTime(time, timezone);
        //     var c = Time.decodeTime(currentTime, timezone);
        //     // Same day. Return time.
        //     if (t.year === c.year && t.month === c.month && t.day === c.day)
        //         return this.format('hh:MM tt', time, timezone);
        //     // Less than 7 days. Return week day.
        //     if (currentTime - time < 7 * 24 * 60 * 60 * 1000 && t.weekday !== c.weekday)
        //         return this.format('dddd', time, timezone);
        //     // Last 2 months?
        //     if ((t.year === c.year && t.month + 1 >= c.month) || (t.year + 1 === c.year && t.month + 1 >= c.month + 12 - 1))
        //         return this.format('mmm d', time, timezone);
        //     // Last 11 month?
        //     if (t.year === c.year || (t.year + 1 === c.year && t.month > c.month))
        //         return this.format('mmm', time, timezone);
        //     // Return year
        //     return this.format('yyyy', time, timezone);
        // },

        /**
         * Format most significant part of date / time relative to current time
         *
         * @param {int} time date/time to be formatted
         * @param {int} currentTime relative to current time (optional)
         * @param {int} timezone time zone bias (optional)
         * @return {string} formatted time
         */
        formatRelativeMostSignificant: function(time, currentTime, timezone) {
            if (time === Infinity)
                return 'Someday';

            currentTime = currentTime || Time.now();
            var t = Time.decodeTime(time, timezone);
            var c = Time.decodeTime(currentTime, timezone);

            // Yesterday + time
            if (t.year === c.year && t.month === c.month && t.day === c.day - 1)
                return 'Yesterday ' + this.format('hh:MM tt', time, timezone);
            // Today + time
            if (t.year === c.year && t.month === c.month && t.day === c.day)
                return 'Today ' + this.format('hh:MM tt', time, timezone);
            // Tomorrow + time.
            if (t.year === c.year && t.month === c.month && t.day === c.day + 1)
                return 'Tomorrow ' + this.format('hh:MM tt', time, timezone);
            // Less than 7 days. Return week day.
            if (Math.abs(currentTime - time) < 7 * 24 * 60 * 60 * 1000 && t.weekday !== c.weekday)
                return this.format('dddd', time, timezone);
            // Last 2 months?
            if ((t.year === c.year && t.month + 1 >= c.month) || (t.year + 1 === c.year && t.month + 1 >= c.month + 12 - 1))
                return this.format('mmm d', time, timezone);
            // Last 11 month?
            if (t.year === c.year || (t.year + 1 === c.year && t.month > c.month))
                return this.format('mmm', time, timezone);
            // Return year
            return this.format('yyyy', time, timezone);
        }

    };
});
Scoped.define("module:Time", [], function() {
    /**
     * Time Helper Functions
     * 
     * All time routines are based on UTC time.
     * The optional timezone parameter should be used as follows:
     *    - undefined or false: UTC
     *    - true: user's local time zone
     *    - int value: actual time zone bias in minutes
     *    
     * @module BetaJS.Time
     */
    return {

        __components: {
            "year": {
                "set": function(date, value) {
                    date.setUTCFullYear(value);
                },
                "get": function(date) {
                    return date.getUTCFullYear();
                }
            },
            "month": {
                "set": function(date, value) {
                    date.setUTCMonth(value);
                },
                "get": function(date) {
                    return date.getUTCMonth();
                }
            },
            "day": {
                "dependencies": {
                    "weekday": true
                },
                "set": function(date, value) {
                    date.setUTCDate(value + 1);
                },
                "get": function(date) {
                    return date.getUTCDate() - 1;
                },
                "milliseconds": 24 * 60 * 60 * 1000
            },
            "weekday": {
                "dependencies": {
                    "day": true,
                    "month": true,
                    "year": true
                },
                "set": function(date, value) {
                    date.setUTCDate(date.getUTCDate() + value - date.getUTCDay());
                },
                "get": function(date) {
                    return date.getUTCDay();
                }
            },
            "hour": {
                "set": function(date, value) {
                    date.setUTCHours(value);
                },
                "get": function(date) {
                    return date.getUTCHours();
                },
                "max": 23,
                "milliseconds": 60 * 60 * 1000
            },
            "minute": {
                "set": function(date, value) {
                    date.setUTCMinutes(value);
                },
                "get": function(date) {
                    return date.getUTCMinutes();
                },
                "max": 59,
                "milliseconds": 60 * 1000
            },
            "second": {
                "set": function(date, value) {
                    date.setUTCSeconds(value);
                },
                "get": function(date) {
                    return date.getUTCSeconds();
                },
                "max": 59,
                "milliseconds": 1000
            },
            "millisecond": {
                "set": function(date, value) {
                    date.setUTCMilliseconds(value);
                },
                "get": function(date) {
                    return date.getUTCMilliseconds();
                },
                "max": 999,
                "milliseconds": 1
            }
        },

        /**
         * Reads the current timezone offset.
         *
         * @return {int} timezone offset in minutes
         */
        getTimezoneOffset: function() {
            return this.__timezoneOffset === undefined ? (new Date()).getTimezoneOffset() : this.__timezoneOffset;
        },

        /**
         * Overwrites the current timezone offset.
         *
         * @param {int} timezoneOffset timezone offset in minutes (undefined to disable overwrite)
         */
        setTimezoneOffset: function(timezoneOffset) {
            this.__timezoneOffset = timezoneOffset;
        },

        /**
         * Computes the timezone bias in milliseconds from UTC
         * 
         * @param {int} timezone bias in minutes; can be true to use current time zone; can be undefined to use UTC
         * 
         * @return {int} timezone bias in milliseconds
         */
        timezoneBias: function(timezone) {
            if (timezone === true)
                timezone = this.getTimezoneOffset();
            if (typeof timezone == "undefined" || timezone === null || timezone === false)
                timezone = 0;
            return timezone * 60 * 1000;
        },

        /**
         * Given a time in milliseconds, compute a Date object.
         * 
         * @param {int} t time in milliseconds
         * @param {int} timezone timezone (optional)
         * 
         * @return {object} Date object
         */
        timeToDate: function(t, timezone) {
            return new Date(t + this.timezoneBias(timezone));
        },

        /**
         * Given a time as a Date object, return UTC time in milliseconds.
         * 
         * @param {object} d time as Date object
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} UTC time in milliseconds
         */
        dateToTime: function(d, timezone) {
            return d.getTime() - this.timezoneBias(timezone);
        },

        /**
         * Given a time in milliseconds, compute a timezone-based Date object.
         * 
         * @param {int} t time in milliseconds
         * @param {int} timezone timezone (optional)
         * 
         * @return {object} timezone-based Date object
         */
        timeToTimezoneBasedDate: function(t, timezone) {
            return new Date(t - this.timezoneBias(timezone));
        },

        /**
         * Given a time as a timezone-based Date object, return UTC time in milliseconds.
         * 
         * @param {object} d time as a timezone-based Date object
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} UTC time in milliseconds
         */
        timezoneBasedDateToTime: function(d, timezone) {
            return d.getTime() + this.timezoneBias(timezone);
        },

        /**
         * Decode time into its time components
         *
         * @param {int} t time in milliseconds
         * @param {int} timezone timezone (optional)
         * 
         * @return {object} decoded time component
         */
        decodeTime: function(t, timezone) {
            var d = this.timeToTimezoneBasedDate(t || this.now(), timezone);
            var result = {};
            for (var key in this.__components)
                result[key] = this.__components[key].get(d);
            return result;
        },

        /**
         * Encode time from components to UTC time
         * 
         * @param {object} data component data
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} encoded UTC time
         */
        encodeTime: function(data, timezone) {
            return this.updateTime(this.now(), data, timezone);
        },

        /**
         * Encode time period data from components to milliseconds
         * 
         * @param {object} data component data
         * 
         * @return {int} encoded milliseconds
         */
        encodePeriod: function(data) {
            return this.incrementTime(0, data);
        },

        /**
         * Updates a given time with respect to provided component data
         * 
         * @param {int} t UTC time
         * @param {object} data component data
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} updated UTC time
         */
        updateTime: function(t, data, timezone) {
            var d = this.timeToTimezoneBasedDate(t, timezone);
            for (var key in data)
                this.__components[key].set(d, data[key]);
            return this.timezoneBasedDateToTime(d, timezone);
        },

        /**
         * Returns the current time in milliseconds
         * 
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} current time
         */
        now: function(timezone) {
            return this.dateToTime(new Date(), timezone);
        },

        /**
         * Returns the earliest time in the future in milliseconds that has not been queried before.
         *
         * @param {int} delta delta (optional, default 1)
         * @param {int} timezone timezone (optional)
         *
         * @return {int} earliest time in the future
         */
        uniqueAtLeastNow: function(delta, timezone) {
            var candidate = this.now(timezone);
            if (this.__unique_at_least_now && this.__unique_at_least_now >= candidate)
                candidate = this.__unique_at_least_now + (delta || 1);
            this.__unique_at_least_now = candidate;
            return candidate;
        },

        /**
         * Returns the performance time in millseconds
         * 
         * @return {float} performance time
         */
        perfNow: function() {
            return typeof performance === "undefined" ? (new Date()).getTime() : performance.now();
        },

        /**
         * Increments a given time with respect to provided component data
         * 
         * @param {int} t UTC time
         * @param {object} data component data
         * 
         * @return {int} incremented UTC time
         */
        incrementTime: function(t, data) {
            var d = this.timeToDate(t);
            for (var key in data)
                this.__components[key].set(d, this.__components[key].get(d) + data[key]);
            return this.dateToTime(d);
        },

        /**
         * Floors a given time with respect to a component key and all smaller components.
         * 
         * @param {int} t time
         * @param {string} key component key
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} floored time
         */
        floorTime: function(t, key, timezone) {
            var d = this.timeToTimezoneBasedDate(t, timezone);
            var found = false;
            for (var comp in this.__components) {
                var c = this.__components[comp];
                found = found || comp == key;
                if (found && (!c.dependencies || !c.dependencies[key]))
                    c.set(d, 0);
            }
            return this.timezoneBasedDateToTime(d, timezone);
        },

        /**
         * Computes how long a specific time is ago from now.
         * 
         * @param {int} t time
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} milliseconds ago
         */
        ago: function(t, timezone) {
            return this.now(timezone) - t;
        },

        /**
         * Returns the multiplicity of a time component given a time.
         * 
         * @param {int} t time
         * @param {string} key component key
         * @param {function} rounding function (default is floor)
         * 
         * @return {int} multiplicity of time
         */
        timeComponent: function(t, key, round) {
            return Math[round || "floor"](t / this.__components[key].milliseconds);
        },

        /**
         * Returns the value of a time component given a time.
         * 
         * @param {int} t time
         * @param {string} key component key
         * @param {int} timezone timezone (optional)
         * 
         * @return {int} value of time
         */
        timeComponentGet: function(t, key, timezone) {
            return this.__components[key].get(this.timeToTimezoneBasedDate(t, timezone));
        },

        /**
         * Returns the remainder of a time component given a time.
         * 
         * @param {int} t time
         * @param {string} key component key
         * @param {function} rounding function (default is floor)
         * 
         * @return {int} remainder of time
         */
        timeModulo: function(t, key, round) {
            return this.timeComponent(t, key, round) % (this.__components[key].max + 1);
        }

    };

});
Scoped.define("module:Trees.TreeNavigator", function() {

    /**
     * Abstract Tree Navigator Mixin
     * 
     * @mixin BetaJS.Trees.TreeNavigator
     */
    return {

        /**
         * Returns the root node of a tree.
         * 
         * @return {object} Root node
         */
        nodeRoot: function() {},

        /**
         * Retrusns the id of a node.
         * 
         * @param {object} node Node
         * @return {string} Id of node
         */
        nodeId: function(node) {},

        /**
         * Returns the parent of a node.
         * 
         * @param {object} node Node
         * @return {object} Parent node
         */
        nodeParent: function(node) {},

        /**
         * Returns the children of a node.
         * 
         * @param {object} node Node
         * @return {array} Children of the node
         */
        nodeChildren: function(node) {},

        /**
         * Watches a node for changes.
         * 
         * @param {object} node Node
         * @param {function} func Change callback function
         * @param {object} context Optional change callback context
         */
        nodeWatch: function(node, func, context) {},

        /**
         * Unwatches a node for changes.
         * 
         * @param {object} node Node
         * @param {function} func Change callback function
         * @param {object} context Optional change callback context
         */
        nodeUnwatch: function(node, func, context) {},

        /**
         * Returns the data associated with a node.
         * 
         * @param {object} node Node
         * @return {object} Node data
         */
        nodeData: function(node) {}

    };
});


Scoped.define("module:Trees.TreeQueryEngine", [
    "module:Class",
    "module:Parser.Lexer",
    "module:Trees.TreeQueryObject"
], function(Class, Lexer, TreeQueryObject, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Tree Query Engine Class
         * 
         * @class BetaJS.Trees.TreeQueryEngine
         */
        return {

            /**
             * Create a new instance.
             * 
             * @param {object} navigator Navigator instance
             */
            constructor: function(navigator) {
                inherited.constructor.call(this);
                this.__navigator = navigator;
                this.__lexer = this._auto_destroy(new Lexer({
                    "<\\+": {
                        token: "Up"
                    },
                    "<": {
                        token: "Up",
                        single: true
                    },
                    ">\\+": {
                        token: "Down"
                    },
                    ">": {
                        token: "Down",
                        single: true
                    },
                    "\\[\s*([a-zA-Z]+)\s*=\s*\'([^']*)\'\s*\\]": {
                        token: "Selector",
                        key: "$1",
                        value: "$2"
                    },
                    "\\[\s*([a-zA-Z]+)\s*=\s*\"([^']*)\"\s*\\]": {
                        token: "Selector",
                        key: "$1",
                        value: "$2"
                    },
                    "\s": null
                }));
            },

            /**
             * Query the tree.
             * 
             * @param {object} node Node to start the query from
             * @param {string} query Query string
             * 
             * @return {object} Tree query object for the query
             */
            query: function(node, query) {
                return new TreeQueryObject(this.__navigator, node, this.__lexer.lex(query));
            }

        };
    });
});


Scoped.define("module:Trees.TreeQueryObject", [
    "module:Class",
    "module:Events.EventsMixin",
    "module:Objs",
    "module:Types"
], function(Class, EventsMixin, Objs, Types, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

        /**
         * Object representing a tree query on a node
         *
         * @class BetaJS.Trees.TreeQueryObject
         */
        return {

            /**
             * Create new instance.
             * 
             * @param {object} navigator Navigator object
             * @param {object} node Node of the query
             * @param {object} query Lexed query
             */
            constructor: function(navigator, node, query) {
                inherited.constructor.call(this);
                this.__navigator = navigator;
                this.__node = node;
                this.__query = query;
                this.__result = {};
                this.__partials = {};
                this.__ids = 0;
                this.__register(node, 0, {});
            },

            /**
             * @override
             */
            destroy: function() {
                Objs.iter(this.__partials, function(partials) {
                    Objs.iter(partials.partials, function(partial) {
                        this.__navigator.nodeUnwatch(partials.node, null, partial);
                    }, this);
                }, this);
                inherited.destroy.call(this);
            },

            /**
             * Returns the currently matching nodes.
             * 
             * @return {array} Matching nodes.
             */
            result: function() {
                var result = [];
                Objs.iter(this.__result, function(value) {
                    result.push(value.node);
                });
                return result;
            },

            __register: function(node, index) {
                var node_id = this.__navigator.nodeId(node);
                if (!this.__partials[node_id]) {
                    this.__partials[node_id] = {
                        node: node,
                        partials: {}
                    };
                }
                var partials = this.__partials[node_id];
                this.__ids++;
                var partial = {
                    owner: partials,
                    id: this.__ids,
                    query_index_start: index,
                    query_index_next: index,
                    query_index_last: index,
                    partial_match: false,
                    partial_final: index >= this.__query.length,
                    partial_data: false,
                    partial_children: false,
                    partial_parent: false,
                    partial_star: false,
                    parent: null,
                    deps: {}
                };
                partials.partials[partial.id] = partial;
                for (var i = partial.query_index_start; i < this.__query.length; ++i) {
                    if (this.__query[i].token == "Selector")
                        partial.partial_data = true;
                    else {
                        if (this.__query[i].token == "Up")
                            partial.partial_parent = true;
                        else if (this.__query[i].token == "Down")
                            partial.partial_children = true;
                        partial.partial_star = !this.__query[i].single;
                        if (!partial.partial_star)
                            partial.query_index_next = i + 1;
                        break;
                    }
                    partial.query_index_next = i + 1;
                    partial.partial_final = i + 1 == this.__query.length;
                }
                partial.query_index_last = partial.partial_star ? partial.query_index_next + 1 : partial.query_index_next;
                var self = this;
                this.__navigator.nodeWatch(node, function(action, node) {
                    if (action == "data" && partial.partial_data)
                        self.__update(partial);
                    if (action == "remove")
                        self.__unregisterPartial(partial);
                    if (action == "addChild" && partial.partial_children && partial.partial_match)
                        self.__addDependentPartial(partial, node);
                }, partial);
                this.__update(partial);
                return partial;
            },

            __unregisterPartial: function(partial) {
                var owner = partial.owner;
                var node = owner.node;
                var node_id = this.__navigator.nodeId(node);
                if (partial.partial_final && this.__result[node_id]) {
                    this.__result[node_id].count--;
                    if (this.__result[node_id].count <= 0) {
                        delete this.__result[node_id];
                        /**
                         * @event BetaJS.Trees.TreeQueryObject#remove
                         */
                        this.trigger("remove", node);
                        /**
                         * @event BetaJS.Trees.TreeQueryObject#change
                         */
                        this.trigger("change");
                    }
                }
                Objs.iter(partial.deps, this.__unregisterPartial, this);
                if (partial.parent)
                    delete partial.parent.deps[partial.id];
                this.__navigator.nodeUnwatch(node, null, partial);
                delete owner.partials[partial.id];
                if (Types.is_empty(owner.partials))
                    delete this.__partials[node_id];
            },

            __addDependentPartial: function(partial, node) {
                var partials = [];
                partials.push(this.__register(node, partial.query_index_next));
                if (partial.partial_star)
                    partials.push(this.__register(node, partial.query_index_next + 1));
                Objs.iter(partials, function(p) {
                    partial.deps[p.id] = p;
                    p.parent = partial;
                }, this);
            },

            __update: function(partial) {
                var matching = true;
                var node = partial.owner.node;
                var node_id = this.__navigator.nodeId(node);
                var node_data = this.__navigator.nodeData(node);
                for (var i = partial.query_index_start; i < partial.query_index_last; ++i) {
                    var q = this.__query[i];
                    if (q.token != "Selector")
                        break;
                    if (node_data[q.key] != q.value) {
                        matching = false;
                        break;
                    }
                }
                if (matching == partial.partial_match)
                    return;
                partial.partial_match = matching;
                if (matching) {
                    if (partial.partial_final) {
                        if (!this.__result[node_id]) {
                            this.__result[node_id] = {
                                node: node,
                                count: 1
                            };
                            /**
                             * @event BetaJS.Trees.TreeQueryObject#add
                             */
                            this.trigger("add", node);
                            /**
                             * @event BetaJS.Trees.TreeQueryObject#change
                             */
                            this.trigger("change");
                        } else
                            this.__result[node_id].count++;
                    } else if (partial.partial_parent) {
                        var parent = this.__navigator.nodeParent(node);
                        if (parent)
                            this.__addDependentPartial(partial, parent);
                    } else if (partial.partial_children) {
                        Objs.iter(this.__navigator.nodeChildren(node), function(child) {
                            this.__addDependentPartial(partial, child);
                        }, this);
                    }
                } else {
                    if (partial.partial_final) {
                        this.__result[node_id].count--;
                        if (this.__result[node_id].count <= 0) {
                            delete this.__result[node_id];
                            /**
                             * @event BetaJS.Trees.TreeQueryObject#remove
                             */
                            this.trigger("remove", node);
                            /**
                             * @event BetaJS.Trees.TreeQueryObject#change
                             */
                            this.trigger("change");
                        }
                    }
                    Objs.iter(partial.deps, this.__unregisterPartial, this);
                }
            }
        };
    }]);
});
Scoped.define("module:Types", function() {
    /**
     * Type-Testing and Type-Parsing
     * 
     * @module BetaJS.Types
     */
    return {
        /**
         * Returns whether argument is an object
         * 
         * @param x argument
         * @return true if x is an object
         */
        is_object: function(x) {
            return typeof x === "object";
        },

        /**
         * Returns whether argument is an array
         * 
         * @param x argument
         * @return true if x is an array
         */
        is_array: function(x) {
            return Array.isArray(x);
        },

        /**
         * Returns whether argument is undefined (which is different from being
         * null)
         * 
         * @param x argument
         * @return true if x is undefined
         */
        is_undefined: function(x) {
            return typeof x === "undefined";
        },

        /**
         * Returns whether argument is null (which is different from being
         * undefined)
         * 
         * @param x argument
         * @return true if x is null
         */
        is_null: function(x) {
            return x === null;
        },

        /**
         * Returns whether argument is undefined or null
         * 
         * @param x argument
         * @return true if x is undefined or null
         */
        is_none: function(x) {
            return this.is_undefined(x) || this.is_null(x);
        },

        /**
         * Returns whether argument is defined (could be null)
         * 
         * @param x argument
         * @return true if x is defined
         */
        is_defined: function(x) {
            return typeof x !== "undefined";
        },

        /**
         * Returns whether argument is empty (undefined, null, an empty array or
         * an empty object)
         * 
         * @param x argument
         * @return true if x is empty
         */
        is_empty: function(x) {
            return this.is_none(x) || (this.is_array(x) && x.length === 0) || (this.is_object(x) && this.is_empty_object(x));
        },

        /**
         * Returns whether object argument is empty
         * 
         * @param x object argument
         * @return true if x is empty
         */
        is_empty_object: function(x) {
            for (var key in x)
                return false;
            return true;
        },

        /**
         * Returns whether argument is a string
         * 
         * @param x argument
         * @return true if x is a a string
         */
        is_string: function(x) {
            return typeof x === "string";
        },

        /**
         * Returns whether argument is a function
         * 
         * @param x argument
         * @return true if x is a function
         */
        is_function: function(x) {
            return typeof x === "function";
        },

        /**
         * Returns whether argument is boolean
         * 
         * @param x argument
         * @return true if x is boolean
         */
        is_boolean: function(x) {
            return typeof x === "boolean";
        },

        /**
         * Compares two values
         * 
         * If values are booleans, we compare them directly. If values are
         * arrays, we compare them recursively by their components. Otherwise,
         * we use localeCompare which compares strings.
         * 
         * @param x left value
         * @param y right value
         * @return 1 if x > y, -1 if x < y and 0 if x == y
         */
        compare: function(x, y) {
            if (this.is_boolean(x) && this.is_boolean(y))
                return x === y ? 0 : (x ? 1 : -1);
            if (this.is_array(x) && this.is_array(y)) {
                var len_x = x.length;
                var len_y = y.length;
                var len = Math.min(len_x, len_y);
                for (var i = 0; i < len; ++i) {
                    var c = this.compare(x[i], y[i]);
                    if (c !== 0)
                        return c;
                }
                return len_x === len_y ? 0 : (len_x > len_y ? 1 : -1);
            }
            return x.localeCompare(y);
        },

        /**
         * Parses a boolean string
         * 
         * @param x boolean as a string
         * @return boolean value
         */
        parseBool: function(x) {
            if (this.is_boolean(x))
                return x;
            if (x === "true" || x === "")
                return true;
            if (x === "false")
                return false;
            return null;
        },

        /**
         * Parses an array of type "foo,bar"
         * 
         * @param x array as a string
         * @return array
         */
        parseArray: function(x) {
            return this.is_string(x) ? x.split(",") : x;
        },

        /**
         * Returns the type of a given expression
         * 
         * @param x expression
         * @return type string
         */
        type_of: function(x) {
            if (this.is_array(x))
                return "array";
            return typeof x;
        },

        /**
         * Returns whether argument is a number
         *
         * @param x argument
         * @return true if x is a number
         */
        isNumber: function(x) {
            return typeof x === "number";
        },

        /**
         * Parses an integer string
         *
         * @param x integer as a string
         * @return integer value
         */
        parseInt: function(x) {
            return this.isNumber(x) ? x : parseInt(x, 10);
        },

        /**
         * Parses a float string
         *
         * @param x float as a string
         * @return float value
         */
        parseFloat: function(x) {
            return this.isNumber(x) ? x : parseFloat(x);
        },

        /**
         * Parses a date time string
         *
         * @param x date time as a string
         * @return integer value
         */
        parseDateTime: function(x) {
            if (typeof x === "number")
                return x;
            if (x === null || x === undefined)
                return 0;
            if (typeof x === "object")
                x = x.toString();
            var d = new Date(x);
            return isNaN(d.getTime()) ? parseInt(x, 10) : d.getTime();
        },

        /**
         * Parses a value given a specific type.
         * 
         * @param x value to be parsed
         * @param {string} type the specific type to be parsed (accepts: bool, boolean, int, integer, date, time, datetime, float, double)
         * @return parsed value
         */
        parseType: function(x, type) {
            switch (type.toLowerCase()) {
                case "bool":
                case "boolean":
                    return this.parseBool(x);
                case "int":
                case "integer":
                case "number":
                    return this.parseInt(x);
                case "date":
                case "time":
                case "datetime":
                    return this.parseDateTime(x);
                case "float":
                case "double":
                    return this.parseFloat(x);
                case "array":
                    return this.parseArray(x);
                case "jsonarray":
                    return typeof x === "string" ? JSON.parse(x) : x;
                case "object":
                case "json":
                    return typeof x === "string" ? JSON.parse(x) : x;
                case "id":
                    return typeof x === "object" && x ? x.toString() : x;
                default:
                    return x;
            }
        },

        /**
         * Parses an object with given types.
         * 
         * @param {object} data object with key value pairs
         * @param {object} types object mapping keys to types
         * 
         * @return {object} object with properly parsed types
         */
        parseTypes: function(data, types) {
            var result = {};
            for (var key in data)
                result[key] = key in types ? this.parseType(data[key], types[key]) : data[key];
            return result;
        },

        /**
         * Returns the specific type of a JavaScript object
         * 
         * @param {object} obj an object instance
         * @return {string} the object type
         */
        objectType: function(obj) {
            if (!this.is_object(obj))
                return null;
            var matcher = obj.toString().match(/\[object (.*)\]/);
            return matcher ? matcher[1] : null;
        },

        /**
         * Returns whether a given object is a pure object
         * 
         * @param {object} obj an object instance
         * @return {boolean} true if pure
         */
        is_pure_object: function(obj) {
            return this.is_object(obj) && (obj.toString().toLowerCase() === '[object]' || obj.toString().toLowerCase() === '[object object]');
        },

        /**
         * Takes a value of any type and recursively tries to aggressively replace strings by more specific types.
         *
         * @param data input data
         *
         * @returns typefied data
         */
        typefy: function(data) {
            var simplify = function(data) {
                var len = data.length;
                ["'", '"'].forEach(function(c) {
                    if (data.indexOf(c) === 0 && data.lastIndexOf(c) === data.length - c.length)
                        data = data.substring(c.length, data.length - 2 * c.length + 1);
                });
                data = data.trim();
                return data.length < len ? simplify(data) : data;
            };
            switch (typeof(data)) {
                case "object":
                    if (!Array.isArray(data)) {
                        for (var key in data)
                            data[key] = typefy(data[key]);
                        return data;
                    }
                    return data.map(typefy);
                case "string":
                    data = simplify(data);
                    if (data === "true")
                        return true;
                    if (data === "false")
                        return false;
                    if (parseInt(data, 10) + "" === data)
                        return parseInt(data, 10);
                    return data;
                default:
                    return data;
            }
        }

    };
});
Scoped.define("module:Channels.Sender", [
    "module:Class",
    "module:Events.EventsMixin"
], function(Class, EventsMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin,

        /**
         * Abstract Sender Channel Class
         * 
         * @class BetaJS.Channels.Sender
         */
        {

            /**
             * Sends a message into the channel.
             * 
             * @param {string} message Message string
             * @param data Custom message data
             * @param serializerInfo Custom serializer information
             * @fires BetaJS.Channels.Sender#send
             */
            send: function(message, data, serializerInfo) {
                /**
                 * @event BetaJS.Channels.Sender#send
                 */
                this.trigger("send", message, data);
                this._send(message, data, serializerInfo);
            },

            /**
             * Protected function for sending the message.
             * 
             * @param {string} message Message string
             * @param data Custom message data
             * @param serializerInfo Custom serializer information
             */
            _send: function(message, data, serializerInfo) {},

            /**
             * Connect sender directly to a receiver.
             *
             * @param {object} receiver receiver object
             */
            connectToReceiver: function(receiver) {
                receiver.connectToSender(this);
                return this;
            }


        }
    ]);
});


Scoped.define("module:Channels.Receiver", [
    "module:Class",
    "module:Events.EventsMixin"
], function(Class, EventsMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin,

        /**
         * Abstract Receiver Channel Class
         * 
         * @class BetaJS.Channels.Receiver
         */
        {

            /**
             * Protected function for receiving the message.
             * 
             * @param {string} message Message string
             * @param data Custom message data
             * @fires BetaJS.Channels.Receiver#receive
             */
            _receive: function(message, data) {
                /**
                 * @event BetaJS.Channels.Receiver#receive
                 */
                this.trigger("receive", message, data);
                this.trigger("receive:" + message, data);
            },

            /**
             * Connect receiver directly to a sender.
             *
             * @param {object} sender sender object
             */
            connectToSender: function(sender) {
                this.on("receive", sender.send, sender);
                return this;
            }

        }
    ]);
});


Scoped.define("module:Channels.ReceiverSender", [
    "module:Channels.Sender",
    "module:Channels.Receiver",
    "module:Async"
], function(Sender, Receiver, Async, scoped) {
    return Sender.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ReceiverSender Class, directly connecting this sender to a receiver.
         * 
         * @class BetaJS.Channels.ReceiverSender
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} receiver Receiver object
             * @param {boolean} async Handle every invocation asynchronously
             * @param {int} delay Delay time for asynchronous invocation
             * @param {boolean} json Convert to JSON (optional, false)
             */
            constructor: function(receiver, async, delay, json) {
                inherited.constructor.call(this);
                this.__receiver = receiver;
                this.__async = async;
                this.__delay = delay;
                this.__json = json;
            },

            /**
             * @override
             */
            _send: function(message, data, serializerInfo) {
                if (this.__json)
                    data = JSON.parse(JSON.stringify(data));
                if (this.__async) {
                    Async.eventually(function() {
                        this.__receiver._receive(message, data);
                    }, this, this.__delay);
                } else
                    this.__receiver._receive(message, data);
            }

        };
    }, {

        createPair: function(async, delay, json) {
            var receiver = new Receiver();
            return {
                sender: new this(receiver, async, delay, json),
                receiver: receiver
            };
        }

    });
});


Scoped.define("module:Channels.ReadySender", [
    "module:Channels.Sender"
], function(Sender, scoped) {
    return Sender.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ReadySender class that buffers messages until sender is ready.
         * 
         * @class BetaJS.Channels.ReadySender
         */
        return {

            /**
             * Instantiates a Ready Sender instance.
             * 
             * @param {object} sender sender instance that should be used as delegate
             */
            constructor: function(sender) {
                inherited.constructor.call(this);
                this.__cache = [];
                this.__sender = sender;
            },

            /**
             * @override
             */
            _send: function(message, data, serializerInfo) {
                if (this.__ready)
                    this.__sender.send(message, data, serializerInfo);
                else
                    this.__cache.push({
                        message: message,
                        data: data,
                        serializerInfo: serializerInfo
                    });
            },

            /**
             * Allow all messages to be flushed directly to the sender delegate.
             * 
             */
            ready: function() {
                this.__ready = true;
                this.__cache.forEach(function(entry) {
                    this.__sender.send(entry.message, entry.data, entry.serializerInfo);
                }, this);
                this.__cache = [];
            },

            /**
             * Stop all messages being flushed.
             * 
             */
            unready: function() {
                this.__ready = false;
            }

        };
    });
});
Scoped.define("module:Channels.SenderMultiplexer", ["module:Channels.Sender"], function(Sender, scoped) {
    return Sender.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Channel Sender Multiplexer Class
         * 
         * @class BetaJS.Channels.SenderMultiplexer
         * 
         */
        return {

            /**
             * Instantiates the Multiplexer Sender
             * 
             * @param {object} sender sender channel
             * @param {string} prefix prefix string for multiplexing
             * 
             */
            constructor: function(sender, prefix) {
                inherited.constructor.call(this);
                this.__sender = sender;
                this.__prefix = prefix;
            },

            _send: function(message, data, serializerInfo) {
                this.__sender.send(this.__prefix + ":" + message, data, serializerInfo);
            }

        };
    });
});


Scoped.define("module:Channels.ReceiverMultiplexer", ["module:Channels.Receiver", "module:Strings"], function(Receiver, Strings, scoped) {
    return Receiver.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Channel Receiver Multiplexer Class
         * 
         * @class BetaJS.Channels.ReceiverMultiplexer
         * 
         */
        return {

            /**
             * Instantiates the Multiplexer Receiver
             * 
             * @param {object} receiver receiver channel
             * @param {string} prefix prefix string for de-multiplexing
             * 
             */
            constructor: function(receiver, prefix) {
                inherited.constructor.call(this);
                this.__receiver = receiver;
                this.__prefix = prefix;
                this.__receiver.on("receive", function(message, data) {
                    if (Strings.starts_with(message, this.__prefix + ":"))
                        this._receive(Strings.strip_start(message, this.__prefix + ":"), data);
                }, this);
            }

        };
    });
});
Scoped.define("module:Channels.SimulatorSender", [
    "module:Channels.Sender"
], function(Sender, scoped) {
    return Sender.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Sender Simulating Online / Offline behavior
         * 
         * @class BetaJS.Channels.SimulatorSender
         */
        return {

            /**
             * Attribute for setting / online offline
             * 
             * @member {boolean} online online / offline setting
             */
            online: true,

            /**
             * Create a new instance given an inner sender channel.
             * 
             * @param {object} sender sender instance
             * 
             * @return {object} simulated sender instance
             */
            constructor: function(sender) {
                inherited.constructor.call(this);
                this.__sender = sender;
            },

            _send: function(message, data) {
                if (this.online)
                    this.__sender.send(message, data);
            }

        };
    });
});



Scoped.define("module:Channels.SimulatorReceiver", [
    "module:Channels.Receiver"
], function(Receiver, scoped) {
    return Receiver.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Receiver Simulating Online / Offline behavior
         *
         * @class BetaJS.Channels.SimulatorReceiver
         */
        return {

            /**
             * Attribute for setting / online offline
             *
             * @member {boolean} online online / offline setting
             */
            online: true,

            /**
             * Create a new instance given an inner receiver channel.
             *
             * @param {object} receiver receiver instance
             *
             * @return {object} simulated receiver instance
             */
            constructor: function(receiver) {
                inherited.constructor.call(this);
                this.__receiver = receiver;
                this.__receiver.on("receive", function(message, data) {
                    if (this.online)
                        this._receive(message, data);
                }, this);
            }

        };
    });
});
Scoped.define("module:Channels.TransportChannel", [
    "module:Class",
    "module:Objs",
    "module:Timers.Timer",
    "module:Time",
    "module:Promise"
], function(Class, Objs, Timer, Time, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Transport Channel for reliable transmission of data.
         * 
         * @class BetaJS.Channels.TransportChannel
         */
        return {

            /**
             * Instantiates TransportChannel
             * 
             * @param {object} sender Sender Channel
             * @param {object} receiver Receiver Channel
             * @param {object} options options (timeout, tries, timer, auto_destroy) for configuring the Transport Channel
             */
            constructor: function(sender, receiver, options) {
                inherited.constructor.call(this);
                this.__sender = sender;
                this.__receiver = receiver;
                this.__options = Objs.extend(options, {
                    timeout: 10000,
                    tries: 1,
                    timer: 500
                });
                if (this.__options.auto_destroy) {
                    this.auto_destroy(sender);
                    this.auto_destroy(receiver);
                }
                this.__receiver.on("receive:send", function(data) {
                    this.__reply(data);
                }, this);
                this.__receiver.on("receive:reply", function(data) {
                    this.__complete(data);
                }, this);
                this.__sent_id = 0;
                this.__sent = {};
                this.__received = {};
                this.__timer = this._auto_destroy(new Timer({
                    delay: this.__options.timer,
                    context: this,
                    fire: this.__maintenance
                }));
            },

            /**
             * Callback function for replying to a message. Needs to be overwritten from the outside.
             * 
             * @param {string} message message string
             * @param {object} data data object
             * 
             * @return {object} promise object containin the reply data or an error
             */
            _reply: function(message, data) {},

            /**
             * Send a message through the channel.
             * 
             * @param {string} message message string
             * @param {object} data data object
             * @param {object} options options (stateless) for sending the message
             * 
             * @return {object} promise object
             */
            send: function(message, data, options) {
                var promise = Promise.create();
                options = options || {};
                if (options.stateless) {
                    this.__sender.send("send", {
                        message: message,
                        data: data,
                        stateless: true
                    }, options.serializerInfo);
                    promise.asyncSuccess(true);
                } else {
                    this.__sent_id++;
                    this.__sent[this.__sent_id] = {
                        message: message,
                        data: data,
                        tries: 1,
                        time: Time.now(),
                        id: this.__sent_id,
                        promise: promise
                    };
                    this.__sender.send("send", {
                        message: message,
                        data: data,
                        id: this.__sent_id
                    }, options.serializerInfo);
                }
                return promise;
            },

            __reply: function(data) {
                if (data.stateless) {
                    this._reply(data.message, data.data);
                    return;
                }
                if (!this.__received[data.id]) {
                    this.__received[data.id] = data;
                    this.__received[data.id].time = Time.now();
                    this.__received[data.id].returned = false;
                    this.__received[data.id].success = false;
                    Promise.value(this._reply(data.message, data.data)).success(function(result) {
                        this.__received[data.id].reply = result;
                        this.__received[data.id].success = true;
                    }, this).error(function(error) {
                        if (error && error.constructor && error.constructor === Error)
                            error = error.toString();
                        this.__received[data.id].reply = error;
                    }, this).callback(function() {
                        this.__received[data.id].returned = true;
                        this.__sender.send("reply", {
                            id: data.id,
                            reply: data.reply,
                            success: data.success
                        });
                    }, this);
                } else if (this.__received[data.id].returned) {
                    this.__sender.send("reply", {
                        id: data.id,
                        reply: data.reply,
                        success: data.success
                    });
                }
            },

            __complete: function(data) {
                if (this.__sent[data.id]) {
                    var promise = this.__sent[data.id].promise;
                    promise[data.success ? "asyncSuccess" : "asyncError"](data.reply);
                    if (this.__sent)
                        delete this.__sent[data.id];
                }
            },

            __maintenance: function() {
                var now = Time.now();
                for (var received_key in this.__received) {
                    var received = this.__received[received_key];
                    if (received.time + this.__options.tries * this.__options.timeout <= now)
                        delete this.__received[received_key];
                }
                for (var sent_key in this.__sent) {
                    var sent = this.__sent[sent_key];
                    if (sent.time + sent.tries * this.__options.timeout <= now) {
                        if (sent.tries < this.__options.tries) {
                            sent.tries++;
                            this.__sender.send("send", {
                                message: sent.message,
                                data: sent.data,
                                id: sent.id
                            });
                        } else {
                            sent.promise.asyncError({
                                message: sent.message,
                                data: sent.data
                            });
                            delete this.__sent[sent_key];
                        }
                    }
                }
            }

        };
    });
});
Scoped.define("module:Classes.ConditionalInstance", [
    "module:Class",
    "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Conditional Instance Class for registering and creating particular flavors of a certain class under particular conditions
         * 
         * @class BetaJS.Classes.ConditionalInstance
         */
        return {

            /**
             * Instantiates a particular flavor of a ConditionalInstance
             * 
             * @param {object} options Options for the instance
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                this._options = this.cls._initializeOptions(options);
            }

        };
    }, {

        /**
         * Initialize given options with potentially additional parameters
         * 
         * @param {object} options Given options
         * @return {object} Initialized options
         * 
         * @static
         */
        _initializeOptions: function(options) {
            return options;
        },

        /**
         * Determines whether a set of options is supported by this flavor of a ConditionalInstance
         * 
         * @param {object} options set of options
         * @return {boolean} true if supported
         * 
         * @static
         */
        supported: function(options) {
            return false;
        }

    }, {

        __registry: [],

        /**
         * Registers a particular flavor of a ConditionalInstance
         * 
         * @param {object} cls flavor class
         * @param {int} priority priority of this class; the higher the priority the more likely it is to be instantiated
         * 
         * @static
         */
        register: function(cls, priority) {
            this.__registry.push({
                cls: cls,
                priority: priority
            });
        },

        /**
         * Determines the best match of all registered flavors, given a set of options.
         * 
         * @param {object} options Set of options
         * @return {object} flavor class being the best match
         * 
         * @static
         */
        match: function(options) {
            options = this._initializeOptions(options);
            var bestMatch = null;
            Objs.iter(this.__registry, function(entry) {
                if ((!bestMatch || bestMatch.priority < entry.priority) && entry.cls.supported(options))
                    bestMatch = entry;
            }, this);
            return bestMatch;
        },

        /**
         * Instantiates the best match.
         * 
         * @param {object} options Set of options
         * @return {object} Instance of best match
         * 
         * @static
         */
        create: function(options) {
            var match = this.match(options);
            return match ? new match.cls(options) : null;
        },

        /**
         * Determines whether there is any support for a given set of options.
         * 
         * @param {object} options Set of options
         * @return {boolean} True if there is at least one match.
         * 
         * @static
         */
        anySupport: function(options) {
            return this.match(options) !== null;
        }

    });
});




Scoped.define("module:Classes.OptimisticConditionalInstance", [
    "module:Class",
    "module:Objs",
    "module:Promise"
], function(Class, Objs, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * OptimisticConditionalInstance for registering and optimistically creating particular flavors of a certain class under particular conditions
         * 
         * @class BetaJS.Classes.OptimisticConditionalInstance
         */
        return {

            /**
             * Instantiates a particular flavor of a OptimisticConditionalInstance
             * 
             * @param {object} options Options for the instance
             * @param {object} transitionals Particular transitional data that should be passed on from one instance to the next
             */
            constructor: function(options, transitionals) {
                inherited.constructor.call(this);
                this._transitionals = {};
            },

            /**
             * Returns an initialization promise.
             * 
             * @return {object} Initialization promise
             */
            _initializer: function() {
                // returns a promise
            },

            /**
             * Tries to initialize this instance.
             * 
             * @return {object} Success promise
             */
            _initialize: function() {
                return this._initializer().success(function() {
                    this._afterInitialize();
                }, this);
            },

            /**
             * Returns the current set of transitionals.
             * 
             * @return {object} Set of transitionals
             */
            transitionals: function() {
                return this._transitionals;
            },

            /**
             * Will be called after an instance has been initialized.
             * 
             */
            _afterInitialize: function() {
                // setup
            }

        };
    }, {}, {

        __registry: [],

        /**
         * Registers a particular flavor of an OptimisticConditionalInstance
         * 
         * @param {object} cls flavor class
         * @param {int} priority priority of this class; the higher the priority the more likely it is to be instantiated
         * 
         * @static
         */
        register: function(cls, priority) {
            this.__registry.push({
                cls: cls,
                priority: priority
            });
        },

        /**
         * Instantiates the best match.
         * 
         * @param {object} options Set of options
         * @return {object} Instance of best match as a promise
         * 
         * @static
         */
        create: function(options) {
            var promise = Promise.create();
            var reg = Objs.clone(this.__registry, 1);
            var transitionals = {};
            var next = function() {
                if (!reg.length) {
                    promise.asyncError(true);
                    return;
                }
                var p = -1;
                var j = -1;
                for (var i = 0; i < reg.length; ++i) {
                    if (reg[i].priority > p) {
                        p = reg[i].priority;
                        j = i;
                    }
                }
                var cls = reg[j].cls;
                reg.splice(j, 1);
                var instance = new cls(options, transitionals);
                instance._initialize().error(function() {
                    transitionals = instance.transitionals();
                    instance.destroy();
                    next.call(this);
                }, this).success(function() {
                    promise.asyncSuccess(instance);
                });
            };
            next.call(this);
            return promise;
        }

    });
});
Scoped.define("module:Classes.LocaleMixin", function() {

    /**
     * Locale Mixin for adding Locale access to a Class
     * 
     * @mixin BetaJS.Classes.LocaleMixin
     */
    return {

        _clearLocale: function() {},
        _setLocale: function(locale) {},

        /**
         * Returns the current locale.
         * 
         * @return {object} current locale
         */
        getLocale: function() {
            return this.__locale;
        },

        /**
         * Clears the current locale.
         * 
         */
        clearLocale: function() {
            this._clearLocale();
            this.__locale = null;
        },

        /**
         * Sets the current locale
         * 
         * @param {object} locale New locale
         */
        setLocale: function(locale) {
            this.clearLocale();
            this.__locale = locale;
            this._setLocale(locale);
        },

        /**
         * Returns whether a locale is set.
         * 
         * @return {boolean} true if locale is set
         */
        isLocaleSet: function() {
            return !!this.__locale;
        },

        /**
         * Sets a locale if not locale is set.
         * 
         * @param {object} locale New weak locale
         */
        setWeakLocale: function(locale) {
            if (!this.isLocaleSet())
                this.setLocale(locale);
        }

    };
});



Scoped.define("module:Classes.LocaleAggregator", [
    "module:Class",
    "module:Classes.LocaleMixin",
    "module:Objs"
], function(Class, LocaleMixin, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, [LocaleMixin, function(inherited) {

        /**
         * Locale Aggregator Class for combining multiple locales into one.
         * 
         * @class BetaJS.Classes.LocaleAggregator
         */
        return {

            /**
             * Create a Locale Aggregator instance.
             * 
             */
            constructor: function() {
                inherited.constructor.call(this);
                this.__locales = [];
            },

            /**
             * Registers a new locale.
             * 
             * @return {object} Locale
             */
            register: function(obj) {
                this.__locales.push(obj);
            },

            /**
             * @override
             */
            _clearLocale: function() {
                Objs.iter(this.__locales, function(obj) {
                    obj.clearLocale();
                }, this);
            },

            /**
             * @override
             */
            _setLocale: function(locale) {
                Objs.iter(this.__locales, function(obj) {
                    obj.setLocale(locale);
                }, this);
            }

        };
    }]);
});
Scoped.define("module:Classes.ObjectCache", [
    "module:Class",
    "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Object Cache Class
         * 
         * @class BetaJS.Classes.ObjectCache
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {function} keyFunction Function mapping objects to strings
             * @param {object} keyFunctionCtx Optional key function context
             */
            constructor: function(keyFunction, keyFunctionCtx) {
                inherited.constructor.call(this);
                this.__keyFunction = keyFunction;
                this.__keyFunctionCtx = keyFunctionCtx;
                this.__cache = {};
            },

            /**
             * @override
             */
            destroy: function() {
                Objs.iter(this.__cache, function(obj) {
                    obj.off(null, null, this);
                }, this);
            },

            /**
             * Returns an object for a key.
             * 
             * @param {string} key Key of an object
             * 
             * @return {object} Object with that key
             */
            get: function(key) {
                return this.__cache[key];
            },

            /**
             * Registers an object in the cache.
             * 
             * @param {object} obj Object to register.
             * 
             */
            register: function(obj) {
                var key = this.__keyFunction.call(this.__keyFunctionCtx || this, obj);
                if (this.__cache[key] && !this.__cache[key].destroyed())
                    this.__cache[key].off(null, null, this);
                this.__cache[key] = obj;
                obj.on("destroy", function() {
                    delete this.__cache[key];
                }, this);
                return this;
            }

        };
    });
});

Scoped.define("module:Classes.ClassRegistry", [
    "module:Class",
    "module:Types",
    "module:Functions",
    "module:Objs"
], function(Class, Types, Functions, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Class Registry Class
         * 
         * @class BetaJS.Classes.ClassRegistry
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {array} classes Class maps in an array
             * @param {boolean} lowercase Should all keys be lowercased
             */
            constructor: function(classes, lowercase) {
                inherited.constructor.call(this);
                this._classes = Types.is_array(classes) ? classes : [classes || {}];
                this._lowercase = lowercase;
            },

            /**
             * Sanitizes the key of a class.
             * 
             * @param {string} key Key to be sanitized
             * 
             * @return {string} Sanitized key
             */
            _sanitize: function(key) {
                return this._lowercase ? key.toLowerCase() : key;
            },

            /**
             * Register a class.
             * 
             * @param {string} key Key of class
             * @param {object} cls Class to be registered
             * 
             */
            register: function(key, cls) {
                this._classes[this._classes.length - 1][this._sanitize(key)] = cls;
                return this;
            },

            /**
             * Return a class by key.
             * 
             * @param {string} key Key of class
             * 
             * @return {object} Class referenced by key
             */
            get: function(key) {
                if (!Types.is_string(key))
                    return key;
                key = this._sanitize(key);
                for (var i = this._classes.length - 1; i >= 0; --i)
                    if (key in this._classes[i])
                        return this._classes[i][key];
                return null;
            },

            /**
             * Creates a new class based on its key.
             * 
             * @param {string} key Key of class
             * 
             * @return {object} Class instance
             */
            create: function(key) {
                var cons = Functions.newClassFunc(this.get(key));
                return cons.apply(this, Functions.getArguments(arguments, 1));
            },

            /**
             * Returns all classes as key-object map.
             * 
             * @return {object} Key-object map.
             */
            classes: function() {
                var result = {};
                Objs.iter(this._classes, function(classes) {
                    result = Objs.extend(result, classes);
                });
                return result;
            }

        };
    });
});


Scoped.define("module:Classes.ContextRegistry", [
    "module:Class",
    "module:Ids",
    "module:Types",
    "module:Objs",
    "module:Iterators.MappedIterator",
    "module:Iterators.ObjectValuesIterator"
], function(Class, Ids, Types, Objs, MappedIterator, ObjectValuesIterator, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Context Registry Class
         * 
         * @class BetaJS.Classes.ContextRegistry
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {function} serializer Serializer function
             * @param {object} serializerContext Optional serializer context
             */
            constructor: function(serializer, serializerContext) {
                inherited.constructor.apply(this);
                this.__data = {};
                this.__contexts = {};
                this.__serializer = serializer || this.__defaultSerializer;
                this.__serializerContext = serializerContext || this;
            },

            __defaultSerializer: function(data) {
                return Types.is_object(data) ? Ids.objectId(data) : data;
            },

            /**
             * Serialize a context.
             * 
             * @param {object} ctx Context object to be serialized
             * 
             * @return {string} Serialized context object
             */
            _serializeContext: function(ctx) {
                return ctx ? Ids.objectId(ctx) : null;
            },

            /**
             * Serializes data.
             * 
             * @param data Data to be serialized
             * 
             * @return {string} Serialized data
             */
            _serializeData: function(data) {
                return this.__serializer.call(this.__serializerContext, data);
            },

            /**
             * Returns stored data based on serializing data
             * 
             * @param data Data to be serialized
             * 
             * @return Stored data
             */
            get: function(data) {
                var serializedData = this._serializeData(data);
                return this.__data[serializedData];
            },

            /**
             * Registers data with respect to an optional context.
             *
             * @param data manatory data
             * @param {object} context optional context
             * 
             * @return data if data was not registered before, null otherwise
             * 
             */
            register: function(data, context) {
                var serializedData = this._serializeData(data);
                var serializedCtx = this._serializeContext(context);
                var result = false;
                if (!(serializedData in this.__data)) {
                    this.__data[serializedData] = {
                        data: data,
                        contexts: {}
                    };
                    result = true;
                }
                if (!(serializedCtx in this.__contexts)) {
                    this.__contexts[serializedCtx] = {
                        context: context,
                        datas: {}
                    };
                }
                this.__data[serializedData].contexts[serializedCtx] = true;
                this.__contexts[serializedCtx].datas[serializedData] = true;
                return result ? this.__data[serializedData].data : null;
            },

            /**
             * Unregisters data with respect to a context.
             * If no data is given, all data with respect to the context is unregistered.
             * If no context is given, all context with respect to the data are unregistered.
             * If nothing is given, everything is unregistered.
             * 
             * @param data optional data
             * @param {object} context optional context
             * 
             * @result {array} unregistered data in an array
             */
            unregister: function(data, context) {
                var result = [];
                if (data) {
                    var serializedData = this.__serializer.call(this.__serializerContext, data);
                    if (this.__data[serializedData]) {
                        if (context) {
                            var serializedCtx = this._serializeContext(context);
                            if (this.__contexts[serializedCtx]) {
                                delete this.__contexts[serializedCtx].datas[serializedData];
                                if (Types.is_empty(this.__contexts[serializedCtx].datas))
                                    delete this.__contexts[serializedCtx];
                            }
                            delete this.__data[serializedData].contexts[serializedCtx];
                            if (Types.is_empty(this.__data[serializedData].contexts)) {
                                result.push(this.__data[serializedData].data);
                                delete this.__data[serializedData];
                            }
                        } else {
                            Objs.iter(this.__data[serializedData].contexts, function(dummy, serializedCtx) {
                                if (this.__contexts[serializedCtx]) {
                                    delete this.__contexts[serializedCtx].datas[serializedData];
                                    if (Types.is_empty(this.__contexts[serializedCtx].datas))
                                        delete this.__contexts[serializedCtx];
                                }
                            }, this);
                            result.push(this.__data[serializedData].data);
                            delete this.__data[serializedData];
                        }
                    }
                } else if (context) {
                    var serializedCtx2 = this._serializeContext(context);
                    if (this.__contexts[serializedCtx2]) {
                        Objs.iter(this.__contexts[serializedCtx2].datas, function(dummy, serializedData) {
                            if (this.__data[serializedData]) {
                                delete this.__data[serializedData].contexts[serializedCtx2];
                                if (Types.is_empty(this.__data[serializedData].contexts)) {
                                    result.push(this.__data[serializedData].data);
                                    delete this.__data[serializedData];
                                }
                            }
                        }, this);
                        delete this.__contexts[serializedCtx2];
                    }
                } else {
                    Objs.iter(this.__data, function(data) {
                        result.push(data.data);
                    }, this);
                    this.__data = {};
                    this.__contexts = [];
                }
                return result;
            },

            /**
             * Custom iterator iterating over the stored data
             * 
             * @return {object} Iterator
             */
            customIterator: function() {
                return new ObjectValuesIterator(this.__data);
            },

            /**
             * Data iterator iterating over the stored data
             * 
             * @return {object} Iterator
             */
            iterator: function() {
                var customIt = this.customIterator();
                return (new MappedIterator(customIt, function(item) {
                    return item.data;
                })).auto_destroy(customIt, true);
            }

        };
    });
});
Scoped.define("module:Classes.Taggable", [
    "module:Objs"
], function(Objs) {

    /**
     * Taggable Mixin for handling instance tags
     * 
     * @mixin BetaJS.Classes.Taggable
     */
    return {

        /**
         * Determines whether a specific tag is present. 
         * 
         * @param {string} tag tag in question
         * @return {boolean} true if tag present
         */
        hasTag: function(tag) {
            return this.__tags && (tag in this.__tags);
        },

        /**
         * Returns all tags being present.
         *  
         * @return {array} Array of tags
         */
        getTags: function() {
            return Object.keys(this.__tags || {});
        },

        /**
         * Removes a specific tag. 
         * 
         * @param {string} tag tag in question
         * @return {object} this
         */
        removeTag: function(tag) {
            if (this.__tags) {
                delete this.__tags[tag];
                this._notify("tags-changed");
            }
            return this;
        },

        /**
         * Remove a list of tags. 
         * 
         * @param {array} tags tags to be removed
         * @return {object} this
         */
        removeTags: function(tags) {
            Objs.iter(tags, this.removeTag, this);
            return this;
        },

        /**
         * Add a tag to the instance. 
         * 
         * @param {string} tag tag in question
         * @return {object} this
         */
        addTag: function(tag) {
            this.__tags = this.__tags || {};
            this.__tags[tag] = true;
            this._notify("tags-changed");
            return this;
        },

        /**
         * Add a number of tags to the instance. 
         * 
         * @param {array} tags tag to be added
         * @return {object} this
         */
        addTags: function(tags) {
            Objs.iter(tags, this.addTag, this);
            return this;
        },

        /**
         * Returns the subset of the given tags that are present in the instance. 
         * 
         * @param {array} tags Superset of tags to be checkd
         * @return {array} Subset of intersecting tags
         */
        tagIntersect: function(tags) {
            return Objs.filter(tags, this.hasTag, this);
        }

    };
});


Scoped.define("module:Classes.StringTable", [
    "module:Class",
    "module:Classes.Taggable",
    "module:Functions",
    "module:Objs"
], function(Class, Taggable, Functions, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, [Taggable, function(inherited) {

        /**
         * Taggable StringTable Class 
         * 
         * @class BetaJS.Classes.StringTable
         */
        return {

            _notifications: {
                "tags-changed": function() {
                    this.__cache = {};
                }
            },

            /**
             * Instantiates a StringTable. 
             */
            constructor: function() {
                inherited.constructor.call(this);
                this.__cache = {};
                this.__strings = {};
            },

            __resolveKey: function(key, prefix) {
                if (prefix)
                    key = prefix + "." + key;
                key = key.replace(/[^\.]+\.</g, "");
                return key;
            },

            __betterMatch: function(candidate, reference) {
                var c = this.tagIntersect(candidate.tags).length - this.tagIntersect(reference.tags).length;
                if (c !== 0)
                    return c > 0;
                c = candidate.priority - reference.priority;
                if (c !== 0)
                    return c > 0;
                c = reference.tags.length - candidate.tags.length;
                return c > 0;
            },

            /**
             * Registers string resources. 
             * 
             * @param {object} strings key-value representation of strings
             * @param {string} prefix optional prefix for the keys
             * @param {array} tags optional tags
             * @param {int} priority optional priority
             * 
             * @return {object} this
             */
            register: function() {
                var args = Functions.matchArgs(arguments, {
                    strings: true,
                    prefix: "string",
                    tags: "array",
                    priority: "number"
                });
                Objs.iter(args.strings, function(value, key) {
                    key = this.__resolveKey(key, args.prefix);
                    this.__strings[key] = this.__strings[key] || [];
                    this.__strings[key].push({
                        value: value,
                        tags: args.tags || [],
                        priority: args.priority || 0
                    });
                    delete this.__cache[key];
                }, this);
                return this;
            },

            /**
             * Returns a string resource by key 
             * 
             * @param {string} key key to be retrieved
             * @param {string} prefix optional prefix for the key
             * 
             * @return {string} resource string
             */
            get: function(key, prefix) {
                key = this.__resolveKey(key, prefix);
                if (key in this.__cache)
                    return this.__cache[key];
                if (!(key in this.__strings))
                    return null;
                var current = null;
                Objs.iter(this.__strings[key], function(candidate) {
                    if (!current || this.__betterMatch(candidate, current))
                        current = candidate;
                }, this);
                this.__cache[key] = current.value;
                return current.value;
            },

            /**
             * Retruns all included string resources 
             * 
             * @return {object} key-value representation of the included string resources
             */
            all: function() {
                return Objs.map(this.__strings, function(value, key) {
                    return this.get(key);
                }, this);
            }

        };
    }]);
});



Scoped.define("module:Classes.LocaleTable", [
    "module:Classes.StringTable",
    "module:Classes.LocaleMixin"
], function(StringTable, LocaleMixin, scoped) {
    return StringTable.extend({
        scoped: scoped
    }, [LocaleMixin,

        /**
         * Locale Table Class
         * 
         * @class BetaJS.Classes.LocaleTable
         */
        {

            _localeTags: function(locale) {
                if (!locale)
                    return null;
                var result = [];
                result.push("language:" + locale);
                if (locale.indexOf("-") > 0)
                    result.push("language:" + locale.substring(0, locale.indexOf("-")));
                return result;
            },

            /**
             * @override 
             */
            _clearLocale: function() {
                this.removeTags(this._localeTags(this.getLocale()));
            },

            /**
             * @override 
             */
            _setLocale: function(locale) {
                this.addTags(this._localeTags(locale));
            }

        }
    ]);
});
Scoped.define("module:Collections.Collection", [
    "module:Class",
    "module:Events.EventsMixin",
    "module:Objs",
    "module:Functions",
    "module:Lists.ArrayList",
    "module:Ids",
    "module:Properties.ObservableMixin",
    "module:Properties.Properties",
    "module:Iterators.ArrayIterator",
    "module:Iterators.MappedIterator",
    "module:Iterators.ConcatIterator",
    "module:Iterators.FilteredIterator",
    "module:Iterators.ObjectValuesIterator",
    "module:Types",
    "module:Promise"
], function(Class, EventsMixin, Objs, Functions, ArrayList, Ids, ObservableMixin, Properties, ArrayIterator, MappedIterator, ConcatIterator, FilteredIterator, ObjectValuesIterator, Types, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, ObservableMixin, function(inherited) {

        /**
         * A collection class for managing a list of Properties-based objects.
         * 
         * @class BetaJS.Collections.Collection
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {object} options Options for the collection or an array of initial objects
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                if (Types.is_array(options)) {
                    options = {
                        objects: options
                    };
                }
                options = options || {};
                this.bulk_operations = 0;
                this.__indices = {};
                if (options.release_references)
                    this.__release_references = true;
                var list_options = {};
                if ("compare" in options)
                    list_options.compare = options.compare;
                list_options.get_ident = Functions.as_method(this.get_ident, this);
                this.__data = new ArrayList([], list_options);
                var self = this;
                this.__data._ident_changed = function(object, index) {
                    self._index_changed(object, index);
                };
                this.__data._re_indexed = function(object) {
                    self._re_indexed(object);
                };
                this.__data._sorted = function() {
                    self._sorted();
                };
                if ("objects" in options)
                    this.add_objects(options.objects);
                if (options.indices)
                    Objs.iter(options.indices, this.add_secondary_index, this);
                if (options.uniqueness)
                    this.__uniqueness = options.uniqueness;
                if (options.progressiveUniqueness)
                    this.__progressiveUniqueness = options.progressiveUniqueness;
            },

            /**
             * Returns the value associated with an observable key.
             *
             * @param {string} key key to read value for
             *
             * @return value for key
             */
            get: function(key) {
                switch (key) {
                    case "observable_count":
                        return this.count();
                }
                return undefined;
            },

            /**
             * Checks whether an observable key is set.
             *
             * @param {string} key key in question
             *
             * @return {boolean} true if key is set
             */
            hasKey: function(key) {
                switch (key) {
                    case "observable_count":
                        return true;
                }
                return false;
            },

            /**
             * Add a secondary key index to the collection.
             * 
             * @param {string} key Name of key to be added
             */
            add_secondary_index: function(key) {
                this.__indices[key] = {};
                this.iterate(function(object) {
                    var value = object.get(key);
                    this.__indices[key][value] = this.__indices[key][value] || {};
                    this.__indices[key][value][this.get_ident(object)] = object;
                }, this);
                return this;
            },

            /**
             * Return entry by value from a secondary index.
             * 
             * @param {string} key Name of secondary index key
             * @param value Value to the secondary index
             * @param {boolean} returnFirst Only return single element
             * 
             * @return Returns entry associated with the key value pair
             */
            get_by_secondary_index: function(key, value, returnFirst) {
                return returnFirst ? Objs.ithValue(this.__indices[key][value]) : this.__indices[key][value];
            },

            /**
             * Get the identifier of an object.
             * 
             * @param {object} obj Source object
             * 
             * @return {string} identifier of source object
             */
            get_ident: function(obj) {
                return Ids.objectId(obj);
            },

            /**
             * Set the comparison function.
             * 
             * @param {function} compare Comparison function
             * @fires BetaJS.Collections.Collection#set_compare
             */
            set_compare: function(compare) {
                /**
                 * @event BetaJS.Collections.Collection#set_compare
                 */
                this.trigger("set_compare", compare);
                this.__data.set_compare(compare);
                return this;
            },

            /**
             * Return the current comparison function.
             * 
             * @return {function} current compare function
             */
            get_compare: function() {
                return this.__data.get_compare();
            },

            __load_item: function(object) {
                if ("on" in object) {
                    object.on("change", function(key, value, oldvalue) {
                        this._object_changed(object, key, value, oldvalue);
                    }, this);
                }
                if (this.__release_references)
                    object.increaseRef(this);
            },

            __unload_item: function(object) {
                if ("off" in object)
                    object.off(null, null, this);
                if (this.__release_references)
                    object.decreaseRef(this);
            },

            /**
             * @override
             * @fires BetaJS.Collections.Collection#destroy
             */
            destroy: function() {
                this.__data.iterate(this.__unload_item, this);
                this.__data.destroy();
                /**
                 * @event BetaJS.Collections.Collection#destroy
                 */
                this.trigger("destroy");
                inherited.destroy.call(this);
            },

            /**
             * Return the number of elements in the collection.
             * 
             * @return {int} number of elements
             */
            count: function() {
                return this.__data.count();
            },

            /**
             * Called when the index of an object has changed.
             * 
             * @param {object} object Object whose index has changed
             * @param {int} index New index
             * @fires BetaJS.Collections.Collection#index
             */
            _index_changed: function(object, index) {
                /**
                 * @event BetaJS.Collections.Collection#index
                 */
                this.trigger("index", object, index);
            },

            /**
             * Called when the index of an object has been successfully updated.
             * 
             * @param {object} object Object whose index has been updated
             * @fires BetaJS.Collections.Collection#reindexed
             */
            _re_indexed: function(object) {
                /**
                 * @event BetaJS.Collections.Collection#reindexed
                 */
                this.trigger("reindexed", object);
            },

            /**
             * Called when the collection has been sorted.
             * 
             * @fires BetaJS.Collections.Collection#sorted
             */
            _sorted: function() {
                /**
                 * @event BetaJS.Collections.Collection#sorted
                 */
                this.trigger("sorted");
            },

            /**
             * Called when an attribute of an object has changed.
             * 
             * @param {object} object Object whose attribute has changed
             * @param {string} key Key of changed attribute
             * @param value New value of the object
             * @param oldValue Old value of the object
             * @fires BetaJS.Collections.Collection#update
             * @fires BetaJS.Collections.Collection#change
             */
            _object_changed: function(object, key, value, oldValue) {
                /**
                 * @event BetaJS.Collections.Collection#update
                 */
                this.trigger("update");
                /**
                 * @event BetaJS.Collections.Collection#change
                 */
                this.trigger("change", object, key, value, oldValue);
                this.trigger("change:" + key, object, value, oldValue);
                this.__data.re_index(this.getIndex(object));
            },

            /**
             * Add an object to the collection.
             * 
             * @param {object} object Object to be added
             * @return {string} Identifier of added object
             * @fires BetaJS.Collections.Collection#add
             * @fires BetaJS.Collections.Collection#update
             */
            add: function(object) {
                if (!Class.is_class_instance(object))
                    object = new Properties(object);
                if (this.__progressiveUniqueness && this.__indices[this.__progressiveUniqueness]) {
                    var obj = this.get_by_secondary_index(this.__progressiveUniqueness, object.get(this.__progressiveUniqueness), true);
                    if (obj && obj !== object) {
                        this.remove(obj);
                    }
                }
                if (this.exists(object))
                    return null;
                var ident = this.__data.add(object);
                if (ident !== null) {
                    Objs.iter(this.__indices, function(entries, key) {
                        var value = object.get(key);
                        entries[value] = entries[value] || {};
                        entries[value][this.get_ident(object)] = object;
                    }, this);
                    /**
                     * @event BetaJS.Collections.Collection#add
                     */
                    this.trigger("add", object);
                    /**
                     * @event BetaJS.Collections.Collection#update
                     */
                    this.trigger("update");
                    this.trigger("change:observable_count", this.count());
                    this.__load_item(object);
                }
                return ident;
            },

            /**
             * Checks whether a bulk operation is in progress.
             *
             * @returns {boolean} true if in progress
             */
            bulkOperationInProgress: function() {
                return this.bulk_operations > 0;
            },

            /**
             * Replace objects by other objects with the same id.
             * 
             * @param {array} object New objects with ids
             * @param {boolean} keep_others True if objects with ids not included should be kept
             * 
             */
            replace_objects: function(objects, keep_others) {
                if (this.destroyed())
                    return this;
                this.bulk_operations++;
                var addQueue = [];
                var ids = {};
                Objs.iter(objects, function(oriObject) {
                    var is_prop = Class.is_class_instance(oriObject);
                    var obj = is_prop ? oriObject : new Properties(oriObject);
                    var id = this.get_ident(obj);
                    ids[id] = true;
                    var old = this.getById(id);
                    if (!old)
                        addQueue.push(obj);
                    else if (is_prop) {
                        /*
                        this.remove(old);
                        this.add(obj);
                        */
                    } else {
                        obj.destroy();
                        old.setAll(oriObject);
                    }
                }, this);
                if (!keep_others) {
                    var iterator = this.iterator();
                    while (iterator.hasNext()) {
                        var object = iterator.next();
                        if (!ids[this.get_ident(object)]) {
                            this.remove(object);
                            if (addQueue.length > 0)
                                this.add(addQueue.shift());
                        }
                    }
                    iterator.destroy();
                }
                while (addQueue.length > 0)
                    this.add(addQueue.shift());
                this.bulk_operations--;
                this.trigger("replaced-objects");
                return this;
            },

            /**
             * Add objects in a bulk.
             * 
             * @param {array} objects Objects to be added
             * @param {boolean} return_collection Whether the return value should be the collection or its length
             * @return {int} Number of objects added
             */
            add_objects: function(objects, return_collection) {
                var count = 0;
                Objs.iter(objects, function(object) {
                    if (this.add(object))
                        count++;
                }, this);
                if (return_collection)
                    return this;
                else
                    return count;
            },

            /**
             * Determine whether an object is already included.
             * 
             * @param {object} object Object in question
             * @return {boolean} True if contained
             */
            exists: function(object) {
                if (this.__data.exists(object))
                    return true;
                if (!this.__uniqueness)
                    return false;
                if (this.__indices[this.__uniqueness])
                    return !!this.get_by_secondary_index(this.__uniqueness, object.get(this.__uniqueness), true);
                return !!this.queryOne(Objs.objectBy(this.__uniqueness, object.get(this.__uniqueness)));
            },

            /**
             * Remove an object from the collection.
             * 
             * @param {object} object Object to be removed
             * @return {object} Removed object
             * @fires BetaJS.Collections.Collection#remove
             * @fires BetaJS.Collections.Collection#update
             */
            remove: function(object) {
                if (!this.exists(object))
                    return null;
                Objs.iter(this.__indices, function(entry, key) {
                    var value = object.get(key);
                    if (entry[value]) {
                        delete entry[value][this.get_ident(object)];
                        if (Types.is_empty(entry[value]))
                            delete entry[value];
                    }
                }, this);
                var result = this.__data.remove(object);
                /**
                 * @event BetaJS.Collections.Collection#remove
                 */
                this.trigger("remove", object);
                this.trigger("change:observable_count", this.count());
                this.__unload_item(object);
                /**
                 * @event BetaJS.Collections.Collection#update
                 */
                this.trigger("update");
                return result;
            },

            /**
             * Get an object by index.
             * 
             * @param {int} index Index to be returned
             * @return {object} Object at that index
             */
            getByIndex: function(index) {
                return this.__data.get(index);
            },

            /**
             * Get an object by identifier.
             * 
             * @param {string} id Identifier of object
             * @return {object} Object with that identifier
             */
            getById: function(id) {
                return this.__data.get(this.__data.ident_by_id(id));
            },

            /**
             * Get the index of an object.
             * 
             * @param {object} object Object in question
             * @return {int} Index of object
             */
            getIndex: function(object) {
                return this.__data.get_ident(object);
            },

            /**
             * Iterate over the collection.
             * 
             * @param {function} cb Item callback
             * @param {object} context Context for callback
             * 
             */
            iterate: function(cb, context) {
                this.__data.iterate(cb, context);
                return this;
            },

            /**
             * Checks whether an item exists
             *
             * @param {function} cb Item callback
             * @param {object} context Context for callback
             * @returns {boolean} true if element exists
             *
             */
            has: function(cb, context) {
                var result = false;
                this.iterate(function(item) {
                    result = result || cb.call(this, item);
                }, context);
                return result;
            },

            /**
             * Checks whether something holds for all items
             *
             * @param {function} cb Item callback
             * @param {object} context Context for callback
             * @returns {boolean} true if holds for all items
             *
             */
            forall: function(cb, context) {
                var result = true;
                this.iterate(function(item) {
                    result = result && cb.call(this, item);
                }, context);
                return result;
            },

            /**
             * Creates an iterator instance for the collection.
             * 
             * @return {object} Iterator instance
             */
            iterator: function() {
                return ArrayIterator.byIterate(this.iterate, this);
            },

            /**
             * Creates an iterator instance via a secondary index for a specific value.
             * 
             * @param {string} key Key of secondary index
             * @param value Particular value
             * @return {object} Iterator instance
             */
            iterateSecondaryIndexValue: function(key, value) {
                if (Types.is_array(value)) {
                    return new ConcatIterator(new MappedIterator(new ArrayIterator(value), function(v) {
                        return this.iterateSecondaryIndexValue(key, v);
                    }, this));
                }
                return new ObjectValuesIterator(this.__indices[key][value]);
            },

            /**
             * Query the collection for items matching some query data.
             * 
             * @param {object} subset Query data to be matched.
             * @return {object} Iterator instance
             */
            query: function(subset) {
                var iterator = null;
                for (var index_key in this.__indices) {
                    if (index_key in subset) {
                        iterator = this.iterateSecondaryIndexValue(index_key, subset[index_key]);
                        delete subset[index_key];
                        break;
                    }
                }
                return new FilteredIterator(iterator || this.iterator(), function(prop) {
                    return prop.isSupersetOf(subset);
                });
            },

            /**
             * Query the collection for a single item matching some query data.
             *
             * @param {object} subset Query data to be matched.
             * @return {object} Item match
             */
            queryOne: function(subset) {
                return this.query(subset).next();
            },

            /**
             * Clears the whole collection.
             * 
             */
            clear: function() {
                this.iterate(function(obj) {
                    this.remove(obj);
                }, this);
                return this;
            },

            /**
             * Increase the view of the collection by a number of steps.
             * 
             * @param {int} steps Steps to increase
             */
            increase_forwards: function(steps) {
                return Promise.error(true);
            },

            /**
             * Increase the view of the collection by a number of steps backwards.
             *
             * @param {int} steps Steps to increase
             */
            increase_backwards: function(steps) {
                return Promise.error(true);
            },

            /**
             * Returns the first item in the collection.
             *
             * @returns {Object} first item
             */
            first: function() {
                return this.getByIndex(0);
            },

            /**
             * Returns the last item in the collection
             *
             * @returns {Object} last item
             */
            last: function() {
                return this.getByIndex(this.count() - 1);
            },

            /**
             * Sets a key value pair in all items
             *
             * @param {string} key key of pair
             * @param value value of pair
             *
             * @returns {BetaJS.Collections.Collection}
             */
            allSet: function(key, value) {
                this.iterate(function(obj) {
                    obj.set(key, value);
                });
                return this;
            },

            /**
             * Sets a set of key-value pairs in all items
             *
             * @param {object} data key-value pair to be set
             *
             * @returns {BetaJS.Collections.Collection}
             */
            allSetAll: function(data) {
                this.iterate(function(obj) {
                    obj.setAll(data);
                });
                return this;
            },

            asJSON: function() {
                var result = [];
                this.iterate(function(p) {
                    result.push(p.data());
                });
                return result;
            }

        };
    }]);
});
Scoped.define("module:Collections.ConcatCollection", [
    "module:Collections.Collection",
    "module:Objs",
    "module:Functions"
], function(Collection, Objs, Functions, scoped) {
    return Collection.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A Concat Collection allows you to dynamically concatinate Collections 
         * 
         * @class BetaJS.Collections.ConcatCollection
         */
        return {

            /**
             * Instantiate a Concat Collection.
             * 
             * @param {array} parents List of parent collections
             * @param {object} options Collection options
             * 
             */
            constructor: function(parents, options) {
                this.__parents = {};
                this.__itemToParent = {};
                options = options || {};
                delete options.objects;
                if (!options.compare)
                    options.compare = Functions.as_method(this.__compareByParent, this);
                inherited.constructor.call(this, options);
                var idx = 0;
                this.__firstParent = null;
                this.__lastParent = null;
                Objs.iter(parents, function(parent) {
                    if (!this.__firstParent)
                        this.__firstParent = parent;
                    this.__lastParent = parent;
                    this.__parents[parent.cid()] = {
                        idx: idx,
                        parent: parent
                    };
                    parent.iterate(function(item) {
                        this.__parentAdd(parent, item);
                    }, this);
                    parent.on("add", function(item) {
                        this.__parentAdd(parent, item);
                    }, this);
                    parent.on("remove", function(item) {
                        this.__parentRemove(parent, item);
                    }, this);
                    idx++;
                }, this);
            },

            /**
             * @override
             */
            destroy: function() {
                Objs.iter(this.__parents, function(parent) {
                    parent.parent.off(null, null, this);
                }, this);
                inherited.destroy.call(this);
            },

            /**
             * @override
             */
            bulkOperationInProgress: function() {
                return inherited.bulkOperationInProgress.call(this) || Objs.exists(this.__parents, function(parent) {
                    return parent.parent.bulkOperationInProgress();
                });
            },

            /**
             * @override
             */
            increase_forwards: function(steps) {
                return this.__lastParent.increase_forwards(steps);
            },

            /**
             * @override
             */
            increase_backwards: function(steps) {
                return this.__firstParent.increase_forwards(steps);
            },

            __parentAdd: function(parent, item) {
                this.__itemToParent[item.cid()] = parent;
                this.add(item);
            },

            __parentRemove: function(parent, item) {
                delete this.__itemToParent[item.cid()];
                this.remove(item);
            },

            __compareByParent: function(item1, item2) {
                var parent1 = this.__itemToParent[item1.cid()];
                var parent2 = this.__itemToParent[item2.cid()];
                if (parent1 === parent2)
                    return parent1.getIndex(item1) - parent2.getIndex(item2);
                return this.__parents[parent1.cid()].idx - this.__parents[parent2.cid()].idx;
            }

        };
    });
});
Scoped.define("module:Collections.FilteredCollection", [
    "module:Collections.Collection"
], function(Collection, scoped) {
    return Collection.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * The FilteredCollection Class allows you to create a dynamic sub collection based on another Collection instance and a filter function.
         * 
         * @class BetaJS.Collections.FilteredCollection
         */
        return {

            /**
             * Instantiates a FilteredCollection.
             * 
             * @param {object} parent Parent Collection
             * @param {object} options Standard Collection options, plus filter and context
             */
            constructor: function(parent, options) {
                this.__parent = parent;
                options = options || {};
                delete options.objects;
                options.compare = options.compare || parent.get_compare();
                inherited.constructor.call(this, options);
                this.__parent.on("add", this.add, this);
                this.__parent.on("remove", this.__selfRemove, this);
                this.__parent.on("change", this.add, this);
                this.setFilter(options.filter, options.context);
            },

            /**
             * Determines whether an item satisfies the filter of this collection.
             * 
             * @param {object} object Properties instance to be checked
             * 
             * @return {boolean} True if object satisfies current filter
             */
            filter: function(object) {
                return !this.__filter || this.__filter.call(this.__filterContext || this, object);
            },

            /**
             * Sets the current filter
             * 
             * @param {function} filterFunction Filter function to be used for checking items
             * @param {object} filterContext Optional filter function context
             */
            setFilter: function(filterFunction, filterContext) {
                this.__filterContext = filterContext;
                this.__filter = filterFunction;
                this.iterate(function(obj) {
                    if (!this.filter(obj))
                        this.__selfRemove(obj);
                }, this);
                this.__parent.iterate(function(object) {
                    if (!this.exists(object) && this.filter(object))
                        this.__selfAdd(object);
                    return true;
                }, this);
            },

            /**
             * @override
             */
            _object_changed: function(object, key, value) {
                inherited._object_changed.call(this, object, key, value);
                if (!this.filter(object))
                    this.__selfRemove(object);
            },

            /**
             * @override
             */
            destroy: function() {
                this.__parent.off(null, null, this);
                inherited.destroy.call(this);
            },

            __selfAdd: function(object) {
                return inherited.add.call(this, object);
            },

            /**
             * @override
             */
            add: function(object) {
                if (this.exists(object) || !this.filter(object))
                    return null;
                var id = this.__selfAdd(object);
                this.__parent.add(object);
                return id;
            },

            __selfRemove: function(object) {
                return inherited.remove.call(this, object);
            },

            /**
             * @override
             */
            remove: function(object) {
                if (!this.exists(object))
                    return null;
                var result = this.__selfRemove(object);
                if (!result)
                    return null;
                return this.__parent.remove(object);
            }

        };
    });
});
Scoped.define("module:Collections.GroupedCollection", [
    "module:Collections.Collection",
    "module:Objs",
    "module:Properties.Properties",
    "module:Functions",
    "module:Promise",
    "module:Async"
], function(Collection, Objs, Properties, Functions, Promise, Async, scoped) {
    return Collection.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * The GroupedCollection Class allows you to create a dynamic sub collection based on another Collection instance by grouping together single items.
         * 
         * @class BetaJS.Collections.GroupedCollection
         */
        return {

            /**
             * Instantiates a GroupedCollection.
             * 
             * @param {object} parent Parent Collection
             * @param {object} options Standard Collection options, plus groupby, insert, remove, context, properties and create
             */
            constructor: function(parent, options) {
                this.__parent = parent;
                options = options || {};
                delete options.objects;
                this.__groupby = options.groupby;
                this.__groupbyCompute = options.groupbyCompute;
                this.__keepEmptyGroups = options.keepEmptyGroups;
                this.__autoIncreaseGroups = options.autoIncreaseGroups;
                this.__generateGroupData = options.generateGroupData;
                this.__nogaps = !!options.nogaps;
                this.__lazyNogaps = !!options.lazyNogaps;
                this.__insertCallback = options.insert;
                this.__removeCallback = options.remove;
                this.__afterGroupCreate = options.afterGroupCreate;
                this.__callbackContext = options.context || this;
                this.__ignoreParentIncrease = options.ignoreParentIncrease;
                this.__propertiesClass = options.properties || Properties;
                this.__itemsAttribute = options.itemsAttribute || "items";
                this.__createProperties = options.create;
                inherited.constructor.call(this, options);
                Objs.iter(this.__groupby, this.add_secondary_index, this);
                this.__parent.iterate(this.__addParentObject, this);
                this.__parent.on("add", this.__addParentObject, this);
                this.__parent.on("remove", this.__removeParentObject, this);
                this.__objectToGroup = {};
            },

            /**
             * @override
             */
            destroy: function() {
                this.__parent.off(null, null, this);
                inherited.destroy.call(this);
            },

            touchGroup: function(data, create, lazy) {
                if (this.destroyed())
                    return;
                if (lazy)
                    return Async.eventually(this.touchGroup, [data, create], this);
                data = Properties.is_instance_of(data) ? data.data() : data;
                data = this.__groupbyCompute ? this.__groupbyCompute.call(this.__callbackContext, data) : data;
                var query = {};
                this.__groupby.forEach(function(key) {
                    query[key] = data[key];
                });
                var group = this.query(query).nextOrNull();
                if (!group && create) {
                    group = this.__createProperties ? this.__createProperties.call(this.__callbackContext) : new this.__propertiesClass();
                    group[this.__itemsAttribute] = group[this.__itemsAttribute] || group.auto_destroy(new Collection({
                        compare: this.__parent.get_compare()
                    }));
                    group[this.__itemsAttribute].bulkOperationInProgress = Functions.as_method(this.bulkOperationInProgress, this);
                    group.setAll(data);
                    this.add(group);
                    if (this.__afterGroupCreate)
                        this.__afterGroupCreate.call(this.__callbackContext, group);
                    this.trigger("touchgroup", group);
                    if (this.__nogaps) {
                        if (group !== this.last())
                            this.touchGroup(this.__generateGroupData.call(this.__callbackContext, group.data(), 1), true, this.__lazyNogaps);
                        if (group !== this.first())
                            this.touchGroup(this.__generateGroupData.call(this.__callbackContext, group.data(), -1), true, this.__lazyNogaps);
                    }
                }
                return group;
            },

            __addParentObject: function(object) {
                var group = this.touchGroup(object, true);
                if (object.cid)
                    this.__objectToGroup[object.cid()] = group;
                this.__addObjectToGroup(object, group);
            },

            __removeParentObject: function(object) {
                var group = object.cid && this.__objectToGroup[object.cid()] ? this.__objectToGroup[object.cid()] : this.touchGroup(object);
                if (group) {
                    this.__removeObjectFromGroup(object, group);
                    if (!this.__keepEmptyGroups && group[this.__itemsAttribute].count() === 0)
                        this.remove(group);
                }
            },

            __addObjectToGroup: function(object, group) {
                group[this.__itemsAttribute].add(object);
                this.__insertObject(object, group);
            },

            __removeObjectFromGroup: function(object, group) {
                group[this.__itemsAttribute].remove(object);
                this.__removeObject(object, group);
            },

            /**
             * @override
             */
            increase_forwards: function(steps) {
                var oldCount = this.__parent.count();
                var promise = this.__ignoreParentIncrease ? Promise.create(true) : this.__parent.increase_forwards(steps);
                return promise.success(function() {
                    if (!this.__autoIncreaseGroups)
                        return;
                    var delta = this.__parent.count() - oldCount;
                    var current = this.last();
                    while (delta < steps) {
                        current = this.touchGroup(this.__generateGroupData.call(this.__callbackContext, current.data(), 1), true);
                        delta++;
                    }
                }, this);
            },

            /**
             * @override
             */
            bulkOperationInProgress: function() {
                return inherited.bulkOperationInProgress.call(this) || this.__parent.bulkOperationInProgress();
            },

            /**
             * @override
             */
            increase_backwards: function(steps) {
                var oldCount = this.__parent.count();
                var promise = this.__ignoreParentIncrease ? Promise.create(true) : this.__parent.increase_backwards(steps);
                return promise.success(function() {
                    if (!this.__autoIncreaseGroups)
                        return;
                    var delta = this.__parent.count() - oldCount;
                    var current = this.first();
                    while (delta < steps) {
                        current = this.touchGroup(this.__generateGroupData.call(this.__callbackContext, current.data(), -1), true);
                        delta++;
                    }
                }, this);
            },

            __insertObject: function(object, group) {
                if (this.__insertCallback)
                    this.__insertCallback.call(this.__callbackContext, object, group);
                else {
                    /**
                     * @event BetaJS.Collections.GroupedCollection#insert
                     */
                    group.trigger("insert", object);
                }
            },

            __removeObject: function(object, group) {
                if (this.__removeCallback)
                    this.__removeCallback.call(this.__callbackContext, object, group);
                else {
                    /**
                     * @event BetaJS.Collections.GroupedCollection#remove
                     */
                    group.trigger("remove", object);
                }
            }

        };
    });
});
Scoped.define("module:Collections.MappedCollection", [
    "module:Collections.Collection",
    "module:Functions"
], function(Collection, Functions, scoped) {
    return Collection.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * The MappedCollection Class allows you to create a dynamic sub collection based on another Collection instance and a mapping function.
         * 
         * @class BetaJS.Collections.MappedCollection
         */
        return {

            /**
             * Instantiates a MappedCollection.
             * 
             * @param {object} parent Parent Collection
             * @param {object} options Standard Collection options, plus map and context
             */
            constructor: function(parent, options) {
                this.__parent = parent;
                this.__parentToThis = {};
                this.__thisToParent = {};
                options = options || {};
                delete options.objects;
                options.compare = Functions.as_method(this.__compareByParent, this);
                inherited.constructor.call(this, options);
                this._mapFunction = options.map;
                this._mapCtx = options.context;
                parent.on("add", this.__parentAdd, this);
                parent.on("remove", this.__parentRemove, this);
                parent.on("change", this.__parentUpdate, this);
                parent.iterate(this.__parentAdd, this);
            },

            /**
             * @override
             */
            destroy: function() {
                this.__parent.off(null, null, this);
                inherited.destroy.call(this);
            },

            __compareByParent: function(item1, item2) {
                return this.__parent.getIndex(this.__thisToParent[item1.cid()]) - this.__parent.getIndex(this.__thisToParent[item2.cid()]);
            },

            __mapItem: function(parentItem, thisItem) {
                return this._mapFunction.call(this._mapCtx || this, parentItem, thisItem);
            },

            __parentAdd: function(item) {
                var mapped = this.__mapItem(item);
                this.__parentToThis[item.cid()] = mapped;
                this.__thisToParent[mapped.cid()] = item;
                this.add(mapped);
            },

            __parentUpdate: function(item) {
                this.__mapItem(item, this.__parentToThis[item.cid()]);
            },

            __parentRemove: function(item) {
                var mapped = this.__parentToThis[item.cid()];
                delete this.__parentToThis[item.cid()];
                delete this.__thisToParent[mapped.cid()];
                this.remove(mapped);
            }

        };
    });
});
Scoped.define("module:Exceptions.ErrorCatcher", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ErrorCatcher Object
         * 
         * @class BetaJS.Exceptions.ErrorCatcher
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {object} thrower thrower instance
             */
            constructor: function(thrower) {
                inherited.constructor.call(this);
                this.__thrower = thrower;
            },

            /**
             * Throws an exception object.
             * 
             * @param e Exception object
             */
            throwException: function(e) {
                this.__thrower.throwException(e);
            }

        };
    });
});


Scoped.define("module:Exceptions.UncaughtErrorCatcher", [
    "module:Exceptions.ErrorCatcher",
    "module:Functions"
], function(ErrorCatcher, Functions, scoped) {
    return ErrorCatcher.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * UncaughtErrorCatcher Object
         * 
         * @class BetaJS.Exceptions.UncaughtErrorCatcher
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {object} thrower Thrower object
             */
            constructor: function(thrower) {
                inherited.constructor.call(this, thrower);
                this.__listenerFunction = Functions.as_method(this._listenerFunction, this);
                try {
                    window.addEventListener("error", this.__listenerFunction);
                } catch (e) {}
                try {
                    process.on('uncaughtException', this.__listenerFunction);
                } catch (e) {}
            },

            /**
             * @override
             */
            destroy: function() {
                try {
                    window.removeEventListener("error", this.__listenerFunction);
                } catch (e) {}
                try {
                    process.off('uncaughtException', this.__listenerFunction);
                } catch (e) {}
                inherited.destroy.call(this);
            },

            _listenerFunction: function(e) {
                this.throwException(e);
            }

        };
    });
});
Scoped.define("module:Exceptions.ExceptionThrower", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        /**
         * Abstract Exception Thrower Class
         * 
         * @class BetaJS.Exceptions.ExceptionThrower
         */
        return {

            /**
             * Throws an exception.
             * 
             * @param {exception} e exception to be thrown
             */
            throwException: function(e) {
                this._throwException(e);
                return this;
            },

            _throwException: function(e) {
                throw e;
            }

        };
    });
});


Scoped.define("module:Exceptions.NullExceptionThrower", [
    "module:Exceptions.ExceptionThrower"
], function(ExceptionThrower, scoped) {
    return ExceptionThrower.extend({
        scoped: scoped
    }, function(inherited) {
        /**
         * Silentely forgets about the exception.
         * 
         * @class BetaJS.Exceptions.NullExceptionThrower
         */
        return {

            /**
             * @override
             */
            _throwException: function(e) {}

        };
    });
});


Scoped.define("module:Exceptions.AsyncExceptionThrower", [
    "module:Exceptions.ExceptionThrower",
    "module:Async"
], function(ExceptionThrower, Async, scoped) {
    return ExceptionThrower.extend({
        scoped: scoped
    }, function(inherited) {
        /**
         * Throws an exception asynchronously.
         * 
         * @class BetaJS.Exceptions.AsyncExceptionThrower
         */
        return {

            /**
             * @override
             */
            _throwException: function(e) {
                Async.eventually(function() {
                    throw e;
                });
            }

        };
    });
});


Scoped.define("module:Exceptions.ConsoleExceptionThrower", [
    "module:Exceptions.ExceptionThrower",
    "module:Exceptions.NativeException"
], function(ExceptionThrower, NativeException, scoped) {
    return ExceptionThrower.extend({
        scoped: scoped
    }, function(inherited) {
        /**
         * Throws execption by console-logging it.
         * 
         * @class BetaJS.Exceptions.ConsoleExceptionThrower
         */
        return {

            /**
             * @override
             */
            _throwException: function(e) {
                console.warn(e.toString());
            }

        };
    });
});


Scoped.define("module:Exceptions.EventExceptionThrower", [
    "module:Exceptions.ExceptionThrower",
    "module:Events.EventsMixin"
], function(ExceptionThrower, EventsMixin, scoped) {
    return ExceptionThrower.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {
        /**
         * Throws exception by triggering an exception event.
         * 
         * @class BetaJS.Exceptions.EventExceptionThrower
         */
        return {

            /**
             * @override
             * @fires BetaJS.Exceptions.EventExceptionThrower#exception
             */
            _throwException: function(e) {
                /**
                 * @event BetaJS.Exceptions.EventExceptionThrower#exception
                 */
                this.trigger("exception", e);
            }

        };
    }]);
});
Scoped.define("module:Exceptions.Exception", [
    "module:Class",
    "module:Comparators"
], function(Class, Comparators, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Exception Class
         * 
         * @class BetaJS.Exceptions.Exception
         */
        return {

            /**
             * Instantiates a new exception.
             * 
             * @param {string} message Exception message
             */
            constructor: function(message) {
                inherited.constructor.call(this);
                this.__message = message;
                try {
                    throw new Error();
                } catch (e) {
                    this.__stack = e.stack;
                }
            },

            /**
             * Asserts to be a certain type of exception. Throws this as an exception of assertion fails.
             * 
             * @param {object} exception_class Exception class to be asserted
             * @return {object} this
             */
            assert: function(exception_class) {
                if (!this.instance_of(exception_class))
                    throw this;
                return this;
            },

            /**
             * Returns exception message string.
             * 
             * @return {string} Exception message string
             */
            message: function() {
                return this.__message;
            },

            /**
             * Returns exception stack.
             * 
             * @return Exception stack
             */
            stack: function() {
                return this.__stack;
            },

            /**
             * Format exception as string.
             * 
             * @return {string} Exception string
             */
            toString: function() {
                return this.message();
            },

            /**
             * Format exception as string including the classname.
             * 
             * @return {string} Exception string plus classname
             */
            format: function() {
                return this.cls.classname + ": " + this.toString();
            },

            /**
             * Returns exception data as JSON.
             * 
             * @return {object} exception data
             */
            json: function() {
                return {
                    classname: this.cls.classname,
                    message: this.message(),
                    stack: this.stack()
                };
            },

            /**
             * Determines whether this exception is equal to another.
             * 
             * @param {object} other Other exception
             * @return {boolean} True if equal
             */
            equals: function(other) {
                return other && this.cls === other.cls && Comparators.deepEqual(this.json(), other.json(), -1);
            }

        };
    }, {

        /**
         * Ensures that a given exception is an instance of an Exception class
         * 
         * @param e Exception
         * @return {object} Exception instance
         */
        ensure: function(e) {
            if (!this.is_instance_of(e))
                throw "Unasserted Exception " + e;
            return e;
        }

    });
});


Scoped.define("module:Exceptions.NativeException", [
    "module:Types",
    "module:Objs",
    "module:Exceptions.Exception"
], function(Types, Objs, Exception, scoped) {

    var NativeException = Exception.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Native Exception Wrapper Class
         * 
         * @class BetaJS.Exceptions.NativeException
         */
        return {

            /**
             * Instantiates a native exception wrapper.
             * 
             * @param {object} object Native exception object
             */
            constructor: function(object) {
                var message = "null";
                this.__data = {};
                if (object) {
                    ["name", "message", "filename", "lineno"].forEach(function(key) {
                        if (key in object)
                            this.__data[key] = object[key];
                    }, this);
                }
                inherited.constructor.call(this, object ? Objs.values(this.__data).join("; ") : "null");
                this.__object = object;
            },

            /**
             * Returns the original native exception object.
             * 
             * @return {object} Native exception object
             */
            object: function() {
                return this.__object;
            },

            /**
             * Returns the extracted data.
             * 
             * @return {object} Extracted data
             */
            data: function() {
                return this.__data;
            },

            /**
             * Returns exception data as JSON.
             * 
             * @return {object} exception data
             */
            json: function() {
                var j = inherited.json.call(this);
                j.data = this.data();
                return j;
            }

        };
    }, {

        /**
         * Ensures that a given exception is an instance of an Exception class
         * 
         * @param e Exception
         * @return {object} Exception instance, possibly wrapping e as a NativeException
         */
        ensure: function(e) {
            return NativeException.is_instance_of(e) ? e : new NativeException(e);
        }

    });

    return NativeException;
});
Scoped.define("module:Async", [
    "module:Types",
    "module:Functions",
    "module:Time"
], function(Types, Functions, Time) {

    var clearTimeoutGlobal = function(h) {
        return clearTimeout(h);
    };

    var clearImmediate =
        Functions.global_method("clearImmediate") ||
        Functions.global_method("cancelAnimationFrame") ||
        Functions.global_method("webkitCancelAnimationFrame") ||
        Functions.global_method("mozCancelAnimationFrame") ||
        clearTimeoutGlobal;

    var setImmediate =
        Functions.global_method("setImmediate") ||
        Functions.global_method("requestAnimationFrame") ||
        Functions.global_method("webkitRequestAnimationFrame") ||
        Functions.global_method("mozRequestAnimationFrame") ||
        function(cb) {
            return setTimeout(cb, 0);
        };


    var __eventuallyOnce = {};
    var __eventuallyOnceIdx = 1;


    /**
     * Auxilary functions for asynchronous operations.
     * 
     * @module BetaJS.Async
     */
    var Module = {


        /**
         * Wait asynchronously for a condition to be met.
         * 
         * @param {function} condition condition function
         * @param {object} conditionCtx condition context (optional)
         * @param {function} callback callback function
         * @param {object} callbackCtx callback context (optional)
         * @param {int} interval interval time between checks (optional, default 1)
         * @param {function} timeoutCallback timeout callback function (optional)
         * @param {object} timeoutCallbackCtx timeout callback context (optional)
         * @param {int} timeout timeout (optional, default unlimited)
         *
         * 
         */
        waitFor: function() {
            var args = Functions.matchArgs(arguments, {
                condition: true,
                conditionCtx: "object",
                callback: true,
                callbackCtx: "object",
                interval: "number",
                timeoutCallback: "function",
                timeoutCallbackCtx: "object",
                timeout: "number"
            });
            var h = function() {
                try {
                    return !!args.condition.apply(args.conditionCtx || args.callbackCtx || this);
                } catch (e) {
                    return false;
                }
            };
            var t = Time.now();
            if (h())
                args.callback.apply(args.callbackCtx || this);
            else {
                var timer = setInterval(function() {
                    if (h()) {
                        clearInterval(timer);
                        args.callback.apply(args.callbackCtx || this);
                    } else if (args.timeout && Time.now() - t >= args.timeout) {
                        clearInterval(timer);
                        if (args.timeoutCallback)
                            args.timeoutCallback.apply(args.timeoutCallbackCtx || args.callbackCtx || this);
                    }
                }, args.interval || 1);
                return timer;
            }
        },

        /**
         * Creates a function that executes a function asynchronously.
         *
         * @param {function} f function to be executed asynchronously
         * @returns {function} asynchronous function
         */
        asyncify: function(f) {
            return function() {
                Module.eventually(f, this);
            };
        },


        /**
         * Execute a function asynchronously eventually.
         * 
         * @param {function} function function to be executed asynchronously
         * @param {array} params optional list of parameters to be passed to the function
         * @param {object} context optional context for the function execution
         * @param {int} time time to wait until execution (default is 0)
         * 
         * @return handle to the eventual call
         */
        eventually: function() {
            var args = Functions.matchArgs(arguments, {
                func: true,
                params: "array",
                context: "object",
                time: "number"
            });
            args.time = args.time || 0;
            var result = {};
            var cb = function() {
                result.clear(result.handle);
                args.func.apply(args.context || this, args.params || []);
            };
            if (args.time > 0) {
                result.clear = clearTimeoutGlobal;
                result.handle = setTimeout(cb, args.time);
            } else {
                result.clear = clearImmediate;
                result.handle = setImmediate(cb);
            }
            return result;
        },


        /**
         * Clears a call scheduled for eventual execution.
         * 
         * @param ev event handle
         * 
         */
        clearEventually: function(ev) {
            if (ev && ev.clear && ev.handle)
                ev.clear(ev.handle);
        },


        /**
         * Executes a function asynchronously eventually, but only once.
         * 
         * @param {function} function function to be executed asynchronously
         * @param {array} params list of parameters to be passed to the function
         * @param {object} context optional context for the function execution
         * 
         */
        eventuallyOnce: function(func, params, context) {
            var data = {
                func: func,
                params: params,
                context: context
            };
            for (var key in __eventuallyOnce) {
                var record = __eventuallyOnce[key];
                if (record.func === func && record.params === params && record.context === context)
                    return;
            }
            __eventuallyOnceIdx++;
            var index = __eventuallyOnceIdx;
            __eventuallyOnce[index] = data;
            return this.eventually(function() {
                delete __eventuallyOnce[index];
                func.apply(context || this, params || []);
            }, this);
        }

    };

    return Module;

});
Scoped.define("module:Promise", [
    "module:Types",
    "module:Functions",
    "module:Async",
    "module:Objs"
], function(Types, Functions, Async, Objs) {

    /**
     * Promise Class
     * 
     * @class BetaJS.Promise
     */
    var Promise = {

        /**
         * Creates a new promise instance.
         * 
         * @param value optional promise value
         * @param error optional promise error
         * @param {boolean} finished does this promise have its final value / error
         */
        Promise: function(value, error, finished) {
            this.__value = error ? null : (value === undefined ? null : value);
            this.__error = error ? error : null;
            this.__isFinished = finished;
            this.__hasError = !!error;
            this.__resultPromise = null;
            this.__callbacks = [];
        },

        fromNativePromise: function(nativePromise) {
            var promise = this.create();
            nativePromise.then(function(value) {
                promise.asyncSuccess(value);
            })['catch'](function(error) {
                promise.asyncError(error);
            });
            return promise;
        },

        /**
         * Create a new promise instance. (Simplified)
         * 
         * @param value optional promise value
         * @param error optional promise error
         * 
         * @return {object} promise instance
         */
        create: function(value, error) {
            return new this.Promise(value, error, arguments.length > 0);
        },

        /**
         * Returns a promise instance for a value. The value might be a promise itself already.
         * 
         * @param value promise value or promise
         * @return {object} promise instance
         */
        value: function(value) {
            return this.is(value) ? value : new this.Promise(value, null, true);
        },

        /**
         * Returns a promise instance for a value, setting the value asynchronously.
         * 
         * @param value promise value
         * @return {object} promise instance
         */
        eventualValue: function(value) {
            var promise = new this.Promise();
            Async.eventually(function() {
                promise.asyncSuccess(value);
            });
            return promise;
        },

        /**
         * Returns a promise instance for an error. The error might be a promise itself already.
         * 
         * @param error promise error or promise
         * @return {object} promise instance
         */
        error: function(error) {
            return this.is(error) ? error : new this.Promise(null, error, true);
        },

        /**
         * Turns a function call or a native promise into a promise, mapping exceptions to errors.
         * 
         * @param {function} f function or native promise
         * @param {object} ctx optional function context
         * @param {array} params optional function parameters
         * 
         * @return {object} promise
         */
        box: function(f, ctx, params) {
            if (f && 'then' in f && 'catch' in f) {
                var promise = this.create();
                f.then(promise.asyncSuccessFunc());
                f['catch'](promise.asyncErrorFunc());
                return promise;
            } else {
                try {
                    var result = f.apply(ctx || this, params || []);
                    return this.is(result) ? result : this.value(result);
                } catch (e) {
                    return this.error(e);
                }
            }
        },

        /**
         * Try-Catch a function, wrapping it into a promise.
         * 
         * @param {function} f function
         * @param {object} ctx optional function context
         * 
         * @return {object} promise
         */
        tryCatch: function(f, ctx) {
            try {
                return this.value(f.apply(ctx || this));
            } catch (e) {
                return this.error(e);
            }
        },

        /**
         * Turns a function accepting a callback function as last parameter into a promise.
         * 
         * @param {object} optional function context
         * @param {function} func function
         * 
         * @return {object} promise
         */
        funcCallback: function(ctx, func) {
            var args = [];
            if (Types.is_function(ctx)) {
                args = Functions.getArguments(arguments, 1);
                func = ctx;
                ctx = this;
            } else
                args = Functions.getArguments(arguments, 2);
            var promise = this.create();
            args.push(promise.asyncCallbackFunc());
            func.apply(ctx, args);
            return promise;
        },

        /**
         * Takes a number of promises and creates a single new promise being successful if and only if all input promises are successful.
         * 
         * @param {array} promises promises array
         * 
         * @return {object} promise
         */
        and: function(promises) {
            var promise = this.create();
            promise.__promises = [];
            promise.__successCount = 0;
            promise.__values = [];
            promise.__errorPromise = null;
            promise.and = function(promises) {
                promises = promises || [];
                if (this.__ended)
                    return this;
                if (!Types.is_array(promises))
                    promises = [promises];
                var f = function(error, value) {
                    if (error)
                        this.promise.__errorPromise = this.promise.__promises[this.idx];
                    else {
                        this.promise.__successCount++;
                        this.promise.__values[this.idx] = value;
                    }
                    this.promise.results();
                };
                for (var i = 0; i < promises.length; ++i) {
                    var last = this.__promises.length;
                    this.__promises.push(promises[i]);
                    this.__values.push(null);
                    if (promises[i].isFinished()) {
                        if (promises[i].hasValue()) {
                            this.__successCount++;
                            this.__values[last] = promises[i].value();
                        } else
                            this.__errorPromise = promises[i];
                    } else {
                        promises[i].callback(f, {
                            promise: this,
                            idx: last
                        });
                    }
                }
                return this;
            };
            promise.end = function() {
                if (this.__ended)
                    return this;
                this.__ended = true;
                this.results();
                return this;
            };
            promise.results = function() {
                if (this.__ended && this.__errorPromise)
                    this.asyncError(this.__errorPromise.err(), this.__errorPromise);
                else if (this.__ended && this.__successCount == this.__promises.length)
                    this.asyncSuccess(this.__values);
                return this;
            };
            promise.successUnfold = function(f, context, options) {
                return this.success(function() {
                    return f.apply(context, arguments);
                }, context, options);
            };
            promise.and(promises);
            return promise;
        },

        /**
         * Takes a function and calls with a number of arguments, some of which might be promises and turns it into actual values.
         * 
         * @param {function} func function
         * 
         * @return {object} promise
         */
        func: function(func) {
            var args = Functions.getArguments(arguments, 1);
            var promises = [];
            for (var i = 0; i < args.length; ++i) {
                if (this.is(args[i]))
                    promises.push(args[i]);
            }
            var promise = this.create();
            this.and(promises).end().success(function(values) {
                var params = [];
                for (var i = 0; i < args.length; ++i)
                    params[i] = this.is(args[i]) ? args[i].value() : args[i];
                var result = func.apply(this, params);
                if (this.is(result))
                    result.forwardCallback(promise);
                else
                    promise.asyncSuccess(result);
            }, this).forwardError(promise);
            return promise;
        },

        /**
         * Takes a method and calls with a number of arguments, some of which might be promises and turns it into actual values.
         * 
         * @param {object} ctx function context
         * @param {function} func function
         * @param {array} params parameters
         * 
         * @return {object} promise
         */
        methodArgs: function(ctx, func, params) {
            params.unshift(function() {
                return func.apply(ctx, arguments);
            });
            return this.func.apply(this, params);
        },

        /**
         * Takes a method and calls with a number of arguments, some of which might be promises and turns it into actual values.
         * 
         * @param {object} ctx function context
         * @param {function} func function
         * 
         * @return {object} promise
         */
        method: function(ctx, func) {
            return this.methodArgs(ctx, func, Functions.getArguments(arguments, 2));
        },

        /**
         * Takes a constructor and calls with a number of arguments, some of which might be promises and turns it into actual values.
         * 
         * @param {object} cls constructor class
         * 
         * @return {object} promise
         */
        newClass: function(cls) {
            var params = Functions.getArguments(arguments, 1);
            params.unshift(Functions.newClassFunc(cls));
            return this.func.apply(this, params);
        },

        /**
         * Determines whether some value is a promise object.
         * 
         * @param obj value
         * 
         * @return {boolean} true if obj is a promise object
         */
        is: function(obj) {
            return obj && Types.is_object(obj) && obj.classGuid == this.Promise.prototype.classGuid;
        },

        /**
         * Applies a method multiple times until it succeeds.
         * 
         * @param {function} method method
         * @param {object} context method context
         * @param {int} resilience number of times to call
         * @param {array} args arguments for method
         * @param {int} delay optional delay in-between tries
         * 
         * @return {object} promise
         */
        resilience: function(method, context, resilience, args, delay) {
            if (delay)
                method = this.delayPromiseMethod(method, delay);
            return method.apply(context, args).mapError(function(error) {
                return resilience === 0 ? error : this.resilience(method, context, resilience - 1, args);
            }, this);
        },

        /**
         * Creates a new method returning a promise based on a method returning a promise by delaying the underlying method.
         *
         * @param {function} method original method
         * @param {int} delay delay time
         * @returns {function} delayed method
         */
        delayPromiseMethod: function(method, delay) {
            var self = this;
            return function() {
                var promise = self.create();
                var args = Functions.getArguments(arguments);
                Async.eventually(function() {
                    method.apply(this, args).forwardCallback(promise);
                }, this, delay);
                return promise;
            };
        },

        /**
         * Wait asynchronously for a condition to be met.
         *
         * @param {function} condition condition function
         * @param {object} conditionCtx condition context (optional)
         * @param {int} interval interval time between checks (optional, default 1)
         * @param {int} timeout optional timeout
         *
         * @return {object} promise
         *
         */
        waitFor: function(condition, conditionCtx, interval, timeout) {
            var promise = this.create();
            var successTimer, errorTimer;
            if (timeout) {
                errorTimer = setTimeout(function() {
                    if (successTimer)
                        clearInterval(successTimer);
                    promise.asyncError(true);
                }, timeout);
            }
            successTimer = Async.waitFor(condition, conditionCtx, function() {
                if (errorTimer)
                    clearTimeout(errorTimer);
                promise.asyncSuccess(true);
            }, interval);
            return promise;
        },

        /**
         * Exclusively execute a promise-based function by postponing execution of further calls by waiting for the
         * promise completion.
         *
         * @param {function} promiseFunc promise function
         * @param {object} ctx function context (optional)
         *
         * @return {function} exclusive function
         *
         */
        exclusiveExecution: function(promiseFunc, ctx) {
            var currentPromise = null;
            var promiseQueue = [];
            return function() {
                var args = arguments;
                var resultPromise = null;
                if (!currentPromise) {
                    currentPromise = promiseFunc.apply(ctx, args);
                    resultPromise = currentPromise;
                } else {
                    var promise = Promise.create();
                    promiseQueue.push(promise);
                    resultPromise = promise.mapSuccess(function() {
                        return promiseFunc.apply(this, args);
                    }, ctx);
                }
                resultPromise.callback(function() {
                    currentPromise = null;
                    if (promiseQueue.length > 0) {
                        currentPromise = promiseQueue.shift();
                        currentPromise.asyncSuccess(true);
                    }
                });
                return resultPromise;
            };
        }

    };

    Objs.extend(Promise.Promise.prototype, {
        classGuid: "7e3ed52f-22da-4e9c-95a4-e9bb877a3935",

        /**
         * Be notified when the promise is successful.
         * 
         * @param {function} f callback function
         * @param {object} context optional callback context
         * @param {object} options optional options
         */
        success: function(f, context, options) {
            return this.callback(f, context, options, "success");
        },

        /**
         * Be notified when the promise is successful asynchronously.
         *
         * @param {function} f callback function
         * @param {object} context optional callback context
         * @param {object} options optional options
         */
        asuccess: function(f, context, options) {
            return this.success(Async.asyncify(f), context, options);
        },

        /**
         * Set an object value once value is known.
         *
         * @param {object} obj object
         * @param {string} key key to set value for
         */
        valueify: function(obj, key) {
            return this.success(function(value) {
                obj[key] = value;
            });
        },

        /**
         * Be notified when the promise is unsuccessful.
         * 
         * @param {function} f callback function
         * @param {object} context optional callback context
         * @param {object} options optional options
         */
        error: function(f, context, options) {
            return this.callback(f, context, options, "error");
        },

        /**
         * Be notified when the promise is finished..
         * 
         * @param {function} f callback function
         * @param {object} context callback context
         * @param {object} options options
         * @param {string} type type of callback like "success"
         */
        callback: function(f, context, options, type) {
            if ("end" in this)
                this.end();
            var record = {
                type: type || "callback",
                func: f,
                options: options || {},
                context: context
            };
            if (this.__isFinished)
                this.triggerResult(record);
            else
                this.__callbacks.push(record);
            return this;
        },

        /**
         * Be notified when the promise does not finish with a certain time.
         *
         * @param {int} delay delay timeout
         * @param {function} f callback function
         * @param {object} context callback context
         */
        timeout: function(delay, f, context) {
            var ev = Async.eventually(f, context, delay);
            return this.callback(function() {
                Async.clearEventually(ev);
            });
        },

        /**
         * Timeout with an error.
         *
         * @param {int} delay delay timeout
         * @param error error value
         */
        timeoutError: function(delay, error) {
            if (!delay)
                return this;
            return this.timeout(delay, function() {
                this.asyncError(error);
            }, this);
        },

        /**
         * Trigger the result.
         * 
         * @param {object} record optional specific callback record
         * 
         */
        triggerResult: function(record) {
            if (!this.__isFinished)
                return this;
            if (record) {
                if (record.type == "success" && !this.__hasError)
                    record.func.call(record.context || this, this.__value, this.__resultPromise || this);
                else if (record.type == "error" && this.__hasError)
                    record.func.call(record.context || this, this.__error, this.__resultPromise || this);
                else if (record.type == "callback")
                    record.func.call(record.context || this, this.__error, this.__value, this.__resultPromise || this);
            } else {
                var records = this.__callbacks;
                this.__callbacks = [];
                for (var i = 0; i < records.length; ++i)
                    this.triggerResult(records[i]);
            }
            return this;
        },

        /**
         * Returns the value of the promise.
         * 
         * @return value of promise
         */
        value: function() {
            return this.__value;
        },

        /**
         * Returns the error of the promise.
         * 
         * @return error of promise
         */
        err: function() {
            return this.__error;
        },

        /**
         * Determines whether the promise has a value or an error already.
         * 
         * @return {boolean} true if value or error present
         */
        isFinished: function() {
            return this.__isFinished;
        },

        /**
         * Determines whether the promise has a value.
         * 
         * @return {boolean} true if value present
         */
        hasValue: function() {
            return this.__isFinished && !this.__hasError;
        },

        /**
         * Determines whether the promise has an error.
         * 
         * @return {boolean} true if error present
         */
        hasError: function() {
            return this.__isFinished && this.__hasError;
        },

        /**
         * Informs the promise of a successful value.
         * 
         * @param value success value
         * @param {object} promise optional success promise
         */
        asyncSuccess: function(value, promise) {
            if (this.__isFinished)
                return this;
            this.__resultPromise = promise;
            this.__error = null;
            this.__isFinished = true;
            this.__hasError = false;
            this.__value = value;
            return this.triggerResult();
        },

        /**
         * Informs the promise of an error value.
         * 
         * @param error error value
         * @param {object} promise optional error promise
         */
        asyncError: function(error, promise) {
            if (this.__isFinished)
                return this;
            this.__resultPromise = promise;
            this.__isFinished = true;
            this.__hasError = true;
            this.__error = error;
            this.__value = null;
            return this.triggerResult();
        },

        /**
         * Informs the promise of an error or success value.
         * 
         * @param error optional error value
         * @param value optional success value
         * @param {object} promise optional callback promise
         */
        asyncCallback: function(error, value, promise) {
            if (error)
                return this.asyncError(error, promise);
            else
                return this.asyncSuccess(value, promise);
        },

        /**
         * Forwards the success of this promise to another promise.
         * 
         * @param {object} promise promise to which the success should be forwarded to
         */
        forwardSuccess: function(promise) {
            this.success(promise.asyncSuccess, promise);
            return this;
        },

        /**
         * Forwards the error of this promise to another promise.
         * 
         * @param {object} promise promise to which the error should be forwarded to
         */
        forwardError: function(promise) {
            this.error(promise.asyncError, promise);
            return this;
        },

        /**
         * Forwards the callback of this promise to another promise.
         * 
         * @param {object} promise promise to which the callback should be forwarded to
         */
        forwardCallback: function(promise) {
            this.callback(promise.asyncCallback, promise);
            return this;
        },

        /**
         * Generates a context-less function for the asynchronous callback.
         * 
         * @return {function} context-less function
         */
        asyncCallbackFunc: function() {
            return Functions.as_method(this.asyncCallback, this);
        },

        /**
         * Generates a context-less function for the asynchronous success.
         *
         * @return {function} context-less function
         */
        asyncSuccessFunc: function() {
            return Functions.as_method(this.asyncSuccess, this);
        },

        /**
         * Generates a context-less function for the asynchronous error.
         *
         * @return {function} context-less function
         */
        asyncErrorFunc: function() {
            return Functions.as_method(this.asyncError, this);
        },

        /**
         * Maps the success value of the promise to a function that might return another promise.
         * 
         * @param {function} func success callback
         * @param {object} ctx optional context
         * 
         * @return {object} promise
         */
        mapSuccess: function(func, ctx) {
            var promise = Promise.create();
            this.forwardError(promise).success(function(value, pr) {
                try {
                    var result = func.call(ctx || promise, value, pr);
                    if (Promise.is(result))
                        result.forwardCallback(promise);
                    else
                        promise.asyncSuccess(result);
                } catch (e) {
                    if (this.__callbacks.every(function(cb) {
                            return cb.type === "success";
                        })) {
                        console.warn(e);
                    }
                    promise.asyncError(e);
                }
            });
            return promise;
        },

        /**
         * Maps the success value of the promise asynchronously to a function that might return another promise.
         *
         * @param {function} func success callback
         * @param {object} ctx optional context
         *
         * @return {object} promise
         */
        mapASuccess: function(func, ctx) {
            return this.mapSuccess(function(result) {
                var promise = Promise.create();
                Async.eventually(function() {
                    Promise.box(func, ctx, [result]).forwardCallback(promise);
                });
                return promise;
            });
        },

        /**
         * Maps the error value of the promise to a function that might return another promise.
         * 
         * @param {function} func error callback
         * @param {object} ctx optional context
         * 
         * @return {object} promise
         */
        mapError: function(func, ctx) {
            var promise = Promise.create();
            this.forwardSuccess(promise).error(function(err, pr) {
                var result = func.call(ctx || promise, err, pr);
                if (Promise.is(result))
                    result.forwardCallback(promise);
                else
                    promise.asyncError(result);
            });
            return promise;
        },

        /**
         * Maps the error or success value of the promise to a function that might return another promise.
         * 
         * @param {function} func callback function
         * @param {object} ctx optional context
         * 
         * @return {object} promise
         */
        mapCallback: function(func, ctx) {
            var promise = Promise.create();
            this.callback(function(err, value, pr) {
                var result = func.call(ctx || promise, err, value, pr);
                if (Promise.is(result))
                    result.forwardCallback(promise);
                else
                    promise.asyncCallback(err ? result : err, err ? value : result, pr);
            });
            return promise;
        },

        /**
         * Concatenates more promises to this promise
         * 
         * @param {array} promises other promises
         * 
         * @return {object} promise
         */
        and: function(promises) {
            var result = Promise.and(this);
            return result.and(promises);
        }
    });

    return Promise;
});
Scoped.define("module:Timers.Timer", [
    "module:Class",
    "module:Objs",
    "module:Time"
], function(Class, Objs, Time, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Timer Class
         * 
         * @class BetaJS.Timers.Timer
         */
        return {

            /**
             * Create a new timer instance.
             * 
             * @param {object} options, including
             *   int delay (mandatory): number of milliseconds until it fires
             *   bool once (optional, default false): should it fire infinitely often
             *   func fire (optional): will be fired
             *   object context (optional): for fire
             *   bool start (optional, default true): should it start immediately
             *   bool real_time (default false)
             *   bool immediate (optional, default false): zero time until first fire
             *   int duration (optional, default null)
             *   int fire_max (optional, default null)
             * 
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                options = Objs.extend({
                    once: false,
                    start: true,
                    fire: null,
                    context: this,
                    destroy_on_fire: false,
                    destroy_on_stop: false,
                    real_time: false,
                    duration: null,
                    fire_max: null,
                    immediate: false
                }, options);
                this.__immediate = options.immediate;
                this.__delay = options.delay;
                this.__destroy_on_fire = options.destroy_on_fire;
                this.__destroy_on_stop = options.destroy_on_stop;
                this.__once = options.once;
                this.__fire = options.fire;
                this.__context = options.context;
                this.__started = false;
                this.__real_time = options.real_time;
                this.__end_time = options.duration !== null ? Time.now() + options.duration : null;
                this.__fire_max = options.fire_max;
                if (options.start)
                    this.start();
            },

            /**
             * @override
             */
            destroy: function() {
                this.stop();
                inherited.destroy.call(this);
            },

            /**
             * Returns the number of times the timer has fired.
             * 
             * @return {int} fire count
             */
            fire_count: function() {
                return this.__fire_count;
            },

            /**
             * Returns the current duration of timer.
             * 
             * @return {int} duration in milliseconds
             */
            duration: function() {
                return Time.now() - this.__start_time;
            },

            /**
             * Fired when the timer fires.
             */
            fire: function() {
                if (this.__once)
                    this.__started = false;
                if (this.__fire) {
                    this.__fire.call(this.__context, this);
                    this.__fire_count++;
                    if (this.__real_time && !this.__destroy_on_fire && !this.__once) {
                        while ((this.__fire_count + 1) * this.__delay <= Time.now() - this.__start_time) {
                            this.__fire.call(this.__context, this);
                            this.__fire_count++;
                        }
                    }
                }
                if ((this.__end_time !== null && Time.now() + this.__delay > this.__end_time) ||
                    (this.__fire_max !== null && this.__fire_max <= this.__fire_count))
                    this.stop();
                if (this.__destroy_on_fire)
                    this.weakDestroy();
            },

            /**
             * Stops the timer.
             * 
             * @return {object}
             */
            stop: function() {
                if (!this.__started)
                    return this;
                if (this.__once)
                    clearTimeout(this.__timer);
                else
                    clearInterval(this.__timer);
                this.__started = false;
                if (this.__destroy_on_stop)
                    this.weakDestroy();
                return this;
            },

            /**
             * Starts the timer.
             * 
             * @return {object} this
             */
            start: function() {
                if (this.__started)
                    return this;
                var self = this;
                this.__start_time = Time.now();
                this.__fire_count = 0;
                if (this.__once)
                    this.__timer = setTimeout(function() {
                        self.fire();
                    }, this.__delay);
                else
                    this.__timer = setInterval(function() {
                        self.fire();
                    }, this.__delay);
                this.__started = true;
                if (this.__immediate)
                    this.fire();
                return this;
            },

            /**
             * Restarts the timer.
             * 
             * @return {object} this
             */
            restart: function() {
                this.stop();
                this.start();
                return this;
            }

        };
    });
});
Scoped.define("module:Iterators.ArrayIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ArrayIterator Class
         * 
         * @class BetaJS.Iterators.ArrayIterator
         */
        return {

            /**
             * Creates an Array Iterator
             * 
             * @param {array} arr array
             */
            constructor: function(arr) {
                inherited.constructor.call(this);
                this.__array = arr;
                this.__i = 0;
            },

            /**
             * @override
             */
            hasNext: function() {
                return this.__i < this.__array.length;
            },

            /**
             * @override
             */
            next: function() {
                var ret = this.__array[this.__i];
                this.__i++;
                return ret;
            }

        };
    }, {

        /**
         * Creates an Array Iterator by an iteration function
         * 
         * @param {function} iterate_func Iteration function
         * @param {object} iterate_func_ctx Optional context
         * 
         * @return {object} Array Iterator instance
         */
        byIterate: function(iterate_func, iterate_func_ctx) {
            var result = [];
            iterate_func.call(iterate_func_ctx || this, function(item) {
                result.push(item);
            }, this);
            return new this(result);
        }
    });
});


Scoped.define("module:Iterators.NativeMapIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * NativeMapIterator Class
         * 
         * @class BetaJS.Iterators.NativeMapIterator
         */
        return {

            /**
             * Creates a Native Map Iterator
             * 
             * @param {Map} map Iterator based on the values of this native map
             */
            constructor: function(map) {
                inherited.constructor.call(this);
                this.__iter = map.values();
                this.__next = this.__iter.next();
            },

            /**
             * @override
             */
            hasNext: function() {
                return !this.__next.done;
            },

            /**
             * @override
             */
            next: function() {
                var value = this.__next.value;
                this.__next = this.__iter.next();
                return value;
            }

        };
    });
});


Scoped.define("module:Iterators.ObjectKeysIterator", ["module:Iterators.ArrayIterator"], function(ArrayIterator, scoped) {
    return ArrayIterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ObjectKeysIterator Class
         * 
         * @class BetaJS.Iterators.ObjectKeysIterator
         */
        return {

            /**
             * Creates an Object Keys Iterator
             * 
             * @param {object} obj Object to create iterator from
             */
            constructor: function(obj) {
                inherited.constructor.call(this, Object.keys(obj));
            }

        };
    });
});


Scoped.define("module:Iterators.ObjectValuesIterator", ["module:Iterators.ArrayIterator", "module:Objs"], function(ArrayIterator, Objs, scoped) {
    return ArrayIterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ObjectValuesIterator Class
         * 
         * @class BetaJS.Iterators.ObjectValuesIterator
         */
        return {

            /**
             * Creates an Object Values Iterator
             * 
             * @param {object} obj Object to create iterator from
             */
            constructor: function(obj) {
                inherited.constructor.call(this, Objs.values(obj));
            }

        };
    });
});


Scoped.define("module:Iterators.LazyMultiArrayIterator", ["module:Iterators.LazyIterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * LazyMultiArrayIterator Class
         * 
         * @class BetaJS.Iterators.LazyMultiArrayIterator
         */
        return {

            /**
             * Creates a Lazy Multi Array Iterator
             * 
             * @param {function} next_callback Function returning the next array
             * @param {object} next_context Context for next function
             */
            constructor: function(next_callback, next_context) {
                inherited.constructor.call(this);
                this.__next_callback = next_callback;
                this.__next_context = next_context;
                this.__array = null;
                this.__i = 0;
            },

            /**
             * @override
             */
            _next: function() {
                if (this.__array === null || this.__i >= this.__array.length) {
                    this.__array = this.__next_callback.apply(this.__next_context);
                    this.__i = 0;
                }
                if (this.__array !== null) {
                    var ret = this.__array[this.__i];
                    this.__i++;
                    return ret;
                } else
                    this._finished();
            }

        };
    });
});
Scoped.define("module:Iterators.MappedIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, mapping each object using a function.
         * 
         * @class BetaJS.Iterators.MappedIterator
         */
        return {

            /**
             * Create a new instance.
             * 
             * @param {object} iterator Source iterator
             * @param {function} map Function mapping source objects to target objects
             * @param {object} context Context for the map function
             */
            constructor: function(iterator, map, context) {
                inherited.constructor.call(this);
                this.__iterator = iterator;
                this.__map = map;
                this.__context = context || this;
            },

            /**
             * @override
             */
            hasNext: function() {
                return this.__iterator.hasNext();
            },

            /**
             * @override
             */
            next: function() {
                return this.hasNext() ? this.__map.call(this.__context, this.__iterator.next()) : null;
            }

        };
    });
});


Scoped.define("module:Iterators.FilteredIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, filtering single objects by a function.
         * 
         * @class BetaJS.Iterators.FilteredIterator
         */
        return {

            /**
             * Create a new instance.
             * 
             * @param {object} iterator Source iterator
             * @param {function} filter Filter function
             * @param {object} context Context for the filter function
             */
            constructor: function(iterator, filter, context) {
                inherited.constructor.call(this);
                this.__iterator = iterator;
                this.__filter = filter;
                this.__context = context || this;
                this.__next = null;
            },

            /**
             * @override
             */
            hasNext: function() {
                this.__crawl();
                return this.__next !== null;
            },

            /**
             * @override
             */
            next: function() {
                this.__crawl();
                var item = this.__next;
                this.__next = null;
                return item;
            },

            __crawl: function() {
                while (!this.__next && this.__iterator.hasNext()) {
                    var item = this.__iterator.next();
                    if (this.__filter_func(item))
                        this.__next = item;
                }
            },

            __filter_func: function(item) {
                return this.__filter.apply(this.__context, [item]);
            }

        };
    });
});


Scoped.define("module:Iterators.SkipIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, skipping some elements.
         * 
         * @class BetaJS.Iterators.SkipIterator
         */
        return {

            /**
             * Create an instance.
             * 
             * @param {object} iterator Source iterator
             * @param {int} skip How many elements should be skipped
             */
            constructor: function(iterator, skip) {
                inherited.constructor.call(this);
                this.__iterator = iterator;
                while (skip > 0) {
                    iterator.next();
                    skip--;
                }
            },

            /**
             * @override
             */
            hasNext: function() {
                return this.__iterator.hasNext();
            },

            /**
             * @override
             */
            next: function() {
                return this.__iterator.next();
            }

        };
    });
});


Scoped.define("module:Iterators.LimitIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, limiting the number of elements iterated.
         * 
         * @class BetaJS.Iterators.LimitIterator
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {object} iterator Source iterator
             * @param {int} limit What should be the maximum number of elements
             */
            constructor: function(iterator, limit) {
                inherited.constructor.call(this);
                this.__iterator = iterator;
                this.__limit = limit;
            },


            /**
             * @override
             */
            hasNext: function() {
                return this.__limit > 0 && this.__iterator.hasNext();
            },

            /**
             * @override
             */
            next: function() {
                if (this.__limit <= 0)
                    return null;
                this.__limit--;
                return this.__iterator.next();
            }

        };
    });
});


Scoped.define("module:Iterators.SortedIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, sorting the source objects by a comparator.
         * 
         * @class BetaJS.Iterators.SortedIterator
         */
        return {

            /**
             * Create an instance.
             * 
             * @param {object} iterator Source iterator
             * @param {function} compare Function comparing two elements of the source iterator
             */
            constructor: function(iterator, compare) {
                inherited.constructor.call(this);
                this.__array = iterator.asArray();
                this.__array.sort(compare);
                this.__i = 0;
            },

            /**
             * @override
             */
            hasNext: function() {
                return this.__i < this.__array.length;
            },

            /**
             * @override
             */
            next: function() {
                var ret = this.__array[this.__i];
                this.__i++;
                return ret;
            }

        };
    });
});


Scoped.define("module:Iterators.LazyIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Lazy Iterator Class that is based on only getting next elements without an internal hasNext.
         * 
         * @class BetaJS.Iterators.LazyIterator
         */
        return {

            /**
             * Create an instance.
             * 
             */
            constructor: function() {
                inherited.constructor.call(this);
                this.__finished = false;
                this.__initialized = false;
                this.__current = null;
                this.__has_current = false;
            },

            /**
             * Initialize lazy iterator.
             */
            _initialize: function() {},

            /**
             * Get next element.
             * 
             * @return next element
             */
            _next: function() {},

            /**
             * The lazy iterator is finished.
             */
            _finished: function() {
                this.__finished = true;
            },

            /**
             * Set current element of lazy iterator.
             * 
             * @param result current element
             */
            _current: function(result) {
                this.__current = result;
                this.__has_current = true;
            },

            __touch: function() {
                if (!this.__initialized)
                    this._initialize();
                this.__initialized = true;
                if (!this.__has_current && !this.__finished)
                    this._next();
            },

            /**
             * @override
             */
            hasNext: function() {
                this.__touch();
                return this.__has_current;
            },

            /**
             * @override
             */
            next: function() {
                this.__touch();
                this.__has_current = false;
                return this.__current;
            }

        };
    });
});


Scoped.define("module:Iterators.SortedOrIterator", ["module:Iterators.LazyIterator", "module:Structures.TreeMap", "module:Objs"], function(Iterator, TreeMap, Objs, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Iterator Class, iterating over an array of source iterator and returning each element by sorting lazily over all source iterators.
         * 
         * @class BetaJS.Iterators.SortedOrIterator
         */
        return {

            /**
             * Create an instance.
             * 
             * @param {array} iterators Array of source iterators
             * @param {function} compare Function comparing two elements of the source iterator
             */
            constructor: function(iterators, compare) {
                this.__iterators = iterators;
                this.__map = TreeMap.empty(compare);
                inherited.constructor.call(this);
            },

            __process: function(iter) {
                if (iter.hasNext()) {
                    var n = iter.next();
                    var value = TreeMap.find(n, this.__map);
                    if (value)
                        value.push(iter);
                    else
                        this.__map = TreeMap.add(n, [iter], this.__map);
                }
            },

            /**
             * @override
             */
            _initialize: function() {
                Objs.iter(this.__iterators, this.__process, this);
                if (TreeMap.is_empty(this.__map))
                    this._finished();
            },

            /**
             * @override
             */
            _next: function() {
                var ret = TreeMap.take_min(this.__map);
                this._current(ret[0].key);
                this.__map = ret[1];
                Objs.iter(ret[0].value, this.__process, this);
                if (TreeMap.is_empty(this.__map))
                    this._finished();
            }

        };
    });
});


Scoped.define("module:Iterators.PartiallySortedIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * A delegated iterator class, by sorting its elements in a partially sorted iterator.
         * 
         * @class BetaJS.Iterators.PartiallySortedIterator
         */
        return {

            /**
             * Creates an instance.
             * 
             * @param {object} iterator Source iterator
             * @param {function} compare Function comparing two elements of the source iterator
             * @param {function} partial_same Function determining whether two objects are partially the same
             */
            constructor: function(iterator, compare, partial_same) {
                inherited.constructor.call(this);
                this.__compare = compare;
                this.__partial_same = partial_same;
                this.__iterator = iterator;
                this.__head = [];
                this.__tail = [];
            },

            __cache: function() {
                if (this.__head.length > 0)
                    return;
                this.__head = this.__tail;
                this.__tail = [];
                if (!this.__iterator.hasNext())
                    return;
                if (this.__head.length === 0)
                    this.__head.push(this.__iterator.next());
                while (this.__iterator.hasNext()) {
                    var n = this.__iterator.next();
                    if (!this.__partial_same(this.__head[0], n)) {
                        this.__tail.push(n);
                        break;
                    }
                    this.__head.push(n);
                }
                this.__head.sort(this.__compare);
            },

            /**
             * @override
             */
            hasNext: function() {
                this.__cache();
                return this.__head.length > 0;
            },

            /**
             * @override
             */
            next: function() {
                this.__cache();
                return this.__head.shift();
            }

        };
    });
});


Scoped.define("module:Iterators.ConcatIterator", ["module:Iterators.Iterator"], function(Iterator, scoped) {
    return Iterator.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ConcatIterator Class
         *
         * @class BetaJS.Iterators.ConcatIterator
         */
        return {

            /**
             * Creates an Iterator of an iterator of iterators
             *
             * @param {object} iterators iterators
             */
            constructor: function(iterators) {
                inherited.constructor.call(this);
                this.__iterators = iterators;
                this.__current = null;
            },

            __ensure: function() {
                while ((!this.__current || !this.__current.hasNext()) && this.__iterators.hasNext())
                    this.__current = this.__iterators.next();
                return this.__current;
            },

            /**
             * @override
             */
            hasNext: function() {
                var iterator = this.__ensure();
                return iterator && iterator.hasNext();
            },

            /**
             * @override
             */
            next: function() {
                return this.__ensure().next();
            }

        };

    });
});
Scoped.extend("module:Iterators", [
    "module:Types",
    "module:Iterators.Iterator",
    "module:Iterators.ArrayIterator"
], function(Types, Iterator, ArrayIterator) {
    return {

        /**
         * Ensure that something is an iterator and if it is not and iterator is created from the data.
         * 
         * @param mixed mixed type variable
         * 
         * @return {object} iterator
         */
        ensure: function(mixed) {
            if (mixed === null)
                return new ArrayIterator([]);
            if (mixed.instance_of(Iterator))
                return mixed;
            if (Types.is_array(mixed))
                return new ArrayIterator(mixed);
            return new ArrayIterator([mixed]);
        }

    };
});


Scoped.define("module:Iterators.Iterator", [
    "module:Class",
    "module:Functions",
    "module:Async",
    "module:Promise"
], function(Class, Functions, Async, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract Iterator Class
         * 
         * @class BetaJS.Iterators.Iterator
         */
        return {

            /**
             * Determines whether there are more elements in the iterator.
             * Should be overwritten by subclass.
             *
             * @return {boolean} true if more elements present
             */
            hasNext: function() {
                return false;
            },

            /**
             * Returns the next element in the iterator.
             * Should be overwritten by subclass.
             * 
             * @return next element in iterator
             */
            next: function() {
                return null;
            },

            /**
             * Returns the next element if present or null otherwise.
             * 
             * @return next element in iterator or null
             */
            nextOrNull: function() {
                return this.hasNext() ? this.next() : null;
            },

            /**
             * Materializes the iterator as an array.
             *
             * @param {boolean} keep do not destroy iterator
             * @return {array} array of elements in iterator
             */
            asArray: function(keep) {
                var arr = [];
                while (this.hasNext())
                    arr.push(this.next());
                if (!keep)
                    this.weakDestroy();
                return arr;
            },

            /**
             * Iterate over the iterator, calling a callback function for every element.
             * 
             * @param {function} cb callback function
             * @param {object} ctx optional callback context
             * @param {boolean} keep do not destroy iterator
             */
            iterate: function(cb, ctx, keep) {
                while (this.hasNext()) {
                    var result = cb.call(ctx || this, this.next());
                    if (result === false)
                        break;
                }
                if (!keep)
                    this.weakDestroy();
            },

            /**
             * Asynchronously iterate over the iterator, calling a callback function for every element.
             * 
             * @param {function} cb callback function
             * @param {object} ctx optional callback context
             * @param {int} time optional time between calls
             * 
             * @return {object} finish promise
             */
            asyncIterate: function(cb, ctx, time) {
                if (!this.hasNext()) {
                    this.destroy();
                    return Promise.value(true);
                }
                var result = cb.call(ctx || this, this.next());
                if (result === false)
                    return Promise.value(true);
                var promise = Promise.create();
                Async.eventually(function() {
                    this.asyncIterate(cb, ctx, time).forwardCallback(promise);
                }, this, time);
                return promise;
            }

        };
    });
});
Scoped.define("module:Loggers.CallOriginLogAugment", [
    "module:Loggers.AbstractLogAugment",
    "module:Functions"
], function(AbstractLogAugment, Functions, scoped) {
    return AbstractLogAugment.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Call Origin Log Augment Class
         * 
         * @class BetaJS.Loggers.CallOriginLogAugment
         */
        return {

            /**
             * @override
             */
            augmentMessage: function(source, msg, depth) {
                var stack = Functions.getStackTrace(depth * 3 + 6);
                return stack[0].trim();
            }

        };
    });
});
Scoped.define("module:Loggers.ConsoleLogListener", [
    "module:Loggers.LogListener"
], function(LogListener, scoped) {
    return LogListener.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Console Log Listener Class
         * 
         * @class BetaJS.Loggers.ConsoleLogListener
         */
        return {

            /**
             * Creates a new instance.
             *
             * @param {object} options options argument
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                this._options = options || {};
            },

            /**
             * @override
             */
            message: function(source, msg) {
                var args = msg.args.concat(msg.augments);
                if (this._options.single)
                    args = [args.join(" | ")];
                console[msg.type].apply(console, args);
            }

        };
    });
});
Scoped.define("module:Loggers.AbstractLogAugment", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract Log Augment Class, augmenting logs
         * 
         * @class BetaJS.Loggers.AbstractLogAugment
         */
        return {

            /**
             * Called when a log message is created.
             * 
             * @param {object} source logger source
             * @param {object} msg message object
             * @param {int} depth call depth (internal use)
             * @return augmentation
             */
            augmentMessage: function(source, msg, depth) {}

        };
    });
});
Scoped.define("module:Loggers.LogListenerFilter", [
    "module:Loggers.LogListener",
    "module:Objs",
    "module:Types"
], function(LogListener, Objs, Types, scoped) {
    return LogListener.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Log Listener Filter Class
         * 
         * @class BetaJS.Loggers.LogListenerFilter
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} target target log listener that should be filtered for
             * @param {array} tags tags that should be filtered by
             */
            constructor: function(target, tags) {
                inherited.constructor.call(this);
                this.__target = target;
                this.__tags = tags;
            },

            /**
             * @override
             */
            message: function(source, msg) {
                var tags = Objs.objectify(msg.tags);
                var result = false;
                if (Types.is_array(this.__tags[0])) {
                    result = this.__tags.some(function(sub) {
                        return sub.every(function(tag) {
                            return tags[tag];
                        });
                    });
                } else {
                    result = this.__tags.every(function(tag) {
                        return tags[tag];
                    });
                }
                if (result)
                    this.__target.message(source, msg);
            }

        };
    });
});
Scoped.define("module:Loggers.LogListener", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract Log Listener Class, reacting to logging calls
         * 
         * @class BetaJS.Loggers.LogListener
         */
        return {

            /**
             * Called when a log message is created.
             * 
             * @param {object} source logger source
             * @param {object} msg message object
             */
            message: function(source, msg) {}

        };
    });
});
Scoped.define("module:Loggers.LoggableMixin", [
    "module:Loggers.Logger",
    "module:Objs",
    "module:Functions"
], function(Logger) {

    /**
     * LoggableMixin Mixin
     *
     * @mixin BetaJS.Loggers.LoggableMixin
     */
    return {

        /**
         * Returns the base logger.
         *
         * @returns {object} base logger
         */
        baseLogger: function() {
            if (!this._baseLogger)
                this._baseLogger = Logger.global();
            return this._baseLogger;
        },

        /**
         * Returns the logger.
         *
         * @returns {object} logger
         */
        logger: function() {
            if (!this._logger)
                this._logger = this.baseLogger().tag(this.cls.classname, this.cid());
            return this._logger;
        }

    };
});
Scoped.define("module:Loggers.Logger", [
    "module:Class",
    "module:Objs",
    "module:Functions"
], function(Class, Objs, Functions, scoped) {
    var Cls = Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Logger Class
         * 
         * @class BetaJS.Loggers.Logger
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} options options for the logger
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                options = options || {};
                this.__listeners = {};
                this.__augments = {};
                this.__tags = options.tags || [];
                Objs.iter(options.listeners, this.addListener, this);
            },

            /**
             * Adds a new augment to the logger.
             * 
             * @param {object} augment augment to be added
             * @param {string} prefix optional prefix
             */
            addAugment: function(augment, prefix) {
                this.__augments[augment.cid()] = {
                    augment: augment,
                    prefix: prefix
                };
                return this;
            },

            /**
             * Remove an existing augment from the logger.
             * 
             * @param {object} augment augment to be removed
             */
            removeAugment: function(augment) {
                delete this.__augments[augment.cid()];
                return this;
            },

            /**
             * Adds a new listener to the logger.
             * 
             * @param {object} listener listener to be added
             */
            addListener: function(listener) {
                this.__listeners[listener.cid()] = listener;
                return this;
            },

            /**
             * Remove an existing listener from the logger.
             * 
             * @param {object} listener listener to be removed
             */
            removeListener: function(listener) {
                delete this.__listeners[listener.cid()];
                return this;
            },

            /**
             * Create a new log message.
             */
            log: function() {
                return this.message(this, {
                    type: "log",
                    args: Functions.getArguments(arguments, 0)
                });
            },

            /**
             * Creates a log function calling the logger.
             */
            logf: function() {
                return Functions.as_method(this.log, this);
            },

            /**
             * Create a new warn message.
             */
            warn: function() {
                return this.message(this, {
                    type: "warn",
                    args: Functions.getArguments(arguments, 0)
                });
            },

            /**
             * Create a new error message.
             */
            error: function() {
                return this.message(this, {
                    type: "error",
                    args: Functions.getArguments(arguments, 0)
                });
            },

            /**
             * Create a new tagged log message.
             * 
             * @param {array} tags tags for the message
             */
            taggedlog: function(tags) {
                return this.message(this, {
                    type: "log",
                    tags: tags,
                    args: Functions.getArguments(arguments, 1)
                });
            },

            /**
             * Create a new tagged warn message.
             * 
             * @param {array} tags tags for the message
             */
            taggedwarn: function(tags) {
                return this.message(this, {
                    type: "warn",
                    tags: tags,
                    args: Functions.getArguments(arguments, 1)
                });
            },

            /**
             * Create a new tagged error message.
             * 
             * @param {array} tags tags for the message
             */
            taggederror: function(tags) {
                return this.message(this, {
                    type: "error",
                    tags: tags,
                    args: Functions.getArguments(arguments, 1)
                });
            },

            /**
             * Create a new log message.
             * 
             * @param {object} source logger source for message
             * @param {object} msg log message
             * @param {int} depth call depth (internal use)
             */
            message: function(source, msg, depth) {
                depth = depth || 0;
                msg.tags = this.__tags.concat(msg.tags || []);
                msg.augments = msg.augments || [];
                Objs.iter(this.__augments, function(augment) {
                    msg.augments.push((augment.prefix ? augment.prefix + ":" : "") + augment.augment.augmentMessage(source, msg, depth));
                }, this);
                Objs.iter(this.__listeners, function(listener) {
                    listener.message(this, msg, depth + 1);
                }, this);
                return this;
            },

            /**
             * Create a new sub logger by tags.
             *
             * @return {object} sub logger
             */
            tag: function() {
                return new Cls({
                    tags: Functions.getArguments(arguments),
                    listeners: [this]
                });
            }

        };
    }, {

        /**
         * Return global singleton logger instance.
         * 
         * @return {object} singleton logger
         */
        global: function() {
            if (!this.__global)
                this.__global = new Cls();
            return this.__global;
        }

    });

    return Cls;
});
Scoped.define("module:Loggers.StaticLogAugment", [
    "module:Loggers.AbstractLogAugment"
], function(AbstractLogAugment, scoped) {
    return AbstractLogAugment.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Static Log Augment Class
         * 
         * @class BetaJS.Loggers.StaticLogAugment
         */
        return {

            /**
             * Creates a new instance.
             *
             * @param value value
             */
            constructor: function(value) {
                inherited.constructor.call(this);
                this.__value = value;
            },

            /**
             * Returns current value.
             *
             * @return value
             */
            getValue: function() {
                return this.__value;
            },

            /**
             * Set current value.
             *
             * @param value current value
             */
            setValue: function(value) {
                this.__value = value;
                return this;
            },

            /**
             * @override
             */
            augmentMessage: function(source, msg, depth) {
                return this.__value;
            }

        };
    });
});
Scoped.define("module:Loggers.TagLogAugment", [
    "module:Loggers.AbstractLogAugment"
], function(AbstractLogAugment, scoped) {
    return AbstractLogAugment.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Tag Log Augment Class
         * 
         * @class BetaJS.Loggers.TagLogAugment
         */
        return {

            /**
             * @override
             */
            augmentMessage: function(source, msg, depth) {
                return msg.tags.join(",");
            }

        };
    });
});
Scoped.define("module:Loggers.TimeLogAugment", [
    "module:Loggers.AbstractLogAugment",
    "module:Time",
    "module:TimeFormat"
], function(AbstractLogAugment, Time, TimeFormat, scoped) {
    return AbstractLogAugment.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Time Log Augment Class
         * 
         * @class BetaJS.Loggers.TimeLogAugment
         */
        return {

            /**
             * Creates a new instance.
             *
             * @param {object} options options argument
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                this._options = options || {};
                this.__last = Time.now();
            },

            /**
             * @override
             */
            augmentMessage: function(source, msg, depth) {
                var now = Time.now();
                var delta = now - this.__last;
                this.__last = now;
                return (this._options.time_format ? TimeFormat.format(this._options.time_format, now) : now) + (this._options.delta ? " (+" + delta + "ms)" : "");
            }

        };
    });
});
Scoped.define("module:Net.SocketSenderChannel", [
    "module:Channels.Sender"
], function(Sender, scoped) {
    return Sender.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Socket Sender Channel Class
         * 
         * @class BetaJS.Net.SocketSenderChannel
         */
        return {

            /**
             * Instantiates Socket Sender Channel
             * 
             * @param {object} socket initial socket
             * @param {string} message message string to be used on the socket
             */
            constructor: function(socket, message) {
                inherited.constructor.call(this);
                this.__socket = socket;
                this.__message = message;
            },

            _send: function(message, data) {
                this.__socket.emit(this.__message, {
                    message: message,
                    data: data
                });
            },

            /**
             * Returns current socket or sets currents socket.
             * 
             * @param {object} socket new socket (optional)
             * 
             * @return {object} current socket
             */
            socket: function() {
                if (arguments.length > 0)
                    this.__socket = arguments[0];
                return this.__socket;
            }

        };
    });
});


Scoped.define("module:Net.SocketReceiverChannel", ["module:Channels.Receiver"], function(Receiver, scoped) {
    return Receiver.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Socket Receiver Channel Class
         * 
         * @class BetaJS.Net.SocketReceiverChannel
         */
        return {

            /**
             * Instantiates Socket Receiver Channel
             * 
             * @param {object} socket initial socket
             * @param {string} message message string to be used on the socket
             */
            constructor: function(socket, message) {
                inherited.constructor.call(this);
                this.__message = message;
                this.socket(socket);
            },

            /**
             * Returns current socket or sets currents socket.
             * 
             * @param {object} socket new socket (optional)
             * 
             * @return {object} current socket
             */
            socket: function() {
                if (arguments.length > 0) {
                    this.__socket = arguments[0];
                    if (this.__socket) {
                        var self = this;
                        this.__socket.on(this.__message, function(data) {
                            self._receive(data.message, data.data);
                        });
                    }
                }
                return this.__socket;
            }

        };
    });
});
Scoped.define("module:Net.Cookies", ["module:Objs", "module:Types"], function(Objs, Types) {
    return {

        getCookielikeValue: function(cookies, key) {
            cookies = cookies || "";
            return decodeURIComponent(cookies.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },

        /**
         *
         * @param {string} key
         * @param {string} value
         * @param {Date} end
         * @param {string} path
         * @param {string} domain
         * @param {boolean} secure
         * @param {string} sameSite
         * @return {null|*}
         */
        createCookielikeValue: function(key, value, end, path, domain, secure, sameSite) {
            if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key))
                return null;
            var components = [];
            components.push([encodeURIComponent(key), encodeURIComponent(value)]);
            if (end) {
                if (end === Infinity)
                    components.push(["expires", "Fri, 31 Dec 9999 23:59:59 GMT"]);
                else if (typeof end === "number")
                    components.push(["max-age", end]);
                else if (typeof end === "object")
                    components.push(["expires", end.toUTCString()]);
                else
                    components.push(["expires", end]);
            }
            if (domain)
                components.push(["domain", domain]);
            if (path)
                components.push(["path", path]);
            if (secure)
                components.push("secure");
            // Any cookie that requests SameSite=None but is not marked Secure will be rejected.
            sameSite = sameSite || 'None';
            components.push("SameSite", sameSite);
            return Objs.map(components, function(component) {
                return Types.is_array(component) ? component.join("=") : component;
            }).join("; ");
        },

        removeCookielikeValue: function(key, value, path, domain) {
            return this.createCookielikeValue(key, value, new Date(0), path, domain);
        },

        hasCookielikeValue: function(cookies, key) {
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(cookies);
        },

        keysCookielike: function(cookies) {
            var base = cookies.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            return Objs.map(base, decodeURIComponent);
        }

    };
});
Scoped.define("module:Net.HttpHeader", function() {
    /**
     * Http Header Codes and Functions
     * 
     * @module BetaJS.Net.HttpHeader
     */
    return {

        HTTP_STATUS_OK: 200,
        HTTP_STATUS_CREATED: 201,
        HTTP_STATUS_BAD_REQUEST: 400,
        HTTP_STATUS_UNAUTHORIZED: 401,
        HTTP_STATUS_PAYMENT_REQUIRED: 402,
        HTTP_STATUS_FORBIDDEN: 403,
        HTTP_STATUS_NOT_FOUND: 404,
        HTTP_STATUS_PRECONDITION_FAILED: 412,
        HTTP_STATUS_INTERNAL_SERVER_ERROR: 500,
        HTTP_STATUS_GATEWAY_TIMEOUT: 504,

        STRINGS: {
            0: "Unknown Error",
            200: "OK",
            201: "Created",
            400: "Bad Request",
            401: "Unauthorized",
            402: "Payment Required",
            403: "Forbidden",
            404: "Not found",
            412: "Precondition Failed",
            500: "Internal Server Error",
            504: "Gateway timeout"
        },


        /**
         * Formats a HTTP status code to a string.
         * 
         * @param {integer} code the http status code
         * @param {boolean} prepend_code should the integer status code be prepended (default false)
         * 
         * @return HTTP status code as a string.
         */
        format: function(code, prepend_code) {
            var ret = this.STRINGS[code in this.STRINGS ? code : 0];
            return prepend_code ? (code + " " + ret) : ret;
        },

        /**
         * Returns true if a status code is in the 200 region.
         * 
         * @param {int} code status code
         * 
         * @return {boolean} true if code in the 200 region
         */
        isSuccessStatus: function(code) {
            return code >= this.HTTP_STATUS_OK && code < 300;
        }

    };
});
Scoped.define("module:Net.Uri", [
    "module:Objs",
    "module:Types",
    "module:Strings",
    "module:Sort"
], function(Objs, Types, Strings, Sort) {

    var parse_strict_regex = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
    var parse_loose_regex = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
    var parse_key = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
    var parse_key_parser = /(?:^|&)([^&=]*)=?([^&]*)/g;


    /**
     * Uri Auxilary Functions
     * 
     * @module BetaJS.Net.Uri
     */
    return {

        /**
         * Create a URI string from a set of parameters.
         * 
         * @param {object} obj parameters
         * 
         * @return {string} uri
         */
        build: function(obj) {
            var s = "";
            if (obj.protocol)
                s += obj.protocol + "://";
            if (obj.username)
                s += obj.username + ":";
            if (obj.password)
                s += obj.password + "@";
            s += obj.server;
            if (obj.port)
                s += ":" + obj.port;
            if (obj.path)
                s += "/" + obj.path;
            return s;
        },


        /**
         * Encode a set of uri query parameters.
         * 
         * @param {object} arr a key-value set of query parameters
         * @param {string} prefix an optional prefix to be used for generating the keys
         * @param {boolean} flatten flatten the components first
         * 
         * @return {string} encoded query parameters
         */
        encodeUriParams: function(arr, prefix, flatten) {
            prefix = prefix || "";
            var res = [];
            if (flatten) {
                Objs.iter(Objs.serializeFlatJSON(arr), function(kv) {
                    res.push(prefix + kv.key + "=" + encodeURIComponent(kv.value));
                }, this);
            } else {
                Objs.iter(arr, function(value, key) {
                    if (Types.is_object(value))
                        res = res.concat(this.encodeUriParams(value, prefix + key + "_"));
                    else
                        res.push(prefix + key + "=" + encodeURIComponent(value));
                }, this);
            }
            return res.join("&");
        },


        /**
         * Decode a uri query parameter string
         * 
         * @param {string} res encoded query parameters
         * 
         * @return {object} key-value set of query parameters
         */
        decodeUriParams: function(res) {
            var arr = {};
            res.split("&").forEach(function(kv) {
                var kvsplit = Strings.splitFirst(kv, "=");
                arr[kvsplit.head] = decodeURIComponent(kvsplit.tail);
            });
            return arr;
        },


        /**
         * Append a set of uri query parameters to a URI.
         * 
         * @param {string} uri a uri
         * @param {object} arr a key-value set of query parameters
         * @param {string} prefix an optional prefix to be used for generating the keys
         * 
         * @return {string} uri with the encoded query parameters attached
         */
        appendUriParams: function(uri, arr, prefix) {
            return Types.is_empty(arr) ? uri : (uri + (uri.indexOf("?") != -1 ? "&" : "?") + this.encodeUriParams(arr, prefix));
        },


        /**
         * Parses a given uri into decomposes it into its components.
         * 
         * @thanks parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com>, MIT License
         * 
         * @param {string} str uri to be parsed
         * @param {boolean} strict use strict parsing (default false)
         * 
         * @return {object} decomposed uri
         */
        parse: function(str, strict) {
            var parser = strict ? parse_strict_regex : parse_loose_regex;
            var m = parser.exec(str);
            var uri = {};
            for (var i = 0; i < parse_key.length; ++i)
                uri[parse_key[i]] = m[i] || "";
            uri.queryKey = {};
            uri[parse_key[12]].replace(parse_key_parser, function($0, $1, $2) {
                if ($1) uri.queryKey[$1] = $2;
            });
            return uri;
        },

        /**
         * Determines whether a target URI is considered cross-domain with respect to a source URI.
         * 
         * @param {string} source source URI
         * @param {string} target target URI
         * 
         * @return {boolean} true if target is cross-domain w.r.t. source
         */
        isCrossDomainUri: function(source, target) {
            // If target has no protocol delimiter, there is no domain given, hence source domain is used
            if (target.indexOf("//") < 0)
                return false;
            // If source has no protocol delimiter but target has, it is cross-domain.
            if (source.indexOf("//") < 0)
                return true;
            source = this.parse(source.toLowerCase());
            target = this.parse(target.toLowerCase());
            // Terminate if one of protocols is the file protocol.
            if (source.protocol === "file" || target.protocol === "file")
                return source.protocol === target.protocol;
            return source.host !== target.host || source.port !== target.port;
        },

        /**
         * Normalizes the query of a uri by sorting keys alphabetically.
         *
         * @param {string} uri source URI
         *
         * @return {string} normalized uri
         */
        normalizeUri: function(uri) {
            var q = uri.indexOf("?");
            return q >= 0 ? uri.substring(0, q) + "?" + this.encodeUriParams(Sort.sort_object(this.decodeUriParams(uri.substring(q + 1)), function(x, y) {
                return x.localeCompare(y);
            })) : uri;
        }

    };
});
Scoped.define("module:RMI.Client", [
    "module:Class",
    "module:Objs",
    "module:Channels.TransportChannel",
    "module:Ids",
    "module:RMI.Skeleton",
    "module:Types",
    "module:RMI.Stub"
], function(Class, Objs, TransportChannel, Ids, Skeleton, Types, Stub, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * RMI Client Class
         * 
         * @class BetaJS.RMI.Client
         */
        return {

            /**
             * Creates a new instance of an RMI client.
             * 
             * @param {object} sender_or_channel_or_null a channel or sender that should be connected to
             * @param {object} receiver_or_null a receiver that should be connected to
             */
            constructor: function(sender_or_channel_or_null, receiver_or_null) {
                inherited.constructor.call(this);
                this.__channel = null;
                this.__instances = {};
                if (sender_or_channel_or_null) {
                    var channel = sender_or_channel_or_null;
                    if (receiver_or_null)
                        channel = this._auto_destroy(new TransportChannel(sender_or_channel_or_null, receiver_or_null));
                    this.__channel = channel;
                }
            },

            /**
             * @override
             */
            destroy: function() {
                if (this.__channel)
                    this.disconnect();
                inherited.destroy.call(this);
            },

            /**
             * Connect to a channel.
             * 
             * @param {object} channel channel to be connected to
             */
            connect: function(channel) {
                if (this.__channel)
                    return;
                this.__channel = channel;
                return this;
            },

            /**
             * Connect to a channel using sender and receiver.
             * 
             * @param {object} sender sender channel to be connected to
             * @param {object} receiver receiver channel to be connected to
             * @param {object} options options for transport channel
             */
            connectTransport: function(sender, receiver, options) {
                return this.connect(this.auto_destroy(new TransportChannel(sender, receiver, options)));
            },

            /**
             * Disconnect from channel.
             * 
             */
            disconnect: function() {
                if (!this.__channel)
                    return;
                this.__channel = null;
                Objs.iter(this.__instances, function(inst) {
                    this.release(inst);
                }, this);
                return this;
            },

            /**
             * Serialize a value.
             * 
             * @param value value to be serialized.
             * 
             * @return Serialized value
             */
            _serializeValue: function(value) {
                if (Skeleton.is_instance_of(value)) {
                    var registry = this.server;
                    registry.registerInstance(value);
                    return {
                        __rmi_meta: true,
                        __rmi_stub: value.stub(),
                        __rmi_stub_id: Ids.objectId(value)
                    };
                } else
                    return value;
            },

            /**
             * Unserialize a value.
             * 
             * @param value value to be unserialized.
             * 
             * @return unserialized value
             */
            _unserializeValue: function(value) {
                if (value && value.__rmi_meta) {
                    var receiver = this;
                    return receiver.acquire(value.__rmi_stub, value.__rmi_stub_id);
                } else
                    return value;
            },

            /**
             * Acquires an object instance.
             * 
             * @param {string} class_type class type of object instance
             * @param {string} instance_name registered name of instance
             * 
             * @return {object} object instance
             */
            acquire: function(class_type, instance_name) {
                if (this.__instances[instance_name])
                    return this.__instances[instance_name];
                if (Types.is_string(class_type))
                    class_type = Scoped.getGlobal(class_type);
                if (!class_type || !class_type.ancestor_of(Stub))
                    return null;
                var instance = new class_type();
                this.__instances[Ids.objectId(instance, instance_name)] = instance;
                var self = this;
                instance.__send = function(message, data, serializes) {
                    if (!self.__channel)
                        return;
                    data = Objs.map(data, self._serializeValue, self);
                    return self.__channel.send(instance_name + ":" + message, data, {
                        serializerInfo: serializes
                    }).mapSuccess(function(result) {
                        return this._unserializeValue(result);
                    }, self);
                };
                return instance;
            },

            /**
             * Releases an acquired instance.
             * 
             * @param {object} instance instance to be released
             * 
             */
            release: function(instance) {
                var instance_name = Ids.objectId(instance);
                if (this.__instances[instance_name]) {
                    instance.weakDestroy();
                    delete this.__instances[instance_name];
                }
                return this;
            }

        };
    });
});
Scoped.define("module:RMI.Peer", [
    "module:Class",
    "module:Channels.SenderMultiplexer",
    "module:Channels.ReceiverMultiplexer",
    "module:RMI.Client",
    "module:RMI.Server"
], function(Class, SenderMultiplexer, ReceiverMultiplexer, Client, Server, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * RMI Peer Class, combining Sender and Receiver into bidirectional Client and Server
         * 
         * @class BetaJS.RMI.Peer
         */
        return {

            /**
             * Instantiates Peer Class
             * 
             * @param {object} sender Sender Channel
             * @param {object} receiver Receiver Channel
             */
            constructor: function(sender, receiver) {
                inherited.constructor.call(this);
                this.__sender = sender;
                this.__receiver = receiver;
                this.__client_sender = this._auto_destroy(new SenderMultiplexer(sender, "client"));
                this.__server_sender = this._auto_destroy(new SenderMultiplexer(sender, "server"));
                this.__client_receiver = this._auto_destroy(new ReceiverMultiplexer(receiver, "server"));
                this.__server_receiver = this._auto_destroy(new ReceiverMultiplexer(receiver, "client"));
                this.client = this._auto_destroy(new Client(this.__client_sender, this.__client_receiver));
                this.server = this._auto_destroy(new Server(this.__server_sender, this.__server_receiver));
                this.client.server = this.server;
                this.server.client = this.client;
            },

            /**
             * Acquires an instance.
             * 
             * @param {string} class_type Type of Class
             * @param {string} instance_name Name of Instance
             * 
             * @return {object} acquired instance
             */
            acquire: function(class_type, instance_name) {
                return this.client.acquire(class_type, instance_name);
            },

            /**
             * Releases an instance.
             * 
             * @param {object} instance Previously acquired instance
             */
            release: function(instance) {
                this.client.release(instance);
            },

            /**
             * Register an instance.
             * 
             * @param {object} instance Object instance
             * @param {object} options Registration options
             * 
             * @return {object} Registered instance
             */
            registerInstance: function(instance, options) {
                return this.server.registerInstance(instance, options);
            },

            /**
             * Unregister an instance.
             * 
             * @param {object} instance Previously registered instance
             */
            unregisterInstance: function(instance) {
                this.server.unregisterInstance(instance);
            }

        };
    });
});
Scoped.define("module:RMI.Server", [
    "module:Class",
    "module:Events.EventsMixin",
    "module:Objs",
    "module:Channels.TransportChannel",
    "module:Lists.ObjectIdList",
    "module:Ids",
    "module:RMI.Skeleton",
    "module:Promise"
], function(Class, EventsMixin, Objs, TransportChannel, ObjectIdList, Ids, Skeleton, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

        /**
         * @class BetaJS.RMI.Server
         */
        return {

            /**
             * Creates an RMI Server instance
             * 
             * @param {object} sender_or_channel_or_null a channel or sender that should be connected to
             * @param {object} receiver_or_null a receiver that should be connected to
             */
            constructor: function(sender_or_channel_or_null, receiver_or_null) {
                inherited.constructor.call(this);
                this.__channels = new ObjectIdList();
                this.__instances = {};
                if (sender_or_channel_or_null) {
                    var channel = sender_or_channel_or_null;
                    if (receiver_or_null)
                        channel = this._auto_destroy(new TransportChannel(sender_or_channel_or_null, receiver_or_null));
                    this.registerClient(channel);
                }
            },

            /**
             * @override
             */
            destroy: function() {
                this.__channels.iterate(this.unregisterClient, this);
                Objs.iter(this.__instances, function(inst) {
                    this.unregisterInstance(inst.instance);
                }, this);
                this.__channels.destroy();
                inherited.destroy.call(this);
            },

            /**
             * Registers an RMI skeleton instance.
             * 
             * @param {object} instance skeleton instance
             * @param {object} options Options like name of instance
             * 
             * @return {object} Instance
             */
            registerInstance: function(instance, options) {
                options = options || {};
                this.__instances[Ids.objectId(instance, options.name)] = {
                    instance: instance,
                    options: options
                };
                if (options.auto_destroy)
                    this.auto_destroy(instance);
                return instance;
            },

            /**
             * Unregisters a RMI skeleton instance
             * 
             * @param {object} instance skeleton instance
             */
            unregisterInstance: function(instance) {
                delete this.__instances[Ids.objectId(instance)];
                instance.weakDestroy();
                return this;
            },

            /**
             * Register a client channel
             * 
             * @param {object} channel Client channel
             * @param {object} options Options
             */
            registerClient: function(channel, options) {
                options = options || {};
                var self = this;
                this.__channels.add(channel);
                channel._reply = function(message, data) {
                    var components = message.split(":");
                    if (components.length == 2)
                        return self._invoke(channel, components[0], components[1], data);
                    else
                        return Promise.error(true);
                };
                if (options.auto_destroy)
                    this.auto_destroy(channel);
                return this;
            },

            /**
             * Register a client by sender and receiver channel
             * 
             * @param {object} sender Sender channel
             * @param {object} receiver Receiver channel
             * @param {object} options Options
             */
            registerTransportClient: function(sender, receiver, options) {
                return this.registerClient(this.auto_destroy(new TransportChannel(sender, receiver, options)));
            },

            /**
             * Unregister a client channel
             * 
             * @param {object} channel Client channel
             */
            unregisterClient: function(channel) {
                this.__channels.remove(channel);
                channel._reply = null;
                return this;
            },

            /**
             * Serialize a value.
             * 
             * @param value value to be serialized.
             * 
             * @return Serialized value
             */
            _serializeValue: function(value) {
                if (Skeleton.is_instance_of(value)) {
                    var registry = this;
                    registry.registerInstance(value);
                    return {
                        __rmi_meta: true,
                        __rmi_stub: value.stub(),
                        __rmi_stub_id: Ids.objectId(value)
                    };
                } else
                    return value;
            },

            /**
             * Unserialize a value.
             * 
             * @param value value to be unserialized.
             * 
             * @return unserialized value
             */
            _unserializeValue: function(value) {
                if (value && value.__rmi_meta) {
                    var receiver = this.client;
                    return receiver.acquire(value.__rmi_stub, value.__rmi_stub_id);
                } else
                    return value;
            },

            /**
             * Invokes an instance method on a channel.
             * 
             * @param {object} channel Channel to be used for invokation
             * @param {string} instance_id Id of instance to be used as context
             * @param {string} method Method to be called
             * @param data Data to be passed to method
             * 
             * @return Return value of method as promise. 
             * 
             * @fires BetaJS.RMI.Server#loadInstance
             */
            _invoke: function(channel, instance_id, method, data) {
                var instance = this.__instances[instance_id];
                if (!instance) {
                    /**
                     * @event BetaJS.RMI.Server#loadInstance
                     */
                    this.trigger("loadInstance", channel, instance_id);
                    instance = this.__instances[instance_id];
                }
                if (!instance)
                    return Promise.error(instance_id);
                instance = instance.instance;
                data = Objs.map(data, this._unserializeValue, this);
                return instance.invoke(method, data, channel).mapSuccess(function(result) {
                    return this._serializeValue(result);
                }, this);
            }

        };
    }]);
});
Scoped.define("module:RMI.Skeleton", [
    "module:Class",
    "module:Objs",
    "module:Promise"
], function(Class, Objs, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Rmi Skeleton Class containing the server-side implementation.
         * 
         * @class BetaJS.RMI.Skeleton
         */
        return {

            /**
             * @member {array} intf List of exported functions
             */
            intf: [],

            _stub: null,
            _intf: {},
            __superIntf: ["_destroy"],

            /**
             * Instantiates a skeleton instance.
             * 
             * @param {object} options Options, currently supported destroyable.
             */
            constructor: function(options) {
                this._options = Objs.extend({
                    destroyable: false
                }, options);
                inherited.constructor.call(this);
                this.intf = this.intf.concat(this.__superIntf);
                for (var i = 0; i < this.intf.length; ++i)
                    this._intf[this.intf[i]] = true;
            },

            /**
             * (Remotely) destroy the skeleton if supported.
             * 
             * @protected
             */
            _destroy: function() {
                if (this._options.destroyable)
                    this.destroy();
            },

            /**
             * Invoke an exported function.
             * 
             * @param {string} message name of exported function
             * @param {array} data custom data array
             * 
             * @return {object} execution promise
             */
            invoke: function(message, data) {
                if (!(this._intf[message]))
                    return Promise.error(message);
                try {
                    var result = this[message].apply(this, data);
                    return Promise.is(result) ? result : Promise.value(result);
                } catch (e) {
                    return Promise.error(e);
                }
            },

            /**
             * Returns a success promise for an exported call.
             * 
             * @param result Success value
             * 
             * @return {object} success promise
             * 
             * @protected
             */
            _success: function(result) {
                return Promise.value(result);
            },

            /**
             * Returns an error promise for an exported call.
             * 
             * @param result Error value
             * 
             * @return {object} error promise
             * 
             * @protected
             */
            _error: function(result) {
                return Promise.error(result);
            },

            /**
             * Returns the name of the corresponding Stub.
             * 
             * @return {string} corresponding Stub name
             */
            stub: function() {
                if (this._stub)
                    return this._stub;
                var stub = this.cls.classname;
                return stub.indexOf("Skeleton") >= 0 ? stub.replace("Skeleton", "Stub") : stub;
            }

        };
    });
});
Scoped.define("module:RMI.Stub", [
    "module:Class",
    "module:Classes.InvokerMixin",
    "module:Functions"
], function(Class, InvokerMixin, Functions, scoped) {
    return Class.extend({
        scoped: scoped
    }, [InvokerMixin, function(inherited) {

        /**
         * Abstract Stub Class
         * 
         * @class BetaJS.RMI.Stub
         */
        return {

            /**
             * 
             * @member {array} intf abstract interface list, needs to be overwritten in subclasses
             */
            intf: [],

            /**
             * 
             * @member {object} serializes list of serialization information
             */
            serializes: {},

            /**
             * Instantiates the stub.
             * 
             */
            constructor: function() {
                inherited.constructor.call(this);
                this.invoke_delegate("invoke", this.intf);
            },

            /**
             * @override
             */
            destroy: function() {
                this.invoke("_destroy");
                inherited.destroy.call(this);
            },

            /**
             * @override
             */
            invoke: function(message) {
                return this.__send(message, Functions.getArguments(arguments, 1), this.serializes[message]);
            }

        };
    }]);
});


Scoped.define("module:RMI.StubSyncer", [
    "module:Class",
    "module:Classes.InvokerMixin",
    "module:Functions",
    "module:Promise"
], function(Class, InvokerMixin, Functions, Promise, scoped) {
    return Class.extend({
        scoped: scoped
    }, [InvokerMixin, function(inherited) {

        /**
         * Stub Syncer class for executing RMI methods one after the other.
         * 
         * @class BetaJS.RMI.StubSyncer
         */
        return {

            /**
             * Instantiates the stub syncer.
             * 
             * @param {object} stub stub object
             */
            constructor: function(stub) {
                inherited.constructor.call(this);
                this.__stub = stub;
                this.__current = null;
                this.__queue = [];
                this.invoke_delegate("invoke", this.__stub.intf);
            },

            /**
             * @override
             */
            invoke: function() {
                var object = {
                    args: Functions.getArguments(arguments),
                    promise: Promise.create()
                };
                this.__queue.push(object);
                if (!this.__current)
                    this.__next();
                return object.promise;
            },

            /**
             * @private
             */
            __next: function() {
                if (this.__queue.length === 0)
                    return;
                this.__current = this.__queue.shift();
                this.__stub.invoke.apply(this.__stub, this.__current.args).forwardCallback(this.__current.promise).callback(this.__next, this);
            }

        };
    }]);
});
Scoped.define("module:Scheduling.GarbageCollector", [
    "module:Class",
    "module:Scheduling.SchedulableMixin"
], function(Class, SchedulableMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [SchedulableMixin, function(inherited) {
        /**
         * Garbage Collector
         * 
         * @class BetaJS.Scheduling.GarbageCollector
         */
        return {

            /**
             * Instantiate garbage collector.
             * 
             */
            constructor: function() {
                inherited.constructor.call(this);
                this.__classes = {};
            },

            /**
             * Add an object to the garbage collection queue.
             * 
             * @param {object} obj object to be destroyed
             */
            queue: function(obj) {
                if (!obj || obj.destroyed() || this.__classes[obj.cid()])
                    return this;
                var cid = obj.cid();
                this.__classes[cid] = true;
                this.schedulable(function() {
                    delete this.__classes[cid];
                    if (!obj.destroyed())
                        obj.destroy();
                    delete obj.__gc;
                });
                return this;
            }

        };
    }]);
});
Scoped.define("module:Scheduling.SchedulableMixin", [], function() {
    return {

        schedulable: function(callback, initialSteps) {
            if (this.scheduler)
                this.scheduler.schedulable(this, callback, initialSteps);
            else
                callback.call(this, Infinity);
        }

    };
});


Scoped.define("module:Scheduling.Helper", [], function() {
    return {

        schedulable: function(callback, initialSteps, scheduler, context) {
            if (scheduler)
                scheduler.schedulable(context || this, callback, initialSteps);
            else
                callback.call(context || this, Infinity);
        }

    };
});


Scoped.define("module:Scheduling.AbstractScheduler", [
    "module:Class"
], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            _schedulable: function(context, callback, initialSteps) {},

            _register: function(context, options) {},

            _unregister: function(context, options) {},

            schedulable: function(context, callback, initialSteps) {
                this._schedulable(context, callback, initialSteps || 1);
            },

            register: function(context, options) {
                context.scheduler = this;
                this._register(context, options);
            },

            unregister: function(context, options) {
                if (context.scheduler === this)
                    context.scheduler = null;
                this._unregister(context, options);
            }

        };
    });
});
Scoped.define("module:Scheduling.DefaultScheduler", [
    "module:Scheduling.AbstractScheduler",
    "module:Time",
    "module:Objs",
    "module:Timers.Timer"
], function(AbstractScheduler, Time, Objs, Timer, scoped) {
    return AbstractScheduler.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(options) {
                inherited.constructor.call(this);
                this._current = null;
                this._last = null;
                this._first = null;
                this._map = {};
                this._resources = 0;
                this._options = Objs.extend({
                    penaltyFactor: 0.5,
                    rewardFactor: 0.5,
                    defaultResources: 10,
                    defaultLimit: 10,
                    autoTimer: null
                }, options);
                if (this._options.autoTimer) {
                    this.auto_destroy(new Timer({
                        start: true,
                        delay: this._options.autoTimer,
                        context: this,
                        fire: this.run
                    }));
                }
            },

            _register: function(context, options) {
                var id = context.cid();
                if (!this._map[id]) {
                    options = options || {};
                    var entry = {
                        context: context,
                        resources: options.resources || this._options.defaultResources,
                        scheduled: [],
                        allocatedTime: 0,
                        usedTime: 0,
                        prev: this._last,
                        next: null
                    };
                    this._map[id] = entry;
                    this._last = entry;
                    if (!this._first)
                        this._first = entry;
                }
            },

            _unregister: function(ctx) {
                var id = context.cid();
                if (this._map[id]) {
                    var entry = this._map[id];
                    if (this._current === entry)
                        this._current = entry.next;
                    if (entry.prev)
                        entry.prev.next = entry.next;
                    else
                        this._first = entry.next;
                    if (entry.next)
                        entry.next.prev = entry.prev;
                    else
                        this._last = entry.prev;
                    if (entry.scheduled)
                        this._resources -= entry.resources;
                    delete this._map[id];
                }
            },

            _schedulable: function(context, callback, initialSteps) {
                var id = context.cid();
                var obj = this._map[id];
                if (obj) {
                    obj.scheduled.push({
                        callback: callback,
                        initialSteps: initialSteps,
                        totalTime: 0,
                        totalSteps: 0
                    });
                    if (obj.scheduled.length === 1)
                        this._resources += obj.resources;
                }
            },

            run: function(limit) {
                limit = limit || this._options.defaultLimit;
                var endTime = Time.perfNow() + limit;
                while (this._resources > 0 && this._first) {
                    var nowTime = Time.perfNow();
                    var timeLeft = endTime - nowTime;
                    if (timeLeft <= 0)
                        break;
                    var current = this._current || this._first;
                    if (current.scheduled.length > 0) {
                        var resources = current.resources;
                        if (current.allocatedTime > current.usedTime)
                            resources += current.usedTime / current.allocatedTime * this._options.rewardFactor;
                        if (current.allocatedTime < current.usedTime)
                            resources -= current.allocatedTime / current.usedTime * this._options.penaltyFactor;
                        var currentEndTime = Math.min(nowTime + limit * resources / this._resources, endTime);
                        do {
                            var deltaTime = currentEndTime - nowTime;
                            var head = current.scheduled.shift();
                            var steps = Math.max(1, head.totalSteps > 0 ? head.totalSteps / (head.totalTime || 1) * deltaTime : head.initialSteps);
                            var result = head.callback.call(current.context, steps);
                            if (result === false)
                                current.scheduled.unshift(head);
                            else if (current.scheduled.length === 0)
                                this._resources -= current.resources;
                            var nextTime = Time.perfNow();
                            current.allocatedTime += deltaTime;
                            current.usedTime += nextTime - nowTime;
                            nowTime = nextTime;
                        } while (nowTime < currentEndTime && current.scheduled.length > 0);
                    }
                    this._current = current.next;
                }
            }

        };
    });
});
Scoped.define("module:States.CompetingComposite", [
    "module:Class",
    "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Competing Composite Class
         * 
         * @class BetaJS.States.CompetingComposite
         */
        return {

            /**
             * Register a competing host
             * 
             * @param {object} competing_host Competing host
             */
            _register_host: function(competing_host) {
                this._hosts = this._hosts || [];
                this._hosts.push(this._auto_destroy(competing_host));
            },

            /**
             * Returns all other hosts of a competing host
             * 
             * @param {object} competing_host competing hosts in question
             * @return {array} other hosts
             */
            other_hosts: function(competing_host) {
                return Objs.filter(this._hosts || [], function(other) {
                    return other != competing_host;
                }, this);
            },

            /**
             * Transcend to another state of a competing host
             * 
             * @param {object} competing_host Competing host
             * @param {object} state State
             */
            _next: function(competing_host, state) {
                var others = this.other_hosts(competing_host);
                for (var i = 0; i < others.length; ++i) {
                    var other = others[i];
                    var other_state = other.state();
                    if (!other_state.can_coexist_with(state))
                        other_state.retreat_against(state);
                }
            }

        };
    });
});


Scoped.define("module:States.CompetingHost", ["module:States.Host"], function(Host, scoped) {
    return Host.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * CompetingHost Class
         * 
         * @class BetaJS.States.CompetingHost
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} composite Associated composite object
             * @param {object} options Host options
             */
            constructor: function(composite, options) {
                inherited.constructor.call(this, options);
                this._composite = composite;
                if (composite)
                    composite._register_host(this);
            },

            /**
             * Returns the associated composite.
             * 
             * @return {object} Composite
             */
            composite: function() {
                return this._composite;
            },

            /**
             * @override
             */
            _can_transition_to: function(state) {
                if (!inherited._can_transition_to.call(this, state))
                    return false;
                if (!this._composite)
                    return true;
                var others = this._composite.other_hosts(this);
                for (var i = 0; i < others.length; ++i) {
                    var other = others[i];
                    var other_state = other.state();
                    if (!state.can_coexist_with(other_state) && !state.can_prevail_against(other_state))
                        return false;
                }
                return true;
            },

            /**
             * @override
             */
            _next: function(state) {
                if (this._composite)
                    this._composite._next(this, state);
                inherited._next.call(this, state);
            }

        };
    });
});


Scoped.define("module:States.CompetingState", ["module:States.State"], function(State, scoped) {
    return State.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ComponentState Class
         * 
         * @class BetaJS.States.CompetingState
         */
        return {

            /**
             * Determines whether this state can coexist with a foreign state
             * 
             * @param {object} foreign_state Foreign state
             * @return {boolean} true if it can coexist
             */
            can_coexist_with: function(foreign_state) {
                return true;
            },

            /**
             * Determines whether this state can prevail against a foreign state
             * 
             * @param {object} foreign_state Foreign state
             * @return {boolean} true if it can prevail
             */
            can_prevail_against: function(foreign_state) {
                return false;
            },

            /**
             * Retreat against foreign state
             * 
             * @param {object} foreign_state Foreign state
             */
            retreat_against: function(foreign_state) {}

        };
    });
});
Scoped.define("module:Router.RouteParser", [
    "module:Class", "module:Strings", "module:Objs"
], function(Class, Strings, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Route Parser Class
         * 
         * @class BetaJS.Router.RouteParser
         */
        return {

            /**
             * Create a new instance.
             * 
             * @param {object} routes routes mapping
             */
            constructor: function(routes) {
                inherited.constructor.call(this);
                this.routes = {};
                Objs.iter(routes, function(route, key) {
                    this.bind(key, route);
                }, this);
            },

            /**
             * Return parses a route and returns the parsed result.
             * 
             * @param {string} route route to be parsed
             * @return {object} parsed route
             */
            parse: function(route) {
                for (var key in this.routes) {
                    var entry = this.routes[key];
                    var result = entry.captureRegex.exec(route);
                    if (result) {
                        return {
                            name: entry.name,
                            args: result
                        };
                    }
                }
                return null;
            },

            /**
             * Recreates a full route from an abstract route descriptor and route arguments.
             * 
             * @param {string} name route descriptor
             * @param {array} args arguments for route
             * 
             * @return {string} full route
             * 
             */
            format: function(name, args) {
                args = args || {};
                var entry = this.routes[name];
                return Strings.regexReplaceGroups(entry.regex,
                    entry.captureRegex.mapBack(args));
            },

            /**
             * Bind a new route.
             * 
             * @param {string} key route descriptor
             * @param {string} route route regex string
             */
            bind: function(key, route) {
                this.routes[key] = {
                    name: key,
                    regex: route,
                    captureRegex: Strings.namedCaptureRegex("^" + route + "$")
                };
                return this;
            }

        };
    });
});

Scoped.define("module:Router.RouteMap", [
    "module:Class", "module:Strings", "module:Objs"
], function(Class, Strings, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * RouteMap Class, mapping routes to routes.
         * 
         * @class BetaJS.Router.RouteMap
         */
        return {

            /**
             * Creates new instance.
             * 
             * @param {object} options initialization options
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                options = options || {};
                this._defaultMap = options.map;
                this._context = options.context || this;
                this._bindings = options.bindings || {};
            },

            /**
             * Maps a route.
             * 
             * @param {string} name route name
             * @param {array} args route arguments
             * 
             * @return {object} mapped route
             */
            map: function(name, args) {
                var binding = this._bindings[name];
                if (binding)
                    return binding.call(this._context, name, args);
                if (this._defaultMap)
                    return this._defaultMap.call(this._context, name, args);
                return {
                    name: name,
                    args: args
                };
            },

            /**
             * Binds a route.
             * 
             * @param {string} name name of route
             * @param {function} func function to bind the route to
             */
            bind: function(name, func) {
                this._bindings[name] = func;
                return this;
            }

        };
    });
});

Scoped.define("module:Router.Router", [
    "module:Class",
    "module:Events.EventsMixin",
    "module:Objs",
    "module:Router.RouteParser",
    "module:Comparators"
], function(Class, EventsMixin, Objs, RouteParser, Comparators, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

        /**
         * Router Class
         * 
         * @class BetaJS.Router.Router
         */
        return {

            /**
             * Creates new instance.
             * 
             * @param {object} routes routes mapping for route parser
             */
            constructor: function(routes) {
                inherited.constructor.call(this);
                this._routeParser = new RouteParser(routes);
                this._current = null;
            },

            /**
             * @override
             */
            destroy: function() {
                this._routeParser.destroy();
                inherited.destroy.call(this);
            },

            /**
             * Bind a new route.
             * 
             * @param {string} key route descriptor
             * @param {string} route route regex string
             * @param {function} func optional function to be called when route is dispatched
             * @param {object} ctx optional function context
             */
            bind: function(key, route, func, ctx) {
                this._routeParser.bind(key, route);
                if (func)
                    this.on("dispatch:" + key, func, ctx);
                return this;
            },

            /**
             * Returns the current route.
             * 
             * @return {string} current route
             */
            current: function() {
                return this._current;
            },

            /**
             * Navigates to a new route.
             * 
             * @param {string} route route to navigate to
             * @fires BetaJS.Router.Router#navigate
             * @fires BetaJS.Router.Router#notfound
             */
            navigate: function(route) {
                /**
                 * @event BetaJS.Router.Router#navigate
                 */
                this.trigger("navigate", route);
                this.trigger("navigate:" + route);
                var parsed = this._routeParser.parse(route);
                if (parsed)
                    this.dispatch(parsed.name, parsed.args, route);
                else {
                    /**
                     * @event BetaJS.Router.Router#notfound
                     */
                    this.trigger("notfound", route);
                }
                return this;
            },

            /**
             * Dispatches a new route.
             * 
             * @param {string} name name of route
             * @param {array} args arguments of new route
             * @param {string} route optional route string
             * @fires BetaJS.Router.Router#leave
             * @fires BetaJS.Router.Router#dispatch
             * @fires BetaJS.Router.Router#dispatched
             */
            dispatch: function(name, args, route) {
                if (this._current) {
                    if (this._current.name === name && Comparators.deepEqual(args, this._current.args, 2))
                        return;
                    /**
                     * @event BetaJS.Router.Router#leave
                     */
                    this.trigger("leave", this._current.name, this._current.args, this._current);
                    this.trigger("leave:" + this._current.name, this._current.args, this._current);
                }
                var current = {
                    route: route || this.format(name, args),
                    name: name,
                    args: args
                };
                /**
                 * @event BetaJS.Router.Router#dispatch
                 */
                this.trigger("dispatch", name, args, current);
                this.trigger("dispatch:" + name, args, current);
                this._current = current;
                /**
                 * @event BetaJS.Router.Router#dispatched
                 */
                this.trigger("dispatched", name, args, current);
                this.trigger("dispatched:" + name, args, current);
                return this;
            },

            /**
             * Recreates a full route from an abstract route descriptor and route arguments.
             * 
             * @param {string} name route descriptor
             * @param {array} args arguments for route
             * 
             * @return {string} full route
             * 
             */
            format: function(name, args) {
                return this._routeParser.format(name, args);
            }

        };
    }]);
});



Scoped.define("module:Router.RouteBinder", [
    "module:Class",
    "module:Types",
    "module:Comparators"
], function(Class, Types, Comparators, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract Route Binder Class for bidirectionally binding the route to a separate router.
         * 
         * @class BetaJS.Router.RouteBinder
         */
        return {

            /**
             * Overwrite the local route of this binder.
             * 
             * @param {string} currentRoute current route
             */
            _setLocalRoute: function(currentRoute) {},

            /**
             * Read the local route of this binder.
             * 
             * @return {string} local route
             */
            _getLocalRoute: function() {},

            /**
             * Notify the router that the local route has changed.
             */
            _localRouteChanged: function() {
                this.setGlobalRoute(this._getLocalRoute());
            },

            /**
             * Creates a new instance.
             * 
             * @param {object} router router instance
             */
            constructor: function(router) {
                inherited.constructor.call(this);
                this._router = router;
                router.on("dispatched", function() {
                    this.setLocalRoute(router.current());
                }, this);
                if (router.current())
                    this.setLocalRoute(router.current());
                else if (this._getLocalRoute())
                    this.setGlobalRoute(this._getLocalRoute());
            },

            /**
             * @override
             */
            destroy: function() {
                this._router.off(null, null, this);
                inherited.destroy.call(this);
            },

            /**
             * Sets the local route.
             * 
             * @param {string} currentRoute current route
             */
            setLocalRoute: function(currentRoute) {
                this._lastLocalRoute = currentRoute;
                this._setLocalRoute(currentRoute);
                return this;
            },

            /**
             * Sets the global route.
             * 
             * @param {string} route new global route
             */
            setGlobalRoute: function(route) {
                if (Types.is_string(route)) {
                    if (!this._lastLocalRoute || route !== this._lastLocalRoute.route)
                        this._router.navigate(route);
                } else {
                    if (!this._lastLocalRoute || route.name !== this._lastLocalRoute.name || !Comparators.deepEqual(route.args, this._lastLocalRoute.args, 2))
                        this._router.dispatch(route.name, route.args);
                }
                return this;
            }

        };
    });
});


Scoped.define("module:Router.StateRouteBinder", [
    "module:Router.RouteBinder", "module:Objs", "module:Strings", "module:Router.RouteMap"
], function(RouteBinder, Objs, Strings, RouteMap, scoped) {
    return RouteBinder.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * State Router Binder Class, binding a router to a state machine
         * 
         * @class BetaJS.Router.StateRouteBinder
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} router router instance
             * @param {object} stateHost state host instance
             * @param {object} options optional options
             */
            constructor: function(router, stateHost, options) {
                this._stateHost = stateHost;
                options = Objs.extend({
                    capitalizeStates: false
                }, options);
                this._options = options;
                this._routeToState = new RouteMap({
                    map: this._options.routeToState || function(name, args) {
                        return {
                            name: options.capitalizeStates ? Strings.capitalize(name) : name,
                            args: args
                        };
                    },
                    context: this._options.context
                });
                this._stateToRoute = new RouteMap({
                    map: this._options.stateToRoute || function(name, args) {
                        return {
                            name: name.toLowerCase(),
                            args: args
                        };
                    },
                    context: this._options.context
                });
                inherited.constructor.call(this, router);
                stateHost.on("start", this._localRouteChanged, this);
            },

            /**
             * @override
             */
            destroy: function() {
                this._routeToState.destroy();
                this._stateToRoute.destroy();
                this._stateHost.off(null, null, this);
                inherited.destroy.call(this);
            },

            /**
             * Bind a route to a state.
             * 
             * @param {string} name route name
             * @param {function} func state function
             */
            bindRouteToState: function(name, func) {
                this._routeToState.bind(name, func);
                return this;
            },

            /**
             * Bind a state to a route.
             * 
             * @param {string} name state name
             * @param {function} func route function
             */
            bindStateToRoute: function(name, func) {
                this._stateToRoute.bind(name, func);
                return this;
            },

            /**
             * Register a new route and corresponding state.
             * 
             * @param {string} name name of route / state
             * @param {string} route new route
             * @param {object} extension state extension object
             */
            register: function(name, route, extension) {
                this._router.bind(name, route);
                this._stateHost.register(this._options.capitalizeStates ? Strings.capitalize(name) : name, extension);
                return this;
            },

            /**
             * @override
             */
            _setLocalRoute: function(currentRoute) {
                var mapped = this._routeToState.map(currentRoute.name, currentRoute.args);
                if (mapped) {
                    this._stateHost.weakNext(mapped.name, mapped.args);
                    /*
                    Objs.iter(args, function (value, key) {
                    	this._stateHost.set(key, value);
                    }, this);
                    */
                }
            },

            /**
             * @override
             */
            _getLocalRoute: function() {
                if (!this._stateHost.state())
                    return null;
                var state = this._stateHost.state();
                return this._stateToRoute.map(state.state_name(), state.allAttr());
            }

        };
    });
});


Scoped.define("module:Router.RouterHistory", [
    "module:Class", "module:Events.EventsMixin"
], function(Class, EventsMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

        /**
         * Router History Class
         * 
         * @class BetaJS.Router.RouterHistory
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} router router instance
             * @fires BetaJS.Router.RouterHistory#change
             * @fires BetaJS.Router.RouterHistory#insert
             */
            constructor: function(router) {
                inherited.constructor.call(this);
                this._router = router;
                this._history = [];
                router.on("dispatched", function(name, args, current) {
                    this._history.push(current);
                    /**
                     * @event BetaJS.Router.RouterHistory#change
                     */
                    this.trigger("change", current);
                    /**
                     * @event BetaJS.Router.RouterHistory#insert
                     */
                    this.trigger("insert", current);
                }, this);
            },

            /**
             * @override
             */
            destroy: function() {
                this._router.off(null, null, this);
                inherited.destroy.call(this);
            },

            /**
             * Returns the last history item.
             * 
             * @param {int} index optional index, counting from the end.
             * @return {string} history route
             */
            last: function(index) {
                index = index || 0;
                return this.get(this.count() - 1 - index);
            },

            /**
             * Return the number of history items.
             * 
             * @return {int} number of history items 
             */
            count: function() {
                return this._history.length;
            },

            /**
             * Pops and returns last history entry.
             *
             * @return {object} last history entry
             */
            pop: function() {
                return this._history.pop();
            },

            /**
             * Returns a history item.
             * 
             * @param {int} index optional index, counting from the start.
             * @return {string} history route
             */
            get: function(index) {
                index = index || 0;
                return this._history[index];
            },

            /**
             * Goes back in history.
             * 
             * @param {int} index optional index, stating how many items to go back.
             * @fires BetaJS.Router.RouterHistory#remove
             * @fires BetaJS.Router.RouterHistory#change
             */
            back: function(index) {
                if (this.count() < 2)
                    return null;
                index = index || 0;
                while (index >= 0 && this.count() > 1) {
                    var removed = this.pop();
                    /**
                     * @event BetaJS.Router.RouterHistory#remove
                     */
                    this.trigger("remove", removed);
                    --index;
                }
                var item = this.pop();
                /**
                 * @event BetaJS.Router.RouterHistory#change
                 */
                this.trigger("change", item);
                return this._router.dispatch(item.name, item.args);
            }

        };
    }]);
});
Scoped.define("module:States.Host", [
    "module:Properties.Properties", "module:Events.EventsMixin", "module:States.State", "module:Types", "module:Strings", "module:Classes.ClassRegistry"
], function(Class, EventsMixin, State, Types, Strings, ClassRegistry, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

        /**
         * State Machine Host Class
         * 
         * @class BetaJS.States.Host
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} options options for state host
             */
            constructor: function(options) {
                inherited.constructor.call(this);
                options = options || {};
                this._stateRegistry = options.stateRegistry;
                this._baseState = options.baseState;
                this._enabled = true;
            },

            /**
             * Initialize state machine.
             * 
             * @param initial_state initial state as string or class
             * @param {object} initial_args initial arguments for state
             * 
             */
            initialize: function(initial_state, initial_args) {
                if (!this._stateRegistry) {
                    var s = null;
                    if (Types.is_string(initial_state) && initial_state.indexOf(".") >= 0) {
                        var split = Strings.splitLast(initial_state, ".");
                        initial_state = split.tail;
                        s = split.head;
                    } else if (!Types.is_string(initial_state))
                        s = Strings.splitLast(initial_state.classname, ".").head;
                    else
                        s = Strings.splitLast(this.cls.classname, ".").head;
                    this._stateRegistry = this._auto_destroy(new ClassRegistry(Scoped.getGlobal(s)));
                }
                this._createState(initial_state, initial_args).start();
                this._baseState = this._baseState || this._state.cls;
                return this;
            },

            /**
             * Creates a new state.
             * 
             * @protected
             * 
             * @param state state as string or class
             * @param {object} args arguments for state
             * @param {object} transitionals transitional arguments for state
             * 
             * @return {object} created state
             */
            _createState: function(state, args, transitionals) {
                return this._stateRegistry.create(state, this, args || {}, transitionals || {});
            },

            /**
             * Finalize current state.
             */
            finalize: function() {
                if (this._state)
                    this._state.end();
                this._state = null;
                return this;
            },

            /**
             * @override
             */
            destroy: function() {
                this.finalize();
                inherited.destroy.call(this);
            },

            /**
             * Enable the state machine.
             */
            enable: function() {
                this._enabled = true;
                return this;
            },

            /**
             * Disable the state machine.
             */
            disable: function() {
                this._enabled = false;
                return this;
            },

            /**
             * Returns the current state.
             * 
             * @return {object} current state
             */
            state: function() {
                return this._state;
            },

            /**
             * Returns the current state name.
             * 
             * @return {string} state name
             */
            state_name: function() {
                return this.state().state_name();
            },

            /**
             * Transitions to the next state
             * 
             * @return {object} next state
             */
            next: function() {
                return this.state() ? this.state().next.apply(this.state(), arguments) : this.initialize.apply(this, arguments);
            },

            /**
             * Weakly transitions to the next state
             * 
             * @return {object} next state
             */
            weakNext: function() {
                return this.state() ? this.state().weakNext.apply(this.state(), arguments) : this.initialize.apply(this, arguments);
            },

            /**
             * Starts a new state.
             * 
             * @protected
             * 
             * @param {object} state state to start
             */
            _start: function(state) {
                this._stateEvent(state, "before_start");
                this._state = state;
                this.set("name", state.state_name());
            },

            /**
             * Called after an event was started.
             * 
             * @protected
             * 
             * @param {object} state state in question
             */
            _afterStart: function(state) {
                this._stateEvent(state, "start");
            },

            /**
             * End a state.
             * 
             * @protected
             * 
             * @param {object} state state in question
             */
            _end: function(state) {
                this._stateEvent(state, "end");
                this._state = null;
            },

            /**
             * Called after an event was ended.
             * 
             * @protected
             * 
             * @param {object} state state in question
             */
            _afterEnd: function(state) {
                this._stateEvent(state, "after_end");
            },

            /**
             * Called when a transition to a state is taking place.
             * 
             * @protected
             * 
             * @param {object} state state in question
             */
            _next: function(state) {
                this._stateEvent(state, "next");
            },

            /**
             * Called after transitioning to a state.
             * 
             * @protected
             * 
             * @param {object} state state in question
             */
            _afterNext: function(state) {
                this._stateEvent(state, "after_next");
            },

            /**
             * Determines whether we can transition to a state
             * 
             * @protected
             * 
             * @param {object} state state in question
             * @return {boolean} true if we can transition
             */
            _can_transition_to: function(state) {
                return this._enabled;
            },

            /**
             * Triggers a state event.
             * 
             * @protected
             * 
             * @param {object} state state in question
             * @param {string} s name of event
             * @fires BetaJS.States.Host#event
             */
            _stateEvent: function(state, s) {
                /**
                 * @event BetaJS.States.Host#event
                 */
                this.trigger("event", s, state.state_name(), state.description());
                this.trigger(s, state.state_name(), state.description());
                this.trigger(s + ":" + state.state_name(), state.description());
            },

            /**
             * Registers a new state.
             * 
             * @param {string} state_name name of new state
             * @param {object} parent_state class of parent state we should inherit from
             * @param {object} extend extension of state class
             * 
             * @return {object} new state class
             */
            register: function(state_name, parent_state, extend) {
                if (!Types.is_string(parent_state)) {
                    extend = parent_state;
                    parent_state = null;
                }
                if (!this._stateRegistry)
                    this._stateRegistry = this._auto_destroy(new ClassRegistry(Strings.splitLast(this.cls.classname).head));
                var base = this._baseState ? (Strings.splitLast(this._baseState.classname, ".").head + "." + state_name) : (state_name.indexOf(".") >= 0 ? state_name : null);
                var cls = (this._stateRegistry.get(parent_state) || this._baseState || State).extend(base, extend);
                if (!base)
                    cls.classname = state_name;
                this._stateRegistry.register(Strings.last_after(state_name, "."), cls);
                return this;
            }

        };
    }]);
});


Scoped.define("module:States.State", [
    "module:Class", "module:Types", "module:Strings", "module:Async", "module:Objs"
], function(Class, Types, Strings, Async, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Abstract State Class
         * 
         * @class BetaJS.States.State
         */
        return {

            _locals: [],
            _persistents: [],
            _defaults: {},
            _clonedDefaults: {},

            _white_list: null,

            _starting: false,
            _started: false,
            _stopped: false,
            _transitioning: false,
            __next_state: null,
            __suspended: 0,

            /**
             * Creates a new instance.
             * 
             * @param {object} host state host
             * @param {object} args arguments for creating the state
             * @param {object} transitionals transitionals variables
             */
            constructor: function(host, args, transitionals) {
                inherited.constructor.call(this);
                this.host = host;
                this.transitionals = transitionals;
                args = Objs.extend(Objs.extend(Objs.clone(this._clonedDefaults || {}, -1), Objs.clone(this._defaults || {}, 1)), args);
                this._locals = Types.is_function(this._locals) ? this._locals() : this._locals;
                var used = {};
                for (var i = 0; i < this._locals.length; ++i) {
                    this["_" + this._locals[i]] = args[this._locals[i]];
                    used[this._locals[i]] = true;
                }
                this._persistents = Types.is_function(this._persistents) ? this._persistents() : this._persistents;
                for (i = 0; i < this._persistents.length; ++i) {
                    this["_" + this._persistents[i]] = args[this._persistents[i]];
                    used[this._locals[i]] = true;
                }
                host.suspendEvents();
                this.__hostArgs = {};
                Objs.iter(args, function(value, key) {
                    if (!used[key]) {
                        this.__hostArgs[key] = true;
                        host.set(key, value);
                    }
                }, this);
                host.resumeEvents();
            },

            /**
             * Returns all attributes of the state.
             * 
             * @return {object} all attributes
             */
            allAttr: function() {
                var result = Objs.clone(this.host.data(), 1);
                Objs.iter(this._locals, function(key) {
                    result[key] = this["_" + key];
                }, this);
                Objs.iter(this._persistents, function(key) {
                    result[key] = this["_" + key];
                }, this);
                return result;
            },

            /**
             * Returns the name of state.
             * 
             * @return {string} name of state
             */
            state_name: function() {
                return Strings.last_after(this.cls.classname, ".");
            },

            /**
             * Returns the description of state.
             * 
             * @return {string} description of state
             */
            description: function() {
                return this.state_name();
            },

            /**
             * Starts the state.
             */
            start: function() {
                if (this._starting)
                    return this;
                this._starting = true;
                this.host._start(this);
                this._start();
                if (this.host) {
                    this.host._afterStart(this);
                    this._started = true;
                }
                return this;
            },

            /**
             * Ends the state.
             */
            end: function() {
                if (this._stopped)
                    return this;
                this._stopped = true;
                this._end();
                this.host._end(this);
                this.host._afterEnd(this);
                this.destroy();
                return this;
            },

            /**
             * Eventually transitions to the next state.
             * 
             * @param {string} state_name name of next state
             * @param {object} args arguments for creating the state
             * @param {object} transitionals transitionals variables
             * 
             * @return {object} next state
             */
            eventualNext: function(state_name, args, transitionals) {
                this.suspend();
                var state = this.next(state_name, args, transitionals);
                this.eventualResume();
                return state;
            },

            /**
             * Eventually transitions to the next state.
             * 
             * @param {string} state_name name of next state
             * @param {object} args arguments for creating the state
             * @param {object} transitionals transitionals variables
             * 
             * @return {object} next state
             */
            next: function(state_name, args, transitionals) {
                if (!this._starting || this._stopped || this.__next_state)
                    return null;
                args = args || {};
                for (var i = 0; i < this._persistents.length; ++i) {
                    if (!(this._persistents[i] in args))
                        args[this._persistents[i]] = this["_" + this._persistents[i]];
                }
                var obj = this.host._createState(state_name, args, transitionals);
                if (!this.can_transition_to(obj)) {
                    obj.destroy();
                    return null;
                }
                if (!this._started) {
                    this.host._afterStart(this);
                    this._started = true;
                }
                this.__next_state = obj;
                this._transitioning = true;
                this._transition();
                if (this.__suspended <= 0)
                    this.__next();
                return obj;
            },

            /**
             * Checks weakly whether a prospective new state is equal to this state.
             * 
             * @param {string} state_name name of next state
             * @param {object} args arguments for creating the state
             * @param {object} transitionals transitionals variables
             * 
             * @return {boolean} true if equal
             */
            weakSame: function(state_name, args, transitionals) {
                var same = true;
                if (state_name !== this.state_name())
                    same = false;
                var all = this.allAttr();
                Objs.iter(args, function(value, key) {
                    if (all[key] !== value)
                        same = false;
                }, this);
                return same;
            },

            /**
             * Weakly transitions to the next state.
             * 
             * @param {string} state_name name of next state
             * @param {object} args arguments for creating the state
             * @param {object} transitionals transitionals variables
             * 
             * @return {object} next state
             */
            weakNext: function(state_name, args, transitionals) {
                return this.weakSame.apply(this, arguments) ? this : this.next.apply(this, arguments);
            },

            __next: function() {
                var host = this.host;
                var obj = this.__next_state;
                host._next(obj);
                var hostArgs = this.__hostArgs;
                this.end();
                obj.start();
                host.suspendEvents();
                obj = host.state();
                if (!obj || obj.destroyed())
                    return;
                Objs.iter(hostArgs, function(dummy, key) {
                    if (!obj.__hostArgs[key])
                        host.unset(key);
                }, this);
                host.resumeEvents();
                host._afterNext(obj);
            },

            _transition: function() {},

            /**
             * Suspends the state.
             */
            suspend: function() {
                this.__suspended++;
                return this;
            },

            /**
             * Eventually resumes the state.
             */
            eventualResume: function() {
                Async.eventually(this.resume, this);
                return this;
            },

            /**
             * Resumes the state.
             */
            resume: function() {
                this.__suspended--;
                if (this.__suspended === 0 && !this._stopped && this.__next_state)
                    this.__next();
                return this;
            },

            /**
             * Determines whether the state can transition to another state.
             * 
             * @param {object} state another state
             * 
             * @return {boolean} true if it can transition
             */
            can_transition_to: function(state) {
                return this.host && this.host._can_transition_to(state) && this._can_transition_to(state);
            },

            _start: function() {},

            _end: function() {},

            _can_transition_to: function(state) {
                return !Types.is_array(this._white_list) || Objs.contains_value(this._white_list, state.state_name());
            }

        };
    }, {

        _extender: {
            _defaults: function(base, overwrite) {
                return Objs.extend(Objs.clone(base, 1), overwrite);
            }
        }

    });
});


Scoped.define("module:States.StateRouter", [
    "module:Class", "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * State Router Class
         * 
         * @class BetaJS.States.StateRouter
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} host state host
             */
            constructor: function(host) {
                inherited.constructor.call(this);
                this._host = host;
                this._routes = [];
                this._states = {};
            },

            /**
             * Register a route.
             * 
             * @param {string} route route to be registered
             * @param {string} state state to be registered
             * @param {array} mapping optional argument mapping
             */
            registerRoute: function(route, state, mapping) {
                var descriptor = {
                    key: route,
                    route: new RegExp("^" + route + "$"),
                    state: state,
                    mapping: mapping || []
                };
                this._routes.push(descriptor);
                this._states[state] = descriptor;
                return this;
            },

            /**
             * Read a route from a state object.
             * 
             * @param {object} stateObject state object
             * 
             * @return {string} corresponding route
             */
            readRoute: function(stateObject) {
                var descriptor = this._states[stateObject.state_name()];
                if (!descriptor)
                    return null;
                var regex = /\(.*?\)/;
                var route = descriptor.key;
                Objs.iter(descriptor.mapping, function(arg) {
                    route = route.replace(regex, stateObject["_" + arg]);
                }, this);
                return route;
            },

            /**
             * Parses a route.
             * 
             * @param {string} route route to be parsed
             * 
             * @return {object} state and argument descriptor
             */
            parseRoute: function(route) {
                for (var i = 0; i < this._routes.length; ++i) {
                    var descriptor = this._routes[i];
                    var result = descriptor.route.exec(route);
                    if (result === null)
                        continue;
                    var args = {};
                    for (var j = 0; j < descriptor.mapping.length; ++j)
                        args[descriptor.mapping[j]] = result[j + 1];
                    return {
                        state: descriptor.state,
                        args: args
                    };
                }
                return null;
            },

            /**
             * Returns the current route.
             * 
             * @return {string} current route
             */
            currentRoute: function() {
                return this.readRoute(this._host.state());
            },

            /**
             * Navigate to a route.
             * 
             * @param {string} route route to be navigated to
             */
            navigateRoute: function(route) {
                var parsed = this.parseRoute(route);
                if (parsed)
                    this._host.next(parsed.state, parsed.args);
                return this;
            }

        };
    });
});
Scoped.define("module:JavaScript", ["module:Objs"], function (Objs) {
    /**
     * JavaScript Simple Parse Functions
     *
     * @module BetaJS.JavaScript
     */
    return {
        STRING_SINGLE_QUOTATION_REGEX: /'[^']*'/g,
        STRING_DOUBLE_QUOTATION_REGEX: /"[^"]*"/g,
        PROPER_IDENTIFIER_REGEX: /^[a-zA-Z_][a-zA-Z_0-9]*$/,
        IDENTIFIER_REGEX: /[a-zA-Z_][a-zA-Z_0-9]*/g,
        IDENTIFIER_SCOPE_REGEX: /[a-zA-Z_][a-zA-Z_0-9\.]*/g,
        RESERVED: Objs.objectify([
            "if", "then", "else", "return", "var"
        ], true),
        /**
         * Is string a JS-reserved keyword?
         *
         * @param {string} key string in question
         * @return {boolean} true if reserved
         */
        isReserved: function (key) {
            return key in this.RESERVED;
        },
        /**
         * Is string a valid JS identifier?
         *
         * @param {string} key string in question
         * @return {boolean} true if identifier
         */
        isIdentifier: function (key) {
            return !this.isReserved(key);
        },
        /**
         * Is string a valid proper JS identifier?
         *
         * @param {string} key string in question
         * @return {boolean} true if identifier
         */
        isProperIdentifier: function (key) {
            return this.isIdentifier(key) && this.PROPER_IDENTIFIER_REGEX.test(key);
        },
        /**
         * Remove string definitions from JS code.
         *
         * @param {string} code input code
         * @return {string} code without strings
         */
        removeStrings: function (code) {
            return code.replace(this.STRING_SINGLE_QUOTATION_REGEX, "").replace(this.STRING_DOUBLE_QUOTATION_REGEX, "");
        },
        /**
         * Return JS identifiers from a piece of code.
         *
         * @param {string} code input code
         * @param {boolean} keepScopes keep scopes, e.g. `foo.bar` instead of `foo` and `bar` (default: false)
         * @return {array} array of extracted identifiers
         */
        extractIdentifiers: function (code, keepScopes) {
            var regex = keepScopes ? this.IDENTIFIER_SCOPE_REGEX : this.IDENTIFIER_REGEX;
            code = this.removeStrings(code);
            return Objs.filter(code.match(regex), this.isIdentifier, this);
        },
        /**
         * Return function parameter names
         *
         * @param {string} func JavaScript function to extract parameter names
         * @return {array} array of extracted parameter names
         */
        extractFunctionParameterNames: function (func) {
            return (func.toString().match(/function \((.*)\).*/))[1].replace(/\s*/g, "").split(",");
        }
    };
});

Scoped.define("module:Maths", [], function () {
    /**
     * This module contains auxilary math functions.
     *
     * @module BetaJS.Maths
     */
    return {
        /**
         * Ceiling an integer to be a multiple of another integer.
         *
         * @param {int} number the number to be ceiled
         * @param {int} steps the multiple
         * @param {int} max an optional maximum
         *
         * @return {int} ceiled integer
         */
        discreteCeil: function (number, steps, max) {
            var x = Math.ceil(number / steps) * steps;
            return max && x > max ? 0 : x;
        }
    };
});

Scoped.define("module:Tokens", function () {
    /**
     * Unique Token Generation
     *
     * @module BetaJS.Tokens
     */
    return {
        /**
         * Generates a random token
         *
         * @param {integer} length optional length of token, default is 16
         * @return {string} generated token
         */
        generate_token: function (length) {
            if (length === void 0) { length = 16; }
            var s = "";
            while (s.length < length)
                s += Math.random().toString(36).substr(2);
            return s.substr(0, length);
        },
        /**
         * Generated a simple hash value from a string.
         *
         * @param {string} input string
         * @return {integer} simple hash value
         * @see http://jsperf.com/string-hashing-methods
         */
        simple_hash: function (s) {
            if (s.length == 0)
                return 0;
            var nHash = 0;
            for (var i = 0; i < s.length; ++i) {
                nHash = ((nHash << 5) - nHash) + s.charCodeAt(i);
                nHash = nHash & nHash;
            }
            return Math.abs(nHash);
        }
    };
});

}).call(Scoped);