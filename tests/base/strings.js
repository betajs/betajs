QUnit.test("test nl2br", function(assert) {
	assert.ok(BetaJS.Strings.nl2br("abc\ndef\ngeh") == "abc<br />\ndef<br />\ngeh");
});

QUnit.test("test htmlentities", function(assert) {
	assert.ok(BetaJS.Strings.htmlentities("<test>") == "&lt;test&gt;");
});

QUnit.test("test email", function(assert) {
	assert.equal(BetaJS.Strings.email_get_email("tester <test@test.com>"), "test@test.com");
	assert.equal(BetaJS.Strings.email_get_email("tester foobar <test@test.com>"), "test@test.com");
	assert.equal(BetaJS.Strings.email_get_email("test@test.com"), "test@test.com");
	assert.equal(BetaJS.Strings.email_get_name("tester <test@test.com>"), "Tester");
	assert.equal(BetaJS.Strings.email_get_name("tester foobar <test@test.com>"), "Tester Foobar");
	assert.equal(BetaJS.Strings.email_get_name("test@test.com"), "Test");
	assert.equal(BetaJS.Strings.email_get_name("test.abc@test.com"), "Test Abc");
});


QUnit.test("named capture groups", function (assert) {
	var regex = "/abc/(def)/geh/(test:ijk)/lmn/(opq)/(foobar:\\d+)";
	var capture = BetaJS.Strings.namedCaptureRegex(regex);
	var test = "/abc/def/geh/ijk/lmn/opq/123";
	assert.deepEqual(capture.exec(test), {test: "ijk", foobar: "123"});
	var back = capture.mapBack({test: "ijk", foobar:"456"});
	var str = BetaJS.Strings.regexReplaceGroups(regex, back);
	assert.equal(str, "/abc/def/geh/ijk/lmn/opq/456");
});