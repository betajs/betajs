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