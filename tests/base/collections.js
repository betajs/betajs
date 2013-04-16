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