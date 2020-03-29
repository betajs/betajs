Scoped.define("module:Types", function() {
    /**
     * Type-Testing and Type-Parsing
     * 
     * @module BetaJS.Types
     */
    return {
        /**
         * Returns whether argument is an object
         * 
         * @param x argument
         * @return true if x is an object
         */
        is_object: function(x) {
            return typeof x === "object";
        },

        /**
         * Returns whether argument is an array
         * 
         * @param x argument
         * @return true if x is an array
         */
        is_array: function(x) {
            return Array.isArray(x);
        },

        /**
         * Returns whether argument is undefined (which is different from being
         * null)
         * 
         * @param x argument
         * @return true if x is undefined
         */
        is_undefined: function(x) {
            return typeof x === "undefined";
        },

        /**
         * Returns whether argument is null (which is different from being
         * undefined)
         * 
         * @param x argument
         * @return true if x is null
         */
        is_null: function(x) {
            return x === null;
        },

        /**
         * Returns whether argument is undefined or null
         * 
         * @param x argument
         * @return true if x is undefined or null
         */
        is_none: function(x) {
            return this.is_undefined(x) || this.is_null(x);
        },

        /**
         * Returns whether argument is defined (could be null)
         * 
         * @param x argument
         * @return true if x is defined
         */
        is_defined: function(x) {
            return typeof x !== "undefined";
        },

        /**
         * Returns whether argument is empty (undefined, null, an empty array or
         * an empty object)
         * 
         * @param x argument
         * @return true if x is empty
         */
        is_empty: function(x) {
            return this.is_none(x) || (this.is_array(x) && x.length === 0) || (this.is_object(x) && this.is_empty_object(x));
        },

        /**
         * Returns whether object argument is empty
         * 
         * @param x object argument
         * @return true if x is empty
         */
        is_empty_object: function(x) {
            for (var key in x)
                return false;
            return true;
        },

        /**
         * Returns whether argument is a string
         * 
         * @param x argument
         * @return true if x is a a string
         */
        is_string: function(x) {
            return typeof x === "string";
        },

        /**
         * Returns whether argument is a function
         * 
         * @param x argument
         * @return true if x is a function
         */
        is_function: function(x) {
            return typeof x === "function";
        },

        /**
         * Returns whether argument is boolean
         * 
         * @param x argument
         * @return true if x is boolean
         */
        is_boolean: function(x) {
            return typeof x === "boolean";
        },

        /**
         * Compares two values
         * 
         * If values are booleans, we compare them directly. If values are
         * arrays, we compare them recursively by their components. Otherwise,
         * we use localeCompare which compares strings.
         * 
         * @param x left value
         * @param y right value
         * @return 1 if x > y, -1 if x < y and 0 if x == y
         */
        compare: function(x, y) {
            if (this.is_boolean(x) && this.is_boolean(y))
                return x === y ? 0 : (x ? 1 : -1);
            if (this.is_array(x) && this.is_array(y)) {
                var len_x = x.length;
                var len_y = y.length;
                var len = Math.min(len_x, len_y);
                for (var i = 0; i < len; ++i) {
                    var c = this.compare(x[i], y[i]);
                    if (c !== 0)
                        return c;
                }
                return len_x === len_y ? 0 : (len_x > len_y ? 1 : -1);
            }
            return x.localeCompare(y);
        },

        /**
         * Parses a boolean string
         * 
         * @param x boolean as a string
         * @return boolean value
         */
        parseBool: function(x) {
            if (this.is_boolean(x))
                return x;
            if (x === "true" || x === "")
                return true;
            if (x === "false")
                return false;
            return null;
        },

        /**
         * Parses an array of type "foo,bar"
         * 
         * @param x array as a string
         * @return array
         */
        parseArray: function(x) {
            return this.is_string(x) ? x.split(",") : x;
        },

        /**
         * Returns the type of a given expression
         * 
         * @param x expression
         * @return type string
         */
        type_of: function(x) {
            if (this.is_array(x))
                return "array";
            return typeof x;
        },

        /**
         * Returns whether argument is a number
         *
         * @param x argument
         * @return true if x is a number
         */
        isNumber: function(x) {
            return typeof x === "number";
        },

        /**
         * Parses an integer string
         *
         * @param x integer as a string
         * @return integer value
         */
        parseInt: function(x) {
            return this.isNumber(x) ? x : parseInt(x, 10);
        },

        /**
         * Parses a float string
         *
         * @param x float as a string
         * @return float value
         */
        parseFloat: function(x) {
            return this.isNumber(x) ? x : parseFloat(x);
        },

        /**
         * Parses a date time string
         *
         * @param x date time as a string
         * @return integer value
         */
        parseDateTime: function(x) {
            if (typeof x === "number")
                return x;
            if (x === null || x === undefined)
                return 0;
            if (typeof x === "object")
                x = x.toString();
            var d = new Date(x);
            return isNaN(d.getTime()) ? parseInt(x, 10) : d.getTime();
        },

        /**
         * Parses a value given a specific type.
         * 
         * @param x value to be parsed
         * @param {string} type the specific type to be parsed (accepts: bool, boolean, int, integer, date, time, datetime, float, double)
         * @return parsed value
         */
        parseType: function(x, type) {
            switch (type.toLowerCase()) {
                case "bool":
                case "boolean":
                    return this.parseBool(x);
                case "int":
                case "integer":
                case "number":
                    return this.parseInt(x);
                case "date":
                case "time":
                case "datetime":
                    return this.parseDateTime(x);
                case "float":
                case "double":
                    return this.parseFloat(x);
                case "array":
                    return this.parseArray(x);
                case "jsonarray":
                    return typeof x === "string" ? JSON.parse(x) : x;
                case "object":
                case "json":
                    return typeof x === "string" ? JSON.parse(x) : x;
                case "id":
                    return typeof x === "object" && x ? x.toString() : x;
                default:
                    return x;
            }
        },

        /**
         * Parses an object with given types.
         * 
         * @param {object} data object with key value pairs
         * @param {object} types object mapping keys to types
         * 
         * @return {object} object with properly parsed types
         */
        parseTypes: function(data, types) {
            var result = {};
            for (var key in data)
                result[key] = key in types ? this.parseType(data[key], types[key]) : data[key];
            return result;
        },

        /**
         * Returns the specific type of a JavaScript object
         * 
         * @param {object} obj an object instance
         * @return {string} the object type
         */
        objectType: function(obj) {
            if (!this.is_object(obj))
                return null;
            var matcher = obj.toString().match(/\[object (.*)\]/);
            return matcher ? matcher[1] : null;
        },

        /**
         * Returns whether a given object is a pure object
         * 
         * @param {object} obj an object instance
         * @return {boolean} true if pure
         */
        is_pure_object: function(obj) {
            return this.is_object(obj) && (obj.toString().toLowerCase() === '[object]' || obj.toString().toLowerCase() === '[object object]');
        },

        /**
         * Takes a value of any type and recursively tries to aggressively replace strings by more specific types.
         *
         * @param data input data
         *
         * @returns typefied data
         */
        typefy: function(data) {
            var simplify = function(data) {
                var len = data.length;
                ["'", '"'].forEach(function(c) {
                    if (data.indexOf(c) === 0 && data.lastIndexOf(c) === data.length - c.length)
                        data = data.substring(c.length, data.length - 2 * c.length + 1);
                });
                data = data.trim();
                return data.length < len ? simplify(data) : data;
            };
            switch (typeof(data)) {
                case "object":
                    if (!Array.isArray(data)) {
                        for (var key in data)
                            data[key] = typefy(data[key]);
                        return data;
                    }
                    return data.map(typefy);
                case "string":
                    data = simplify(data);
                    if (data === "true")
                        return true;
                    if (data === "false")
                        return false;
                    if (parseInt(data, 10) + "" === data)
                        return parseInt(data, 10);
                    return data;
                default:
                    return data;
            }
        }

    };
});