test("test is_object", function() {
	ok(BetaJS.Types.is_object({}));
});

test("test ! is_object", function() {
	ok(!BetaJS.Types.is_object(1));
});

test("test is_array", function () {
	ok(BetaJS.Types.is_array([]));
});

test("test ! is_array", function () {
	ok(!BetaJS.Types.is_array({}));
});

test("test is_null", function () {
	ok(BetaJS.Types.is_null(null));
});

test("test ! is_null", function () {
	ok(!BetaJS.Types.is_null({}));
});

test("test ! is_undefined", function () {
	ok(!BetaJS.Types.is_undefined(null));
});

test("test is_defined", function () {
	ok(BetaJS.Types.is_defined({}));
});

test("test is_none", function () {
	ok(BetaJS.Types.is_none(null));
});

test("test is_empty null", function () {
	ok(BetaJS.Types.is_empty(null));
});

test("test is_empty array", function () {
	ok(BetaJS.Types.is_empty([]));
});

test("test ! is_empty array", function () {
	ok(!BetaJS.Types.is_empty([1]));
});

test("test is_empty object", function () {
	ok(BetaJS.Types.is_empty({}));
});

test("test ! is_empty object", function () {
	ok(!BetaJS.Types.is_empty({k:1}));
});

test("test is_string", function () {
	ok(BetaJS.Types.is_string("test"));
	ok(BetaJS.Types.is_string(""));
});
