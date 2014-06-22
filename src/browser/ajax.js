BetaJS.Net.AbstractAjax.extend("BetaJS.Browser.JQueryAjax", {
	
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
				var err = "";
				try {
					err = JSON.parse(jqXHR.responseText);
				} catch (e) {
					err = JSON.parse('"' + jqXHR.responseText + '"');
				}
				throw new BetaJS.Net.AjaxException(jqXHR.status, errorThrown, ee);
			}
		});
		return result;
	},
	
	_asyncCall: function (options, callbacks) {
		if (BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() <= 9)
			BetaJS.$.support.cors = true;
		BetaJS.$.ajax({
			type: options.method,
			async: true,
			url: options.uri,
			dataType: options.decodeType ? options.decodeType : null, 
			data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
			success: function (response) {
				BetaJS.SyncAsync.callback(callbacks, "success", response);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				var err = "";
				try {
					err = JSON.parse(jqXHR.responseText);
				} catch (e) {
					err = JSON.parse('"' + jqXHR.responseText + '"');
				}
				var exc = new BetaJS.Net.AjaxException(jqXHR.status, errorThrown, err);
				BetaJS.SyncAsync.callback(callbacks, "exception", exc);
			}
		});
	}

});
