test("test nl2br", function() {
	ok(BetaJS.Strings.nl2br("abc\ndef\ngeh") == "abc<br />\ndef<br />\ngeh");
});

test("test htmlentities", function() {
	ok(BetaJS.Strings.htmlentities("<test>") == "&lt;test&gt;");
});

test("test email", function() {
	QUnit.equal(BetaJS.Strings.email_get_email("tester <test@test.com>"), "test@test.com");
	QUnit.equal(BetaJS.Strings.email_get_email("tester foobar <test@test.com>"), "test@test.com");
	QUnit.equal(BetaJS.Strings.email_get_email("test@test.com"), "test@test.com");
	QUnit.equal(BetaJS.Strings.email_get_name("tester <test@test.com>"), "Tester");
	QUnit.equal(BetaJS.Strings.email_get_name("tester foobar <test@test.com>"), "Tester Foobar");
	QUnit.equal(BetaJS.Strings.email_get_name("test@test.com"), "Test");
	QUnit.equal(BetaJS.Strings.email_get_name("test.abc@test.com"), "Test Abc");
});


test("named capture groups", function () {
	var regex = "/abc/(def)/geh/(test:ijk)/lmn/(opq)/(foobar:\\d+)";
	var capture = BetaJS.Strings.namedCaptureRegex(regex);
	var test = "/abc/def/geh/ijk/lmn/opq/123";
	QUnit.deepEqual(capture.exec(test), {test: "ijk", foobar: "123"});
	var back = capture.mapBack({test: "ijk", foobar:"456"});
	var str = BetaJS.Strings.regexReplaceGroups(regex, back);
	QUnit.equal(str, "/abc/def/geh/ijk/lmn/opq/456");
});