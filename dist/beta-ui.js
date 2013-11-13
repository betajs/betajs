/*!
  betajs - v0.0.2 - 2013-11-14
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*
 * <ul>
 *  <li>uri: target uri</li>
 *  <li>method: get, post, ...</li>
 *  <li>data: data as JSON to be passed with the request</li>
 *  <li>success_callback(data): will be called when request was successful</li>
 *  <li>failure_callback(status_code, status_text, data): will be called when request was not successful</li>
 *  <li>complete_callback(): will be called when the request has been made</li>
 * </ul>
 * 
 */
BetaJS.Class.extend("BetaJS.Browser.AbstractAjax", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Browser.AbstractAjax, "constructor");
		this.__options = BetaJS.Objs.extend({
			"method": "GET",
			"data": {}
		}, options);
	},
	
	syncCall: function (options) {
		var opts = BetaJS.Objs.clone(this.__options, 1);
		opts = BetaJS.Objs.extend(opts, options);
		var success_callback = opts.success_callback;
		delete opts["success_callback"];
		var failure_callback = opts.failure_callback;
		delete opts["failure_callback"];
		var complete_callback = opts.complete_callback;
		delete opts["complete_callback"];
		try {
			var result = this._syncCall(opts);
			if (success_callback)
				success_callback(result);
			if (complete_callback)
				complete_callback();
			return result;
		} catch (e) {
			e = BetaJS.Exceptions.ensure(e);
			e.assert(BetaJS.Browser.AjaxException);
			if (failure_callback)
				failure_callback(e.status_code(), e.status_text(), e.data())
			else
				throw e;
		}
	},
	
	asyncCall: function (options) {
		var opts = BetaJS.Objs.clone(this.__options, 1);
		opts = BetaJS.Objs.extend(opts, options);
		var success_callback = opts.success_callback;
		delete opts["success_callback"];
		var failure_callback = opts.failure_callback;
		delete opts["failure_callback"];
		var complete_callback = opts.complete_callback;
		delete opts["complete_callback"];
		try {
			var result = this._asyncCall(BetaJS.Objs.extend({
				"success": function (data) {
					if (success_callback)
						success_callback(data);
					if (complete_callback)
						complete_callback();
				},
				"failure": function (status_code, status_text, data) {
					if (failure_callback)
						failure_callback(status_code, status_text, data)
					else
						throw new BetaJS.Browser.AjaxException(status_code, status_text, data);
					if (complete_callback)
						complete_callback();
				}
			}, opts));
			return result;
		} catch (e) {
			e = BetaJS.Exceptions.ensure(e);
			e.assert(BetaJS.Browser.AjaxException);
			if (failure_callback)
				failure_callback(e.status_code(), e.status_text(), e.data())
			else
				throw e;
		}
	},
	
	call: function (options) {
		if (!("async" in options))
			return false;
		var async = options["async"];
		delete options["async"];
		return async ? this.asyncCall(options) : this.syncCall(options);
	},
	
	_syncCall: function (options) {},
	
	_asyncCall: function (options) {}
	
});


BetaJS.Exceptions.Exception.extend("BetaJS.Browser.AjaxException", {
	
	constructor: function (status_code, status_text, data) {
		this._inherited(BetaJS.Browser.AjaxException, "constructor", status_code + ": " + status_text);
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
	}
	
});


BetaJS.Browser.AbstractAjax.extend("BetaJS.Browser.JQueryAjax", {
	
	_syncCall: function (options) {
		var result;
		BetaJS.$.ajax({
			type: options.method,
			async: false,
			url: options.uri,
			dataType: options.decodeType ? options.decodeType : null, 
			data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
			success: function (response) {
				result = response;
			},
			error: function (jqXHR, textStatus, errorThrown) {
				throw new BetaJS.Browser.AjaxException(jqXHR.status, errorThrown, JSON.parse(jqXHR.responseText));
			}
		});
		return result;
	},
	
	_asyncCall: function (options) {
		BetaJS.$.ajax({
			type: options.method,
			async: true,
			url: options.uri,
			dataType: options.decodeType ? options.decodeType : null, 
			data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
			success: function (response) {
				options.success(response);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				options.failure(jqXHR.status, errorThrown, JSON.parse(jqXHR.responseText));
			}
		});
	}

});

BetaJS.Browser.Dom = {
	
	traverseNext: function (node, skip_children) {
		if ("get" in node)
			node = node.get(0);
		if (node.firstChild && !skip_children)
			return BetaJS.$(node.firstChild);
		if (!node.parentNode)
			return null;
		if (node.nextSibling)
			return BetaJS.$(node.nextSibling);
		return this.traverseNext(node.parentNode, true);
	},
	
	selectNode : function(node, offset) {
		node = BetaJS.$(node).get(0);
		var selection = null;
		var range = null;
		if (window.getSelection) {
			selection = window.getSelection();
			selection.removeAllRanges();
			range = document.createRange();
		} else if (document.selection) {
			selection = document.selection;
			range = selection.createRange();
		}
		if (offset) {
			range.setStart(node, offset);
			range.setEnd(node, offset);
			selection.addRange(range);
		} else {
			range.selectNode(node);
			selection.addRange(range);
		}
	},

	selectionStartNode : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).startContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().startContainer);
		return null;
	},
	
	selectedHtml : function() {
		if (window.getSelection)
			return window.getSelection().toString();
		else if (document.selection)
			return document.selection.createRange().htmlText;
		return "";
	},
	
	selectionAncestor : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).commonAncestorContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().parentElement());
		return null;
	},
	
	selectionStartOffset: function () {
		if (window.getSelection)
			return window.getSelection().getRangeAt(0).startOffset;
		else if (document.selection)
			return document.selection.createRange().startOffset;
		return null;
	},
	
	selectionEndOffset: function () {
		if (window.getSelection)
			return window.getSelection().getRangeAt(0).endOffset;
		else if (document.selection)
			return document.selection.createRange().endOffset;
		return null;
	},

	selectionStart : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).startContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().startContainer);
		return null;
	},

	selectionEnd : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).endContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().endContainer);
		return null;
	},
	
	selectionNonEmpty: function () {
		var start = this.selectionStart();
		var end = this.selectionEnd();
		return start && end && start.get(0) && end.get(0) && (start.get(0) != end.get(0) || this.selectionStartOffset() != this.selectionEndOffset());
	},
	
	selectionContained: function (node) {
		return node.has(this.selectionStart()).length > 0 && node.has(this.selectionEnd()).length > 0;
	},

	selectionNodes: function () {
		var result = [];
		var start = this.selectionStart();
		var end = this.selectionEnd();
		result.push(start);
		var current = start;
		while (current.get(0) != end.get(0)) {
			current = this.traverseNext(current);
			result.push(current);
		}
		return result;
	},
	
	selectionLeaves: function () {
		return BetaJS.Objs.filter(this.selectionNodes(), function (node) { return node.children().length == 0; });
	},
	
	contentSiblings: function (node) {
		return node.parent().contents().filter(function () {
			return this != node.get(0);
		});
	},
	
	remove_tag_from_parent_path: function (node, tag, context) {	
		tag = tag.toLowerCase();
		node = BetaJS.$(node);
		var parents = node.parents(context ? context + " " + tag : tag);
		for (var i = 0; i < parents.length; ++i) {
			var parent = parents.get(i);
			parent = BetaJS.$(parent);
			while (node.get(0) != parent.get(0)) {
				this.contentSiblings(node).wrap("<" + tag + "></" + tag + ">");
				node = node.parent();
			}
			parent.contents().unwrap();
		}
	},
	
	selectionSplitOffsets: function () {
		var startOffset = this.selectionStartOffset();
		var endOffset = this.selectionEndOffset();
		var start = this.selectionStart();
		var end = this.selectionEnd();
		var single = start.get(0) == end.get(0);
		if (endOffset < end.get(0).wholeText.length) {
			var endElem = end.get(0);
			endElem.splitText(endOffset);
			end = BetaJS.$(endElem);
			if (single)
				start = end;
		}
		if (startOffset > 0) {
			start = BetaJS.$(start.get(0).splitText(startOffset));
			if (single)
				end = start;
		}
		this.selectRange(start, end);
	},
	
	selectRange: function (start_node, end_node, start_offset, end_offset) {
		start_node = BetaJS.$(start_node);
		end_node = BetaJS.$(end_node);
		var selection = null;
		var range = null;
		if (window.getSelection) {
			selection = window.getSelection();
			selection.removeAllRanges();
			range = document.createRange();
		} else if (document.selection) {
			selection = document.selection;
			range = selection.createRange();
		}
		range.setStart(start_node.get(0), start_offset || 0);
		range.setEnd(end_node.get(0), end_offset || end_node.get(0).data.length);
		selection.addRange(range);
	},
	
	splitNode: function (node, start_offset, end_offset) {
		node = BetaJS.$(node);
		var start_offset = start_offset || 0;
		var end_offset = end_offset || node.get(0).data.length;
		if (end_offset < node.get(0).data.length) {
			var elem = node.get(0);
			elem.splitText(end_offset);
			node = BetaJS.$(elem);
		}
		if (start_offset > 0) 
			node = BetaJS.$(node.get(0).splitText(start_offset));
		return node;
	},
	
	elementHasAncestorTag: function (node, element, context) {
		if (BetaJS.Types.is_defined(node.get(0).tagName) && node.get(0).tagName.toLowerCase() == element.toLowerCase())
			return;
		return context ? node.parents(context + " " + element).length > 0 : node.parents(element).length > 0;
	}
		
};

BetaJS.Browser = BetaJS.Browser || {};

/**
 * Uses modified portions of:
 * 
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */

