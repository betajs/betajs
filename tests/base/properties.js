test("test properties", function () {
	var e = new BetaJS.Properties.Properties();
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