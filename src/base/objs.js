Scoped.define("module:Objs", [
    "module:Types",
    "module:Functions"
], function(Types, Functions) {

    /**
     * Object and Array Manipulation Routines
     * 
     * @module BetaJS.Objs
     */
    return {

        /**
         * Return the i-th key of an object.
         * 
         * @param {object} obj the object
         * @param {int} i index of the i-th key (default: 0)
         * 
         * @return {string} i-th key
         */
        ithKey: function(obj, i) {
            i = i || 0;
            for (var key in obj) {
                if (i <= 0)
                    return key;
                else
                    --i;
            }
            return null;
        },

        /**
         * Return the i-th value of an object.
         * 
         * @param {object} obj the object
         * @param {int} i index of the i-th value (default: 0)
         * 
         * @return {string} i-th value
         */
        ithValue: function(obj, i) {
            i = i || 0;
            for (var key in obj) {
                if (i <= 0)
                    return obj[key];
                else
                    --i;
            }
            return null;
        },

        /**
         * Return the i-th value of an object or array.
         * 
         * @param obj the object or array
         * @param {int} idx index of the i-th value (default: 0)
         * 
         * @return {string} i-th value
         */
        valueByIndex: function(obj, idx) {
            return Types.is_array(obj) ? obj[idx || 0] : this.ithValue(obj, idx);
        },

        /**
         * Return the i-th key of an object or array.
         * 
         * @param obj the object or array
         * @param {int} idx index of the i-th key (default: 0)
         * 
         * @return i-th key
         */
        keyByIndex: function(obj, idx) {
            return Types.is_array(obj) ? idx || 0 : this.ithKey(obj, idx);
        },

        /**
         * Returns the number of elements of an object or array.
         * 
         * @param obj object or array
         * 
         * @return {int} number of elements
         */
        count: function(obj) {
            if (Types.is_array(obj))
                return obj.length;
            else {
                var c = 0;
                for (var key in obj)
                    c++;
                return c;
            }
        },

        /**
         * Clone an object or array up to a certain depth.
         * 
         * @param item object or array
         * @param {int} depth depth until to clone it (default 0)
         * 
         * @return cloned object or array
         */
        clone: function(item, depth) {
            if (!item || !depth || depth === 0)
                return item;
            if (Types.is_array(item))
                return item.slice(0);
            else if (Types.is_object(item))
                return this.extend({}, item, depth - 1);
            else
                return item;
        },

        /**
         * Acyclicly clone an object.
         * 
         * @param {object} object source object
         * 
         * @return acyclic cloned object
         */
        acyclic_clone: function(object) {
            if (object === null || !Types.is_object(object))
                return object;
            var s = "__acyclic_cloned";
            if (object[s])
                return object[s];
            var result = {};
            object[s] = result;
            for (var key in object)
                if (key !== s)
                    result[key] = this.acyclic_clone(object[key]);
            delete object[s];
            return result;
        },

        /**
         * Extend target object by source object, modifying target object in-place.
         * 
         * @param {object} target target object
         * @param {object} source source object
         * @param {int} depth optional depth for cloning source values
         * 
         * @return {object} target object
         */
        extend: function(target, source, depth) {
            target = target || {};
            if (source) {
                for (var key in source)
                    target[key] = this.clone(source[key], depth);
            }
            return target;
        },

        /**
         * Extend target object by source objects, modifying target object in-place.
         *
         */
        multi_extend: function() {
            var args = Functions.getArguments(arguments);
            var depth;
            if (!Types.is_object(args[args.length - 1])) {
                depth = args[args.length - 1];
                args.pop();
            }
            while (args.length > 1) {
                args[1] = this.extend(args[0], args[1], depth);
                args.shift();
            }
            return args[0];
        },

        /**
         * Weakly extend target object by source object, modifying target object in-place.
         * If a key already exists within the target object, it is not overwritten by source.
         * 
         * @param {object} target target object
         * @param {object} source source object
         * @param {int} depth optional depth for cloning source values
         * 
         * @return {object} target object
         */
        weak_extend: function(target, source, depth) {
            target = target || {};
            if (source) {
                for (var key in source) {
                    if (!(key in target))
                        target[key] = this.clone(source[key], depth);
                }
            }
            return target;
        },

        /**
         * Extend target object by source object recursively, modifying target object in-place.
         * 
         * @param {object} target target object
         * @param {object} source source object
         * @param {int} depth optional depth for cloning source values
         * 
         * @return {object} target object
         */
        tree_extend: function(target, source, depth) {
            target = target || {};
            if (source) {
                for (var key in source) {
                    if (key in target && Types.is_object(target[key]) && Types.is_object(source[key]) && !Types.is_array(target[key]) && !Types.is_array(source[key]))
                        target[key] = this.tree_extend(target[key], source[key], depth);
                    else
                        target[key] = this.clone(source[key], depth);
                }
            }
            return target;
        },

        /**
         * Returns the keys of an object.
         * If mapped is given, an object is returned with all keys mapped to mapped. Otherwise, an array is returned.
         * 
         * @param {object} object source object
         * @param mapped optional value
         * 
         * @return keys as array or as an object
         */
        keys: function(obj, mapped) {
            var result = null;
            var key = null;
            if (Types.is_undefined(mapped)) {
                result = [];
                for (key in obj)
                    result.push(key);
                return result;
            } else {
                result = {};
                for (key in obj)
                    result[key] = mapped;
                return result;
            }
        },

        /**
         * Returns true if all key-value-pairs of the first object are contained in the second object.
         * 
         * @param a first object or array
         * @param b second object or array
         * 
         * @return {boolean} true if first contained in second
         */
        subset_of: function(a, b) {
            a = Types.is_array(a) ? this.objectify(a) : a;
            b = Types.is_array(b) ? this.objectify(b) : b;
            for (var key in a)
                if (a[key] != b[key])
                    return false;
            return true;
        },

        /**
         * Returns true if all key-value-pairs of the second object are contained in the first object.
         * 
         * @param a first object or array
         * @param b second object or array
         * 
         * @return {boolean} true if second contained in first
         */
        superset_of: function(a, b) {
            return this.subset_of(b, a);
        },

        /**
         * Converts an array into an object by pairing together odd and even items.
         * 
         * @param {array} arr array with pairs
         * 
         * @return {object} created object
         */
        pairArrayToObject: function(arr) {
            var result = {};
            for (var i = 0; i < arr.length / 2; i += 2)
                result[arr[i]] = arr[i + 1];
            return result;
        },

        /**
         * Converts a list of arguments into an object by pairing together odd and even arguments.
         * 
         * @return {object} created object
         */
        pairsToObject: function() {
            var result = {};
            for (var i = 0; i < arguments.length; ++i)
                result[arguments[i][0]] = arguments[i][1];
            return result;
        },

        /**
         * Inverses the key-value pairs in an object.
         * 
         * @param {object} obj object to be reversed
         * @return {object} object with reversed key-value-pairs
         */
        inverseKeyValue: function(obj) {
            var result = {};
            this.iter(obj, function(value, key) {
                result[value] = key;
            });
            return result;
        },

        /**
         * Returns true if an entry in an object or array exists.
         * 
         * @param obj object or array
         * @param {function} f function to check for an entry to exist
         * @param {object} context optional context for the function
         * 
         * @return {boolean} returns true if an entry exists
         * 
         */
        exists: function(obj, f, context) {
            var success = false;
            this.iter(obj, function() {
                success = success || f.apply(this, arguments);
                return !success;
            }, context);
            return success;
        },

        /**
         * Returns true if all entries in an object or array satisfy a condition
         * 
         * @param obj object or array
         * @param {function} f function to check for the condition
         * @param {object} context optional context for the function
         * 
         * @return {boolean} returns true if all entries satisfy the condition
         * 
         */
        all: function(obj, f, context) {
            var success = true;
            this.iter(obj, function() {
                success = success && f.apply(this, arguments);
                return success;
            }, context);
            return success;
        },

        /**
         * Returns the first entry of an object or array.
         * 
         * @param obj object or array
         * 
         * @return first entry
         */
        peek: function(obj) {
            if (Types.is_array(obj))
                return obj.length > 0 ? obj[0] : null;
            for (var key in obj)
                return obj[key];
            return null;
        },

        /**
         * Returns and removes the first entry of an object or array.
         * 
         * @param obj object or array
         * 
         * @return first entry
         */
        poll: function(obj) {
            if (Types.is_array(obj))
                return obj.shift();
            for (var key in obj) {
                var item = obj[key];
                delete obj[key];
                return item;
            }
            return null;
        },

        /**
         * Iterates over an object or array, calling a callback function for each item.
         * 
         * @param obj object or array
         * @param {function} f callback function
         * @param {object} context optional callback context
         * 
         */
        iter: function(obj, f, context) {
            var result = null;
            if (Types.is_array(obj)) {
                for (var i = 0; i < obj.length; ++i) {
                    result = context ? f.apply(context, [obj[i], i]) : f(obj[i], i);
                    if (Types.is_defined(result) && !result)
                        return false;
                }
            } else {
                for (var key in obj) {
                    result = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
                    if (Types.is_defined(result) && !result)
                        return false;
                }
            }
            return true;
        },

        /**
         * Creates the intersection object of two objects.
         * 
         * @param {object} a object one
         * @param {object} b object two
         * 
         * @return {object} intersection object
         */
        intersect: function(a, b) {
            var c = {};
            for (var key in a) {
                if (key in b)
                    c[key] = a[key];
            }
            return c;
        },

        /**
         * Determines whether two objects have the same set of keys.
         *
         * @param {object} a object one
         * @param {object} b object two
         *
         * @return {boolean} true if same keys
         */
        keyEquals: function(a, b) {
            for (var key in a)
                if (!(key in b))
                    return false;
            for (key in b)
                if (!(key in a))
                    return false;
            return true;
        },

        /**
         * Splits an object into two according to a callback function
         *
         * @param {object} obj object to split
         * @param {function} f function to determine how to split
         * @param {object} ctx optional context
         *
         * @return {array} two element array of two split objects
         */
        splitObject: function(obj, f, ctx) {
            var x = {};
            var y = {};
            this.iter(obj, function(value, key) {
                if (f.apply(this, arguments))
                    x[key] = value;
                else
                    y[key] = value;
            }, ctx);
            return [x, y];
        },

        /**
         * Creates the difference object of two objects.
         * 
         * @param {object} a object one
         * @param {object} b object two
         * 
         * @return {object} difference object
         */
        diff: function(a, b) {
            var c = {};
            for (var key in a)
                if (!(key in b) || a[key] !== b[key])
                    c[key] = a[key];
            return c;
        },

        /**
         * Determines whether a key exists in an array or object.
         * 
         * @param obj object or array
         * @param key search key
         * 
         * @return {boolean} true if key is contained in obj
         */
        contains_key: function(obj, key) {
            if (Types.is_array(obj))
                return Types.is_defined(obj[key]);
            else
                return key in obj;
        },

        /**
         * Determines whether a value exists in an array or object.
         * 
         * @param obj object or array
         * @param value search value
         * 
         * @return {boolean} true if value is contained in obj
         */
        contains_value: function(obj, value) {
            if (Types.is_array(obj)) {
                for (var i = 0; i < obj.length; ++i) {
                    if (obj[i] === value)
                        return true;
                }
            } else {
                for (var key in obj) {
                    if (obj[key] === value)
                        return true;
                }
            }
            return false;
        },

        /**
         * Maps an array of object, mapping values using a function.
         * 
         * @param obj object or array
         * @param {function} f function for mapping values
         * @param {object} context function context
         * 
         * @return object or array with mapped values
         * 
         */
        map: function(obj, f, context) {
            var result = null;
            context = context || this;
            if (Types.is_array(obj)) {
                result = [];
                for (var i = 0; i < obj.length; ++i)
                    result.push(f.call(context, obj[i], i));
                return result;
            } else {
                result = {};
                for (var key in obj)
                    result[key] = f.call(context, obj[key], key);
                return result;
            }
        },

        /**
         * Maps the keys of an object using a function.
         * 
         * @param {object} obj object
         * @param {function} f function for mapping keys
         * @param {object} context function context
         * 
         * @return {object} object with mapped keys
         */
        keyMap: function(obj, f, context) {
            result = {};
            context = context || this;
            for (var key in obj)
                result[f.call(context, obj[key], key)] = obj[key];
            return result;
        },

        /**
         * Returns all values of an object as an array.
         * 
         * @param {object} obj object
         * 
         * @return {array} values of object as array
         */
        values: function(obj) {
            var result = [];
            for (var key in obj)
                result.push(obj[key]);
            return result;
        },

        /**
         * Filters all values of an object or array.
         * 
         * @param obj object or array
         * @param {function} f filter function
         * @param {object} context filter function context
         * 
         * @return object or array with filtered items
         */
        filter: function(obj, f, context) {
            f = f || function(x) {
                return !!x;
            };
            if (Types.is_array(obj))
                return obj.filter(f, context);
            var ret = {};
            for (var key in obj) {
                if (context ? f.apply(context, [obj[key], key]) : f(obj[key], key))
                    ret[key] = obj[key];
            }
            return ret;
        },

        /**
         * Tests two objects for deep equality up to a certain depth.
         * 
         * @param {object} obj1 first object
         * @param {object} obj2 second object
         * @param {int} depth depth until deep comparison should be done
         * 
         * @return {boolean} true if both objects are equal 
         */
        equals: function(obj1, obj2, depth) {
            var key = null;
            if (depth && depth > 0) {
                for (key in obj1) {
                    if (!(key in obj2) || !this.equals(obj1[key], obj2[key], depth - 1))
                        return false;
                }
                for (key in obj2) {
                    if (!(key in obj1))
                        return false;
                }
                return true;
            } else
                return obj1 == obj2;
        },

        /**
         * Converts an array into object using the array values as keys.
         * 
         * @param {array} arr array to be converted
         * @param f a function mapping the value of an array to a value of the object, or a constant value, or undefined (then true is used)
         * @param {object} context optional function context
         * 
         * @return {object} converted object
         */
        objectify: function(arr, f, context) {
            var result = {};
            var is_function = Types.is_function(f);
            if (Types.is_undefined(f))
                f = true;
            for (var i = 0; i < arr.length; ++i)
                result[arr[i]] = is_function ? f.apply(context || this, [arr[i], i]) : f;
            return result;
        },

        /**
         * Converts an object into an array using a function to merge value and key.
         *
         * @param {object} obj obj to be converted
         * @param f a function mapping the value and key to an item instance of the array
         * @param {object} context optional function context
         *
         * @return {array} converted array
         */
        arrayify: function(obj, f, context) {
            var result = [];
            this.iter(obj, function(value, key) {
                result.push(f.call(this, value, key));
            }, context);
            return result;
        },

        /**
         * Creates an object by pairing up the arguments to key value pairs.
         * 
         * @return {object} created object
         */
        objectBy: function() {
            var obj = {};
            var count = arguments.length / 2;
            for (var i = 0; i < count; ++i)
                obj[arguments[2 * i]] = arguments[2 * i + 1];
            return obj;
        },

        /**
         * Extracts all key-value pairs from an object instance not matching default key-value pairs in another instance.
         * 
         * @param {object} ordinary object with default key-value pairs
         * @param {object} concrete object with a concrete list of key-value pairs
         * @param {boolean} keys if true, iterating over the ordinary keys, otherwise iterating over the conrete keys (default)
         * 
         * @return {object} specialized key-value pairs
         */
        specialize: function(ordinary, concrete, keys) {
            var result = {};
            var iterateOver = keys ? ordinary : concrete;
            for (var key in iterateOver)
                if (!(key in ordinary) || ordinary[key] != concrete[key])
                    result[key] = concrete[key];
            return result;
        },

        /**
         * Merges to objects.
         * 
         * @param {object} secondary Secondary object
         * @param {object} primary Primary object
         * @param {object} options Key-based options for merging
         * 
         * @return {object} Merged object
         */
        merge: function(secondary, primary, options) {
            secondary = secondary || {};
            primary = primary || {};
            var result = {};
            var keys = this.extend(this.keys(secondary, true), this.keys(primary, true));
            for (var key in keys) {
                var opt = key in options ? options[key] : "primary";
                if (opt == "primary" || opt == "secondary") {
                    if (key in primary || key in secondary) {
                        if (opt == "primary")
                            result[key] = key in primary ? primary[key] : secondary[key];
                        else
                            result[key] = key in secondary ? secondary[key] : primary[key];
                    }
                } else if (Types.is_function(opt))
                    result[key] = opt(secondary[key], primary[key]);
                else if (Types.is_object(opt))
                    result[key] = this.merge(secondary[key], primary[key], opt);
            }
            return result;
        },

        /**
         * Recursively merges one object into another without modifying the source objects.
         * 
         * @param {object} secondary Object to be merged into.
         * @param {object} primary Object to be merged in
         * 
         * @return {object} Recursively merged object
         */
        tree_merge: function(secondary, primary) {
            secondary = secondary || {};
            primary = primary || {};
            var result = {};
            var keys = this.extend(this.keys(secondary, true), this.keys(primary, true));
            for (var key in keys) {
                if (Types.is_object(primary[key]) && secondary[key])
                    result[key] = this.tree_merge(secondary[key], primary[key]);
                else
                    result[key] = key in primary ? primary[key] : secondary[key];
            }
            return result;
        },

        /**
         * Serializes an object in such a way that all subscopes appear in a flat notation.
         * 
         * @param {object} obj source object
         * @param {string} head prefix header, usually empty
         * 
         * @return {array} serialized object
         */
        serializeFlatJSON: function(obj, head) {
            var result = [];
            if (Types.is_array(obj) && obj) {
                obj.forEach(function(value) {
                    result = result.concat(this.serializeFlatJSON(value, head + "[]"));
                }, this);
            } else if (Types.is_object(obj) && obj) {
                this.iter(obj, function(value, key) {
                    result = result.concat(this.serializeFlatJSON(value, head ? head + "[" + key + "]" : key));
                }, this);
            } else {
                result = [{
                    key: head,
                    value: obj
                }];
            }
            return result;
        },

        /**
         * Converts an object into an array by calling a custom function for combining key and value.
         *
         * @param {object} obj source object
         * @param f a function for combining key and value
         * @param {object} context optional function context
         *
         * @return {array} resulint arrayarray
         */
        objectToArray: function(obj, f, ctx) {
            var a = [];
            this.iter(obj, function(value, key) {
                a.push(f.call(this, key, value));
            }, ctx);
            return a;
        },

        /**
         * Initializes an array with pre-computed values using a callback function.
         *
         * @param {int} count number of elements to be generated
         * @param {function} callback function for computing the elements
         * @param {object} context optional context
         * @returns {array} generated array
         */
        initArray: function(count, callback, context) {
            var result = [];
            for (var i = 0; i < count; ++i)
                result.push(callback.call(context || this, i));
            return result;
        },

        /**
         * Merge key / values from two objects; merge value with callback function on intersection of both objects
         *
         * @param {object} obj1 first object
         * @param {object} obj2 second object
         * @param {function} merger merging function
         * @param {object} mergerCtx optional context
         */
        customMerge: function(obj1, obj2, merger, mergerCtx) {
            var result = {};
            for (var key1 in obj1)
                result[key1] = key1 in obj2 ? merger.call(mergerCtx, key1, obj1[key1], obj2[key1]) : obj1[key1];
            for (var key2 in obj2)
                if (!(key2 in obj1))
                    result[key2] = obj2[key2];
            return result;
        },

        indexizeArray: function(arr, keyName) {
            var result = {};
            arr.forEach(function(value) {
                result[value[keyName]] = value;
            });
            return result;
        },

        filterOutValues: function(obj, values) {
            return this.filter(obj, function(value) {
                return !values.includes(value);
            });
        },

        mergeSortedArrays: function(arr1, arr2, compare) {
            compare = compare || function(a, b) {
                return a > b ? 1 : (a < b ? -1 : 0);
            };
            var result = [];
            var i = 0;
            arr1.forEach(function(el1) {
                while (i < arr2.length && compare(el1, arr2[i]) > 0) {
                    result.push(arr2[i]);
                    i++;
                }
                result.push(el1);
                while (i < arr2.length && compare(el1, arr2[i]) === 0)
                    i++;
            });
            while (i < arr2.length) {
                result.push(arr2[i]);
                i++;
            }
            return result;
        }

    };
});


