Scoped.define("module:Net.Uri", ["module:Objs", "module:Types"], function (Objs, Types) {
	return {
		
		build: function (obj) {
			var s = "";
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
		
		appendUriParams: function (uri, arr, prefix) {
			return Types.is_empty(arr) ? uri : (uri + (uri.indexOf("?") != -1 ? "&" : "?") + this.encodeUriParams(arr, prefix));
		},
		
		// parseUri 1.2.2
		// (c) Steven Levithan <stevenlevithan.com>
		// MIT License
	
		parse: function (str, strict) {
			var parser = strict ? this.__parse_strict_regex : this.__parse_loose_regex;
			var m = parser.exec(str);
			var uri = {};
			for (var i = 0; i < this.__parse_key.length; ++i)
				uri[this.__parse_key[i]] = m[i] || "";
			uri.queryKey = {};
			uri[this.__parse_key[12]].replace(this.__parse_key_parser, function ($0, $1, $2) {
				if ($1) uri.queryKey[$1] = $2;
			});
	
			return uri;
		},
		
		__parse_strict_regex: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		__parse_loose_regex: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
		__parse_key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
		__parse_key_parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	
	};
});	