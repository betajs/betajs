QUnit.test("test collection sort", function (assert) {
	var objs = [
		new BetaJS.Properties.Properties({"text": "A Example Z"}),
        new BetaJS.Properties.Properties({"text": "D Example W"}),
        new BetaJS.Properties.Properties({"text": "C Example X"}),
        new BetaJS.Properties.Properties({"text": "B Example Y"}),
        new BetaJS.Properties.Properties({"text": "E Example V"})
    ];
	var list = new BetaJS.Collections.Collection({
		objects: objs,
		compare: function (x, y) {
			return x.get("text").localeCompare(y.get("text"));
		}    	
    });
    assert.ok(list.getByIndex(0) == objs[0]);
    assert.ok(list.getByIndex(1) == objs[3]);
    assert.ok(list.getByIndex(2) == objs[2]);
    assert.ok(list.getByIndex(3) == objs[1]);
    assert.ok(list.getByIndex(4) == objs[4]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
    assert.ok(list.getByIndex(0) == objs[4]);
    assert.ok(list.getByIndex(1) == objs[1]);
    assert.ok(list.getByIndex(2) == objs[2]);
    assert.ok(list.getByIndex(3) == objs[3]);
    assert.ok(list.getByIndex(4) == objs[0]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
    assert.ok(list.getByIndex(0) == objs[0]);
    assert.ok(list.getByIndex(1) == objs[3]);
    assert.ok(list.getByIndex(2) == objs[2]);
    assert.ok(list.getByIndex(3) == objs[1]);
    assert.ok(list.getByIndex(4) == objs[4]);
});


QUnit.test("test collection sort 2", function (assert) {
	var objs = [
		new BetaJS.Properties.Properties({"text": "A Example Z"}),
        new BetaJS.Properties.Properties({"text": "D Example W"}),
        new BetaJS.Properties.Properties({"text": "C Example X"}),
        new BetaJS.Properties.Properties({"text": "B Example Y"}),
        new BetaJS.Properties.Properties({"text": "E Example V"})
    ];
	var list = new BetaJS.Collections.Collection({
		objects: objs,
		compare: BetaJS.Comparators.byObject({"text": 1})	
    });
    assert.ok(list.getByIndex(0) == objs[0]);
    assert.ok(list.getByIndex(1) == objs[3]);
    assert.ok(list.getByIndex(2) == objs[2]);
    assert.ok(list.getByIndex(3) == objs[1]);
    assert.ok(list.getByIndex(4) == objs[4]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
    assert.ok(list.getByIndex(0) == objs[4]);
    assert.ok(list.getByIndex(1) == objs[1]);
    assert.ok(list.getByIndex(2) == objs[2]);
    assert.ok(list.getByIndex(3) == objs[3]);
    assert.ok(list.getByIndex(4) == objs[0]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
    assert.ok(list.getByIndex(0) == objs[0]);
    assert.ok(list.getByIndex(1) == objs[3]);
    assert.ok(list.getByIndex(2) == objs[2]);
    assert.ok(list.getByIndex(3) == objs[1]);
    assert.ok(list.getByIndex(4) == objs[4]);
    list.set_compare(BetaJS.Comparators.byObject({text : -1}));
    assert.ok(list.getByIndex(0) == objs[4]);
    assert.ok(list.getByIndex(1) == objs[1]);
    assert.ok(list.getByIndex(2) == objs[2]);
    assert.ok(list.getByIndex(3) == objs[3]);
    assert.ok(list.getByIndex(4) == objs[0]);
});


QUnit.test("test filtered collection", function (assert) {
	var objs = [
		new BetaJS.Properties.Properties({"text": "A Example Z"}),
        new BetaJS.Properties.Properties({"text": "D Example W"}),
        new BetaJS.Properties.Properties({"text": "C Example X"}),
        new BetaJS.Properties.Properties({"text": "B Example Y"}),
        new BetaJS.Properties.Properties({"text": "E Example V"})
    ];
	var list = new BetaJS.Collections.Collection({
		objects: objs
    });
	var filtered_list = new BetaJS.Collections.FilteredCollection(list, {
		filter: function () {
			return true;
		}
	});
	assert.equal(list.count(), 5);
	assert.equal(filtered_list.count(), 5);
	list.remove(list.getByIndex(0));
	assert.equal(list.count(), 4);
	assert.equal(filtered_list.count(), 4);
	filtered_list.remove(filtered_list.getByIndex(0));
	assert.equal(list.count(), 3);
	assert.equal(filtered_list.count(), 3);
	var count = {
		add: 0,
		remove: 0
	};
	filtered_list.on("add", function () {
		count.add++;
	});
	filtered_list.on("remove", function () {
		count.remove++;
	});
	filtered_list.setFilter(function () {
		return true;
	});
	assert.equal(count.add, 0);
	assert.equal(count.remove, 0);
});



QUnit.test("test mapped collection", function (assert) {
	var objs = [
		new BetaJS.Properties.Properties({"text": "A Example Z"}),
        new BetaJS.Properties.Properties({"text": "D Example W"}),
        new BetaJS.Properties.Properties({"text": "C Example X"}),
        new BetaJS.Properties.Properties({"text": "B Example Y"}),
        new BetaJS.Properties.Properties({"text": "E Example V"})
    ];
	var list = new BetaJS.Collections.Collection({
		objects: objs
    });
	var mapped_list = new BetaJS.Collections.MappedCollection(list, {
		map: function (source, target) {
			if (!target)
				target = new BetaJS.Properties.Properties();
			target.set("text", source.get("text") + "!!");
			return target;
		}
	});
	assert.equal(mapped_list.count(), 5);
	assert.equal(mapped_list.getByIndex(0).get("text"), "A Example Z!!");
	list.remove(list.getByIndex(0));
	assert.equal(mapped_list.count(), 4);
	list.getByIndex(0).set("text", "Foobar");
	assert.equal(mapped_list.getByIndex(0).get("text"), "Foobar!!");
});


QUnit.test("test concat collection", function (assert) {
	var objs1 = [
		new BetaJS.Properties.Properties({"text": "A Example Z"}),
        new BetaJS.Properties.Properties({"text": "D Example W"})
    ];
	var list1 = new BetaJS.Collections.Collection({
		objects: objs1
    });
	var objs2 = [
	             new BetaJS.Properties.Properties({"text": "C Example X"}),
	             new BetaJS.Properties.Properties({"text": "B Example Y"}),
	             new BetaJS.Properties.Properties({"text": "E Example V"})
	         ];
	var list2 = new BetaJS.Collections.Collection({
		objects: objs2
    });
	var concat_list = new BetaJS.Collections.ConcatCollection([list1, list2]);
	assert.equal(concat_list.count(), 5);
	list2.remove(objs2[2]);
    assert.equal(concat_list.count(), 4);
});


QUnit.test("test collection query", function (assert) {
	var objs = [
		new BetaJS.Properties.Properties({"text": "A Example Z"}),
        new BetaJS.Properties.Properties({"text": "D Example W"}),
        new BetaJS.Properties.Properties({"text": "C Example X"}),
        new BetaJS.Properties.Properties({"text": "B Example Y"}),
        new BetaJS.Properties.Properties({"text": "E Example V"})
    ];
	var list = new BetaJS.Collections.Collection({
		objects: objs
    });
	assert.equal(list.query({"text": "C Example X"}).asArray().length, 1);
	list.add(new BetaJS.Properties.Properties({"text": "C Example X"}));
	assert.equal(list.query({"text": "C Example X"}).asArray().length, 2);
	list.add_secondary_index("text");
	assert.equal(list.get_by_secondary_index("text", "C Example X", true).get("text"), "C Example X");
	assert.equal(list.query({"text": "C Example X"}).asArray().length, 2);
	list.add(new BetaJS.Properties.Properties({"text": "C Example X"}));
	assert.equal(list.query({"text": "C Example X"}).asArray().length, 3);
	assert.equal(list.query({"text": ["C Example X", "A Example Z"]}).asArray().length, 4);
});



QUnit.test("test collection replace objects", function (assert) {
	var objs = [
		new BetaJS.Properties.Properties({"text": "A Example Z"}),
        new BetaJS.Properties.Properties({"text": "D Example W"})
    ];
	var list = new BetaJS.Collections.Collection(objs);
    assert.equal(list.count(), 2);
	list.replace_objects([
	    new BetaJS.Properties.Properties({"text": "C Example X"}),
	    new BetaJS.Properties.Properties({"text": "B Example Y"})
	]);
    assert.equal(list.count(), 2);
	list.replace_objects([
        new BetaJS.Properties.Properties({"text": "E Example V"}),
        new BetaJS.Properties.Properties({"text": "F Example U"})
  	], true);
	assert.equal(list.count(), 4);
});
