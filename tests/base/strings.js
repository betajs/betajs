test("test nl2br", function() {
	ok(BetaJS.Strings.nl2br("abc\ndef\ngeh") == "abc<br />\ndef<br />\ngeh");
});

test("test htmlentities", function() {
	ok(BetaJS.Strings.htmlentities("<test>") == "&lt;test&gt;");
});

test("test email_get_email", function() {
	QUnit.equal(BetaJS.Strings.email_get_email("tester <test@test.com>"), "test@test.com");
});

test("test email_get_name", function() {
	QUnit.equal(BetaJS.Strings.email_get_name("tester <test@test.com>"), "Tester");
});
