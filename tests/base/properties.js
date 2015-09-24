test("test properties", function() {
    var e = new BetaJS.Properties.Properties();
    var z = 0;
    e.on("change:test", function() {
        z++;
    });
    e.set("test", 1);
    QUnit.equal(z, 1);
    e.set("test", 2);
    QUnit.equal(z, 2);
    e.set("test", 2);
    QUnit.equal(z, 2);
    e.set("test2", 3);
    QUnit.equal(z, 2);
    e.set("test", 3);
    QUnit.equal(z, 3);
});

test("test properties binding", function() {
    var e = new BetaJS.Properties.Properties();
    var f = new BetaJS.Properties.Properties();
    e.set("test", 1);
    f.set("test", e.binding("test"));
    QUnit.equal(f.get("test"), 1);
    e.set("test", 2);
    QUnit.equal(f.get("test"), 2);
    f.set("test", 3);
    QUnit.equal(e.get("test"), 3);
    f.destroy();
    e.set("test", 4);
    QUnit.equal(e.get("test"), 4);
    e.destroy();
});

test("test properties computed", function() {
    var e = new BetaJS.Properties.Properties();
    e.set("a", 1);
    e.set("b", 2);
    e.set("sum", e.computed(function() {
        return this.get("a") + this.get("b");
    }, ["a", "b"]));
    QUnit.equal(e.get("sum"), 3);
    var z = 0;
    e.on("change:sum", function() {
        z++;
    });
    QUnit.equal(z, 0);
    e.set("a", 5);
    QUnit.equal(e.get("sum"), 7);
    QUnit.equal(z, 1);
});

test("test sub properties", function() {
    var e = new BetaJS.Properties.Properties();
    var z = 0;
    e.on("change:test.abc", function() {
        z++;
    });
    e.set("test.abc", 1);
    QUnit.equal(z, 1);
    e.set("test.abc", 2);
    QUnit.equal(z, 2);
    e.set("test.abc", 2);
    QUnit.equal(z, 2);
    e.set("test.xyz", 3);
    QUnit.equal(z, 2);
    e.set("test.xyz", 4);
    QUnit.equal(z, 2);
});

test("test properties sub binding", function() {
    var e = new BetaJS.Properties.Properties();
    var f = new BetaJS.Properties.Properties();
    e.set("ebase.test.x", 2);
    e.bind("ebase", f, {secondKey: "fbase", deep: true});
    QUnit.equal(f.get("fbase.test.x"), 2);
    var echange = 0;
    var fchange = 0;
    e.on("change:ebase.test.y", function () {
    	echange++;
    });
    f.on("change:fbase.test.y", function () {
    	fchange++;
    });
    f.set("fbase.test.y", 5);
    QUnit.equal(f.get("fbase.test.y"), 5);
    QUnit.equal(e.get("ebase.test.y"), 5);
    QUnit.equal(echange, 1);
    QUnit.equal(fchange, 1);
    e.set("ebase.test.y", 10);
    QUnit.equal(f.get("fbase.test.y"), 10);
    QUnit.equal(e.get("ebase.test.y"), 10);
    QUnit.equal(echange, 2);
    QUnit.equal(fchange, 2);
});

test("test properties sub binding full", function() {
    var e = new BetaJS.Properties.Properties();
    var f = new BetaJS.Properties.Properties();
    e.set("a", 7);
    f.set("b", 8);
    e.bind("", f, {deep: true});
    e.set("x", 2);
    f.set("y", 3);
    e.set("test.abc", 5);
    f.set("test.xyz", 6);
    QUnit.equal(f.get("a"), 7);
    QUnit.equal(e.get("b"), 8);
    QUnit.equal(e.get("y"), 3);
    QUnit.equal(f.get("x"), 2);
    QUnit.equal(e.get("test.xyz"), 6);
    QUnit.equal(f.get("test.abc"), 5);
    f.set("a", 9);
    QUnit.equal(f.get("a"), 9);
    QUnit.equal(e.get("a"), 9);
    e.set("a", 10);
    QUnit.equal(f.get("a"), 10);
    QUnit.equal(e.get("a"), 10);
});


test("test properties computed w collections", function() {
    var e = new BetaJS.Properties.Properties();
    e.set("coll", new BetaJS.Collections.Collection());
    e.set("count", e.computed(function() {
        return this.get("coll").count();
    }, ["coll"]));
    QUnit.equal(e.get("count"), 0);
    e.get("coll").add({foo: 1});
    e.get("coll").add({bar: 2});
    QUnit.equal(e.get("count"), 2);
});
