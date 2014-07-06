BetaJS.Sort = {

	sort_object : function(object, f) {
		var a = [];
		for (var key in object)
		a.push({
			key : key,
			value : object[key]
		});
		a.sort(function (x, y) {
			return f(x.key, y.key, x.value, y.value);
		});
		var o = {};
		for (var i = 0; i < a.length; ++i)
			o[a[i].key] = a[i].value;
		return o;
	},
	
	deep_sort: function (object, f) {
		f = f || BetaJS.Comparators.byValue;
		if (BetaJS.Types.is_array(object)) {
			for (var i = 0; i < object.length; ++i)
				object[i] = this.deep_sort(object[i], f);
			return object.sort(f);
		} else if (BetaJS.Types.is_object(object)) {
			for (var key in object)
				object[key] = this.deep_sort(object[key], f);
			return this.sort_object(object, f);
		} else
			return f;
	},

	dependency_sort : function(items, identifier, before, after) {
		var identifierf = BetaJS.Types.is_string(identifier) ? function(obj) {
			return obj[identifier];
		} : identifier;
		var beforef = BetaJS.Types.is_string(before) ? function(obj) {
			return obj[before];
		} : before;
		var afterf = BetaJS.Types.is_string(after) ? function(obj) {
			return obj[after];
		} : after;
		var n = items.length;
		var data = [];
		var identifier_to_index = {};
		var todo = {};
		var i = null;
		for ( i = 0; i < n; ++i) {
			todo[i] = true;
			var ident = identifierf(items[i], i);
			identifier_to_index[ident] = i;
			data.push({
				before : {},
				after : {}
			});
		}
		for ( i = 0; i < n; ++i) {
			BetaJS.Objs.iter(beforef(items[i], i) || [], function(before) {
				var before_index = identifier_to_index[before];
				if (BetaJS.Types.is_defined(before_index)) {
					data[i].before[before_index] = true;
					data[before_index].after[i] = true;
				}
			});
			BetaJS.Objs.iter(afterf(items[i]) || [], function(after) {
				var after_index = identifier_to_index[after];
				if (BetaJS.Types.is_defined(after_index)) {
					data[i].after[after_index] = true;
					data[after_index].before[i] = true;
				}
			});
		}
		var result = [];
		while (!BetaJS.Types.is_empty(todo)) {
			for (i in todo) {
				if (BetaJS.Types.is_empty(data[i].after)) {
					delete todo[i];
					result.push(items[i]);
					for (bef in data[i].before)
					delete data[bef].after[i];
				}
			}
		}
		return result;
	}
};