BetaJS.Browser.Hotkeys = {
	
	SHIFT_NUMS: {
		"`":"~",
		"1":"!",
		"2":"@",
		"3":"#",
		"4":"$",
		"5":"%",
		"6":"^",
		"7":"&",
		"8":"*",
		"9":"(",
		"0":")",
		"-":"_",
		"=":"+",
		";":":",
		"'":"\"",
		",":"<",
		".":">",
		"/":"?",
		"\\":"|"
	},
	
	SPECIAL_KEYS: {
		'esc':27,
		'escape':27,
		'tab':9,
		'space':32,
		'return':13,
		'enter':13,
		'backspace':8,

		'scrolllock':145,
		'scroll_lock':145,
		'scroll':145,
		'capslock':20,
		'caps_lock':20,
		'caps':20,
		'numlock':144,
		'num_lock':144,
		'num':144,
		
		'pause':19,
		'break':19,
		
		'insert':45,
		'home':36,
		'delete':46,
		'end':35,
		
		'pageup':33,
		'page_up':33,
		'pu':33,

		'pagedown':34,
		'page_down':34,
		'pd':34,

		'left':37,
		'up':38,
		'right':39,
		'down':40,

		'f1':112,
		'f2':113,
		'f3':114,
		'f4':115,
		'f5':116,
		'f6':117,
		'f7':118,
		'f8':119,
		'f9':120,
		'f10':121,
		'f11':122,
		'f12':123
	},
	
	MODIFIERS: ["ctrl", "alt", "shift", "meta"],
	
	keyCodeToCharacter: function (code) {
		if (code == 188)
			return ",";
		else if (code == 190)
			return ".";
		return String.fromCharCode(code).toLowerCase();
	},
	
	register: function (hotkey, callback, context, options) {
		options = BetaJS.Objs.extend({
			"type": "keyup",
			"propagate": false,
			"disable_in_input": false,
			"target": document,
			"keycode": false
		}, options);
		options.target = BetaJS.$(options.target);
		var keys = hotkey.toLowerCase().split("+");
		var func = function (e) {
			if (options.disable_in_input) {
				var element = e.target || e.srcElement || null;
				if (element && element.nodeType == 3)
					element = element.parentNode;
				if (element && (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA'))
					return;
			}
			var code = e.keyCode || e.which || 0;
			var character = BetaJS.Browser.Hotkeys.keyCodeToCharacter(code);
			var kp = 0;
			var modifier_map = {};
			BetaJS.Objs.iter(BetaJS.Browser.Hotkeys.MODIFIERS, function (mod) {
				modifier_map[mod] = {
					pressed: e[mod + "Key"],
					wanted: false
				};
			}, this);
			BetaJS.Objs.iter(keys, function (key) {
				if (key in modifier_map) {
					modifier_map[key].wanted = true;
					kp++;
				} else if (key.length > 1) {
					if (BetaJS.Browser.Hotkeys.SPECIAL_KEYS[key] == code)
						kp++;
				} else if (options.keycode) {
					if (options.keycode == code)
						kp++;
				} else if (character == key || (e.shiftKey && BetaJS.Browser.Hotkeys.SHIFT_NUMS[character] == key)) {
					kp++;
				}
			}, this);
			if (kp == keys.length && BetaJS.Objs.all(modifier_map, function (data) { return data.wanted == data.pressed; })) {
				callback.apply(context || this);
				if (!options.propagate)
					e.preventDefault();
			}
		};
		options.target.on(options.type, func);
		return {
			target: options.target,
			type: options.type,
			func: func
		};
	},
	
	unregister: function (handle) {
		handle.target.off(handle.type, handle.func);
	} 
	
};

BetaJS.Browser = BetaJS.Browser || {};

BetaJS.Browser.Info = {
	
	getNavigator: function () {
		return {
			appCodeName: navigator.appCodeName,
			appName: navigator.appName,
			appVersion: navigator.appVersion,
			cookieEnabled: navigator.cookieEnabled,
			onLine: navigator.onLine,
			platform: navigator.platform,
			userAgent: navigator.userAgent
		};
	},
	
	__flash: null,
	__isiOS: null,
	__isAndroid: null,
	__iOSversion: null,
	__isWebOS: null,
	__isWindowsPhone: null,
	__isBlackberry: null,
	__isMobile: null,
	__isInternetExplorer: null,

	flash: function () {
		if (!this.__flash)
			this.__flash = new BetaJS.Browser.FlashDetect();
		return this.__flash;
	},
	
	isiOS: function () {
		if (this.__isiOS == null)
			this.__isiOS = (navigator.userAgent.indexOf('iPhone') != -1) || (navigator.userAgent.indexOf('iPod') != -1) || (navigator.userAgent.indexOf('iPad') != -1);
		return this.__isiOS;
	},
	
	isChrome: function () {
		return "chrome" in window;
	},
	
	isAndroid: function () {
		if (this.__isAndroid == null)
			this.__isAndroid = navigator.userAgent.toLowerCase().indexOf("android") != -1;
		return this.__isAndroid;
	},
	
	isWebOS: function () {
		if (this.__isWebOS == null)
			this.__isWebOS = navigator.userAgent.toLowerCase().indexOf("webos") != -1;
		return this.__isWebOS;
	},

	isWindowsPhone: function () {
		if (this.__isWindowsPhone == null)
			this.__isWindowsPhone = navigator.userAgent.toLowerCase().indexOf("windows phone") != -1;
		return this.__isWindowsPhone;
	},

	isBlackberry: function () {
		if (this.__isBlackberry == null)
			this.__isBlackberry = navigator.userAgent.toLowerCase().indexOf("blackberry") != -1;
		return this.__isBlackberry;
	},

	iOSversion: function () {
		if (this.__iOSversion == null && this.isiOS()) {
		    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		    this.__iOSversion = {
		    	major: parseInt(v[1], 10),
		    	minor: parseInt(v[2], 10),
		    	revision: parseInt(v[3] || 0, 10)
		    };
		}
		return this.__iOSversion;
	},
	
	isMobile: function () {
		if (this.__isMobile == null)
			this.__isMobile = this.isiOS() || this.isAndroid() || this.isWebOS() || this.isWindowsPhone() || this.isBlackberry();
		return this.__isMobile;
	},
	
	isInternetExplorer: function () {
		if (this.__isInternetExplorer == null)
			this.__isInternetExplorer = navigator.appName == 'Microsoft Internet Explorer';
		return this.__isInternetExplorer;
	}
	
}


/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/

BetaJS.Class.extend("BetaJS.Browser.FlashDetect", {
	
	constructor: function () {
		this._inherited(BetaJS.Browser.FlashDetect, "constructor");
		this.__version = null;
        if (navigator.plugins && navigator.plugins.length > 0) {
            var type = 'application/x-shockwave-flash';
            var mimeTypes = navigator.mimeTypes;
            if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description)
                this.__version = this.parseVersion(mimeTypes[type].enabledPlugin.description);
        } else if (navigator.appVersion.indexOf("Mac") == -1 && window.execScript)
            for (var i = 0; i < this.__activeXDetectRules.length; i++)
		        try {
		            var obj = new ActiveXObject(this.__activeXDetectRules[i].name);
		            var version = this.__activeXDetectRules[i].version(obj);
                    if (version) {
                    	this.__version = this.parseActiveXVersion(version);
                    	break;
                    }
		        } catch (err) { }
	},
	
    parseVersion: function(str) {
        var descParts = str.split(/ +/);
        var majorMinor = descParts[2].split(/\./);
        var revisionStr = descParts[3];
        return {
            "raw": str,
            "major": parseInt(majorMinor[0], 10),
            "minor": parseInt(majorMinor[1], 10), 
            "revisionStr": revisionStr,
            "revision": parseInt(revisionStr.replace(/[a-zA-Z]/g, ""), 10)
        };
    },
	
    parseActiveXVersion : function(str) {
        var versionArray = str.split(",");
        return {
            "raw": str,
            "major": parseInt(versionArray[0].split(" ")[1], 10),
            "minor": parseInt(versionArray[1], 10),
            "revision": parseInt(versionArray[2], 10),
            "revisionStr": versionArray[2]
        };
    },
	
	version: function () {
		return this.__version;
	},
	
	installed: function () {
		return this.__version != null;
	},
	
	supported: function () {
		return this.installed() || !BetaJS.Browser.Info.is_iOS();
	},
	
    majorAtLeast : function (version) {
        return this.installed() && this.version().major >= version;
    },

    minorAtLeast : function (version) {
        return this.installed() && this.version().minor >= version;
    },

    revisionAtLeast : function (version) {
        return this.installed() && this.version().revision >= version;
    },

    versionAtLeast : function (major) {
    	if (!this.installed())
    		return false;
        var properties = [this.version().major, this.version().minor, this.version().revision];
        var len = Math.min(properties.length, arguments.length);
        for (i = 0; i < len; i++)
            if (properties[i] != arguments[i]) 
            	return properties[i] > arguments[i];
        return true;
    },
	
    __activeXDetectRules: [{
        name: "ShockwaveFlash.ShockwaveFlash.7",
        version: function(obj) {
	        try {
	            return obj.GetVariable("$version");
	        } catch(err) {
	        	return null;
	        }
	    }
	}, {
		name: "ShockwaveFlash.ShockwaveFlash.6",
        version: function(obj) {
            try {
                obj.AllowScriptAccess = "always";
		        try {
		            return obj.GetVariable("$version");
		        } catch(err) {
		        	return null;
		        }
            } catch(err) {
            	return "6,0,21";
            }
        }
	}, {
		name: "ShockwaveFlash.ShockwaveFlash",
		version: function(obj) {
	        try {
	            return obj.GetVariable("$version");
	        } catch(err) {
	        	return null;
	        }
        }
    }]

});
BetaJS.Browser = BetaJS.Browser || {};

BetaJS.Browser.Loader = {
	
	loadScript: function (url, callback, context) {
		var executed = false;
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.src = url;
		script.onload = script.onreadystatechange = function() {
			if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				executed = true;
				script.onload = script.onreadystatechange = null;
				if (callback)
					callback.apply(context || this, [url]);
				// Does not work properly if we remove the script for some reason if it is used the second time !?
				//head.removeChild(script);
			}
		};
		head.appendChild(script);
	}

}
BetaJS.Browser = BetaJS.Browser || {}; 

/** @class */
BetaJS.Browser.Router = BetaJS.Class.extend("BetaJS.Browser.Router", [
	BetaJS.Events.EventsMixin,
	/** @lends BetaJS.Browser.Router.prototype */
	{
		
	/** Specifies all routes. Can either be an associative array, an array of associative arrays or a function returning one of those.
	 * 
	 * <p>A route is a mapping from a regular expression to a route descriptor. A route descriptor is either a name of a callback function or a route descriptor associative array.</p>
	 * <p>The callback function should accept the parameters given by the capturing groups of the regular expression</p>
	 * The route descriptor object may contain the following options:
	 * <ul>
	 *   <li>
	 *     action: the callback function; either a string or a function (mandatory)
	 *   </li>
	 *   <li>
	 *     path: name of the route; can be used to look up route (optional)
	 *   </li>
	 *   <li>
	 *     applicable: array of strings or functions or string or function to determine whether the route is applicable; if it is not, it will be skipped (optional)
	 *   </li>
	 *   <li>
	 *     valid: array of strings or functions or string or function to determine whether an applicable route is valid; if it is not, the routing fails (optional)
	 *   </li>
	 * </ul>
	 * @return routes
	 * @example
	 * return {
	 * 	"users/(\d+)/post/(\d+)" : "users_post",
	 *  "users/(\d+)/account": {
	 * 	  action: "users_account",
	 *    path: "users_account_path",
	 *    applicable: "is_user",
	 *    valid: "is_admin"
	 *  }
	 * }
	 */	
	routes: [],
	
	/** Creates a new router with options
	 * <ul>
	 *  <li>routes: adds user defined routes</li> 
	 *  <li>actions: extends the object by user-defined actions</li>
	 * </ul>
	 * @param options options
	 */
	constructor: function (options) {
		this._inherited(BetaJS.Browser.Router, "constructor");
		var routes = BetaJS.Types.is_function(this.routes) ? this.routes() : this.routes;
		if (!BetaJS.Types.is_array(routes))
			routes = [routes];
		if ("routes" in options) {
			if (BetaJS.Types.is_array(options["routes"]))
				routes = routes.concat(options["routes"])
			else
				routes.push(options["routes"]);
		}
		this.__routes = [];
		this.__paths = {};
		this.__current = null;
		BetaJS.Objs.iter(routes, function (assoc) {
			BetaJS.Objs.iter(assoc, function (obj, key) {
				if (BetaJS.Types.is_string(obj))
					obj = {action: obj};
				obj.key = key;
				obj.route = new RegExp("^" + key + "$");
				if (!("applicable" in obj))
					obj.applicable = []
				else if (!BetaJS.Types.is_array(obj.applicable))
					obj.applicable = [obj.applicable];
				if (!("valid" in obj))
					obj.valid = []
				else if (!BetaJS.Types.is_array(obj.valid))
					obj.valid = [obj.valid];
				if (!("path" in obj))
					obj.path = obj.key;
				this.__routes.push(obj);
				this.__paths[obj.path] = obj;
			}, this);
		}, this);
		if ("actions" in options)
			BetaJS.Objs.iter(options.actions, function (action, key) {
				this[key] = action;
			}, this);
	},
	
	destroy: function() {
		this.__leave();
		this._inherited(BetaJS.Browser.Router, "destroy");
	},
	
	/** Parse a given route and map it to the first applicable object that is valid
	 * @param route the route given as a strings
	 * @return either null if nothing applicable and valid could be matched or an associative array with params and routing object as attributes.
	 */
	parse: function (route) {
		for (var i = 0; i < this.__routes.length; ++i) {
			var obj = this.__routes[i];
			var result = obj.route.exec(route);
			if (result != null) {
				result.shift(1);
				var applicable = true;
				BetaJS.Objs.iter(obj.applicable, function (s) {
					var f = BetaJS.Types.is_string(s) ? this[s] : s;
					applicable = applicable && f.apply(this, result)
				}, this);
				if (!applicable)
					continue;
				var valid = true
				BetaJS.Objs.iter(obj.valid, function (s) {
					var f = BetaJS.Types.is_string(s) ? this[s] : s;
					valid = valid && f.apply(this, result)
				}, this);
				if (!valid)
					return null;
				return {
					object: obj,
					params: result
				}
			}
		}
		return null;
	},
	
	/** Looks up the routing object given a path descriptor
 	 * @param path the path descriptor
 	 * @return the routing object
	 */
	object: function (path) {
		return this.__paths[path];
	},
	
	/** Returns the route of a path description
	 * @param path the path descriptor
	 * @param parameters parameters that should be attached to the route (capturing groups)
	 */
	path: function (path) {
		var key = this.object(path).key;
		var args = Array.prototype.slice.apply(arguments, [1]);
		var regex = /\(.*?\)/;
		while (arg = args.shift())
			key = key.replace(regex, arg);
		return key;
	},
	
	/** Navigate to a given route, invoking the matching action.
 	 * @param route the route
	 */
	navigate: function (route) {
		this.trigger("navigate", route);
		var result = this.parse(route);
		if (result == null) {
			this.trigger("navigate-fail", route);
			return false;
		}
		this.trigger("navigate-success", result.object, result.params);
		return this.invoke(result.object, result.params, route);
	},
	
	/** Invoke a routing object with parameters
	 * <p>
	 *   Invokes the protected method _invoke
	 * </p>
	 * @param object the routing object
	 * @param params (optional) the parameters that should be attached to the route
	 * @param route (optional) an associated route that should be saved
	 */
	invoke: function (object, params, route) {
		route = route || this.path(object.key, params);
		this.trigger("before_invoke", object, params, route);
		this.__enter(object, params, route);
		this.trigger("after_invoke", object, params, route);
		var result = this._invoke(object, params);
		return result;
	},
	
	/** Invokes a routing object with parameters.
	 * <p>
	 *   Can be overwritten and does the invoking.
	 * </p>
	 * @param object the routing object
	 * @param params (optional) the parameters that should be attached to the route
	 */
	_invoke: function (object, params) {
		var f = object.action;
		if (BetaJS.Types.is_string(f))
			f = this[f];
		return f.apply(this, params);
	},
	
	__leave: function () {
		if (this.__current != null) {
			this.trigger("leave", this.__current);
			this.__current.destroy();
			this.__current = null;
		}
	},
	
	__enter: function (object, params, route) {
		this.__leave();
		this.__current = new BetaJS.Events.Events();
		this.__current.route = route;
		this.__current.object = object;
		this.__current.params = params;
		this.trigger("enter", this.__current);
	},
	
	/** Returns the current route object.
	 * <ul>
	 *  <li>route: the route as string</li>
	 *  <li>object: the routing object</li>
	 *  <li>params: the params</li>
	 * </ul>
	 */
	current: function () {
		return this.__current;
	}
		
}]);


