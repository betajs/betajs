Scoped.define("module:Tokens", function() {
	/**
	 * Unique Token Generation
	 * 
	 * @module BetaJS.Tokens
	 */
	return {

		/**
		 * Returns a new token
		 * 
		 * @param length
		 *            optional length of token, default is 16
		 * @return token
		 */
		generate_token : function(length) {
			length = length || 16;
			var s = "";
			while (s.length < length)
				s += Math.random().toString(36).substr(2);
			return s.substr(0, length);
		},

		// http://jsperf.com/string-hashing-methods
		simple_hash : function(s) {
			var nHash = 0;
			if (!s.length)
				return nHash;
			for (var i = 0, imax = s.length, n; i < imax; ++i) {
				n = s.charCodeAt(i);
				nHash = ((nHash << 5) - nHash) + n;
				nHash = nHash & nHash;
			}
			return Math.abs(nHash);
		}

	};
});