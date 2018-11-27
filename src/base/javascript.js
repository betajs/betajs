Scoped.define("module:JavaScript", ["module:Objs"], function(Objs) {
    /**
     * JavaScript Simple Parse Functions
     * 
     * @module BetaJS.JavaScript
     */
    return {

        STRING_SINGLE_QUOTATION_REGEX: /'[^']*'/g,
        STRING_DOUBLE_QUOTATION_REGEX: /"[^"]*"/g,

        PROPER_IDENTIFIER_REGEX: /^[a-zA-Z_][a-zA-Z_0-9]*$/,
        IDENTIFIER_REGEX: /[a-zA-Z_][a-zA-Z_0-9]*/g,
        IDENTIFIER_SCOPE_REGEX: /[a-zA-Z_][a-zA-Z_0-9\.]*/g,

        RESERVED: Objs.objectify([
            "if", "then", "else", "return", "var"
        ], true),

        /**
         * Is string a JS-reserved keyword?
         * 
         * @param {string} key string in question
         * @return {boolean} true if reserved
         */
        isReserved: function(key) {
            return key in this.RESERVED;
        },

        /**
         * Is string a valid JS identifier?
         * 
         * @param {string} key string in question
         * @return {boolean} true if identifier
         */
        isIdentifier: function(key) {
            return !this.isReserved(key);
        },

        /**
         * Is string a valid proper JS identifier?
         * 
         * @param {string} key string in question
         * @return {boolean} true if identifier
         */
        isProperIdentifier: function(key) {
            return this.isIdentifier(key) && this.PROPER_IDENTIFIER_REGEX.test(key);
        },

        /**
         * Remove string definitions from JS code.
         * 
         * @param {string} code input code
         * @return {string} code without strings
         */
        removeStrings: function(code) {
            return code.replace(this.STRING_SINGLE_QUOTATION_REGEX, "").replace(this.STRING_DOUBLE_QUOTATION_REGEX, "");
        },

        /**
         * Return JS identifiers from a piece of code.
         * 
         * @param {string} code input code
         * @param {boolean} keepScopes keep scopes, e.g. `foo.bar` instead of `foo` and `bar` (default: false)
         * @return {array} array of extracted identifiers
         */
        extractIdentifiers: function(code, keepScopes) {
            var regex = keepScopes ? this.IDENTIFIER_SCOPE_REGEX : this.IDENTIFIER_REGEX;
            code = this.removeStrings(code);
            return Objs.filter(code.match(regex), this.isIdentifier, this);
        },

        /**
         * Return function parameter names
         *
         * @param {string} func JavaScript function to extract parameter names
         * @return {array} array of extracted parameter names
         */
        extractFunctionParameterNames: function(func) {
            return (func.toString().match(/function \((.*)\).*/))[1].replace(/\s*/g, "").split(",");
        }

    };

});