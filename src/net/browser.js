BetaJS.Net.Browser = {
	
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
			this.__flash = new BetaJS.Net.FlashDetect();
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

BetaJS.Class.extend("BetaJS.Net.FlashDetect", {
	
	constructor: function () {
		this._inherited(BetaJS.Net.FlashDetect, "constructor");
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
		return this.installed() || !BetaJS.Net.Browser.is_iOS();
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



BetaJS.Net.Browser.Loader = {
	
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