BetaJS.Class.extend("BetaJS.Browser.RouterHistory", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (router) {
		this._inherited(BetaJS.Browser.RouterHistory, "constructor");
		this.__router = router;
		this.__history = [];
		router.on("after_invoke", this.__after_invoke, this);
	},
	
	destroy: function () {
		this.__router.off(null, null, this);
		this._inherited(BetaJS.Browser.RouterHistory, "destroy");
	},
	
	__after_invoke: function (object, params) {
		this.__history.push({
			object: object,
			params: params
		});
		this.trigger("change");
	},
	
	last: function (index) {
		index = index || 0;
		return this.get(this.count() - 1 - index);
	},
	
	count: function () {
		return this.__history.length;
	},
	
	get: function (index) {
		index = index || 0;
		return this.__history[index];
	},
	
	getRoute: function (index) {
		var item = this.get(index);
		return this.__router.path(item.object.path, item.params);
	},
	
	back: function (index) {
		if (this.count() < 2)
			return;
		index = index || 0;
		while (index >= 0 && this.count() > 1) {
			this.__history.pop();
			--index;
		}
		var item = this.__history.pop();
		this.trigger("change");
		return this.__router.invoke(item.object, item.params);
	}
	
}]);


BetaJS.Class.extend("BetaJS.Browser.RouteBinder", {

	constructor: function (router) {
		this._inherited(BetaJS.Browser.RouteBinder, "constructor");
		this.__router = router;
		this.__router.on("after_invoke", function (object, params, route) {
			if (this._getExternalRoute() != route)
				this._setExternalRoute(route);
		}, this);
	},
	
	destroy: function () {
		this.__router.off(null, null, this);
		this._inherited(BetaJS.Browser.RouteBinder, "destroy");
	},
	
	current: function () {
		return this._getExternalRoute();
	},
	
	_setRoute: function (route) {
		var current = this.__router.current();
		if (current && current.route == route)
			return;
		this.__router.navigate(route);
	},
	
	_getExternalRoute: function () { return "" },
	_setExternalRoute: function (route) { }
	
});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.HashRouteBinder", [
	BetaJS.Ids.ClientIdMixin,
	{
	
	constructor: function (router) {
		this._inherited(BetaJS.Browser.HashRouteBinder, "constructor", router);
		var self = this;
		BetaJS.$(window).on("hashchange.events" + this.cid(), function () {
			self._setRoute(self._getExternalRoute());
		});
	},
	
	destroy: function () {
		BetaJS.$(window).off("hashchange.events" + this.cid());
		this._inherited(BetaJS.Browser.HashRouteBinder, "destroy");
	},
	
	_getExternalRoute: function () {
		var hash = window.location.hash;
		return (hash.length && hash[0] == '#') ? hash.slice(1) : hash;
	},
	
	_setExternalRoute: function (route) {
		window.location.hash = "#" + route;
	}

}]);


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.HistoryRouteBinder", [
	BetaJS.Ids.ClientIdMixin,
	{
		
	constructor: function (router) {
		this._inherited(BetaJS.Browser.HistoryRouteBinder, "constructor", router);
		var self = this;
		this.__used = false;
		BetaJS.$(window).on("popstate.events" + this.cid(), function () {
			if (self.__used)
				self._setRoute(self._getExternalRoute());
		});
	},
	
	destroy: function () {
		BetaJS.$(window).off("popstate.events" + this.cid());
		this._inherited(BetaJS.Browser.HistoryRouteBinder, "destroy");
	},

	_getExternalRoute: function () {
		return window.location.pathname;
	},
	
	_setExternalRoute: function (route) {
		window.history.pushState({}, document.title, route);
		this.__used = true;
	}
}], {
	supported: function () {
		return window.history && window.history.pushState;
	}
});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.LocationRouteBinder", {
	_getExternalRoute: function () {
		return window.location.pathname;
	},
	
	_setExternalRoute: function (route) {
		window.location.pathname = route;
	}
});
BetaJS.Stores.StoreException.extend("BetaJS.Stores.RemoteStoreException", {
	
	constructor: function (source) {
		source = BetaJS.Browser.AjaxException.ensure(source);
		this._inherited(BetaJS.Stores.RemoteStoreException, "constructor", source.toString());
		this.__source = source;
	},
	
	source: function () {
		return this.__source;
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.RemoteStore", {

	constructor : function(uri, ajax, options) {
		this._inherited(BetaJS.Stores.RemoteStore, "constructor", options);
		this._uri = uri;
		this.__ajax = ajax;
		this.__options = BetaJS.Objs.extend({
			"update_method": "PUT",
			"uri_mappings": {}
		}, options || {});
	},
	
	_supports_async_write: function () {
		return true;
	},

	_supports_async_read: function () {
		return false;
	},

	getUri: function () {
		return this._uri;
	},
	
	prepare_uri: function (action, data) {
		if (this.__options["uri_mappings"][action])
			return this.__options["uri_mappings"][action](data);
		if (action == "remove" || action == "get" || action == "update")
			return this.getUri() + "/" + data[this._id_key];
		return this.getUri();
	},

	_include_callbacks: function (opts, error_callback, success_callback) {
		opts.failure = function (status_code, status_text, data) {
			error_callback(new BetaJS.Stores.RemoteStoreException(new BetaJS.Browser.AjaxException(status_code, status_text, data)));
		};
		opts.success = success_callback;
		return opts;
	},

	_insert : function(data, callbacks) {
		try {
			var opts = {method: "POST", uri: this.prepare_uri("insert", data), data: data};
			if (this._async_write) 
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success))
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
	},

	_remove : function(id, callbacks) {
		try {
			var data = {};
			data[this._id_key] = id;
			var opts = {method: "DELETE", uri: this.prepare_uri("remove", data)};
			if (this._async_write) {
				var self = this;
				opts = this._include_callbacks(opts, callbacks.exception, function (response) {
					if (!response) {
						response = {};
						response[self._id_key] = id;
					}
					callbacks.success(response);
				});
				this.__ajax.asyncCall(opts);
			} else {
				var response = this.__ajax.syncCall(opts);
				if (!response) {
					response = {};
					response[this._id_key] = id;
				}
				return response;
			}
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
	},

	_get : function(id, callbacks) {
		var data = {};
		data[this._id_key] = id;
		try {
			var opts = {uri: this.prepare_uri("get", data)};
			if (this._async_read)
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success))
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
	},

	_update : function(id, data, callbacks) {
		var copy = BetaJS.Objs.clone(data, 1);
		copy[this._id_key] = id;
		try {
			var opts = {method: this.__options.update_method, uri: this.prepare_uri("update", copy), data: data};
			if (this._async_write)
				this.__ajax.asyncCall(this._include_callbacks(opts, callbacks.exception, callbacks.success))
			else
				return this.__ajax.syncCall(opts);
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
	},
	
	_query : function(query, options, callbacks) {
		try {		
			var opts = this._encode_query(query, options);
			if (this._async_read) {
				var self = this;
				opts = this._include_callbacks(opts, callbacks.exception, function (response) {
					callbacks.success(BetaJS.Types.is_string(raw) ? JSON.parse(raw) : raw)
				});
				this.__ajax.asyncCall(opts);
			} else {
				var raw = this.__ajax.syncCall(opts);
				return BetaJS.Types.is_string(raw) ? JSON.parse(raw) : raw;
			}
		} catch (e) {
			throw new BetaJS.Stores.RemoteStoreException(e); 			
		}
	},
	
	_encode_query: function (query, options) {
		return {
			uri: this.prepare_uri("query")
		};		
	}
	
});


BetaJS.Stores.RemoteStore.extend("BetaJS.Stores.QueryGetParamsRemoteStore", {

	constructor : function(uri, ajax, capability_params, options) {
		this._inherited(BetaJS.Stores.QueryGetParamsRemoteStore, "constructor", uri, ajax, options);
		this.__capability_params = capability_params;
	},
	
	_query_capabilities: function () {
		var caps = {};
		if ("skip" in this.__capability_params)
			caps.skip = true;
		if ("limit" in this.__capability_params)
			caps.limit = true;
		return caps;
	},

	_encode_query: function (query, options) {
		options = options || {};
		var uri = this.getUri() + "?"; 
		if (options["skip"] && "skip" in this.__capability_params)
			uri += this.__capability_params["skip"] + "=" + options["skip"] + "&";
		if (options["limit"] && "limit" in this.__capability_params)
			uri += this.__capability_params["limit"] + "=" + options["limit"] + "&";
		return {
			uri: uri
		};		
	}

});
/*
 * Inspired by Underscore's Templating Engine
 * (which itself is inspired by John Resig's implementation)
 */

BetaJS.Templates = {
	
	tokenize: function (s) {
		// Already tokenized?
		if (BetaJS.Types.is_array(s))
			return s;
		var tokens = [];
		var index = 0;
		s.replace(BetaJS.Templates.SYNTAX_REGEX(), function(match, expr, esc, code, offset) {
			if (index < offset) 
				tokens.push({
					type: BetaJS.Templates.TOKEN_STRING,
					data: BetaJS.Strings.js_escape(s.slice(index, offset))
				});
			if (code)
				tokens.push({type: BetaJS.Templates.TOKEN_CODE, data: code});
			if (expr)
				tokens.push({type: BetaJS.Templates.TOKEN_EXPR, data: expr});
			if (esc)
				tokens.push({type: BetaJS.Templates.TOKEN_ESC, data: esc});
		    index = offset + match.length;
		    return match;
		});
		return tokens;
	},
	
	/*
	 * options
	 *  - start_index: token start index
	 *  - end_index: token end index
	 */
	compile: function(source, options) {
		if (BetaJS.Types.is_string(source))
			source = this.tokenize(source);
		options = options || {};
		var start_index = options.start_index || 0;
		var end_index = options.end_index || source.length;
		var result = "__p+='";
		for (var i = start_index; i < end_index; ++i) {
			switch (source[i].type) {
				case BetaJS.Templates.TOKEN_STRING:
					result += source[i].data;
					break;
				case BetaJS.Templates.TOKEN_CODE:
					result += "';\n" + source[i].data + "\n__p+='";
					break;
				case BetaJS.Templates.TOKEN_EXPR:
					result += "'+\n((__t=(" + source[i].data + "))==null?'':__t)+\n'";
					break;
				case BetaJS.Templates.TOKEN_ESC:
					result += "'+\n((__t=(" + source[i].data + "))==null?'':BetaJS.Strings.htmlentities(__t))+\n'";
					break;
			}	
		}
		result += "';\n";
		result = 'with(obj||{}){\n' + result + '}\n';
		result = "var __t,__p='',__j=Array.prototype.join," +
		  "echo=function(){__p+=__j.call(arguments,'');};\n" +
		  result + "return __p;\n";
		var func = new Function('obj', result);
		var func_call = function(data) {
			return func.call(this, data);
		};
		func_call.source = 'function(obj){\n' + result + '}';
		return func_call;
	}
		
};

BetaJS.Templates.SYNTAX = {
	OPEN: "{%",
	CLOSE: "%}",
	MODIFIER_CODE: "",
	MODIFIER_EXPR: "=",
	MODIFIER_ESC: "-"
};

BetaJS.Templates.SYNTAX_REGEX = function () {
	var syntax = BetaJS.Templates.SYNTAX;
	if (!BetaJS.Templates.SYNTAX_REGEX_CACHED)
		BetaJS.Templates.SYNTAX_REGEX_CACHED = new RegExp(
			syntax.OPEN + syntax.MODIFIER_EXPR + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_ESC + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_CODE + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			"$",
		'g');
	return BetaJS.Templates.SYNTAX_REGEX_CACHED;
}

BetaJS.Templates.TOKEN_STRING = 1;
BetaJS.Templates.TOKEN_CODE = 2;
BetaJS.Templates.TOKEN_EXPR = 3;
BetaJS.Templates.TOKEN_ESC = 4;

BetaJS.Class.extend("BetaJS.Templates.Template", {
	
	constructor: function (template_string) {
		this._inherited(BetaJS.Templates.Template, "constructor");
		this.__tokens = BetaJS.Templates.tokenize(template_string);
		this.__compiled = BetaJS.Templates.compile(this.__tokens);
	},
	
	evaluate: function (obj) {
		return this.__compiled.apply(this, [obj]);
	}
	
}, {
	
	bySelector: function (selector) {
		return new this(BetaJS.$(selector).html());
	}
	
});
BetaJS.$ = jQuery || null;

BetaJS.Exceptions.Exception.extend("BetaJS.Views.ViewException");

/** @class */
BetaJS.Views.View = BetaJS.Class.extend("BetaJS.Views.View", [
    BetaJS.Events.EventsMixin,                                            
	BetaJS.Events.ListenMixin,
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Properties.PropertiesMixin,
	BetaJS.Classes.ModuleMixin,
	/** @lends BetaJS.Views.View.prototype */
	{
    
    /** Returns all templates to be pre-loaded.
     * <p>It should return an associative array of templates. The keys are user-defined identifiers, the values are either the template strings or a jquery object containing the template.</p>
     * @return associative array of templates
     * @example
     * return {
     * 	"default": BetaJS.Templates.Cached["my-view-template"],
     *  "inner": $("#inner-template"),
     *  "item": '< p >{%= item.get("text") %}< /p >'
     * }
     */
	_templates: function () {
		return {};
	},
	
    /** Returns all dynamics to be pre-loaded.
     * <p>It should return an associative array of dynamics. The keys are user-defined identifiers, the values are either the template strings or a jquery object containing the template.</p>
     * @return associative array of dynamics
     */
	_dynamics: function () {
		// {"name": "string" or jquery selector}
		return {};
	},
	
	/** Returns all events that the view is listening to.
	 * <p>It should return an associative array of event bindings. The keys are strings composed of the event name and the jquery selector that specifies to which elements the event should be bound to. The value is the name of the method that should be called when the event is fired.</p>
	 * <p>Note: It is also possible to return an array of associative arrays. You should do that if you want to bind more than one method to a single key.</p> 
	 * @return associative array of events
	 * @example
	 * return {
	 * 	"click #button": "_clickButton",
	 *  "change #input": "_inputChanged",
	 *  "blur": "_containerElementBlur"
	 * }  
	 */
	_events: function () {
		// [{"event selector": "function"}]
		return [];
	},
	
	_global_events: function () {
		// [{"event selector": "function"}]
		return [];
	},

	/** Returns all default css classes that should be used for this view. 
	 * <p>They can be overwritten by the parent view or by options.
	 * The keys are internal identifiers that the view uses to lookup the css classed that are to be used.
	 * The values are the actual names of the css classes.</p>
	 * @return associative array of css classes
	 * @example
	 * return {
	 * 	"main-class": "default-main-class",
	 *  "item-class": "default-item-class"
	 * }
	 */
	_css: function () {
		// {"identifier": "css-class"}
		return {};
	},
	
	/** Returns css class by identifier.
	 * <p>The return strategy has the following priorities: options, parent, defaults.</p>
	 * @param ident identifier of class
	 * @example
	 * this.css("main_class")
	 */
	css: function (ident) {
		if (this.__css[ident])
			return this.__css[ident];
		if (this.__parent) {
			var css = this.__parent.css(ident);
			if (css && css != ident)
				return css;
		}
		var css = this._css();
		if (css[ident])
			return css[ident];
		return ident;
	},
	
	/** Is called by the view when the view needs to be rendered.
	 * <p>By default, the function renders the template or dynamic named "default" and passes the default arguments to it.</p>
	 * 
	 */
	_render: function () {
		if (this.__html)
			this.$el.html(this.__html)
		else if (this.__templates["default"])
			this.$el.html(this.evaluateTemplate("default", {}));
		else if (this.__dynamics["default"])
			this.evaluateDynamics("default", this.$el, {}, {name: "default"});
	},
	
	/** Returns a template associated with the view
	 * @param key identifier of template
	 * @return template object
	 */
	templates: function (key) {
		return key in this.__templates ? this.__templates[key] : null;
	},
	
	/** Returns a dynamic associated with the view
	 * @param key identifier of dynamic
	 * @return template object
	 */
	dynamics: function (key) {
		return key in this.__dynamics ? this.__dynamics[key] : null;
	},

	/** Support Routines for Templates and Dynamics
	 * <ul>
	 *  <li>supp.css(key): Returns css class associated with key</li>
	 *  <li>supp.attrs(obj): Returns html code for all html attributes specified by obj</li>
	 *  <li>supp.styles(obj): Returns html code for all styles specified by obj</li>
	 *  <li>supp.selector(name): Returns html code for data-selector='name'</li>
	 * </ul>
	 * @example
	 * < label class="{%= supp.css("main-class") %}" {%= supp.attrs({id: "test", title: "foo"}) %} {%= supp.selector("bar") %} > < /label >
	 * results in
	 * < label class="default-main-class" id="test" title="foo" data-selector="bar" > < /label >
	 */
	_supp: function () {
		return {
			__context: this,
			css: function (key) {
				return this.__context.css(key);
			},
			attrs: function (obj) {
				var s = "";
				for (var key in obj)
					s += (obj[key] == null ? key : (key + "='" + obj[key] + "'")) + " ";
				return s;
			},
			styles: function (obj) {
				var s = "";
				for (var key in obj)
					s += (key + ":" + obj[key] + "") + ";";
				return s;
			},
			selector: function (name) {
				return "data-selector='" + name + "' ";
			},
			view_id: this.cid()
		}
	},
	
	/** Returns all arguments that are passed to every template by default.
	 * <p>By default, this function returns the support routines supp and all properties that have been set via this.set or that have been set via this._setOptionProperty</p>
	 * @return associative array of template arguments  
	 */
	templateArguments: function () {
		var args = this.getAll();
		args.supp = this._supp();
		return args;
	},
	
	/** Evaluates a template with used-defined arguments.
	 * 
	 * @param key identifier of template 
	 * @param args arguments to be given to the template (optional)
	 * @return html string of evaluated template
	 */
	evaluateTemplate: function (key, args) {
		args = args || {};
		return this.__templates[key].evaluate(BetaJS.Objs.extend(args, this.templateArguments()));
	},
	
	/** Evaluates a dynamic and binds it to a given element with used-defined arguments and options.
	 * 
	 * @param key identifier of dynamic
	 * @param element jquery element to which the dynamic should be bound to 
	 * @param args arguments to be given to the dynamic (optional)
	 * @param options options to be passed to the dynamic (name is the most important one, see documentation)
	 * @return dynamic instance
	 */
	evaluateDynamics: function (key, element, args, options) {
		return this.__dynamics[key].renderInstance(element, BetaJS.Objs.extend(options || {}, {args: args || {}}));
	},

	/** Sets private variable from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 * @param prefix (optional) per default is "__"
	 */
	_setOption: function (options, key, value, prefix) {
		var prefix = prefix ? prefix : "__";
		this[prefix + key] = (key in options) && (BetaJS.Types.is_defined(options[key])) ? options[key] : value;
	},
	
	/** Sets property variable (that will be passed to templates and dynamics by default) from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 */
	_setOptionProperty: function (options, key, value) {
		this.set(key, (key in options) && (BetaJS.Types.is_defined(options[key])) ? options[key] : value);
	},
	
	/** Creates a new view with options
	 * <ul>
	 *  <li>el: the element to which the view should bind to; either a jquery selector or a jquery element</li> 
	 *  <li>visible: (default true) should the view be visible initially</li>
	 *  <li>html: (default null) string that should be used as default rendering</li>
	 *  <li>events: (default []) events that should be used additionally</li>
	 *  <li>attributes: (default {}) attributes that should be attached to container</li>
	 *  <li>el_classes: (default []) css classes that should be attached to container</li>
	 *  <li>el_styles: (default {}) styles that should be attached to container</li>
	 *  <li>children_classes: (default []) css classes that should be attached to all direct children</li>
	 *  <li>children_styles: (default {}) styles that should be attached to all direct children</li>
	 *  <li>css: (default {}) css classes that should be overwritten</li>
	 *  <li>templates: (default {}) templates that should be overwritten</li>
	 *  <li>dynamics: (default: {}) dynamics that should be overwritten</li>
	 *  <li>properties: (default: {}) properties that should be added (and passed to templates and dynamics)</li>
	 *  <li>invalidate_on_change: (default: false) rerender view on property change</li>
	 *  <li>invalidate_on_show: (default: false) invalidate view on show</li>
	 *  <li>append_to_el: (default: false) append to el instead of replacing content</li>
	 * </ul>
	 * @param options options
	 */
	constructor: function (options) {
		options = options || {};
		this._inherited(BetaJS.Views.View, "constructor");
		this._setOption(options, "el", null);
		this._setOption(options, "visible", true);
		this._setOption(options, "html", null);
		this._setOption(options, "events", []);
		this._setOption(options, "attributes", {});
		this._setOption(options, "invalidate_on_show", false);
		this._setOption(options, "append_to_el", false);
		this.__old_attributes = {};
		this._setOption(options, "el_classes", []);
		if (BetaJS.Types.is_string(this.__el_classes))
			this.__el_classes = this.__el_classes.split(" ");
		this.__added_el_classes = [];
		this._setOption(options, "el_styles", {});
		this._setOption(options, "children_styles", {});
		this._setOption(options, "children_classes", []);
		if (BetaJS.Types.is_string(this.__children_classes))
			this.__children_classes = this.__children_classes.split(" ");
		this._setOption(options, "invalidate_on_change", false);
		this.__old_el_styles = {};
		this._setOption(options, "css", {});
		this.__parent = null;
		this.__children = {};
		this.__active = false;
		this.$el = null;
		var events = BetaJS.Types.is_function(this._events) ? this._events() : this._events;
		if (!BetaJS.Types.is_array(events))
			events = [events]; 
		this.__events = events.concat(this.__events);

		var global_events = BetaJS.Types.is_function(this._global_events) ? this._global_events() : this._global_events;
		if (!BetaJS.Types.is_array(global_events))
			global_events = [global_events]; 
		this.__global_events = global_events;

		var templates = BetaJS.Objs.extend(BetaJS.Types.is_function(this._templates) ? this._templates() : this._templates, options["templates"] || {});
		if ("template" in options)
			templates["default"] = options["template"];
		this.__templates = {};
		for (var key in templates) {
			if (templates[key] == null)
				throw new BetaJS.Views.ViewException("Could not find template '" + key + "' in View '" + this.cls.classname + "'");
			this.__templates[key] = new BetaJS.Templates.Template(BetaJS.Types.is_string(templates[key]) ? templates[key] : templates[key].html());
		}

		var dynamics = BetaJS.Objs.extend(BetaJS.Types.is_function(this._dynamics) ? this._dynamics() : this._dynamics, options["dynamics"] || {});
		if ("dynamic" in options)
			dynamics["default"] = options["dynamic"];
		this.__dynamics = {};
		for (var key in dynamics)
			this.__dynamics[key] = new BetaJS.Views.DynamicTemplate(this, BetaJS.Types.is_string(dynamics[key]) ? dynamics[key] : dynamics[key].html());

		this.setAll(options["properties"] || {});
		if (this.__invalidate_on_change)
			this.on("change", function () {
				this.invalidate();
			}, this);

		this.__modules = {};
		BetaJS.Objs.iter(options.modules || [], this.add_module, this);

		this._notify("created", options);
		this.ns = {};
		var domain = this._domain();
		var domain_defaults = this._domain_defaults();

		if (!BetaJS.Types.is_empty(domain)) {
			var viewlist = [];
			for (var view_name in domain)
				viewlist.push({
					name: view_name,
					data: domain[view_name]
				});
			viewlist = BetaJS.Sort.dependency_sort(viewlist, function (data) {
				return data.name;
			}, function (data) {
				return data.data.before || [];
			}, function (data) {
				var after = data.data.after || [];
				if (data.data.parent)
					after.push(data.data.parent);
				return after;
			});
			for (var i = 0; i < viewlist.length; ++i) {
				var view_name = viewlist[i].name;
				var record = viewlist[i].data;
				var options = record.options || {};
				if (BetaJS.Types.is_function(options))
					options = options.apply(this, [this]);
				var default_options = domain_defaults[record.type] || {};
				if (BetaJS.Types.is_function(default_options))
					default_options = default_options.apply(this, [this]);
				options = BetaJS.Objs.tree_merge(default_options, options);
				if (record.type in BetaJS.Views)
					record.type = BetaJS.Views[record.type];
				if (BetaJS.Types.is_string(record.type))
					record.type = BetaJS.Scopes.resolve(record.type);
				var view = new record.type(options);
				this.ns[view_name] = view;
				var parent_options = record.parent_options || {};
				var parent = this;
				if (record.parent)
					parent = BetaJS.Scopes.resolve(record.parent, this.ns);
				if (record.method)
					record.method(parent, view)
				else
					parent.addChild(view, parent_options);
				view.domain = this;
				for (var event in record.events || {})
					view.on(event, record.events[event], view);
				for (var event in record.listeners || {})
					this.on(event, record.listeners[event], view);
			}		
		}
	},
	
	_domain: function () {
		return {};
	},
	
	_domain_defaults: function () {
		return {};
	},

	/** Returns whether this view is active (i.e. bound and rendered) 
	 * @return active  
	 */
	isActive: function () {
		return this.__active;
	},
	
	/** Activates view and all added sub views
	 *  
	 */
	activate: function () {
		if (this.isActive())
			return this;
		if (this.__el == null) 
			return null;
		if (this.__parent && !this.__parent.isActive())
			return null;
		if (this.__parent)
			this.$el = this.__el == "" ? this.__parent.$el : this.__parent.$(this.__el)
		else
			this.$el = BetaJS.$(this.__el);
		if (this.$el.size() == 0)
			this.$el = null;
		if (!this.$el)
			return null;
		if (this.__append_to_el) {
			this.$el.append("<div data-view-id='" + this.cid() + "'></div>");
			this.$el = this.$el.find("[data-view-id='" + this.cid() + "']");
		}
		this.__old_attributes = {};
		for (var key in this.__attributes) {
			var old_value = this.$el.attr(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_attributes[key] = old_value
			else
				this.__old_attributes[key] = null;
			this.$el.attr(key, this.__attributes[key]);
		}
		this.__added_el_classes = [];
		var new_el_classes = BetaJS.Objs.extend(this._el_classes(), this.__el_classes);
		for (var i = 0; i < new_el_classes.length; ++i)
			if (!this.$el.hasClass(new_el_classes[i])) {
				this.$el.addClass(new_el_classes[i]);
				this.__added_el_classes.push(new_el_classes[i]);
			}
		this.__old_el_styles = {};
		var new_el_styles = BetaJS.Objs.extend(this._el_styles(), this.__el_styles);
		for (var key in new_el_styles)  {
			var old_value = this.$el.css(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_el_styles[key] = old_value
			else
				this.__old_el_styles[key] = null;
			this.$el.css(key, new_el_styles[key]);
		}
		this.__bind();
		if (!this.__visible)
			this.$el.css("display", this.__visible ? "" : "none");
		this.__active = true;
		this.__render();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.activate();
		});
		this._notify("activate");
		this.trigger("activate");
		if (this.__visible)
			this.trigger("show");
		this.trigger("visibility", this.__visible);
		this.trigger("resize");
		return this;
	},
	
	/** Deactivates view and all added sub views
	 * 
	 */
	deactivate: function () {
		if (!this.isActive())
			return false;
		if (this.__visible)
			this.trigger("hide");
		this.trigger("visibility", false);
		this._notify("deactivate");
		this.trigger("deactivate");
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.deactivate();
		});
		this.__active = false;
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
		this.__unbind();
		this.$el.html("");
		for (var key in this.__old_attributes) 
			this.$el.attr(key, this.__old_attributes[key]);
		for (var i = 0; i < this.__added_el_classes.length; ++i)
			this.$el.removeClass(this.__added_el_classes[i]);
		for (var key in this.__old_el_styles) 
			this.$el.css(key, this.__old_el_styles[key]);
		if (this.__append_to_el)
			this.$el.remove();
		this.$el = null;
		return true;
	},
	
	/** Returns an associate array of styles that should be attached to the element
	 * @return styles
	 * @example
	 * return {"color": "red"};
	 * or
	 * var styles = {};
	 * styles.color = "red";
	 * return styles; 
	 */
	_el_styles: function () {
		return {};
	},
	
	/** Returns an array of classes that should be attached to the element
	 * @return classes
	 * @example
	 * return ["test-css-class"]
	 */
	_el_classes: function () {
		return [];
	},
	
	/** Finds an element within the container of the view
	 * @param selector a jquery selector
	 * @return the jquery element(s) it matched 
	 */
	$: function(selector) {
		return this.$el.find(selector);
	},
	
	/** Finds an element within a subelement that matches a set of data attributes
	 * 
	 * @param selectors associative array, e.g. {"selector": "container", "view-id": this.cid()}
	 * @param elem (optional, default is $el) the element we search in
	 * @return the jquery element(s) it matched
	 */
	$data: function(selectors, elem) {
		if (!elem)
			elem = this.$el
		var s = "";
		for (var key in selectors)
			s += "[data-" + key + "='" + selectors[key] + "']";
		return elem.find(s);
	},
	
	/** Destroys the view
	 * 
	 */
	destroy: function () {
		this.deactivate();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.destroy();
		});
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.destroy();
		}, this);
		BetaJS.Objs.iter(this.__templates, function (template) {
			template.destroy();
		}, this);
		this.trigger("destroy");
		this._inherited(BetaJS.Views.View, "destroy");
	},
	
	/** Makes the view visible
	 * 
	 */
	show: function () {
		this.setVisibility(true);
	},
	
	/** Makes the view invisible
	 * 
	 */
	hide: function () {
		this.setVisibility(false);
	},
	
	isVisible: function () {
		return this.__visible;
	},
	
	/** Sets the visibility of the view
	 * @param visible visibility
	 */
	setVisibility: function (visible) {
		if (visible == this.__visible)
			return;
		this.__visible = visible;
		if (this.isActive()) {
			this.$el.css("display", this.__visible ? "" : "none");
			if (this.__visible) {
				this.trigger("resize");
				if (this.__invalidate_on_show)
					this.invalidate();	
			}
			this.trigger(visible ? "show" : "hide");
			this.trigger("visibility", visible);		
		}
		if (this.__parent)
			this.__parent.updateChildVisibility(this);	
	},
	
	updateChildVisibility: function (child) {		
	},
	
	toggle: function () {
		this.setVisibility(!this.isVisible());
	},
	
	__bind: function () {
		var self = this;
		this.__unbind();
		BetaJS.Objs.iter(this.__events, function (obj) {
			BetaJS.Objs.iter(obj, function (value, key) {
				var func = BetaJS.Types.is_function(value) ? value : self[value];
		        var match = key.match(BetaJS.Views.BIND_EVENT_SPLITTER);
		        var event = match[1];
		        var selector = match[2];
		        event = event + ".events" + self.cid();
		        var method = BetaJS.Functions.as_method(func, self);
		        if (selector === '')
		        	self.$el.on(event, method);
		        else
		        	self.$el.on(event, selector, method);
			});
		});
		BetaJS.Objs.iter(this.__global_events, function (obj) {
			BetaJS.Objs.iter(obj, function (value, key) {
				var func = BetaJS.Types.is_function(value) ? value : self[value];
		        var match = key.match(BetaJS.Views.BIND_EVENT_SPLITTER);
		        var event = match[1];
		        var selector = match[2];
		        event = event + ".events" + self.cid();
		        var method = BetaJS.Functions.as_method(func, self);
		        if (selector === '')
		        	BetaJS.$(document).on(event, method);
		        else
		        	BetaJS.$(document).on(event, selector, method);
			});
		});
	},
	
	__unbind: function () {
		this.$el.off('.events' + this.cid());
		BetaJS.$(document).off('.events' + this.cid());
	},
	
	__render: function () {
		if (!this.isActive())
			return;
		this._render();
		var q = this.$el.children();
		if (!BetaJS.Types.is_empty(this.__children_styles))
			for (var key in this.__children_styles)
				q.css(key, this.__children_styles[key]);
		BetaJS.Objs.iter(this.__children_classes, function (cls) {
			q.addClass(cls);	
		});
	},
	
	/** Manually triggers rerendering of the view
	 * 
	 */
	invalidate: function () {
		if (!this.isActive())
			return;
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.deactivate();
		});
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
		this.__render();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.activate();
		});
	},
	
	/** Sets the container element of the view
	 * @param el new container element
 	 */
	setEl: function (el) {
		if (this.isActive()) {
			this.deactivate();
			this.__el = el;
			this.activate();
		}
		else
			this.__el = el;
	},
	
	/** Returns the parent view
	 * @return parent view
	 */
	getParent: function () {
		return this.__parent;
	},
	
	/** Checks whether a view has been added as a child
	 * 
 	 * @param child view in question
 	 * @return true if view has been added
	 */
	hasChild: function (child) {
		return child && child.cid() in this.__children;
	},
	
	/** Changes the parent view
	 * @param parent the new parent
	 */
	setParent: function (parent) {
		if (parent == this.__parent)
			return;
		this.deactivate();
		if (this.__parent) {
			this._unbindParent(this.__parent);
			var old_parent = this.__parent;
			this.__parent.off(null, null, this);
			this.__parent = null;
			old_parent.removeChild(this);
		}
		if (parent) {
			this.__parent = parent;
			parent.addChild(this);
			this._bindParent(parent);
			if (parent.isActive())
				this.activate();
		}
	},
	
	_bindParent: function () {		
	},

	_unbindParent: function () {		
	},
	
	/** Returns all child views
	 * @return array of child views 
	 */
	children: function () {
		var children = {};
		BetaJS.Objs.iter(this.__children, function (child, key) {
			children[key] = child.view;
		}, this);
		return children;
	},
	
	childOptions: function (child) {
		return this.__children[child.cid()].options;
	},
	
	/** Adds an array of child views
	 * 
 	 * @param children array of views
	 */
	addChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.addChild(child);
		}, this);
	},

	/** Adds a child view
	 * 
 	 * @param child view
	 */	
	addChild: function (child, options) {
		if (!this.hasChild(child)) {
			options = options || {};
			this.__children[child.cid()] = {
				view: child,
				options: options
			};
			this._notify("addChild", child, options);
			child.setParent(this);
			if (this.isActive() && this.isVisible())
				this.trigger("resize");
			return child;
		}
		return null;
	},
	
	/** Removes an array of child views
	 * 
 	 * @param children array of views
	 */
	removeChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.removeChild(child);
		}, this);
	},
	
	/** Removes a child view
	 * 
 	 * @param child view
	 */	
	removeChild: function (child) {
		if (this.hasChild(child)) {
			delete this.__children[child.cid()];
			child.setParent(null);
			child.off(null, null, this);
			this._notify("removeChild", child);
			if (this.isActive() && this.isVisible())
				this.trigger("resize");
		}
	},
	
	/** Returns the width (excluding margin, border, and padding) of the view
	 * @return width
	 */
	width: function () {
		return this.$el.width();
	},
	
	/** Returns the inner width (excluding margin, border, but including padding) of the view
	 * @return inner width
	 */
	innerWidth: function () {
		return this.$el.innerWidth();
	},

	/** Returns the outer width (including margin, border, and padding) of the view
	 * @return outer width
	 */
	outerWidth: function () {
		return this.$el.outerWidth();
	},

	/** Returns the height (excluding margin, border, and padding) of the view
	 * @return height
	 */
	height: function () {
		return this.$el.height();
	},
	
	/** Returns the inner height (excluding margin, border, but including padding) of the view
	 * @return inner height
	 */
	innerHeight: function () {
		return this.$el.innerHeight();
	},

	/** Returns the outer height (including margin, border, and padding) of the view
	 * @return outer height
	 */
	outerHeight: function () {
		return this.$el.outerHeight();
	}
	
}]);

