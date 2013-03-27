test("test events", function() {
	var e = new BetaJS.Events.Events();
	var x = 0;
	var y = 0;
	var o = {};
	var z = 0;
	e.on("test", function () {
		x++;
	}, o);
	e.on("all", function () {
		y++;
	});
	e.trigger("test test2");
	ok(x==1 && y==2);
	e.on("test", function () {
		z++;
	});
	e.off("test", null, o);
	e.trigger("test");
	ok(x==1 && y==3 && z == 1);
});

test("test empty events", function() {
	var e = new BetaJS.Events.Events();
	e.trigger("test");
	ok(true);
});
