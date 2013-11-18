/** @class */
BetaJS.Strings = {
	
    /** Converts a string new lines to html <br /> tags
     * 
     * @param s string
     * @return string with new lines replaced by <br /> 
     */
	nl2br: function (s) {
		return (s + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
	},
	
    /** Converts special characters in a string to html entitiy symbols
     * 
     * @param s string
     * @return converted string
     */
	htmlentities: function (s) {
		return (s + "").
			replace(/&/g, '&amp;').
			replace(/</g, '&lt;').
			replace(/>/g, '&gt;').
			replace(/"/g, '&quot;').
			replace(/'/g, '&#x27;').
			replace(/\//g, '&#x2F;');
	},
	
	JS_ESCAPES: {
		"'":      "'",
		'\\':     '\\',
		'\r':     'r',
		'\n':     'n',
		'\t':     't',
		'\u2028': 'u2028',
		'\u2029': 'u2029'
	},
	
	JS_ESCAPER_REGEX: function () {
		if (!this.JS_ESCAPER_REGEX_CACHED)
			this.JS_ESCAPER_REGEX_CACHED = new RegExp(BetaJS.Objs.keys(this.JS_ESCAPES).join("|"), 'g');
		return this.JS_ESCAPER_REGEX_CACHED;
	},
	
    /** Converts string such that it can be used in javascript by escaping special symbols
     * 
     * @param s string
     * @return escaped string
     */
	js_escape: function (s) {
		var self = this;
		return s.replace(this.JS_ESCAPER_REGEX(), function(match) {
			return '\\' + self.JS_ESCAPES[match];
		});
	},
	
    /** Determines whether a string starts with a sub string
     * 
     * @param s string in question
     * @param needle sub string
     * @return true if string in question starts with sub string
     */
	starts_with: function (s, needle) {
		return s.substring(0, needle.length) == needle;
	},
	
    /** Determines whether a string ends with a sub string
     * 
     * @param s string in question
     * @param needle sub string
     * @return true if string in question ends with sub string
     */
	ends_with: function(s, needle) {
    	return s.indexOf(needle, s.length - needle.length) !== -1;
	},
	
    /** Removes sub string from a string if string starts with sub string
     * 
     * @param s string in question
     * @param needle sub string
     * @return string without sub string if it starts with sub string otherwise it returns the original string
     */
	strip_start: function (s, needle) {
		return this.starts_with(s, needle) ? s.substring(needle.length) : s;
	},
	
    /** Returns the complete remaining part of a string after a the last occurrence of a sub string
     * 
     * @param s string in question
     * @param needle sub string
     * @return remaining part of the string in question after the last occurrence of the sub string
     */
	last_after: function (s, needle) {
		return s.substring(s.lastIndexOf(needle) + needle.length, s.length);
	},
	
	EMAIL_ADDRESS_REGEX: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	
    /** Determines whether a string is a syntactically valid email address
     * 
     * @param s string in question
     * @return true if string looks like an email address
     */
	is_email_address: function (s) {
		return this.EMAIL_ADDRESS_REGEX.test(s);
	},
	
	STRIP_HTML_REGEX: /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi,
		
    /** Removes all html from data and returns plain text
     * 
     * @param html string containing html
     * @return string containing the plain text part of it
     */
	strip_html: function (html) {
    	return html.replace(this.STRIP_HTML_REGEX, '');
    }

};
