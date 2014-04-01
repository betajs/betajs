test("test store update sync", function() {
	var store = new BetaJS.Stores.MemoryStore();
	var object = store.insert({x: 5});
	ok(!!object.id);
	QUnit.equal(object.x, 5);
	store.update(object.id, {y: 7});
	QUnit.equal(object.y, 7);
});


test("test store update async", function() {
	var store = new BetaJS.Stores.MemoryStore();
	var object = store.insert({x: 5});
	ok(!!object.id);
	QUnit.equal(object.x, 5);
	var updated = false;
	store.update(object.id, {
		y: 7
	}, {
		context: {
			z: 3
		},
		success: function (row) {
			updated = true;
			QUnit.equal(row.y, 7);
			QUnit.equal(this.z, 3);
		}
	});
	ok(updated);
});
