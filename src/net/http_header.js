Scoped.define("module:Net.HttpHeader", function () {
	/**
	 * Http Header Codes and Functions
	 * 
	 * @module BetaJS.Net.HttpHeader
	 */
	return {
		
		HTTP_STATUS_OK : 200,
		HTTP_STATUS_CREATED : 201,
		HTTP_STATUS_PAYMENT_REQUIRED : 402,
		HTTP_STATUS_FORBIDDEN : 403,
		HTTP_STATUS_NOT_FOUND : 404,
		HTTP_STATUS_PRECONDITION_FAILED : 412,
		HTTP_STATUS_INTERNAL_SERVER_ERROR : 500,
		
		
		/**
		 * Formats a HTTP status code to a string.
		 * 
		 * @param {integer} code the http status code
		 * @param {boolean} prepend_code should the integer status code be prepended (default false)
		 * 
		 * @return HTTP status code as a string.
		 */
		format: function (code, prepend_code) {
			var ret = "";
			if (code == this.HTTP_STATUS_OK)
				ret = "OK";
			else if (code == this.HTTP_STATUS_CREATED)
				ret = "Created";
			else if (code == this.HTTP_STATUS_PAYMENT_REQUIRED)
				ret = "Payment Required";
			else if (code == this.HTTP_STATUS_FORBIDDEN)
				ret = "Forbidden";
			else if (code == this.HTTP_STATUS_NOT_FOUND)
				ret = "Not found";
			else if (code == this.HTTP_STATUS_PRECONDITION_FAILED)
				ret = "Precondition Failed";
			else if (code == this.HTTP_STATUS_INTERNAL_SERVER_ERROR)
				ret = "Internal Server Error";
			else
				ret = "Other Error";
			return prepend_code ? (code + " " + ret) : ret;
		}
		
	};
});