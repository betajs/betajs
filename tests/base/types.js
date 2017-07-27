QUnit.test("test is_object", function(assert) {
	assert.ok(BetaJS.Types.is_object({}));
});

QUnit.test("test ! is_object", function(assert) {
	assert.ok(!BetaJS.Types.is_object(1));
});

QUnit.test("test is_array", function (assert) {
	assert.ok(BetaJS.Types.is_array([]));
});

QUnit.test("test ! is_array", function (assert) {
	assert.ok(!BetaJS.Types.is_array({}));
});

QUnit.test("test is_null", function (assert) {
	assert.ok(BetaJS.Types.is_null(null));
});

QUnit.test("test ! is_null", function (assert) {
	assert.ok(!BetaJS.Types.is_null({}));
});

QUnit.test("test ! is_undefined", function (assert) {
	assert.ok(!BetaJS.Types.is_undefined(null));
});

QUnit.test("test is_defined", function (assert) {
	assert.ok(BetaJS.Types.is_defined({}));
});

QUnit.test("test is_none", function (assert) {
	assert.ok(BetaJS.Types.is_none(null));
});

QUnit.test("test is_empty null", function (assert) {
	assert.ok(BetaJS.Types.is_empty(null));
});

QUnit.test("test is_empty array", function (assert) {
	assert.ok(BetaJS.Types.is_empty([]));
});

QUnit.test("test ! is_empty array", function (assert) {
	assert.ok(!BetaJS.Types.is_empty([1]));
});

QUnit.test("test is_empty object", function (assert) {
	assert.ok(BetaJS.Types.is_empty({}));
});

QUnit.test("test ! is_empty object", function (assert) {
	assert.ok(!BetaJS.Types.is_empty({k:1}));
});

QUnit.test("test is_string", function (assert) {
	assert.ok(BetaJS.Types.is_string("test"));
	assert.ok(BetaJS.Types.is_string(""));
});
