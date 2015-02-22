Scoped.define("module:JavaScript", ["module:Objs"], function (Objs) {
	return {
		
		STRING_SINGLE_QUOTATION_REGEX: /'[^']*'/g,
		STRING_DOUBLE_QUOTATION_REGEX: /"[^"]*"/g,
		
		IDENTIFIER_REGEX: /[a-zA-Z_][a-zA-Z_0-9]*/g,
		IDENTIFIER_SCOPE_REGEX: /[a-zA-Z_][a-zA-Z_0-9\.]*/g,
	
		RESERVED: Objs.objectify(
			["if", "then", "else", "return", "var"],
			true),
		
		isReserved: function (key) {
			return key in this.RESERVED;
		},
		
		isIdentifier: function (key) {
			return !this.isReserved(key);
		},
		
		removeStrings: function (code) {
			return code.replace(this.STRING_SINGLE_QUOTATION_REGEX, "").replace(this.STRING_DOUBLE_QUOTATION_REGEX, "");
		},	
		
		extractIdentifiers: function (code, keepScopes) {
			var regex = keepScopes ? this.IDENTIFIER_SCOPE_REGEX : this.IDENTIFIER_REGEX;
			code = this.removeStrings(code);
			return Objs.filter(code.match(regex), this.isIdentifier, this);
		}
			
	};

});