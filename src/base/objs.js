BetaJS.Objs = {
	
	clone: function (item, depth) {
		if (!depth || depth <= 0)
			return item;
		if (BetaJS.Types.is_array(item))
			return item.slice(0);
		else if (BetaJS.Types.is_object(item))
			return this.extend({}, item, depth-1)
		else
			return item;
	},
	
	extend: function (target, source, depth) {
		for (var key in source)
			target[key] = this.clone(source[key], depth);
		return target;
	},
	
	keys: function(obj, mapped) {
		if (BetaJS.Types.is_undefined(mapped)) {
			var result = [];
			for (var key in obj)
				result.push(key);
			return result;
		} else {
			var result = {};
			for (var key in obj)
				result[key] = mapped;
			return result;
		}
	},
	
	map: function (obj, f, context) {
		if (BetaJS.Types.is_array(obj)) {
			var result = [];
			for (var i = 0; i < obj.length; ++i)
				result.push(context ? f.apply(context, obj[i], i) : f(obj[i], i));
			return result;
		} else {
			var result = {};
			for (var key in obj)
				result[key] = context ? f.apply(context, obj[key], key) : f(obj[key], key);
		}
	},
	
	values: function (obj) {
		var result = [];
		for (var key in obj)
			result.push(obj[key]);
		return result;
	},
	
	filter: function (obj, f, context) {
		if (BetaJS.Types.is_array(obj)) {
			var ret = [];
			for (var i = 0; i < obj.length; ++i) {
				if (context ? f.apply(context, [obj[i], i]) : f(obj[i], i))
					ret.push(obj[i]);
			}
			return ret;
		} else {
			var ret = {};
			for (var key in obj) {
				if (context ? f.apply(context, [obj[key], key]) : f(obj[key], key))
					ret[key] = obj[key];
			}
			return ret;
		}
	},
	
	equals: function (obj1, obj2, depth) {
		if (depth && depth > 0) {
			for (var key in obj1)
				if (!key in obj2 || !this.equals(obj1[key], obj2[key], depth-1))
					return false;
			for (var key in obj2)
				if (!key in obj1)
					return false;
			return true;
		} else
			return obj1 == obj2;
	},
	
	iter: function (obj, f, context) {
		if (BetaJS.Types.is_array(obj))
			for (var i = 0; i < obj.length; ++i) {
				var result = context ? f.apply(context, [obj[i], i]) : f(obj[i], i)
				if (BetaJS.Types.is_defined(result) && !result)
					return;
			}
		else
			for (var key in obj) {
				var result = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
				if (BetaJS.Types.is_defined(result) && !result)
					return;
			}
	},
	
	intersect: function (a, b) {
		var c = {};
		for (var key in a)
			if (key in b)
				c[key] = a[key];
		return c;
	},
	
	contains_key: function (obj, key) {
		if (BetaJS.Types.is_array(obj))
			return BetaJS.Types.is_defined(obj[key])
		else
			return key in obj;
	},
	
	contains_value: function (obj, value) {
		if (BetaJS.Types.is_array(obj)) {
			for (var i = 0; i < obj.length; ++i)
				if (obj[i] === value)
					return true
		} else {
			for (var key in obj)
				if (obj[key] === value)
					return true;
		}
		return false;
	}
	
};
