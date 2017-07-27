QUnit.test("test scoped", function(assert) {
	var o = new BetaJS.Lists.LinkedList();
	var id1 = o.add({x: "a"});
	var id2 = o.add({x: "b"});
	assert.ok(o.get(id1).x == "a" && o.get(id2).x == "b");
});

QUnit.test("test array list sort", function (assert) {
	var objs = [
		new BetaJS.Properties.Properties({"text": "A Example Z"}),
        new BetaJS.Properties.Properties({"text": "D Example W"}),
        new BetaJS.Properties.Properties({"text": "C Example X"}),
        new BetaJS.Properties.Properties({"text": "B Example Y"}),
        new BetaJS.Properties.Properties({"text": "E Example V"})
    ];
	var list = new BetaJS.Lists.ArrayList(objs, {
		compare: function (x, y) {
			return x.get("text").localeCompare(y.get("text"));
		}    	
    });
    assert.ok(list.get(0) == objs[0]);
    assert.ok(list.get(1) == objs[3]);
    assert.ok(list.get(2) == objs[2]);
    assert.ok(list.get(3) == objs[1]);
    assert.ok(list.get(4) == objs[4]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
	list.sort();
    assert.ok(list.get(0) == objs[4]);
    assert.ok(list.get(1) == objs[1]);
    assert.ok(list.get(2) == objs[2]);
    assert.ok(list.get(3) == objs[3]);
    assert.ok(list.get(4) == objs[0]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
	list.sort();
    assert.ok(list.get(0) == objs[0]);
    assert.ok(list.get(1) == objs[3]);
    assert.ok(list.get(2) == objs[2]);
    assert.ok(list.get(3) == objs[1]);
    assert.ok(list.get(4) == objs[4]);
});