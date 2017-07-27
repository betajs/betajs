QUnit.test("test events", function(assert) {
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
	assert.ok(x==1 && y==2);
	e.on("test", function () {
		z++;
	});
	e.off("test", null, o);
	e.trigger("test");
	assert.ok(x==1 && y==3 && z == 1);
});

QUnit.test("test empty events", function(assert) {
	var e = new BetaJS.Events.Events();
	e.trigger("test");
	assert.ok(true);
});


QUnit.test("test suspended events", function(assert) {
	var e = new BetaJS.Events.Events();
	var i = 0;
	e.on("test", function () {
		i++;
	});
	e.suspendEvents();
	e.trigger("test");
	assert.equal(i, 0);
	e.resumeEvents();
	assert.equal(i, 1);
});



QUnit.test("chained events", function (assert) {
	
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
	
	assert.equal(s, "dcb");
	
});


QUnit.test("test persistent events", function(assert) {
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
	assert.equal(x, 0);
	assert.equal(y, 1);
	assert.equal(z, 1);
});


QUnit.test("test persistent events 2", function(assert) {
    var e = new BetaJS.Events.Events();
    e.trigger("event1");
    var x = 0;
    e.on("event1", function () {
        x++;
    });
    var y = 0;
    var z = 0;
    e.on("event2", function () {
        y++;
        e.on("event2", function () {
            z++;
        });
    });
    e.persistentTrigger("event2");
    assert.equal(x, 0);
    assert.equal(y, 1);
    assert.equal(z, 1);
});