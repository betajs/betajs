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
    e.on("change:test->abc", function() {
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
