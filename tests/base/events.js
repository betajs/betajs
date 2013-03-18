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

test("test properties", function () {
	var e = new BetaJS.Events.Properties();
	var z = 0;
	e.on("change:test", function () {
		z++
	});
	e.set("test", 1);
	ok(z==1);
	e.set("test", 2);
	ok(z==2);
	e.set("test", 2);
	ok(z==2);
	e.set("test2", 3);
	ok(z==2);
	e.set("test", 3);
	ok(z==3);
});