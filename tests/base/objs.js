test("test clone depth 1", function() {
	var obj = {k: 1, o: {}};
	var obj2 = BetaJS.Objs.clone(obj, 1);
	ok(obj != obj2 && obj2.k == 1 && obj.o == obj2.o);
});

test("test clone depth 2", function() {
	var obj = {k: 1, o: {}};
	var obj2 = BetaJS.Objs.clone(obj, 2);
	ok(obj != obj2 && obj2.k == 1 && obj.o != obj2.o);
});

test("test extend", function() {
	var obj = {a:1, b:2};
	var obj2 = {b:3, c:4};
	BetaJS.Objs.extend(obj2, obj);
	ok(obj.a == 1 && obj.b == 2 && obj2.b == 2 && obj2.c == 4 && obj2.a == 1);
});

test("test ! equals depth 0", function () {
	ok(!BetaJS.Objs.equals({a:1, b:2, c:3}, {a:1, b:2, c:3}, 0));
});

test("test equals depth 1", function () {
	ok(BetaJS.Objs.equals({a:1, b:2, c:3}, {a:1, b:2, c:3}, 1));
});

test("test keys no map", function () {
	ok(BetaJS.Objs.equals(BetaJS.Objs.keys({a:1, b:2, c:3}), ["a", "b", "c"], 1));
});

test("test keys map", function () {
	ok(BetaJS.Objs.equals(BetaJS.Objs.keys({a:1, b:2, c:3}, true), {"a": true, "b": true, "c": true}, 1));
});

test("test iter array", function () {
	var obj = {};
	BetaJS.Objs.iter(["a", "b", "c"], function (value, key) {
		obj[value] = key;
	});
	ok(BetaJS.Objs.equals(obj, {"a": 0, "b": 1, "c": 2}, 1));
});

test("test iter object", function () {
	var obj = {};
	BetaJS.Objs.iter({"a":"d", "b":"e", "c":"f"}, function (value, key) {
		obj[value] = key;
	});
	ok(BetaJS.Objs.equals(obj, {"d": "a", "e": "b", "f": "c"}, 1));
});
