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


test("cross domain check", function () {
	QUnit.equal(BetaJS.Net.Uri.isCrossDomainUri("http://a.com/test", "http://b.com/test"), true);
	QUnit.equal(BetaJS.Net.Uri.isCrossDomainUri("http://a.com/test", "http://a.com/foobar"), false);	
	QUnit.equal(BetaJS.Net.Uri.isCrossDomainUri("http://a.com/test", "/foobar"), false);
});