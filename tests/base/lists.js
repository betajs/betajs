test("test scoped", function() {
	var o = new BetaJS.Lists.LinkedList();
	var id1 = o.add({x: "a"});
	var id2 = o.add({x: "b"});
	ok(o.get(id1).x == "a" && o.get(id2).x == "b");
});

test("test array list sort", function () {
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
    ok(list.get(0) == objs[0]);
    ok(list.get(1) == objs[3]);
    ok(list.get(2) == objs[2]);
    ok(list.get(3) == objs[1]);
    ok(list.get(4) == objs[4]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
	list.sort();
    ok(list.get(0) == objs[4]);
    ok(list.get(1) == objs[1]);
    ok(list.get(2) == objs[2]);
    ok(list.get(3) == objs[3]);
    ok(list.get(4) == objs[0]);
	list.iterate(function (item) {
		item.set("text", item.get("text").split("").reverse().join(""));
	});
	list.sort();
    ok(list.get(0) == objs[0]);
    ok(list.get(1) == objs[3]);
    ok(list.get(2) == objs[2]);
    ok(list.get(3) == objs[1]);
    ok(list.get(4) == objs[4]);
});