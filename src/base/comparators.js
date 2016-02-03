Scoped.define("module:Comparators", ["module:Types", "module:Properties.Properties"], function (Types, Properties) {
	return {		
		
		byObject: function (object) {
			var self = this;
			return function (left, right) {
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
		
		byValue: function (a, b) {
			if (Types.is_string(a))
				return a.localeCompare(b);
			if (a < b)
				return -1;
			if (a > b)
				return 1;
			return 0;
		},
		
		deepEqual: function (a, b, depth) {
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
				if ((a && !b) || (b && !a))
					return a || b;
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
		
		listEqual: function (a, b) {
			return this.deepEqual(a, b, 2);
		}
			
	};
});