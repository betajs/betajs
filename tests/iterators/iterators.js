QUnit.test("test array iterator", function(assert) {
	var iter = new BetaJS.Iterators.ArrayIterator(["a", "b", "c"]);
	var s = "";
	while (iter.hasNext())
		s += iter.next();
	assert.ok(s == "abc");
});

QUnit.test("test mapped iterator", function(assert) {
	var base = new BetaJS.Iterators.ArrayIterator([2, 4, 6]);
	var iter = new BetaJS.Iterators.MappedIterator(base, function (x) { return 2 * x + 1; });
	var s = 0;
	while (iter.hasNext())
		s += iter.next();
	assert.ok(s == 27);
});


QUnit.test("test filtered iterator", function(assert) {
	var base = new BetaJS.Iterators.ArrayIterator([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	var iter = new BetaJS.Iterators.FilteredIterator(base, function (x) { return x % 2 === 0; });
	var s = "";
	while (iter.hasNext())
		s += iter.next();
	assert.ok(s == "2468");
});


QUnit.test("test partially sorted iterator", function(assert) {
	var base = new BetaJS.Iterators.ArrayIterator([[1, 2], [1, 1], [2, 1], [2, 2]]);
	var iter = new BetaJS.Iterators.PartiallySortedIterator(base, function (x, y) {
		return x[0] === y[0] ? (x[1] - y[1]) : (x[0] - y[0]);
	}, function (x, y) {
		return x[0] === y[0];
	});
	assert.deepEqual(iter.asArray(), [[1, 1], [1, 2], [2, 1], [2, 2]]);
});
