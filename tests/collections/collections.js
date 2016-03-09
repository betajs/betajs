test("test collection sort", function () {
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
    ok(list.getByIndex(0) == objs[0]);
    ok(list.getByIndex(1) == objs[3]);
    ok(list.getByIndex(2) == objs[2]);
    ok(list.getByIndex(3) == objs[1]);
    ok(list.getByIndex(4) == objs[4]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
    ok(list.getByIndex(0) == objs[4]);
    ok(list.getByIndex(1) == objs[1]);
    ok(list.getByIndex(2) == objs[2]);
    ok(list.getByIndex(3) == objs[3]);
    ok(list.getByIndex(4) == objs[0]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
    ok(list.getByIndex(0) == objs[0]);
    ok(list.getByIndex(1) == objs[3]);
    ok(list.getByIndex(2) == objs[2]);
    ok(list.getByIndex(3) == objs[1]);
    ok(list.getByIndex(4) == objs[4]);
});


test("test collection sort 2", function () {
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
    ok(list.getByIndex(0) == objs[0]);
    ok(list.getByIndex(1) == objs[3]);
    ok(list.getByIndex(2) == objs[2]);
    ok(list.getByIndex(3) == objs[1]);
    ok(list.getByIndex(4) == objs[4]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
    ok(list.getByIndex(0) == objs[4]);
    ok(list.getByIndex(1) == objs[1]);
    ok(list.getByIndex(2) == objs[2]);
    ok(list.getByIndex(3) == objs[3]);
    ok(list.getByIndex(4) == objs[0]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
    ok(list.getByIndex(0) == objs[0]);
    ok(list.getByIndex(1) == objs[3]);
    ok(list.getByIndex(2) == objs[2]);
    ok(list.getByIndex(3) == objs[1]);
    ok(list.getByIndex(4) == objs[4]);
    list.set_compare(BetaJS.Comparators.byObject({text : -1}));
    ok(list.getByIndex(0) == objs[4]);
    ok(list.getByIndex(1) == objs[1]);
    ok(list.getByIndex(2) == objs[2]);
    ok(list.getByIndex(3) == objs[3]);
    ok(list.getByIndex(4) == objs[0]);
});


test("test filtered collection", function () {
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
	QUnit.equal(list.count(), 5);
	QUnit.equal(filtered_list.count(), 5);
	list.remove(list.getByIndex(0));
	QUnit.equal(list.count(), 4);
	QUnit.equal(filtered_list.count(), 4);
	filtered_list.remove(filtered_list.getByIndex(0));
	QUnit.equal(list.count(), 3);
	QUnit.equal(filtered_list.count(), 3);
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
	QUnit.equal(count.add, 0);
	QUnit.equal(count.remove, 0);
});



test("test mapped collection", function () {
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
	QUnit.equal(mapped_list.count(), 5);
	QUnit.equal(mapped_list.getByIndex(0).get("text"), "A Example Z!!");
	list.remove(list.getByIndex(0));
	QUnit.equal(mapped_list.count(), 4);
	list.getByIndex(0).set("text", "Foobar");
	QUnit.equal(mapped_list.getByIndex(0).get("text"), "Foobar!!");
});


test("test concat collection", function () {
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
	QUnit.equal(concat_list.count(), 5);
});


test("test collection query", function () {
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
	QUnit.equal(list.query({"text": "C Example X"}).asArray().length, 1);
	list.add(new BetaJS.Properties.Properties({"text": "C Example X"}));
	QUnit.equal(list.query({"text": "C Example X"}).asArray().length, 2);
	list.add_secondary_index("text");
	QUnit.equal(list.query({"text": "C Example X"}).asArray().length, 2);
	list.add(new BetaJS.Properties.Properties({"text": "C Example X"}));
	QUnit.equal(list.query({"text": "C Example X"}).asArray().length, 3);
});



test("test collection replace objects", function () {
	var objs = [
		new BetaJS.Properties.Properties({"text": "A Example Z"}),
        new BetaJS.Properties.Properties({"text": "D Example W"})
    ];
	var list = new BetaJS.Collections.Collection(objs);
    QUnit.equal(list.count(), 2);
	list.replace_objects([
	    new BetaJS.Properties.Properties({"text": "C Example X"}),
	    new BetaJS.Properties.Properties({"text": "B Example Y"})
	]);
    QUnit.equal(list.count(), 2);
	list.replace_objects([
        new BetaJS.Properties.Properties({"text": "E Example V"}),
        new BetaJS.Properties.Properties({"text": "F Example U"})
  	], true);
	QUnit.equal(list.count(), 4);
});