BetaJS.Views.BIND_EVENT_SPLITTER = /^(\S+)\s*(.*)$/;

BetaJS.Class.extend("BetaJS.Views.DynamicTemplate", {
	
	constructor: function (parent, template_string) {
		this._inherited(BetaJS.Views.DynamicTemplate, "constructor");
		this.__parent = parent;
		this.__template = new BetaJS.Templates.Template(template_string);
		this.__instances = {};
		this.__instances_by_name = {};
	},
	
	reset: function () {
		BetaJS.Objs.iter(this.__instances, function (instance) {
			this.removeInstance(instance);
		}, this);
	},
	
	destroy: function () {
		this.reset();
		this._inherited(BetaJS.Views.DynamicTemplate, "destroy");
	},
	
	renderInstance: function (binder, options) {
		options = options || {};
		if (options["name"])
			this.removeInstanceByName(options["name"]);
		var instance = new BetaJS.Views.DynamicTemplateInstance(this, binder, options);
		this.__instances[instance.cid()] = instance;
		if (options["name"])
			this.__instances_by_name[name] = instance;
	},
	
	removeInstanceByName: function (name) {
		if (name in this.__instances_by_name)
			this.removeInstance(this.__instances_by_name[name]);
	},
	
	removeInstance: function (instance) {
		delete this.__instances[instance.cid()];
		delete this.__instances_by_name[instance.name()];
		instance.destroy();
	},
	
	view: function () {
		return this.__parent;
	},
	
	template: function () {
		return this.__template;
	}
	
});

