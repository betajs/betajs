test("javascript proper identifier", function () {
	QUnit.equal(BetaJS.JavaScript.isProperIdentifier("foobar"), true);
	QUnit.equal(BetaJS.JavaScript.isProperIdentifier("foobar.test"), false);
});