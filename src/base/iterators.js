BetaJS.Iterators = {};

BetaJS.Iterators.Iterator = BetaJS.Class.extend("Iterator");

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
		return this.__map(this.__iterator.next());
	}
	
});