BetaJS.Class.extend("BetaJS.Views.DynamicTemplateInstance", [
	BetaJS.Ids.ClientIdMixin,
	BetaJS.Events.ListenMixin, {
		
	__bind: {
		attr: function (attribute, variable) {
			return this.__context.__bind_attribute(attribute, variable);
		},
		attrs: function (attributes) {
			var s = "";
			for (attribute in attributes)
				s += this.attr(attribute, attributes[attribute]) + " ";
			return s;
		},
		value: function (variable) {
			return this.__context.__bind_value(variable);
		},
		inner: function (variable) {
			return this.__context.__bind_inner(variable);
		},
		css_if: function (css, variable) {
			return this.__context.__bind_css_if(css, variable, true);
		},
		css_if_not: function (css, variable) {
			return this.__context.__bind_css_if(css, variable, false);
		}
	},
	
	__new_element: function (base) {
		var id = BetaJS.Ids.uniqueId();
		this.__elements[id] = BetaJS.Objs.extend({
			id: id,
			$el: null
		}, base);
		return this.__elements[id];
	},
	
	__decompose_variable: function (variable) {
		var parts = variable.split(".");
		return {
			object: parts.length == 1 ? this.__parent.view() : this.__args[parts[0]],
			key: parts.length == 1 ? variable : parts[1]
		};
	},
	
	__get_variable: function (variable) {
		var dec = this.__decompose_variable(variable);
		return dec.object.get(dec.key);
	},
	
	__set_variable: function (variable, value) {
		var dec = this.__decompose_variable(variable);
		return dec.object.set(dec.key, value);
	},

	__update_element: function (element) {
		var value = this.__get_variable(element.variable);
		if (element.type == "inner")
			element.$el.html(value)
		else if (element.type == "value") {
			if (element.$el.val() != value)
				element.$el.val(value);
		} else if (element.type == "attribute")
			element.$el.attr(element.attribute, value)
		else if (element.type == "css") {
			if (!element.positive)
				value = !value;
			if (value)
				element.$el.addClass(this.__parent.view().css(element.css))
			else
				element.$el.removeClass(this.__parent.view().css(element.css));
		};
	},
	
	__prepare_element: function (element) {
		var self = this;
		element.$el = this.$el.find(element.selector);
		if (element.type == "inner" || element.type == "css")
			this.__update_element(element);
		else if (element.type == "value")
			element.$el.on("change input keyup paste", function () {
				self.__set_variable(element.variable, element.$el.val());
			});
	},
	
	__bind_attribute: function (attribute, variable) {
		var element = this.__new_element({
			type: "attribute",
			attribute: attribute,
			variable: variable
		});
		var selector = "data-bind-" + attribute + "='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector + " " + attribute + "='" + dec.object.get(dec.key) + "'";
	},
	
	__bind_css_if: function (css, variable, positive) {
		var element = this.__new_element({
			type: "css",
			css: css,
			variable: variable,
			positive: positive
		});
		var selector = "data-bind-css-" + css + "='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector;
	},
	
	__bind_value: function (variable) {
		var element = this.__new_element({
			type: "value",
			variable: variable
		});
		var selector = "data-bind-value='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector + " value='" + dec.object.get(dec.key) + "'";
	},

	__bind_inner: function (variable) {
		var element = this.__new_element({
			type: "inner",
			variable: variable
		});
		var selector = "data-bind-inner='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector;
	},

	constructor: function (parent, binder, options) {
		this._inherited(BetaJS.Views.DynamicTemplateInstance, "constructor");
		this.__elements = {};
		this.__inners = {};
		options = options || {};
		if (options["name"])
			this.__name = name;
		this.__parent = parent;
		this.$el = binder;
		this.__args = BetaJS.Objs.extend(options["args"] || {}, this.__parent.view().templateArguments());
		this.__args.bind = BetaJS.Objs.extend({__context: this}, this.__bind);
		this.$el.html(parent.template().evaluate(this.__args));
		BetaJS.Objs.iter(this.__elements, function (element) { this.__prepare_element(element); }, this);
	},
	
	destroy: function () {
		BetaJS.Objs.iter(this.__elements, function (element) {
			element.$el.off();
		}, this);
		this._inherited(BetaJS.Views.DynamicTemplateInstance, "destroy");
	},
	
	name: function () {
		return this.__name;
	}
	
}]);

