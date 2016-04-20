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


test("test suspended events", function() {
	var e = new BetaJS.Events.Events();
	var i = 0;
	e.on("test", function () {
		i++;
	});
	e.suspendEvents();
	e.trigger("test");
	QUnit.equal(i, 0);
	e.resumeEvents();
	QUnit.equal(i, 1);
});



test("chained events", function () {
	
	var a = new BetaJS.Events.Events();
	var b = new BetaJS.Events.Events();
	b._eventChain = function () { return a; };
	var c = new BetaJS.Events.Events();
	c._eventChain = function () { return b; };
	var d = new BetaJS.Events.Events();
	d._eventChain = function () { return c; };
	
	var s ='';
	
	d.on("test", function (data) {
		s += "d";
	});

	c.on("test", function (data) {
		s += "c";
	});

	b.on("test", function (data) {
		s += "b";
		data.bubbles = false;
	});
	
	a.on("test", function (data) {
		s += "a";
	});
	
	d.chainedTrigger("test");
	
	QUnit.equal(s, "dcb");
	
});


test("test persistent events", function() {
	var e = new BetaJS.Events.Events();
	e.trigger("event1");
	var x = 0;
	e.on("event1", function () {
		x++;
	});
	var y = 0;
	e.on("event2", function () {
		y++;
	});
	e.persistentTrigger("event2");
	var z = 0;
	e.on("event2", function () {
		z++;
	});
	QUnit.equal(x, 0);
	QUnit.equal(y, 1);
	QUnit.equal(z, 1);
});