Scoped.define("module:Comparators", ["module:Types", "module:Properties.Properties"], function(Types, Properties) {

    /**
     * Comparator Functions
     * 
     * @module BetaJS.Comparators
     */
    return {


        /**
         * Creates a function that compares two json object w.r.t. a json object, mapping keys to a comparison order,
         * e.g. {'last_name': 1, 'first_name': -1, 'age': -1 }  
         * 
         * @param {json} object comparison object
         * @return {function} function for comparing two objects w.r.t. the comparison object
         */
        byObject: function(object) {
            var self = this;
            return function(left, right) {
                for (var key in object) {
                    var c = 0;
                    if (Properties.is_class_instance(left) && Properties.is_class_instance(right))
                        c = self.byValue(left.get(key) || null, right.get(key) || null);
                    else
                        c = self.byValue(left[key] || null, right[key] || null);
                    if (c !== 0)
                        return c * object[key];
                }
                return 0;
            };
        },


        /**
         * Compares to variables by the natural order in JS.
         * 
         * @param a value A
         * @param b value B
         * @return {int} 1 if a > b, -1 if a < b and 0 otherwise
         */
        byValue: function(a, b) {
            if (Types.is_string(a))
                return a.localeCompare(b);
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
        },


        /**
         * Compares two values a and b recursively.
         * 
         * @param a value A
         * @param b value B
         * @param {int} depth depth limit for the recursion, leave blank for infinite recursion
         * @return {bool} true if both values are equal
         */
        deepEqual: function(a, b, depth) {
            if (depth === 0)
                return true;
            if (depth === 1)
                return a === b;
            if (Types.is_array(a) && Types.is_array(b)) {
                if (a.length !== b.length)
                    return false;
                for (var i = 0; i < a.length; ++i)
                    if (!this.deepEqual(a[i], b[i], depth - 1))
                        return false;
                return true;
            } else if (Types.is_object(a) && Types.is_object(b)) {
                if (!a || !b)
                    return a === b;
                for (var key in a)
                    if (!this.deepEqual(a[key], b[key], depth - 1))
                        return false;
                for (key in b)
                    if (!(key in a))
                        return false;
                return true;
            } else
                return a === b;
        },


        /**
         * Determines whether two lists are equal. Two lists are considered equal if their elements are equal.
         * 
         * @param a list A
         * @param b list B
         * @return {bool} true if both lists are equal
         */
        listEqual: function(a, b) {
            return this.deepEqual(a, b, 2);
        }

    };
});