BetaJS.Classes.Module.extend("BetaJS.Views.Modules.Centering", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.Modules.Centering, "constructor", options);
		this.__vertical = "vertical" in options ? options.vertical : false;
		this.__horizontal = "horizontal" in options ? options.horizontal : false;
	},
	
	_register: function (object, data) {
		object.on("resize", function () {
			if (object.isVisible())
				this.__update(object);
		}, this);
		if (object.isActive() && object.isVisible())
			this.__update(object);
	},
	
	__update: function (object) {
		if (this.__vertical) {
			object.$el.css("top", "50%");
			object.$el.css("margin-top", Math.round(-object.$el.height() / 2) + "px");
		}
		if (this.__horizontal) {
			object.$el.css("left", "50%");
			object.$el.css("margin-left", Math.round(-object.$el.width() / 2) + "px");
		}
	}
	
}, {
	
	__vertical: null,
	
	vertical: function () {
		if (!this.__vertical)
			this.__vertical = new this({auto_destroy: false, vertical: true, horizontal: false});
		return this.__vertical;
	},
	
	__horizontal: null,
	
	horizontal: function () {
		if (!this.__horizontal)
			this.__horizontal = new this({auto_destroy: false, horizontal: true, vertical: false});
		return this.__horizontal;
	},
	
	__both: null,
	
	both: function () {
		if (!this.__both)
			this.__both = new this({auto_destroy: false, vertical: true, horizontal: true});
		return this.__both;
	}
	
});

BetaJS.Classes.Module.extend("BetaJS.Views.Modules.BindOnActivate", {
	
	_register: function (object, data) {
		data.bound = false;
		object.on("activate", function () { this.__bind(object); }, this);
		object.on("deactivate", function () { this.__unbind(object); }, this);
		if (object.isActive())
			this.__bind(object);
	},
	
	_unregister: function (object, data) {
		this.__unbind(object);
	},
	
	__bind: function (object) {
		var data = this._data(object);
		if (data.bound)
			return;
		this._bind(object, data);
		data.bound = true;
	},
	
	__unbind: function (object) {
		var data = this._data(object);
		if (!data.bound)
			return;
		this._unbind(object, data);
		data.bound = false;
	},
	
	_bind: function (object, data) {},
	
	_unbind: function (object, data) {}
	
});

BetaJS.Classes.Module.extend("BetaJS.Views.Modules.BindOnVisible", {
	
	_register: function (object, data) {
		data.bound = false;
		object.on("visibility", function (visible) {
			if (visible)
				this.__bind(object)
			else
				this.__unbind(object);
		}, this);
		if (object.isActive() && object.isVisible())
			this.__bind(object);
	},
	
	_unregister: function (object, data) {
		this.__unbind(object);
	},
	
	__bind: function (object) {
		var data = this._data(object);
		if (data.bound)
			return;
		this._bind(object, data);
		data.bound = true;
	},
	
	__unbind: function (object) {
		var data = this._data(object);
		if (!data.bound)
			return;
		this._unbind(object, data);
		data.bound = false;
	},
	
	_bind: function (object, data) {},
	
	_unbind: function (object, data) {}
	
});

BetaJS.Views.Modules.BindOnVisible.extend("BetaJS.Views.Modules.HideOnLeave", {
		
	_bind: function (object, data) {
		var el = object.$el.get(0);
		data.hide_on_leave_func = function (e) {
			if (data.hide_on_leave_skip) {
				data.hide_on_leave_skip = false;
				return;
			}
			if (document.contains(e.target) && e.target !== el && !BetaJS.$.contains(el, e.target))
				object.hide();
		};
		data.hide_on_leave_skip = true;
		BetaJS.$(document.body).on("click", data.hide_on_leave_func);
	},
	
	_unbind: function (object, data) {
		BetaJS.$(document.body).unbind("click", data.hide_on_leave_func);
	}
	
});

BetaJS.Views.Modules.BindOnActivate.extend("BetaJS.Views.Modules.Hotkeys", {
		
	constructor: function (options) {
		this._inherited(BetaJS.Views.Modules.Hotkeys, "constructor", options);
		this.__hotkeys = options.hotkeys;
	},

	_bind: function (object, data) {
		data.hotkeys = {};
		BetaJS.Objs.iter(this.__hotkeys, function (f, hotkey) {
			data.hotkeys[hotkey] = BetaJS.Browser.Hotkeys.register(hotkey, BetaJS.Types.is_function(f) ? f : object[f], object); 
		}, this);
	},
	
	_unbind: function (object, data) {
		BetaJS.Objs.iter(data.hotkeys, function (handle) {
			BetaJS.Browser.Hotkeys.unregister(handle);
		}, this);
		data.hotkeys = {};
	}
	
});
BetaJS.Templates.Cached = BetaJS.Templates.Cached || {};
BetaJS.Templates.Cached['holygrail-view-template'] = '  <div data-selector="right" class=\'holygrail-view-right-container\'></div>  <div data-selector="left" class=\'holygrail-view-left-container\'></div>  <div data-selector="center" class=\'holygrail-view-center-container\'></div> ';

BetaJS.Templates.Cached['list-container-view-item-template'] = '  <{%= container_element %} data-view-id="{%= cid %}"></{%= container_element %}> ';

BetaJS.Templates.Cached['switch-container-view-item-template'] = '  <div data-view-id="{%= cid %}" class="switch-container" data-selector="switch-container-item"></div> ';

BetaJS.Templates.Cached['button-view-template'] = '   <{%= button_container_element %} data-selector="button-inner" class="{%= supp.css("default") %}"    {%= bind.css_if("disabled", "disabled") %}    {%= bind.css_if("selected", "selected") %}    {%= bind.inner("label") %}>   </{%= button_container_element %}>  ';

BetaJS.Templates.Cached['check-box-view-template'] = '  <input type="checkbox" {%= checked ? "checked" : "" %} id="check-{%= supp.view_id %}" />  <label for="check-{%= supp.view_id %}">{%= label %}</label> ';

BetaJS.Templates.Cached['input-view-template'] = '  <input class="input-view" type="{%= input_type %}" {%= bind.value("value") %} {%= bind.attr("placeholder", "placeholder") %} /> ';

BetaJS.Templates.Cached['label-view-template'] = '  <{%= element %} class="{%= supp.css(\'label\') %}" {%= bind.inner("label") %}></{%= element %}> ';

BetaJS.Templates.Cached['link-view-template'] = '  <a href="javascript:{}" {%= bind.inner("label") %}></a> ';

BetaJS.Templates.Cached['text-area-template'] = '   <textarea {%= bind.value("value") %} {%= bind.attr("placeholder", "placeholder") %}             {%= bind.css_if_not("text-area-no-resize", "resizable") %}             {%= readonly ? \'readonly\' : \'\' %}             style="resize: {%= horizontal_resize ? (vertical_resize ? \'both\' : \'horizontal\') : (vertical_resize ? \'vertical\' : \'none\') %}"             {%= bind.css_if("text-area-horizontal-fill", "horizontal_fill") %}></textarea>  ';

BetaJS.Templates.Cached['progress-template'] = '  <div class="{%= supp.css(\'outer\') %}">   <div data-selector="inner" class="{%= supp.css(\'inner\') %}" style="{%= horizontal ? \'width\': \'height\' %}:{%= value*100 %}%">   </div>   <div class="progress-view-overlay" data-selector="label">    {%= label %}   </div>  </div> ';

BetaJS.Templates.Cached['list-view-template'] = '   <{%= list_container_element %}    {%= supp.attrs(list_container_attrs) %}    class="{%= list_container_classes %}"    data-selector="list">   </{%= list_container_element %}>  ';
BetaJS.Templates.Cached['list-view-item-container-template'] = '   <{%= item_container_element %}    {%= supp.attrs(item_container_attrs) %}    class="{%= item_container_classes %}"    {%= supp.list_item_attr(item) %}>   </{%= item_container_element %}>  ';

BetaJS.Templates.Cached['overlay-view-template'] = '  <div data-selector="container"></div> ';

BetaJS.Templates.Cached['fullscreen-overlay-view-template'] = '  <div class="fullscreen-overlay-background" data-selector="outer"></div>  <div class="fullscreen-overlay" data-selector="inner"></div> ';

