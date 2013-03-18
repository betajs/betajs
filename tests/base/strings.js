test("test nl2br", function() {
	ok(BetaJS.Strings.nl2br("abc\ndef\ngeh") == "abc<br />\ndef<br />\ngeh");
});

test("test htmlentities", function() {
	ok(BetaJS.Strings.htmlentities("<test>") == "&lt;test&gt;");
});
