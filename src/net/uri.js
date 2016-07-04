Scoped.define("module:Net.Uri", [
    "module:Objs",
    "module:Types",
    "module:Strings"
], function (Objs, Types, Strings) {
	
	var parse_strict_regex = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
	var parse_loose_regex = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
	var parse_key = ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];
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
		build: function (obj) {
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
		 * 
		 * @return {string} encoded query parameters
		 */
		encodeUriParams: function (arr, prefix) {
			prefix = prefix || "";
			var res = [];
			Objs.iter(arr, function (value, key) {
				if (Types.is_object(value))
					res = res.concat(this.encodeUriParams(value, prefix + key + "_"));
				else
					res.push(prefix + key + "=" + encodeURIComponent(value));
			}, this);
			return res.join("&");
		},
		
		
		/**
		 * Decode a uri query parameter string
		 * 
		 * @param {string} res encoded query parameters
		 * 
		 * @return {object} key-value set of query parameters
		 */
		decodeUriParams: function (res) {
			var arr = {};
			res.split("&").forEach(function (kv) {
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
		appendUriParams: function (uri, arr, prefix) {
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
		parse: function (str, strict) {
			var parser = strict ? parse_strict_regex : parse_loose_regex;
			var m = parser.exec(str);
			var uri = {};
			for (var i = 0; i < parse_key.length; ++i)
				uri[parse_key[i]] = m[i] || "";
			uri.queryKey = {};
			uri[parse_key[12]].replace(parse_key_parser, function ($0, $1, $2) {
				if ($1) uri.queryKey[$1] = $2;
			});
			return uri;
		}
			
	};
});	