BetaJS.Views.View.extend("BetaJS.Views.HolygrailView", {
	_templates: {
		"default": BetaJS.Templates.Cached["holygrail-view-template"]
	},
	constructor: function (options) {
		this._inherited(BetaJS.Views.HolygrailView, "constructor", options);
		this.__left = null;
		this.__center = null;
		this.__right = null;
	},
	getLeft: function () {
		return this.__left;
	},
	setLeft: function (view) {
		return this.__setView("left", view);
	},
	getCenter: function () {
		return this.__center;
	},
	setCenter: function (view) {
		return this.__setView("center", view);
	},
	getRight: function () {
		return this.__right;
	},
	setRight: function (view) {
		return this.__setView("right", view);
	},
	__setView: function(key, view) {
		// Remove old child in case we had one
		this.removeChild(this["__" + key]);
		// Set old child attribute to null
		this["__" + key] = null;
		// If we have a new view (i.e. set view was not called with null)
		if (view) {
			// bind new view to selector
			view.setEl('[data-selector="' + key + '"]');
			// store new view as child attribute and add the view
			this["__" + key] = this.addChild(view);
		}
		return view;
	}
});
BetaJS.Views.View.extend("BetaJS.Views.ListContainerView", {
	
	_templates: {
		"item": BetaJS.Templates.Cached["list-container-view-item-template"]
	},
	
	_notifications: {
		"addChild": "__addChildContainer",
		"removeChild": "__removeChildContainer"
	},
	
	constructor: function (options) {
		options = options || {};
		this._inherited(BetaJS.Views.ListContainerView, "constructor", options);
		this._setOption(options, "alignment", "horizontal");
		this._setOption(options, "positioning", "float"); // float, computed, none
		this._setOption(options, "container_element", "div");
		this.on("show", function () {
			if (this.__positioning == "computed")
				this.__updatePositioning();
		}, this);
	},
	
	isHorizontal: function () {
		return this.__alignment == "horizontal";
	},
	
	_render: function () {
		this.$el.html("");
		BetaJS.Objs.iter(this.children(), function (child) {
			this.__addChildContainer(child);
		}, this);
	},
	
	__addChildContainer: function (child) {
		var options = this.childOptions(child);
		if (this.isActive())
			this.$el.append(this.evaluateTemplate("item", {cid: child.cid(), container_element: this.__container_element}));
		child.setEl("[data-view-id='" + child.cid() + "']");
		if (this.isHorizontal() && !("float" in options) && this.__positioning == "float")
			options["float"] = "left";
		if (this.isActive() && "float" in options && this.__positioning == "float") {
			var container = this.$("[data-view-id='" + child.cid() + "']");
			container.css("float", options["float"]);
		}			
	},
	
	__removeChildContainer: function (child) {
		this.$data({"view-id": child.cid()}).remove();
	},
	
	__updatePositioningHelper: function (arr, pos_string, size_string) {
		var pos = 0;
		BetaJS.Objs.iter(arr, function (child) {
			var opts = this.childOptions(child);
			if (!(opts['type'] && opts['type'] == 'ignore')) {
				child.$el.css(pos_string, pos + 'px');
				if (child.isVisible())
					pos += parseInt(child.$el.css(size_string));
				if (opts['type'] && opts['type'] == 'dynamic')
					return false;
			}
		}, this);
	},
	
	__updatePositioning: function () {
		var ltr = BetaJS.Objs.values(this.children());
		var rtl = BetaJS.Objs.clone(ltr, 1).reverse();
		var left_string = this.isHorizontal() ? "left" : "top";
		var right_string = this.isHorizontal() ? "right" : "bottom";
		var width_string = this.isHorizontal() ? "width" : "height";
		this.__updatePositioningHelper(rtl, right_string, width_string);
		this.__updatePositioningHelper(ltr, left_string, width_string);
	},

	updateChildVisibility: function (child) {
		this._inherited(BetaJS.Views.ListContainerView, "updateChildVisibility", child);
		if (this.__positioning == "computed")
			this.__updatePositioning();
	}
	
	
});
BetaJS.Views.View.extend("BetaJS.Views.SingleContainerView", {
	constructor: function (options) {
		this._inherited(BetaJS.Views.SingleContainerView, "constructor", options);
		this.__view = null;
	},
	getView: function () {
		return this.__view;
	},
	setView: function(view) {
		this.removeChild(this.__view);
		if (view) {
			view.setEl("");
			this.__view = this.addChild(view);
		}
		return view;
	}
});
BetaJS.Views.View.extend("BetaJS.Views.SwitchContainerView", {
	
	_templates: {
		"item": BetaJS.Templates.Cached["switch-container-view-item-template"]
	},
	
	_notifications: {
		"addChild": "__addChildContainer",
		"removeChild": "__removeChildContainer"
	},
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.SwitchContainerView, "constructor", options);
		this.__selected = null;
	},

	_render: function () {
		this.$el.html("");
		BetaJS.Objs.iter(this.children(), function (child) {
			this.__addChildContainer(child);
		}, this);
	
	},
	
	__addChildContainer: function (child) {
		if (this.isActive())
			this.$el.append(this.evaluateTemplate("item", {cid: child.cid()}));
		child.setEl("[data-view-id='" + child.cid() + "']");
		this.__selected = this.__selected || child;
		child.setVisibility(this.__selected == child);
	},
	
	__removeChildContainer: function (child) {
		this.$data({"view-id": child.cid()}).remove();
		if (this.__selected == child)
			this.__selected = null;
	},
	
	select: function (child) {
		this.__selected = child;
		BetaJS.Objs.iter(this.children(), function (child) {
			child.setVisibility(this.__selected == child);
		}, this);
	},
	
	selected: function () {
		return this.__selected;
	}
	
});
BetaJS.Views.View.extend("BetaJS.Views.ButtonView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["button-view-template"]
	},
	_css: function () {
		return {
			"disabled": "",
			"default": "",
			"selected": ""
		};
	},
	constructor: function(options) {
		options = options || {};
		this._inherited(BetaJS.Views.ButtonView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "button_container_element", "button");
		this._setOptionProperty(options, "disabled", false);
		this._setOptionProperty(options, "selected", false);
		this._setOption(options, "selectable", false);
		this._setOption(options, "deselect_all", false);
		if (options.hotkey) {
			var hotkeys = {};
			hotkeys[options.hotkey] = function () {
				this.click();
			};
			this.add_module(new BetaJS.Views.Modules.Hotkeys({hotkeys: hotkeys}));
		}
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click [data-selector='button-inner']": "click"
		}]);
	},
	click: function () {
		if (!this.get("disabled")) {
			if (this.__selectable)
				this.select();
			this.trigger("click");
		}
	},
	_bindParent: function (parent) {
		parent.on("select", function () {
			this.unselect();
		}, this);
	},
	
	_unbindParent: function (parent) {
		parent.off("select", this);
	},
	
	select: function () {
		if (!this.__selectable)
			return;
		this.getParent().trigger("select", this);
		this.set("selected", true);
	},
	
	unselect: function () {
		if (!this.__selectable)
			return;
		this.set("selected", false);
	},
	
	isSelected: function () {
		return this.get("selected");
	}
});
BetaJS.Views.View.extend("BetaJS.Views.CheckBoxView", {
	_templates: {
		"default": BetaJS.Templates.Cached["check-box-view-template"]
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click input": "__click"
		}]);
	},
	constructor: function(options) {
		options = options || {};
		options["invalidate_on_change"] = true;
		this._inherited(BetaJS.Views.CheckBoxView, "constructor", options);
		this._setOptionProperty(options, "checked", false);
		this._setOptionProperty(options, "label", "");
	},
	__click: function () {
		this.set("checked", this.$("input").is(":checked"));
		this.trigger("check", this.get("checked"));
	}
});
BetaJS.Views.SwitchContainerView.extend("BetaJS.Views.InputLabelView", {

	constructor: function(options) {
		this._inherited(BetaJS.Views.InputLabelView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
		this._setOption(options, "edit_on_click", true);
		this._setOption(options, "label_mode", true);
		this._setOption(options, "read_only", false);
		this.label = this.addChild(new BetaJS.Views.LabelView({
			label: this.binding("value"),
			el_classes: options["label_el_classes"],
			children_classes: options["label_children_classes"]
		}));
		this.input = this.addChild(new BetaJS.Views.InputView({
			value: this.binding("value"),
			placeholder: this.binding("placeholder")
		}));
		if (!this.__label_mode)
			this.select(this.input);
		this.input.on("leave enter_key", function () {
			this.label_mode();
		}, this);
		if (this.__edit_on_click)
			this.label.on("click", function () {
				this.edit_mode();
			}, this);
	},
	
	is_label_mode: function () {
		return this.__label_mode;
	},
	
	is_edit_mode: function () {
		return !this.__label_mode;
	},

	label_mode: function () {
		if (this.is_label_mode())
			return;
		this.__label_mode = true;
		this.select(this.label);		
	},
	
	edit_mode: function () {
		if (this.is_edit_mode() || this.__read_only)
			return;
		this.__label_mode = false;
		this.select(this.input);
		this.input.focus(true);
	}

});
BetaJS.Views.View.extend("BetaJS.Views.InputView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["input-view-template"]
	},
	_events: function () {
		return [{
			"blur input": "__leaveEvent",
			"keyup input": "__changeEvent",
			"change input": "__changeEvent",
			"input input": "__changeEvent",
			"paste input": "__changeEvent"
		}, {
			"keyup input": "__keyupEvent"
		}];
	},
	constructor: function(options) {
		options = options || {};
		this._inherited(BetaJS.Views.InputView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");	
		this._setOptionProperty(options, "input_type", "text");
	},
	__keyupEvent: function (e) {
		var key = e.keyCode || e.which;
        if (key == 13)
			this.trigger("enter_key", this.get("value"));
    },
	__leaveEvent: function () {
		this.trigger("leave");
	},
	__changeEvent: function () {
		this.trigger("change", this.get("value"));
	},
	focus: function (select_all) {
		this.$("input").focus();
		this.$("input").focus();
		if (select_all)
			this.$("input").select();
	}
});
BetaJS.Views.View.extend("BetaJS.Views.LabelView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["label-view-template"]
	},
	_css: function () {
		return {"label": "label-view-class"};
	},
	_events: function () {
		return [{
			"click": "__clickEvent"	
		}];
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.LabelView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "element", "span");
	},
	__clickEvent: function () {
		this.trigger("click");
	}
});
BetaJS.Views.View.extend("BetaJS.Views.LinkView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["link-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.LinkView, "constructor", options);
		this._setOptionProperty(options, "label", "");
	},
	_events: function () {
		return this._inherited(BetaJS.Views.LinkView, "_events").concat([{
			"click a": "__click"
		}]);
	},
	__click: function () {
		this.trigger("click");
	}
});
BetaJS.Views.View.extend("BetaJS.Views.ProgressView", {
	_templates: {
		"default": BetaJS.Templates.Cached["progress-template"]
	},
	
	_css: function () {
		return {
			outer: "",
			inner: ""
		};
	},
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ProgressView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "horizontal", true);
		this._setOptionProperty(options, "value", 1);
		this.on("change:value", function (value) {
			if (this.isActive())
				this.$("[data-selector='inner']").css(this.get("horizontal") ? 'width' : 'height', (value * 100) + "%");
		}, this);
		this.on("change:label", function (label) {
			if (this.isActive())
				this.$("[data-selector='label']").html(label);
		}, this);
	}
	
});

BetaJS.Views.View.extend("BetaJS.Views.TextAreaView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["text-area-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.TextAreaView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
		this._setOptionProperty(options, "horizontal_resize", false);
		this._setOptionProperty(options, "vertical_resize", true);
		this._setOptionProperty(options, "horizontal_fill", false);
		this._setOptionProperty(options, "readonly", false);
		this.on("change:readonly", function () {
			if (this.get("readonly"))
				this.$("textarea").attr("readonly", "readonly");
			else
				this.$("textarea").removeAttr("readonly");
		}, this);
	}
});
BetaJS.Views.View.extend("BetaJS.Views.CustomListView", {
	
	_templates: function () {
		return {
			"default": BetaJS.Templates.Cached["list-view-template"],
			"item-container": BetaJS.Templates.Cached["list-view-item-container-template"]
		};
	},
	
	_supp: function () {
		return BetaJS.Objs.extend(this._inherited(BetaJS.Views.CustomListView, "_supp"), {
			list_item_attr: function (item) {
				return this.attrs({
					"data-view-id": this.__context.cid(),
					"data-cid": BetaJS.Ids.objectId(item),
					"data-index": this.__context.__collection.getIndex(item)
				});
			}
		});
	},
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.CustomListView, "constructor", options);
		this._setOption(options, "list_container_element", "ul");
		this._setOption(options, "list_container_attrs", {});
		this._setOption(options, "list_container_classes", "");
		this._setOption(options, "item_container_element", "li");
		this._setOption(options, "item_container_classes", "");
		this.__itemData = {};
		if ("collection" in options) {
			this.__collection = options.collection;
			this.__destroy_collection = "destroy_collection" in options ? options.destroy_collection : false;
			if ("compare" in options)
				this.__collection.set_compare(options["compare"]);
		} else {
			var col_options = {};
			if ("objects" in options) 
				col_options["objects"] = options["objects"];
			if ("compare" in options) 
				col_options["compare"] = options["compare"];
			this.__collection = new BetaJS.Collections.Collection(col_options);
			this.__destroy_collection = true;
		}
		this.__collection.on("add", function (item) {
			this.__addItem(item, true);
		}, this);
		this.__collection.on("remove", function (item) {
			this.__removeItem(item);
		}, this);
		this.__collection.on("change", function (item) {
			this.__changeItem(item);
		}, this);
		this.__collection.on("index", function (item, index) {
			this.__updateItemIndex(item, index);
		}, this);
		this.__collection.on("reindexed", function (item) {
			this.__reIndexItem(item);
		}, this);
		this.__collection.on("sorted", function () {
			this.__sorted();
		}, this);
	},
	
	destroy: function () {
		for (var key in this.__itemData)
			this._destroyItemData(this.__itemData[key]);
		this.__itemData = null;
		this.__collection.off(null, null, this);
		if (this.__destroy_collection)
			this.__collection.destroy();
		this._inherited(BetaJS.Views.CustomListView, "destroy");
	},
	
	collection: function () {
		return this.__collection;
	},
	
	add: function (item) {
		this.__collection.add(item);						
	},
	
	remove: function (item) {
		this.__collection.remove(item);
	},
	
	_render: function () {
		this.$selector_list = this._renderListContainer();
		var self = this;
		this.__collection.iterate(function (item) {
			self.__addItem(item, false);
		});
	},
	
	_renderListContainer: function () {
		this.$el.html(this.evaluateTemplate("default", {
			list_container_element: this.__list_container_element,
			list_container_attrs: this.__list_container_attrs,
			list_container_classes: this.__list_container_classes
		}));
		return this.$data({"selector": "list"});
	},

	_findItemElement: function (item) {
		return this.$data({
			"view-id": this.cid(),
			"cid": BetaJS.Ids.objectId(item)
		}, this.$selector_list);
	},
	
	_findIndexElement: function (index) {
		return this.$data({
			"view-id": this.cid(),
			"index": index
		}, this.$selector_list);
	},

	__changeItem: function (item) {
		if (!this.isActive())
			return;
		this._changeItem(item);
	},
	
	_newItemData: function (item) {
		return {};
	},
	
	_destroyItemData: function (data) {
	},
	
	itemData: function (item) {
		return this.__itemData[BetaJS.Ids.objectId(item)];
	},

	_changeItem: function (item) {},

	__addItem: function (item, is_new_item) {
		if (!this.isActive())
			return;
		var container = this.evaluateTemplate("item-container", {
			item: item,
			item_container_element: this.__item_container_element, 
			item_container_attrs: this.__item_container_attrs,
			item_container_classes: this.__item_container_classes			
		});
		var index = this.__collection.getIndex(item);
		if (index == 0)
			this.$selector_list.prepend(container)
		else {
			var before = this._findIndexElement(index - 1);
			if (before.length > 0) 
				before.after(container)
			else {
				var after = this._findIndexElement(index + 1);
				if (after.length > 0)
					after.before(container)
				else
					this.$selector_list.append(container);
			}
		}
		var element = this._findItemElement(item);
		if (this.__itemData[BetaJS.Ids.objectId(item)])
			this._destroyItemData(this.__itemData[BetaJS.Ids.objectId(item)]);
		this.__itemData[BetaJS.Ids.objectId(item)] = this._newItemData(item);
		this._addItem(item, element, is_new_item);
		this._addElement(element, is_new_item);
	},
	
	_addElement: function (element, is_new_item) {},
	
	_addItem: function (item, element, is_new_item) {},
	
	__removeItem: function (item) {
		if (!this.isActive())
			return;
		var element = this._findItemElement(item);
		this._removeItem(item, element);
		this._destroyItemData(this.__itemData[BetaJS.Ids.objectId(item)]);
		delete this.__itemData[BetaJS.Ids.objectId(item)];
		this._removeElement(element);
	},
	
	_removeElement: function (element) {
		element.remove();
	},
	
	_removeItem: function (item, element) {},

	__updateItemIndex: function (item, index) {
		var element = this._findItemElement(item);
		element.attr("data-index", index);
		this._updateItemIndex(item, element);
	},

	__reIndexItem: function (item) {
		var element = this._findItemElement(item);
		var index = this.collection().getIndex(item);
		if (index == 0)
			this.$selector_list.prepend(element)
		else {
			var before = this._findIndexElement(index - 1);
			before.after(element);
		}
	},
	
	_updateItemIndex: function (item, index) {},
	
	__sort: function () {
		for (var index = this.collection().count() - 1; index >= 0; index--)
			this.$selector_list.prepend(this._findIndexElement(index));
	}
	
});



