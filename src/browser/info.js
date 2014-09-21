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
	
	__cache: {},
	
	__cached: function (key, value_func) {
		if (!(key in this.__cache))
			this.__cache[key] = value_func.apply(this);
		return this.__cache[key];
	},

	flash: function () {
		return this.__cached("flash", function () {
			return new BetaJS.Browser.FlashDetect();
		});
	},
	
	isiOS: function () {
		return this.__cached("isiOS", function () {
			var ua = navigator.userAgent;
			return ua.indexOf('iPhone') != -1 || ua.indexOf('iPod') != -1 || ua.indexOf('iPad') != -1;
		});
	},
	
	isChrome: function () {
		return this.__cached("isChrome", function () {
			return ("chrome" in window || navigator.userAgent.indexOf('CriOS') != -1)  && !window.opera && navigator.userAgent.indexOf(' OPR/') === -1;
		});
	},
	
	isOpera: function () {
		return this.__cached("isOpera", function () {
			return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		});
	},
	
	isAndroid: function () {
		return this.__cached("isAndroid", function () {
			return navigator.userAgent.toLowerCase().indexOf("android") != -1;
		});
	},
	
	isWebOS: function () {
		return this.__cached("isWebOS", function () {
			return navigator.userAgent.toLowerCase().indexOf("webos") != -1;
		});
	},

	isWindowsPhone: function () {
		return this.__cached("isWindowsPhone", function () {
			return navigator.userAgent.toLowerCase().indexOf("windows phone") != -1;
		});
	},

	isBlackberry: function () {
		return this.__cached("isBlackberry", function () {
			return navigator.userAgent.toLowerCase().indexOf("blackberry") != -1;
		});
	},

	iOSversion: function () {
		return this.__cached("iOSversion", function () {
			if (!this.isiOS())
				return false;
		    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		    return {
		    	major: parseInt(v[1], 10),
		    	minor: parseInt(v[2], 10),
		    	revision: parseInt(v[3] || 0, 10)
		    };
		});
	},
	
	isMobile: function () {
		return this.__cached("isMobile", function () {
			return this.isiOS() || this.isAndroid() || this.isWebOS() || this.isWindowsPhone() || this.isBlackberry();
		});
	},
	
	isInternetExplorer: function () {
		return this.__cached("isInternetExplorer", function () {
			//return navigator.appName == 'Microsoft Internet Explorer';
			return this.internetExplorerVersion() !== null;
		});
	},
	
	isFirefox: function () {
		return this.__cached("isFirefox", function () {
			return navigator.userAgent.toLowerCase().indexOf("firefox") != -1;
		});
	},
	
	isSafari: function () {
		return this.__cached("isSafari", function () {
			return !this.isChrome() && navigator.userAgent.toLowerCase().indexOf("safari") != -1;
		});
	},
	
	isWindows: function () {
		return this.__cached("isWindows", function () {
			return navigator.appVersion.toLowerCase().indexOf("win") != -1;
		});
	},
	
	isMacOS: function () {
		return this.__cached("isMacOS", function () {
			return navigator.appVersion.toLowerCase().indexOf("mac") != -1;
		});
	},
	
	isUnix: function () {
		return this.__cached("isUnix", function () {
			return navigator.appVersion.toLowerCase().indexOf("x11") != -1;
		});
	},
	
	isLinux: function () {
		return this.__cached("isLinux", function () {
			return navigator.appVersion.toLowerCase().indexOf("linux") != -1;
		});
	},
	
	internetExplorerVersion: function () {
		if (navigator.appName == 'Microsoft Internet Explorer') {
		    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		    if (re.exec(navigator.userAgent))
		    	return parseFloat(RegExp.$1);
		} else if (navigator.appName == 'Netscape') {
		    var re2 = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
		    if (re2.exec(navigator.userAgent))
		    	return parseFloat(RegExp.$1);
		}
		return null;
	}
	
};




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
        } else if (navigator.appVersion.indexOf("Mac") == -1 && window.execScript) {
            for (var i = 0; i < this.__activeXDetectRules.length; i++) {
		        try {
		            var obj = new ActiveXObject(this.__activeXDetectRules[i].name);
		            var version = this.__activeXDetectRules[i].version(obj);
                    if (version) {
                    	this.__version = this.parseActiveXVersion(version);
                    	break;
                    }
		        } catch (err) { }
		    }
		}
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
		return this.__version !== null;
	},
	
	supported: function () {
		return this.installed() || !BetaJS.Browser.Info.isiOS();
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
        for (i = 0; i < len; i++) {
            if (properties[i] != arguments[i]) 
            	return properties[i] > arguments[i];
        }
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