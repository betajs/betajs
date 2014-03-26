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
				throw new BetaJS.Net.AjaxException(jqXHR.status, errorThrown, JSON.parse(jqXHR.responseText));
			}
		});
		return result;
	},
	
	_asyncCall: function (options) {
		if (BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() <= 9)
			BetaJS.$.support.cors = true;
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