BetaJS.Views.CustomListView.extend("BetaJS.Views.ListView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ListView, "constructor", options);
		this._setOption(options, "item_label", "label");
		this._setOption(options, "render_item_on_change", this.dynamics("item") == null);
	},
	
	_changeItem: function (item) {
		if (this.__render_item_on_change) {
			var element = this._findItemElement(item);
			this._renderItem(item, element, false);
		}
	},
	
	_addItem: function (item, element, is_new_item) {
		this._renderItem(item, element, is_new_item);
	},
	
	_renderItem: function (item, element, is_new_item) {
		if (this.templates("item") != null)
			element.html(this.evaluateTemplate("item", {item: item}))
		else if (this.dynamics("item") != null)
			this.evaluateDynamics("item", element, {item: item}, {name: "item-" + BetaJS.Ids.objectId(item)})
		else
			element.html(item.get(this.__item_label)); 
	},
	
	_removeItem: function (item, element) {
		if (this.dynamics("item") != null)
			this.dynamics("item").removeInstanceByName("item-" + BetaJS.Ids.objectId(item));
	}
	
});


BetaJS.Views.CustomListView.extend("BetaJS.Views.SubViewListView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.SubViewListView, "constructor", options);
		if ("create_view" in options)
			this._create_view = options["create_view"];
		this._setOption(options, "sub_view", BetaJS.Views.LabelView);
		this._setOption(options, "item_label", "label");
		var self = this;
		this._setOption(options, "sub_view_options", function (item) {
			return {
				label: item.binding(self.__item_label)
			};
		});
	},
	
	_create_view: function (item, element) {
		var options = this.__sub_view_options(item);
		options.el = element;
		return new this.__sub_view(options);
	},
	
	_addItem: function (item, element, is_new_item) {
		var view = this._create_view(item, element); 
		this.itemData(item).view = view;
		this.addChild(view);
	},
	
	_destroyItemData: function (data) {
		this.removeChild(data.view);
		data.view.destroy();
	}
	
});
BetaJS.Views.View.extend("BetaJS.Views.ItemListItemView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ItemListItemView, "constructor", options);
		this._setOptionProperty(options, "item", null);
		this._setOptionProperty(options, "_selected", false);
	},
	
	_events: function () {
		return [{
			"click": "__click"
		}];
	},
	
	isSelected: function () {
		return this.get("_selected");
	},
	
	__click: function () {
		if (this.getParent() && this.getParent().__click_select)
			this.select();
	},
	
	select: function () {
		this.getParent().select(this.get("item"));
	},
	
	unselect: function () {
		this.getParent().unselect(this.get("item"));
	}

});

BetaJS.Views.CustomListView.extend("BetaJS.Views.ItemListView", {
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ItemListView, "constructor", options);
		this._setOption(options, "sub_view", BetaJS.Views.ItemListItemView);
		if (!this._sub_view_options)
			this._sub_view_options = {};
		if (this._sub_view_options) {
			if (!BetaJS.Types.is_function(this._sub_view_options)) {
				var svo = this._sub_view_options;
				this._sub_view_options = function (item) {
					return svo;
				};
			}
		};
		if (options.sub_view_options) {
			if (!BetaJS.Types.is_function(options.sub_view_options)) {
				var svo = options.sub_view_options;
				options.sub_view_options = function (item) {
					return svo;
				};
			}
			this.__sub_view_options = options.sub_view_options;
			var self = this;
			if (this._sub_view_options)
				this.__sub_view_options = function (item) {
					return BetaJS.Objs.extend(self._sub_view_options(item), options.sub_view_options(item));
				};
		}
		else
			this.__sub_view_options = this._sub_view_options;
		this._setOption(options, "selectable", true);
		this._setOption(options, "multi_select", false);
		this._setOption(options, "click_select", true);
	},
	
	_addItem: function (item, element, is_new_item) {
		var view = new this.__sub_view(BetaJS.Objs.extend({
			el: element,
			item: item
		}, this.__sub_view_options(item)));
		this.itemData(item).view = view;
		this.addChild(view);
	},
	
	_destroyItemData: function (data) {
		this.removeChild(data.view);
		data.view.destroy();
	},
	
	isSelected: function (item) {
		return this.itemData(item).view.get("_selected");
	},
	
	select: function (item) {
		if (!this.itemData(item))
			return;
		var self = this;
		if (this.__selectable && !this.isSelected(item)) {
			if (!this.__multi_select)
				this.collection().iterate(function (object) {
					self.unselect(object);
				});
			this.itemData(item).view.set("_selected", true);
			this.trigger("select", item);
		}
		return this.itemData(item).view;
	},
	
	unselect: function (item) {
		if (this.__selectable && this.isSelected(item)) {
			this.itemData(item).view.set("_selected", false);
			this.trigger("unselect", item);
		}
		return this.itemData(item).view;
	}
	
});
BetaJS.Views.View.extend("BetaJS.Views.OverlayView", {
	
	_templates: {
		"default": BetaJS.Templates.Cached["overlay-view-template"]
	},

	/*
	 * overlay_inner (optional) : sub view to be bound to the overlay
	 * 
	 * anchor: "none" | "absolute" | "element" | "relative"
     *
	 * overlay_left
	 * overlay_top
     *
	 * overlay_align_vertical: "top" | "center" | "bottom"
	 * overlay_align_horizontal: "left" | "center" | "right"
	 *
	 * element-align-vertical: "top" | "center" | "bottom"
	 * element-align-horizontal: "left" | "center" | "right"
     *
	 * element
	 */
	constructor: function (options) {
		options = options || {};
		options.anchor = options.anchor || "absolute";
		//options.hide_on_leave = "hide_on_leave" in options ? options.hide_on_leave : true;
		options.visible = "visible" in options ? options.visible : false;
		options.children_classes = options.children_classes || [];
		if (BetaJS.Types.is_string(options.children_classes))
			options.children_classes = options.children_classes.split(" ");
		options.children_classes.push("overlay-container-class");
		this._inherited(BetaJS.Views.OverlayView, "constructor", options);
		this._setOption(options, "anchor", "none");
		this._setOption(options, "element", "");
		this._setOption(options, "overlay_left", 0);
		this._setOption(options, "overlay_top", 0);
		this._setOption(options, "overlay_align_vertical", "top");
		this._setOption(options, "overlay_align_horizontal", "left");
		this._setOption(options, "element_align_vertical", "bottom");
		this._setOption(options, "element_align_horizontal", "left");
		if (options.overlay_inner) {
			options.overlay_inner.setEl('[data-selector="container"]');
			this.overlay_inner = this.addChild(options.overlay_inner);
		}
		if (!("hide_on_leave" in options) || options.hide_on_leave)
			this.add_module(BetaJS.Views.Modules.HideOnLeave.singleton());
		this.on("show", this._after_show, this);
	},
	
	_after_show: function () {	
		if (this.__anchor == "none")
			return;
		var overlay = this.$(".overlay-container-class");
		var width = overlay.outerWidth();
		var height = overlay.outerHeight();

		var left = this.__overlay_left;
		var top = this.__overlay_top;
		
		if (this.__overlay_align_vertical == "bottom")
			top -= height
		else if (this.__overlay_align_vertical == "center")
			top -= Math.round(height/2);

		if (this.__overlay_align_horizontal == "right")
			left -= width
		else if (this.__overlay_align_horizontal == "center")
			left -= Math.round(width/2);
			
		var element = this.$el;
		if (this.__anchor == "element" && this.__element) {
			element = this.__element;
			if (BetaJS.Types.is_string(element))
				element = BetaJS.$(element)
			else if (BetaJS.Class.is_class_instance(element))
				element = element.$el;
		}
		if (this.__anchor == "relative" || this.__anchor == "element") {
			element_width = element.outerWidth();
			element_height = element.outerHeight();
			left += element.offset().left - $(window).scrollLeft();
			top += element.offset().top - $(window).scrollTop();
			if (this.__element_align_vertical == "bottom")
				top += element_height
			else if (this.__element_align_vertical == "center")
				top += Math.round(element_height/2);
			if (this.__element_align_horizontal == "right")
				left += element_width
			else if (this.__element_align_horizontal == "center")
				left += Math.round(element_width/2);
		}
		overlay.css("left", left + "px");
		overlay.css("top", top + "px");
	}

});
BetaJS.Views.View.extend("BetaJS.Views.FullscreenOverlayView", {
	
	_templates: {
		"default": BetaJS.Templates.Cached["fullscreen-overlay-view-template"]
	},
	
	_events: function () {
		return [{
			'click [data-selector="outer"]': "__unfocus",
			'touchstart [data-selector="outer"]': "__unfocus"
		}];
	},

	constructor: function (options) {
		options = options || {};
		options.el = options.el || "body";
		options.append_to_el = "append_to_el" in options ? options.append_to_el : true;
		options.visible = "visible" in options ? options.visible : false;
		this._inherited(BetaJS.Views.FullscreenOverlayView, "constructor", options);
		options.overlay_inner.setEl('[data-selector="inner"]');
		this.overlay_inner = this.addChild(options.overlay_inner);
		this._setOption(options, "hide_on_unfocus", true);
		this._setOption(options, "destroy_on_unfocus", false);
		this.on("show", this._after_show, this);
		this.on("hide", this._after_hide, this);
	},
	
	_after_show: function () {	
		var outer = this.$('[data-selector="outer"]');
		var inner = this.$('[data-selector="inner"]');
		inner.removeClass("fullscreen-overlay-float");
		inner.removeClass("fullscreen-overlay-fit");
		var outer_width = outer.outerWidth();
		var outer_height = outer.outerHeight();
		var inner_width = inner.outerWidth();
		var inner_height = inner.outerHeight();
		var left = Math.floor((outer_width - inner_width) / 2);
		var top = Math.floor((outer_height - inner_height) / 2);
		if (left >= 0 && top >= 0) {
			inner.css("left", left + "px");
			inner.css("top", top + "px");
			inner.addClass("fullscreen-overlay-float");
		} else {
			inner.css("left", "0px");
			inner.css("top", "0px");
			inner.addClass("fullscreen-overlay-fit");
		}
		BetaJS.$("body").addClass("fullscreen-overlay-body");
	},
	
	_after_hide: function () {
		BetaJS.$("body").removeClass("fullscreen-overlay-body");
	},
	
	__unfocus: function () {
		if (this.__destroy_on_unfocus)
			this.destroy()
		else if (this.__hide_on_unfocus)
			this.hide();
	}

});
BetaJS.Views.ListContainerView.extend("BetaJS.Views.FormControlView", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.FormControlView, "constructor", options);
		this._model = options.model;
		this._property = options.property;
		this._setOption(options, "validate_on_change", false);
		this._setOption(options, "validate_on_show", false);
		this._setOption(options, "error_classes", "");
		this.control_view = this.addChild(this._createControl(this._model, this._property, options.control_options || {}));
		this.label_view = this.addChild(new BetaJS.Views.LabelView(BetaJS.Objs.extend(options.label_options || {}, {visible: false})));
		if (this.__validate_on_change)
			this._model.on("change:" + this._property, this.validate, this);
		if (this.__validate_on_show)
			this.on("show", this.validate, this);
		this._model.on("validate:" + this._property, this.validate, this);
	},
	
	validate: function () {
		if (this.isActive()) {
			var result = this._model.validateAttr(this._property);
			this.label_view.setVisibility(!result);
			if (result) {
				this.$el.removeClass(this.__error_classes);
			} else {
				this.$el.addClass(this.__error_classes);
				this.label_view.set("label", this._model.getError(this._property));
			}
		}			
	},
	
	_createControl: function (model, property, options) {}
	
});

BetaJS.Views.FormControlView.extend("BetaJS.Views.FormInputView", {
	
	_createControl: function (model, property, options) {
		return new BetaJS.Views.InputView(BetaJS.Objs.extend(options, {
			value: model.binding(property)
		}));
	}
	
});

BetaJS.Views.FormControlView.extend("BetaJS.Views.FormCheckBoxView", {
	
	_createControl: function (model, property, options) {
		return new BetaJS.Views.CheckBoxView(BetaJS.Objs.extend(options, {
			checked: model.binding(property)
		}));
	}
	
});
