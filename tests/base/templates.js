QUnit.test("test template", function(assert) {
	var t = new BetaJS.Templates.Template("<a href='{%= 2*x %}'>test</a>");
	assert.ok(t.evaluate({x:3}) == "<a href='6'>test</a>");
});


QUnit.test("test template tokenization", function(assert) {
	assert.ok(BetaJS.Templates.tokenize("<a href='{%= 2*x %}'>test</a>").length == 3);
});

QUnit.test("test template compile", function(assert) {
	var f = BetaJS.Templates.compile("<a href='{%= 2*x %}'>test</a>");
	assert.ok(f({x: 3}) == "<a href='6'>test</a>");
});
