BetaJS.Net.Browser = {
	
	__flash: null,
	__is_iOS: null,
	
	flash: function () {
		if (!this.__flash)
			this.__flash = new BetaJS.Net.FlashDetect();
		return this.__flash;
	},
	
	is_iOS: function () {
		if (this.__is_iOS == null)
			this.__is_iOS = (navigator.userAgent.indexOf('iPhone') != -1) || (navigator.userAgent.indexOf('iPod') != -1) || (navigator.userAgent.indexOf('iPad') != -1);
		return this.__is_iOS;
	},
	
	isChrome: function () {
		return "chrome" in window;
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
		return this.installed() && !BetaJS.Net.Browser.is_iOS();
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
    }],

});
