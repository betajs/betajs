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

test("test properties binding", function () {
	var e = new BetaJS.Properties.Properties();
	var f = new BetaJS.Properties.Properties();
	e.set("test", 1);
	f.set("test", e.binding("test"));
	ok(f.get("test") == 1);
	e.set("test", 2);
	ok(f.get("test") == 2);
	f.set("test", 3);
	ok(e.get("test") == 3);
});

test("test properties computed", function () {
	var e = new BetaJS.Properties.Properties();
	e.set("a", 1);
	e.set("b", 2);
	e.set("sum", e.computed(function () {
		return this.get("a") + this.get("b");
	}, ["a", "b"]));
	ok(e.get("sum"), 3);
	var z = 0;
	e.on("change:sum", function () {
		z++;
	});
	ok(z==0);
	e.set("a", 5);
	ok(e.get("sum") == 7);
	ok(z == 1);
});