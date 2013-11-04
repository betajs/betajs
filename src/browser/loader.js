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