Scoped.define("module:Objs.Scopes", ["module:Types"], function(Types) {
    /**
     * Scoped access of keys within objects.
     * 
     * @module BetaJS.Objs.Scopes
     */
    return {

        /**
         * Determines whether a scoped key exists within a scope.
         * 
         * @param {string} key key within scope
         * @param {object} name scope context
         * 
         * @return {boolean} true if key exists within scope
         */
        has: function(key, scope) {
            var keys = key ? key.split(".") : [];
            for (var i = 0; i < keys.length; ++i) {
                if (!scope || !Types.is_object(scope))
                    return false;
                scope = scope[keys[i]];
            }
            return Types.is_defined(scope);
        },

        /**
         * Returns the value of a key within a scope.
         * 
         * @param {string} key key within scope
         * @param {object} name scope context
         * 
         * @return Value for key in scope
         */
        get: function(key, scope) {
            var keys = key ? key.split(".") : [];
            for (var i = 0; i < keys.length; ++i) {
                if (!scope || !Types.is_object(scope))
                    return null;
                scope = scope[keys[i]];
            }
            return scope;
        },

        /**
         * Sets the value of a key within a scope.
         * 
         * @param {string} key key within scope
         * @param name value to be set
         * @param {object} name scope context
         */
        set: function(key, value, scope) {
            if (!key)
                return;
            var keys = key.split(".");
            for (var i = 0; i < keys.length - 1; ++i) {
                if (!(keys[i] in scope) || !Types.is_object(scope[keys[i]]))
                    scope[keys[i]] = {};
                scope = scope[keys[i]];
            }
            scope[keys[keys.length - 1]] = value;
        },

        /**
         * Unsets a key within a scope.
         * 
         * @param {string} key key within scope
         * @param {object} name scope context
         */
        unset: function(key, scope) {
            if (!key)
                return;
            var keys = key.split(".");
            for (var i = 0; i < keys.length - 1; ++i) {
                if (!scope || !Types.is_object(scope))
                    return;
                scope = scope[keys[i]];
            }
            delete scope[keys[keys.length - 1]];
        },

        /**
         * Makes sure that a certain key is accessible within a scope.
         * 
         * @param {string} key key within scope
         * @param {object} name scope context
         * 
         * @return Touched value
         */
        touch: function(key, scope) {
            if (!key)
                return scope;
            var keys = key.split(".");
            for (var i = 0; i < keys.length; ++i) {
                if (!(keys[i] in scope) || !Types.is_object(scope))
                    scope[keys[i]] = {};
                scope = scope[keys[i]];
            }
            return scope[keys[keys.length - 1]];
        }

    };
});