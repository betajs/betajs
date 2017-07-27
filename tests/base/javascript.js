QUnit.test("javascript proper identifier", function (assert) {
	assert.equal(BetaJS.JavaScript.isProperIdentifier("foobar"), true);
	assert.equal(BetaJS.JavaScript.isProperIdentifier("foobar.test"), false);
});