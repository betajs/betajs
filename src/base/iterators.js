BetaJS.Iterators = {
	
	ensure: function (mixed) {
		if (mixed == null)
			return new BetaJS.Iterators.ArrayIterator([]);
		if (mixed.instance_of(BetaJS.Iterators.Iterator))
			return mixed;
		if (BetaJS.Types.is_array(mixed))
			return new BetaJS.Iterators.ArrayIterator(mixed);
		return new BetaJS.Iterators.ArrayIterator([mixed]);
	},
	
};

BetaJS.Iterators.Iterator = BetaJS.Class.extend("Iterator", {
	
	asArray: function () {
		var arr = [];
		while (this.hasNext())
			arr.push(this.next());
		return arr;
	}
	
});

BetaJS.Iterators.ArrayIterator = BetaJS.Iterators.Iterator.extend("ArrayIterator", {
	
	constructor: function (arr) {
		this._inherited(BetaJS.Iterators.ArrayIterator, "constructor");
		this.__arr = arr;
		this.__i = 0;
	},
	
	hasNext: function () {
		return this.__i < this.__arr.length;
	},
	
	next: function () {
		return this.__arr[this.__i++];
	}
	
});

BetaJS.Iterators.MappedIterator = BetaJS.Iterators.Iterator.extend("MappedIterator", {
	
	constructor: function (iterator, map) {
		this._inherited(BetaJS.Iterators.MappedIterator, "constructor");
		this.__iterator = iterator;
		this.__map = map;
	},
	
	hasNext: function () {
		return this.__iterator.hasNext();
	},
	
	next: function () {
		return this.hasNext() ? this.__map(this.__iterator.next()) : null;
	}
	
});

BetaJS.Iterators.FilteredIterator = BetaJS.Iterators.Iterator.extend("FilteredIterator", {
	
	constructor: function (iterator, filter, context) {
		this._inherited(BetaJS.Iterators.FilteredIterator, "constructor");
		this.__iterator = iterator;
		this.__filter = filter;
		this.__context = context || this;
		this.__next = null;
	},
	
	hasNext: function () {
		this.__crawl();
		return this.__next != null;
	},
	
	next: function () {
		this.__crawl();
		var item = this.__next;
		this.__next = null;
		return item;
	},
	
	__crawl: function () {
		while (this.__next == null && this.__iterator.hasNext()) {
			this.__next = this.__iterator.next();
			if (this.__filter_func(this.__next))
				return;
			this.__next == null;
		}
	},
	
	__filter_func: function (item) {
		return this.__filter.apply(this.__context, item);
	}

});


BetaJS.Iterators.SkipIterator = BetaJS.Iterators.Iterator.extend("SkipIterator", {
	
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
	},

});


BetaJS.Iterators.LimitIterator = BetaJS.Iterators.Iterator.extend("LimitIterator", {
	
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
	},

});


BetaJS.Iterators.SortedIterator = BetaJS.Iterators.Iterator.extend("SortedIterator", {
	
	constructor: function (iterator, compare) {
		this._inherited(BetaJS.Iterators.SortedIterator, "constructor");
		this.__arr = iterator.asArray();
		this.__arr.sort(compare);
		this.__i = 0;
	},
	
	hasNext: function () {
		return this.__i < this.__arr.length;
	},
	
	next: function () {
		return this.__arr[this.__i++];
	}
	
});
