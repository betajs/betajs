Scoped.extend("module:Iterators", ["module:Types", "module:Iterators.Iterator", "module:Iterators.ArrayIterator"], function (Types, Iterator, ArrayIterator) {
	return {
		ensure: function (mixed) {
			if (mixed === null)
				return new ArrayIterator([]);
			if (mixed.instance_of(Iterator))
				return mixed;
			if (Types.is_array(mixed))
				return new ArrayIterator(mixed);
			return new ArrayIterator([mixed]);
		}		
	};
});


Scoped.define("module:Iterators.Iterator", [
    "module:Class",
    "module:Functions",
    "module:Async",
    "module:Promise"
], function (Class, Functions, Async, Promise, scoped) {
	return Class.extend({scoped: scoped}, {
		
		hasNext: function () {
			return false;
		},
		
		next: function () {
			return null;
		},
		
		nextOrNull: function () {
			return this.hasNext() ? this.next() : null;
		},

		asArray: function () {
			var arr = [];
			while (this.hasNext())
				arr.push(this.next());
			return arr;
		},

		asArrayDelegate: function (f) {
			var arr = [];
			while (this.hasNext()) {
				var obj = this.next();			
				arr.push(obj[f].apply(obj, Functions.getArguments(arguments, 1)));
			}
			return arr;
		},

		iterate: function (cb, ctx) {
			while (this.hasNext()) {
				var result = cb.call(ctx || this, this.next());
				if (result === false)
					return;
			}
		},
		
		asyncIterate: function (cb, ctx, time) {
			if (!this.hasNext())
				return Promise.value(true);
			var result = cb.call(ctx || this, this.next());
			if (result === false)
				return Promise.value(true);
			var promise = Promise.create();
			Async.eventually(function () {
				this.asyncIterate(cb, ctx, time).forwardCallback(promise);
			}, this, time);
			return promise;
		}

	});
});
