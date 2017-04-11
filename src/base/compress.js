Scoped.define("module:Compress", function() {

    /**
     * Compress Module
     * 
     * Contains simple and reasonably fast LZW Like Encode / Decode Functions
     * 
     * Differs from standard LZW in the following sense:
     *
     *   - If input contains characters not included in the initial dictionary, output stream sends:
     *       (1) dictionary.size + 1 (2) the input character
     *       
     *   - If dictionary size exceeds 2 bytes, the dictionary is reset
     * 
     * @module BetaJS.Compress
     */
    return {

        /**
         * LZW Like Encode Function
         * 
         * @param {string} input input string
         * @param {int} dict initial dictionary size, default is 1 byte
         * 
         * @param {string} UTF-8 encoded compressed string
         */
        lzw_like_encode: function(input, dict) {
            if (dict === undefined)
                dict = 256;
            var dictionary = new Map();
            var output = [];
            for (var i = 0; i < dict; ++i)
                dictionary.set(String.fromCharCode(i), i);
            var acc = "";
            for (var j = 0; j < input.length; ++j) {
                var c = input.charAt(j);
                if (!dictionary.has(c)) {
                    if (acc)
                        output.push(dictionary.get(acc));
                    dictionary.set(c, dictionary.size);
                    output.push(dictionary.size + 1);
                    output.push(input.charCodeAt(j));
                    acc = "";
                } else if (dictionary.has(acc + c)) {
                    acc += c;
                } else {
                    output.push(dictionary.get(acc));
                    dictionary.set(acc + c, dictionary.size);
                    acc = c;
                    if (dictionary.size >= 256 * 256 - 1) {
                        dictionary = new Map();
                        for (i = 0; i < dict; ++i)
                            dictionary.set(String.fromCharCode(i), i);
                        acc = "";
                        j--;
                    }
                }
            }
            if (acc)
                output.push(dictionary.get(acc));
            return output.map(function(i) {
                return String.fromCharCode(i);
            }).join("");
        },

        /**
         * LZW Like Decode Function
         * 
         * @param {string} input UTF-8 encoded compressed input string
         * @param {int} dict initial dictionary size, default is 1 byte
         * 
         * @param {string} decompressed string
         */
        lzw_like_decode: function(input, dict) {
            if (dict === undefined)
                dict = 256;
            var dictionary = [];
            var output = [];
            for (var i = 0; i < dict; ++i)
                dictionary.push(String.fromCharCode(i));
            var last = "";
            for (var j = 0; j < input.length; ++j) {
                var code = input.charCodeAt(j);
                if (code > dictionary.length) {
                    j++;
                    code = input.charCodeAt(j);
                    output.push(String.fromCharCode(code));
                    dictionary.push(String.fromCharCode(code));
                    last = "";
                } else {
                    var cur = code < dictionary.length ? dictionary[code] : (last + last.charAt(0));
                    output.push(cur);
                    if (last)
                        dictionary.push(last + cur.charAt(0));
                    last = cur;
                    if (dictionary.length >= 256 * 256 - 2) {
                        dictionary = [];
                        for (i = 0; i < dict; ++i)
                            dictionary.push(String.fromCharCode(i));
                        last = "";
                    }
                }
            }
            return output.join("");
        }

    };
});