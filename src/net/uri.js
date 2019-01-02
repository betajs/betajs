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