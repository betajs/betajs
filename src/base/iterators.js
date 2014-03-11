BetaJS.Iterators = {
	
	ensure: function (mixed) {
		if (mixed === null)
			return new BetaJS.Iterators.ArrayIterator([]);
		if (mixed.instance_of(BetaJS.Iterators.Iterator))
			return mixed;
		if (BetaJS.Types.is_array(mixed))
			return new BetaJS.Iterators.ArrayIterator(mixed);
		return new BetaJS.Iterators.ArrayIterator([mixed]);
	}
	
};

BetaJS.Class.extend("BetaJS.Iterators.Iterator", {
	
	asArray: function () {
		var arr = [];
		while (this.hasNext())
			arr.push(this.next());
		return arr;
	}
	
});

BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.ArrayIterator", {
	
	constructor: function (arr) {
		this._inherited(BetaJS.Iterators.ArrayIterator, "constructor");
		this.__array = arr;
		this.__i = 0;
	},
	
	hasNext: function () {
		return this.__i < this.__array.length;
	},
	
	next: function () {
		var ret = this.__array[this.__i];
		this.__i++;
		return ret;
	}
	
});

BetaJS.Iterators.ArrayIterator.extend("BetaJS.Iterators.ObjectKeysIterator", {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Iterators.ObjectKeysIterator, "constructor", BetaJS.Objs.keys(obj));
	}
	
});

BetaJS.Iterators.ArrayIterator.extend("BetaJS.Iterators.ObjectValuesIterator", {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Iterators.ObjectValuesIterator, "constructor", BetaJS.Objs.values(obj));
	}
	
});

BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.MappedIterator", {
	
	constructor: function (iterator, map, context) {
		this._inherited(BetaJS.Iterators.MappedIterator, "constructor");
		this.__iterator = iterator;
		this.__map = map;
		this.__context = context || this;
	},
	
	hasNext: function () {
		return this.__iterator.hasNext();
	},
	
	next: function () {
		return this.hasNext() ? this.__map.call(this.__context, this.__iterator.next()) : null;
	}
	
});

BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.FilteredIterator", {
	
	constructor: function (iterator, filter, context) {
		this._inherited(BetaJS.Iterators.FilteredIterator, "constructor");
		this.__iterator = iterator;
		this.__filter = filter;
		this.__context = context || this;
		this.__next = null;
	},
	
	hasNext: function () {
		this.__crawl();
		return this.__next !== null;
	},
	
	next: function () {
		this.__crawl();
		var item = this.__next;
		this.__next = null;
		return item;
	},
	
	__crawl: function () {
		while (!this.__next && this.__iterator.hasNext()) {
			var item = this.__iterator.next();
			if (this.__filter_func(item))
				this.__next = item;
		}
	},
	
	__filter_func: function (item) {
		return this.__filter.apply(this.__context, [item]);
	}

});


BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.SkipIterator", {
	
	constructor: function (iterator, skip) {
		this._inherited(BetaJS.Iterators.SkipIterator, "constructor");
		this.__iterator = iterator;
		while (skip > 0) {
			iterator.next();
			skip--;
		}
	},
	
	hasNext: function () {
		return this.__iterator.hasNext();
	},
	
	next: function () {
		return this.__iterator.next();
	}

});


BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.LimitIterator", {
	
	constructor: function (iterator, limit) {
		this._inherited(BetaJS.Iterators.LimitIterator, "constructor");
		this.__iterator = iterator;
		this.__limit = limit;
	},
	
	hasNext: function () {
		return this.__limit > 0 && this.__iterator.hasNext();
	},
	
	next: function () {
		if (this.__limit <= 0)
			return null;
		this.__limit--;
		return this.__iterator.next();
	}

});


BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.SortedIterator", {
	
	constructor: function (iterator, compare) {
		this._inherited(BetaJS.Iterators.SortedIterator, "constructor");
		this.__array = iterator.asArray();
		this.__array.sort(compare);
		this.__i = 0;
	},
	
	hasNext: function () {
		return this.__i < this.__array.length;
	},
	
	next: function () {
		var ret = this.__array[this.__i];
		this.__i++;
		return ret;
	}
	
});
