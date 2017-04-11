Scoped.define("module:Sort", [
    "module:Comparators",
    "module:Types",
    "module:Objs"
], function(Comparators, Types, Objs) {

    /**
     * Sort objects and arrays.
     * 
     * @module BetaJS.Sort
     */
    return {

        /**
         * Sort keys in an object according to a comparator. 
         * 
         * @param {object} object object to be sorted
         * @param {function} f comparator comparator for sorting, accepting keys first and then optionally values
         * 
         * @return {object} sorted object
         */
        sort_object: function(object, f) {
            var a = [];
            for (var key in object)
                a.push({
                    key: key,
                    value: object[key]
                });
            a.sort(function(x, y) {
                return f(x.key, y.key, x.value, y.value);
            });
            var o = {};
            for (var i = 0; i < a.length; ++i)
                o[a[i].key] = a[i].value;
            return o;
        },

        /**
         * Deep sorting an object according to a comparator. 
         * 
         * @param {object} object object to be sorted
         * @param {function} f comparator comparator for sorting, accepting keys first and then optionally values
         * 
         * @return {object} sorted object
         */
        deep_sort: function(object, f) {
            f = f || Comparators.byValue;
            if (Types.is_array(object)) {
                for (var i = 0; i < object.length; ++i)
                    object[i] = this.deep_sort(object[i], f);
                return object.sort(f);
            } else if (Types.is_object(object)) {
                for (var key in object)
                    object[key] = this.deep_sort(object[key], f);
                return this.sort_object(object, f);
            } else
                return object;
        },

        /**
         * Sort an array of items with inter-dependency specifiers s.t. every item in the resulting array has all its dependencies come before.
         * 
         * @param {array} items list of items with inter-dependency specifiers
         * @param {string|function} identifier function / key mapping an item to its unique identifier
         * @param {string|function} before function / key mapping an item to its array of dependencies
         * @param {string|function} after function / key mapping an item to its array of depending items
         * 
         * @return {array} sorted array
         */
        dependency_sort: function(items, identifier, before, after) {
            var identifierf = Types.is_string(identifier) ? function(obj) {
                return obj[identifier];
            } : identifier;
            var beforef = Types.is_string(before) ? function(obj) {
                return obj[before];
            } : before;
            var afterf = Types.is_string(after) ? function(obj) {
                return obj[after];
            } : after;
            var n = items.length;
            var data = [];
            var identifier_to_index = {};
            var todo = {};
            var i = 0;
            for (i = 0; i < n; ++i) {
                todo[i] = true;
                var ident = identifierf(items[i], i);
                identifier_to_index[ident] = i;
                data.push({
                    before: {},
                    after: {}
                });
            }
            var make_before_iter_func = function(i) {
                return function(before) {
                    var before_index = identifier_to_index[before];
                    if (Types.is_defined(before_index)) {
                        data[i].before[before_index] = true;
                        data[before_index].after[i] = true;
                    }
                };
            };
            var make_after_iter_func = function(i) {
                return function(after) {
                    var after_index = identifier_to_index[after];
                    if (Types.is_defined(after_index)) {
                        data[i].after[after_index] = true;
                        data[after_index].before[i] = true;
                    }
                };
            };
            for (i = 0; i < n; ++i) {
                Objs.iter(beforef(items[i], i) || [], make_before_iter_func(i));
                Objs.iter(afterf(items[i]) || [], make_after_iter_func(i));
            }
            var result = [];
            while (!Types.is_empty(todo)) {
                for (i in todo) {
                    if (Types.is_empty(data[i].after)) {
                        delete todo[i];
                        result.push(items[i]);
                        for (var bef in data[i].before)
                            delete data[bef].after[i];
                    }
                }
            }
            return result;
        }

    };
});