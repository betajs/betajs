Scoped.define("module:Objs", [
    "module:Types"
], function (Types) {
	
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
		ithKey: function (obj, i) {
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
		ithValue: function (obj, i) {
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
		valueByIndex: function (obj, idx) {
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
		keyByIndex: function (obj, idx) {
			return Types.is_array(obj) ? idx || 0 : this.ithKey(obj, idx);
		},

		/**
		 * Returns the number of elements of an object or array.
		 * 
		 * @param obj object or array
		 * 
		 * @return {int} number of elements
		 */
		count: function (obj) {
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
		clone: function (item, depth) {
			if (!depth || depth === 0)
				return item;
			if (Types.is_array(item))
				return item.slice(0);
			else if (Types.is_object(item))
				return this.extend({}, item, depth-1);
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
		acyclic_clone: function (object) {
			if (object === null || ! Types.is_object(object))
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
		extend: function (target, source, depth) {
			target = target || {};
			if (source) {
				for (var key in source)
					target[key] = this.clone(source[key], depth);
			}
			return target;
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
		weak_extend: function (target, source, depth) {
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
		tree_extend: function (target, source, depth) {
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
		subset_of: function (a, b) {
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
		superset_of: function (a, b) {
			return this.subset_of(b, a);
		},
		
		/**
		 * Converts an array into an object by pairing together odd and even items.
		 * 
		 * @param {array} arr array with pairs
		 * 
		 * @return {object} created object
		 */
		pairArrayToObject: function (arr) {
			var result = {};
			for (var i = 0; i < arr.length / 2; i += 2)
				result[arr[i]] = arr[i+1];
			return result;
		},
		
		/**
		 * Converts a list of arguments into an object by pairing together odd and even arguments.
		 * 
		 * @return {object} created object
		 */
		pairsToObject: function () {
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
		inverseKeyValue: function (obj) {
			var result = {};
			this.iter(obj, function (value, key) {
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
		exists: function (obj, f, context) {
			var success = false;
			this.iter(obj, function () {
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
		all: function (obj, f, context) {
			var success = true;
			this.iter(obj, function () {
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
		peek: function (obj) {
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
		poll: function (obj) {
			if (Types.is_array(obj))
				return obj.shift();
			for (var key in obj) {
				var item = obj[key];
				delete obj[key];
				return item;
			}
			return null;
		},

		merge: function (secondary, primary, options) {
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
				}
				else if (Types.is_function(opt))
					result[key] = opt(secondary[key], primary[key]);
				else if (Types.is_object(opt))
					result[key] = this.merge(secondary[key], primary[key], opt);
			}
			return result;
		},

		tree_merge: function (secondary, primary) {
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

		map: function (obj, f, context) {
			var result = null;
			if (Types.is_array(obj)) {
				result = [];
				for (var i = 0; i < obj.length; ++i)
					result.push(context ? f.apply(context, [obj[i], i]) : f(obj[i], i));
				return result;
			} else {
				result = {};
				for (var key in obj)
					result[key] = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
				return result;
			}
		},

		keyMap: function (obj, f, context) {
			result = {};
			for (var key in obj)
				result[f.call(context || this, obj[key], key)] = obj[key];
			return result;
		},

		values: function (obj) {
			var result = [];
			for (var key in obj)
				result.push(obj[key]);
			return result;
		},

		filter: function (obj, f, context) {
			f = f || function (x) { return !!x; };
			if (Types.is_array(obj))
				return obj.filter(f, context);
			var ret = {};
			for (var key in obj) {
				if (context ? f.apply(context, [obj[key], key]) : f(obj[key], key))
					ret[key] = obj[key];
			}
			return ret;
		},

		equals: function (obj1, obj2, depth) {
			var key = null;
			if (depth && depth > 0) {
				for (key in obj1) {
					if (!(key in obj2) || !this.equals(obj1[key], obj2[key], depth-1))
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

		iter: function (obj, f, context) {
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

		intersect: function (a, b) {
			var c = {};
			for (var key in a) {
				if (key in b)
					c[key] = a[key];
			}
			return c;
		},
		
		diff: function (a, b) {
			var c = {};
			for (var key in a)
				if (!(key in b) || a[key] !== b[key])
					c[key] = a[key];
			return c;
		},
		
		contains_key: function (obj, key) {
			if (Types.is_array(obj))
				return Types.is_defined(obj[key]);
			else
				return key in obj;
		},

		contains_value: function (obj, value) {
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

		objectify: function (arr, f, context) {
			var result = {};
			var is_function = Types.is_function(f);
			if (Types.is_undefined(f))
				f = true;
			for (var i = 0; i < arr.length; ++i)
				result[arr[i]] = is_function ? f.apply(context || this, [arr[i], i]) : f;
				return result;
		},

		objectBy: function () {
			var obj = {};
			var count = arguments.length / 2;
			for (var i = 0; i < count; ++i)
				obj[arguments[2 * i]] = arguments[2 * i + 1];
			return obj;
		},

		specialize: function (ordinary, concrete, keys) {
			var result = {};
			var iterateOver = keys ? ordinary : concrete;
			for (var key in iterateOver)
				if (!(key in ordinary) || ordinary[key] != concrete[key])
					result[key] = concrete[key];
			return result;
		}

	};
});


Scoped.define("module:Objs.Scopes", ["module:Types"], function (Types) {
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
		has: function (key, scope) {
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
		get: function (key, scope) {
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
		set: function (key, value, scope) {
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
		unset: function (key, scope) {
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
		touch: function (key, scope) {
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
