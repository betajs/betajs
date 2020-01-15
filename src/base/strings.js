Scoped.define("module:Strings", ["module:Objs"], function(Objs) {
    /**
     * String Utilities
     *
     * @module BetaJS.Strings
     */
    return {

        /**
         * Uppercases first character in string.
         *
         * @param {string} s string in question
         *
         * @return {string} uppercased string
         */
        ucFirst: function(s) {
            s += '';
            return s.charAt(0).toUpperCase() + s.substr(1);
        },

        /**
         * Escapes a string to be used as an exact match in a regular expression.
         *
         * @param {string} s string in question
         *
         * @return {string} escaped string
         *
         * @link http://stackoverflow.com/a/3561711
         */
        regexEscape: function(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        },

        /**
         * Transforms a string with asterisks as placeholders to a regular expression
         *
         * @param {string} s string in question
         *
         * @return {string} escaped string
         */
        asteriskPatternToRegex: function(s) {
            return s.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');
        },

        /**
         * Pads a string from the left with characters if necessary.
         *
         * @param {string} s string that should be padded
         * @param {string} padding padding string that should be used (e.g. whitespace)
         * @param {int} length minimum length of result string
         *
         * @return {string} padded string
         */
        padLeft: function(s, padding, length) {
            while (s.length < length)
                s = padding + s;
            return s;
        },

        /**
         * Pads a string from the left with zeros ('0') if necessary.
         *
         * @param {string} s string that should be padded
         * @param {int} length minimum length of result string
         *
         * @return {string} zero-padded string
         */
        padZeros: function(s, length) {
            return this.padLeft(s + "", "0", length);
        },

        /** Converts a string new lines to html <br /> tags
         *
         * @param s string
         * @return string with new lines replaced by <br />
         */
        nl2br: function(s) {
            return (s + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
        },

        /** Converts special characters in a string to html entitiy symbols
         *
         * @param s string
         * @return converted string
         */
        htmlentities: function(s) {
            return (s + "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
        },

        JS_ESCAPES: {
            "'": "'",
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        },

        JS_ESCAPER_REGEX: function() {
            if (!this.JS_ESCAPER_REGEX_CACHED)
                this.JS_ESCAPER_REGEX_CACHED = new RegExp(Objs.keys(this.JS_ESCAPES).join("|"), 'g');
            return this.JS_ESCAPER_REGEX_CACHED;
        },

        /** Converts string such that it can be used in javascript by escaping special symbols
         *
         * @param s string
         * @return escaped string
         */
        js_escape: function(s) {
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
        starts_with: function(s, needle) {
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
        strip_start: function(s, needle) {
            return this.starts_with(s, needle) ? s.substring(needle.length) : s;
        },

        /** Removes sub string from a string if string ends with sub string
         *
         * @param s string in question
         * @param needle sub string
         * @return string without sub string if it ends with sub string otherwise it returns the original string
         */
        strip_end: function(s, needle) {
            return this.ends_with(s, needle) ? s.substring(0, s.length - needle.length) : s;
        },

        /**
         * Returns the complete remaining part of a string after the last occurrence of a sub string
         *
         * @param s string in question
         * @param needle sub string
         * @return remaining part of the string in question after the last occurrence of the sub string
         */
        last_after: function(s, needle) {
            return this.splitLast(s, needle).tail;
        },

        /**
         * Returns the complete remaining part of a string after the first occurrence of a sub string
         *
         * @param s string in question
         * @param needle sub string
         * @return remaining part of the string in question after the first occurrence of the sub string
         */
        first_after: function(s, needle) {
            return s.substring(s.indexOf(needle) + 1, s.length);
        },

        EMAIL_ADDRESS_REGEX: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

        STRICT_URL_REGEX: /^\w+:\/\/[^\s]+$/,

        PERMISSIVE_URL_REGEX: /^[\w\.]+\.(com|de|co\.uk|fr|net|org|edu)[^\s]*$/,

        /** Determines whether a string is a syntactically valid email address
         *
         * @param s string in question
         * @return true if string looks like an email address
         */
        is_email_address: function(s) {
            return this.EMAIL_ADDRESS_REGEX.test(s);
        },

        STRIP_HTML_TAGS: ["script", "style", "head"],
        STRIP_HTML_REGEX: /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi,
        STRIP_HTML_COMMENT_REGEX: /<![^>]*>/gi,

        /** Removes all html from data and returns plain text
         *
         * @param html string containing html
         * @return string containing the plain text part of it
         */
        strip_html: function(html) {
            var result = html;
            for (var i = 0; i < this.STRIP_HTML_TAGS.length; ++i)
                result = result.replace(new RegExp("<" + this.STRIP_HTML_TAGS[i] + ".*</" + this.STRIP_HTML_TAGS[i] + ">", "i"), '');
            result = result.replace(this.STRIP_HTML_REGEX, '').replace(this.STRIP_HTML_COMMENT_REGEX, '');
            return result;
        },

        /** Trims all trailing and leading whitespace and removes block indentations
         *
         * @param s string
         * @return string with trimmed whitespaces and removed block indentation
         */
        nltrim: function(s) {
            var a = s.replace(/\t/g, "  ").split("\n");
            var len = null;
            var i = 0;
            for (i = 0; i < a.length; ++i) {
                var j = 0;
                while (j < a[i].length) {
                    if (a[i].charAt(j) != ' ')
                        break;
                    ++j;
                }
                if (j < a[i].length)
                    len = len === null ? j : Math.min(j, len);
            }
            for (i = 0; i < a.length; ++i)
                a[i] = a[i].substring(len);
            return a.join("\n").trim();
        },

        /**
         * Replaces all occurrences of a substring with something else.
         *
         * @param {string} s input string
         * @param {string} sub search string
         * @param {string} wth replacement string
         *
         * @return {string} input with all occurrences of the search string replaced by the replacement string
         */
        replaceAll: function(s, sub, wth) {
            while (s.indexOf(sub) >= 0)
                s = s.replace(sub, wth);
            return s;
        },

        /**
         * Capitalizes all first characters of all words in a string.
         *
         * @param {string} input input string
         *
         * @return {string} input with all first characters capitalized
         */
        capitalize: function(input) {
            return input.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        },

        /**
         * Converts string to pascal case
         *
         * @param {string} s input string
         *
         * @return {string} input in pascal case
         */
        pascalCase: function(s) {
            return s.replace(/[A-Z][a-z0-9]/g, function(txt) {
                return " " + txt;
            }).replace(/[A-Za-z0-9]+/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }).replace(/[-_\s]/g, "");
        },

        /**
         * Converts string to camel case
         *
         * @param {string} s input string
         *
         * @return {string} input in camel case
         */
        camelCase: function(s) {
            var txt = this.pascalCase(s);
            return txt.charAt(0).toLowerCase() + txt.substr(1);
        },

        /**
         * Converts string to train case
         *
         * @param {string} s input string
         *
         * @return {string} input in train case
         */
        trainCase: function(s) {
            var txt = this.pascalCase(s);
            return txt.replace(/[A-Z]/g, function(txt) {
                return "-" + txt;
            }).substring(1);
        },

        /**
         * Converts string to snake case
         *
         * @param {string} s input string
         *
         * @return {string} input in snake case
         */
        snakeCase: function(s) {
            return this.trainCase(s).replace(/-/g, "_").toLowerCase();
        },

        /**
         * Converts string to kebab case
         *
         * @param {string} s input string
         *
         * @return {string} input in kebab case
         */
        kebabCase: function(s) {
            return this.trainCase(s).toLowerCase();
        },

        /**
         * Extracts the name from an email address name string (e.g. 'Foo Bar <foobar@domain.com>')
         *
         * @param {string} input email address name input string
         *
         * @return {string} name included in the string
         */
        email_get_name: function(input) {
            input = input || "";
            var temp = input.split("<");
            input = temp[0].trim();
            if (!input || temp.length < 2) {
                temp = temp[temp.length - 1].split("@");
                input = temp[0].trim();
            }
            input = input.replace(/['"]/g, "").replace(/[\\._@]/g, " ");
            return this.capitalize(input);
        },

        /**
         * Extracts the email from an email address name string (e.g. 'Foo Bar <foobar@domain.com>')
         *
         * @param {string} input email address name input string
         *
         * @return {string} email included in the string
         */
        email_get_email: function(input) {
            input = input || "";
            var temp = input.split("<");
            input = temp[0].trim();
            if (temp.length > 1) {
                temp = temp[1].split(">");
                input = temp[0].trim();
            }
            input = input.replace(/'/g, "").replace(/"/g, "").trim();
            return input;
        },

        /**
         * Extracts the salutatory name from an email address name string (normally the first name)
         *
         * @param {string} input email address name input string
         *
         * @return {string} salutatory name
         */
        email_get_salutatory_name: function(input) {
            return (this.email_get_name(input || "").split(" "))[0];
        },

        /**
         * Splits a string into two by the first occurrence of a delimiter
         *
         * @param {string} s input string
         * @param {string} delimiter delimiter string
         *
         * @return {object} a json object, mapping 'head' to the region left and 'tail' to region right to the delimiter
         */
        splitFirst: function(s, delimiter) {
            var i = s.indexOf(delimiter);
            return {
                head: i >= 0 ? s.substring(0, i) : s,
                tail: i >= 0 ? s.substring(i + delimiter.length) : ""
            };
        },

        /**
         * Splits a string into two by the last occurrence of a delimiter
         *
         * @param {string} s input string
         * @param {string} delimiter delimiter string
         *
         * @return {object} a json object, mapping 'head' to the region left and 'tail' to region right to the delimiter
         */
        splitLast: function(s, delimiter) {
            var i = s.lastIndexOf(delimiter);
            return {
                head: i >= 0 ? s.substring(0, i) : "",
                tail: i >= 0 ? s.substring(i + delimiter.length) : s
            };
        },

        /**
         * Replace all groups in a regular expression string by string parameters.
         *
         * @param {string} regex regular expression with groups as a string
         * @param {array} args array of string parameters
         *
         * @return {string} regular expression with groups being replaced by string parameters
         */
        regexReplaceGroups: function(regex, args) {
            var findGroup = /\(.*?\)/;
            var f = function(captured) {
                if (arg)
                    return arg;
                return captured.substring(1, captured.length - 1);
            };
            while (args.length > 0) {
                var arg = args.shift();
                regex = regex.replace(findGroup, f);
            }
            return regex;
        },

        /**
         * Given a regular expression with named capture groups (e.g. '(foobar:\d+)'), compute a normal regular expression with mappings to the named groups.
         *
         * @param {string} regex regular expression with named capture groups
         *
         * @return {object} mapping object
         */
        namedCaptureRegex: function(regex) {
            var groupMap = {};
            var groupIdx = 0;
            var newRegex = new RegExp(regex.replace(/\([^)]+\)/ig, function(group) {
                if (group.charAt(1) != "?" && group.indexOf(":") > 0) {
                    var delimiter = group.indexOf(":");
                    groupMap[group.substring(1, delimiter)] = groupIdx;
                    group = "(" + group.substring(delimiter + 1, group.length - 1) + ")";
                }
                groupIdx++;
                return group;
            }));
            var map = function(groups) {
                return Objs.map(groupMap, function(idx) {
                    return groups[idx + 1];
                });
            };
            var exec = function(test) {
                var result = newRegex.exec(test);
                return result ? map(result) : null;
            };
            var mapBack = function(args) {
                var result = [];
                for (var i = 0; i < groupIdx; ++i)
                    result.push(null);
                for (var key in args)
                    if (key in groupMap)
                        result[groupMap[key]] = args[key];
                return result;
            };
            return {
                regex: newRegex,
                map: map,
                exec: exec,
                mapBack: mapBack
            };
        },

        /**
         * Given an int, returns the short form of its ordinal value
         *
         * @param {int} i An integer
         *
         * @return {string} The ordinal value of the number
         */
        ordinalSuffix: function(i) {
            var j = i % 10,
                k = i % 100;
            if (j === 1 && k !== 11) {
                return i + "st";
            }
            if (j === 2 && k !== 12) {
                return i + "nd";
            }
            if (j === 3 && k !== 13) {
                return i + "rd";
            }
            return i + "th";
        },

        __cachedRegExp: {},

        /**
         * Returns a reg exp object for a reg exp string from a cache.
         *
         * @param {string} regexString reg exp string
         * @param {string} regexOptions reg exp options string
         *
         * @returns {object} RegExp object
         */
        cachedRegExp: function(regexString, regexOptions) {
            regexOptions = regexOptions || "";
            if (!this.__cachedRegExp[regexString])
                this.__cachedRegExp[regexString] = {};
            if (!this.__cachedRegExp[regexString][regexOptions])
                this.__cachedRegExp[regexString][regexOptions] = new RegExp(regexString, regexOptions);
            return this.__cachedRegExp[regexString][regexOptions];
        },

        IP_ADDRESS_REGEXP: /^\d+\.\d+\.\d+\.\d+$/,

        /**
         * Checks whether a given string is an IP address.
         *
         * @param {string} str potential ip address
         *
         * @returns {boolean} true if ip address
         */
        isIPAddress: function(str) {
            return this.IP_ADDRESS_REGEXP.test(str);
        },

        NORMALIZE_SEARCH_TEXT_MAPS: {
            "\\u00dc": "Ue",
            "\\u00fc": "ue",
            "\\u00c4": "Ae",
            "\\u00e4": "ae",
            "\\u00d6": "Oe",
            "\\u00f6": "oe",
            "\\u00df": "ss",
            /*
            "Ue": "U",
            "ue": "u",
            "Ae": "A",
            "ae": "a",
            "Oe": "O",
            "oe": "o",
             */
            "\\W": " ",
            "\\s+": " "
        },

        NORMALIZE_SEARCH_TEXT_MAPS_REGEX: function() {
            if (!this.NORMALIZE_SEARCH_TEXT_MAPS_CACHED) {
                this.NORMALIZE_SEARCH_TEXT_MAPS_CACHED = [];
                Objs.iter(this.NORMALIZE_SEARCH_TEXT_MAPS, function(value, key) {
                    this.NORMALIZE_SEARCH_TEXT_MAPS_CACHED.push({
                        search: new RegExp(key, "g"),
                        replace: value
                    });
                }, this);
            }
            return this.NORMALIZE_SEARCH_TEXT_MAPS_CACHED;
        },

        /**
         * Normalizes a search text in regards to umlauts etc.
         *
         * @param {string} text search text to be normalized
         * @returns {string} normalized search text
         */
        normalizeSearchText: function(text) {
            Objs.iter(this.NORMALIZE_SEARCH_TEXT_MAPS_REGEX(), function(searchReplace) {
                text = text.replace(searchReplace.search, searchReplace.replace);
            });
            return text.trim();
        }

    };

});