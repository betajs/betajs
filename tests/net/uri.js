test("test encode uri params", function () {
	QUnit.equal(BetaJS.Net.Uri.encodeUriParams({
		foo: "bar",
		test: "tester"
	}), "foo=bar&test=tester");
	QUnit.equal(BetaJS.Net.Uri.encodeUriParams({
		foo: "Simon&Garfunkel",
		test: "tester"
	}), "foo=Simon%26Garfunkel&test=tester");
});