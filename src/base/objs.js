BetaJS.Objs = {
	
	clone: function (item, depth) {
		if (BetaJS.Types.is_object(item) && depth && depth > 0)
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
	
	// Iterates over all object properties or array entries 
	iter: function (obj, f) {
		if (BetaJS.Types.is_array(obj))
			for (var i = 0; i < obj.length; ++i) {
				var result = f(obj[i], i)
				if (BetaJS.Types.is_defined(result) && !result)
					return;
			}
		else
			for (var key in obj) {
				f(obj[key], key);
				if (BetaJS.Types.is_defined(result) && !result)
					return;
			}
	}
	
};
