QUnit.test("test clone depth 1", function(assert) {
	var obj = {k: 1, o: {}};
	var obj2 = BetaJS.Objs.clone(obj, 1);
	assert.ok(obj != obj2 && obj2.k == 1 && obj.o == obj2.o);
});

QUnit.test("test clone depth 2", function(assert) {
	var obj = {k: 1, o: {}};
	var obj2 = BetaJS.Objs.clone(obj, 2);
	assert.ok(obj != obj2 && obj2.k == 1 && obj.o != obj2.o);
});

QUnit.test("test extend", function(assert) {
	var obj = {a:1, b:2};
	var obj2 = {b:3, c:4};
	BetaJS.Objs.extend(obj2, obj);
	assert.ok(obj.a == 1 && obj.b == 2 && obj2.b == 2 && obj2.c == 4 && obj2.a == 1);
});

QUnit.test("test ! equals depth 0", function (assert) {
	assert.ok(!BetaJS.Objs.equals({a:1, b:2, c:3}, {a:1, b:2, c:3}, 0));
});

QUnit.test("test equals depth 1", function (assert) {
	assert.ok(BetaJS.Objs.equals({a:1, b:2, c:3}, {a:1, b:2, c:3}, 1));
});

QUnit.test("test keys no map", function (assert) {
	assert.ok(BetaJS.Objs.equals(BetaJS.Objs.keys({a:1, b:2, c:3}), ["a", "b", "c"], 1));
});

QUnit.test("test keys map", function (assert) {
	assert.ok(BetaJS.Objs.equals(BetaJS.Objs.keys({a:1, b:2, c:3}, true), {"a": true, "b": true, "c": true}, 1));
});

QUnit.test("test iter array", function (assert) {
	var obj = {};
	BetaJS.Objs.iter(["a", "b", "c"], function (value, key) {
		obj[value] = key;
	});
	assert.ok(BetaJS.Objs.equals(obj, {"a": 0, "b": 1, "c": 2}, 1));
});

QUnit.test("test iter object", function (assert) {
	var obj = {};
	BetaJS.Objs.iter({"a":"d", "b":"e", "c":"f"}, function (value, key) {
		obj[value] = key;
	});
	assert.ok(BetaJS.Objs.equals(obj, {"d": "a", "e": "b", "f": "c"}, 1));
});

QUnit.test("test tree extend", function (assert) {
	assert.deepEqual({
		level1: 2,
		level2: {
			level1: 4,
            first1: 7,
            second1: 8
		},
		first1: 5,
		second1: 6
	}, BetaJS.Objs.tree_extend({
		level1: 1,
		level2: {
			level1: 3,
			first1: 7
		},
		first1: 5
	}, {
		level1: 2,
		level2: {
			level1: 4,
			second1: 8
		},
		second1: 6
	}));
});