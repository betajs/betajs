QUnit.test("test properties", function(assert) {
    var e = new BetaJS.Properties.Properties();
    var z = 0;
    e.on("change:test", function() {
        z++;
    });
    e.set("test", 1);
    assert.equal(z, 1);
    e.set("test", 2);
    assert.equal(z, 2);
    e.set("test", 2);
    assert.equal(z, 2);
    e.set("test2", 3);
    assert.equal(z, 2);
    e.set("test", 3);
    assert.equal(z, 3);
});

QUnit.test("test properties binding", function(assert) {
    var e = new BetaJS.Properties.Properties();
    var f = new BetaJS.Properties.Properties();
    e.set("test", 1);
    f.set("test", e.binding("test"));
    assert.equal(f.get("test"), 1);
    e.set("test", 2);
    assert.equal(f.get("test"), 2);
    f.set("test", 3);
    assert.equal(e.get("test"), 3);
    f.destroy();
    e.set("test", 4);
    assert.equal(e.get("test"), 4);
    e.destroy();
});

QUnit.test("test properties computed", function(assert) {
    var e = new BetaJS.Properties.Properties();
    e.set("a", 1);
    e.set("b", 2);
    e.set("sum", e.computed(function() {
        return this.get("a") + this.get("b");
    }, ["a", "b"]));
    assert.equal(e.get("sum"), 3);
    var z = 0;
    e.on("change:sum", function() {
        z++;
    });
    assert.equal(z, 0);
    e.set("a", 5);
    assert.equal(e.get("sum"), 7);
    assert.equal(z, 1);
});

QUnit.test("test sub properties", function(assert) {
    var e = new BetaJS.Properties.Properties();
    var z = 0;
    e.on("change:test.abc", function() {
        z++;
    });
    e.set("test.abc", 1);
    assert.equal(z, 1);
    e.set("test.abc", 2);
    assert.equal(z, 2);
    e.set("test.abc", 2);
    assert.equal(z, 2);
    e.set("test.xyz", 3);
    assert.equal(z, 2);
    e.set("test.xyz", 4);
    assert.equal(z, 2);
});

QUnit.test("test properties sub binding", function(assert) {
    var e = new BetaJS.Properties.Properties();
    var f = new BetaJS.Properties.Properties();
    e.set("ebase.test.x", 2);
    e.bind("ebase", f, {secondKey: "fbase", deep: true});
    assert.equal(f.get("fbase.test.x"), 2);
    var echange = 0;
    var fchange = 0;
    e.on("change:ebase.test.y", function () {
    	echange++;
    });
    f.on("change:fbase.test.y", function () {
    	fchange++;
    });
    f.set("fbase.test.y", 5);
    assert.equal(f.get("fbase.test.y"), 5);
    assert.equal(e.get("ebase.test.y"), 5);
    assert.equal(echange, 1);
    assert.equal(fchange, 1);
    e.set("ebase.test.y", 10);
    assert.equal(f.get("fbase.test.y"), 10);
    assert.equal(e.get("ebase.test.y"), 10);
    assert.equal(echange, 2);
    assert.equal(fchange, 2);
});

QUnit.test("test properties sub binding full", function(assert) {
    var e = new BetaJS.Properties.Properties();
    var f = new BetaJS.Properties.Properties();
    e.set("a", 7);
    f.set("b", 8);
    e.bind("", f, {deep: true});
    e.set("x", 2);
    f.set("y", 3);
    e.set("test.abc", 5);
    f.set("test.xyz", 6);
    assert.equal(f.get("a"), 7);
    assert.equal(e.get("b"), 8);
    assert.equal(e.get("y"), 3);
    assert.equal(f.get("x"), 2);
    assert.equal(e.get("test.xyz"), 6);
    assert.equal(f.get("test.abc"), 5);
    f.set("a", 9);
    assert.equal(f.get("a"), 9);
    assert.equal(e.get("a"), 9);
    e.set("a", 10);
    assert.equal(f.get("a"), 10);
    assert.equal(e.get("a"), 10);
});


QUnit.test("test properties computed w collections", function(assert) {
    var e = new BetaJS.Properties.Properties();
    e.set("coll", new BetaJS.Collections.Collection());
    e.set("count", e.computed(function() {
        return this.get("coll").count();
    }, ["coll"]));
    assert.equal(e.get("count"), 0);
    e.get("coll").add({foo: 1});
    e.get("coll").add({bar: 2});
    assert.equal(e.get("count"), 2);
});

QUnit.test("test inner properties", function (assert) {
	var outer = new BetaJS.Properties.Properties();
	var inner = new BetaJS.Properties.Properties();	
	outer.set("inner", inner);
	inner.set("foo", "bar");
	assert.equal(outer.getProp("inner.foo"), "bar");
	outer.setProp("inner.test", "abc");
	assert.equal(inner.get("test"), "abc");
});
