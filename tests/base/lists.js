test("test linked list", function() {
	var o = new BetaJS.Lists.LinkedList();
	var id1 = o.add({x: "a"});
	var id2 = o.add({x: "b"});
	ok(o.get(id1).x == "a" && o.get(id2).x == "b");
});
