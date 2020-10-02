Scoped.define("module:Tokens", function () {
    /**
     * Unique Token Generation
     *
     * @module BetaJS.Tokens
     */
    return {
        /**
         * Generates a random token
         *
         * @param {integer} length optional length of token, default is 16
         * @return {string} generated token
         */
        generate_token: function (length) {
            if (length === void 0) { length = 16; }
            var s = "";
            while (s.length < length)
                s += Math.random().toString(36).substr(2);
            return s.substr(0, length);
        },
        /**
         * Generated a simple hash value from a string.
         *
         * @param {string} input string
         * @return {integer} simple hash value
         * @see http://jsperf.com/string-hashing-methods
         */
        simple_hash: function (s) {
            if (s.length == 0)
                return 0;
            var nHash = 0;
            for (var i = 0; i < s.length; ++i) {
                nHash = ((nHash << 5) - nHash) + s.charCodeAt(i);
                nHash = nHash & nHash;
            }
            return Math.abs(nHash);
        }
    };
});
