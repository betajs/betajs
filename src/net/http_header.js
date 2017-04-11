Scoped.define("module:Net.HttpHeader", function() {
    /**
     * Http Header Codes and Functions
     * 
     * @module BetaJS.Net.HttpHeader
     */
    return {

        HTTP_STATUS_OK: 200,
        HTTP_STATUS_CREATED: 201,
        HTTP_STATUS_BAD_REQUEST: 400,
        HTTP_STATUS_UNAUTHORIZED: 401,
        HTTP_STATUS_PAYMENT_REQUIRED: 402,
        HTTP_STATUS_FORBIDDEN: 403,
        HTTP_STATUS_NOT_FOUND: 404,
        HTTP_STATUS_PRECONDITION_FAILED: 412,
        HTTP_STATUS_INTERNAL_SERVER_ERROR: 500,
        HTTP_STATUS_GATEWAY_TIMEOUT: 504,

        STRINGS: {
            0: "Unknown Error",
            200: "OK",
            201: "Created",
            400: "Bad Request",
            401: "Unauthorized",
            402: "Payment Required",
            403: "Forbidden",
            404: "Not found",
            412: "Precondition Failed",
            500: "Internal Server Error",
            504: "Gateway timeout"
        },


        /**
         * Formats a HTTP status code to a string.
         * 
         * @param {integer} code the http status code
         * @param {boolean} prepend_code should the integer status code be prepended (default false)
         * 
         * @return HTTP status code as a string.
         */
        format: function(code, prepend_code) {
            var ret = this.STRINGS[code in this.STRINGS ? code : 0];
            return prepend_code ? (code + " " + ret) : ret;
        },

        /**
         * Returns true if a status code is in the 200 region.
         * 
         * @param {int} code status code
         * 
         * @return {boolean} true if code in the 200 region
         */
        isSuccessStatus: function(code) {
            return code >= this.HTTP_STATUS_OK && code < 300;
        }

    };
});