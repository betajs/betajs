QUnit.test("treemap iteration test", function(assert) {
	var TM = BetaJS.Structures.TreeMap;
	var tm = TM.empty(BetaJS.Comparators.byValue);
	tm = TM.add("a", 1, tm);
	tm = TM.add("b", 2, tm);
	tm = TM.add("c", 3, tm);
	tm = TM.add("d", 4, tm);
	tm = TM.add("e", 5, tm);
	tm = TM.add("f", 6, tm);
	var s = "";
	TM.iterate_from("c", tm, function (key, value) {
		s += key + value;
	});
	assert.equal(s, "c3d4e5f6");
	s = "";
	TM.iterate_from("e", tm, function (key, value) {
		s += key + value;
	}, null, true);
	assert.equal(s, "e5d4c3b2a1");
});

QUnit.test("treemap distance test", function (assert) {
	var TM = BetaJS.Structures.TreeMap;
	var tm = TM.empty(BetaJS.Comparators.byValue);
	for (var i = 0; i < 256; ++i)
		tm = TM.add(i, i, tm);
	for (var j = 0; j < 128; ++j) {
		assert.equal(TM.distance(j, 255-j, tm), 255 - 2 * j);
		assert.equal(TM.treeSizeRight(j, tm), 255 - j + 1);
		assert.equal(TM.treeSizeLeft(j, tm), j + 1);
	}
});