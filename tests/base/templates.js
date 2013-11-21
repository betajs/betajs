test("test template", function() {
	var t = new BetaJS.Templates.Template("<a href='{%= 2*x %}'>test</a>");
	ok(t.evaluate({x:3}) == "<a href='6'>test</a>");
});


test("test template tokenization", function() {
	ok(BetaJS.Templates.tokenize("<a href='{%= 2*x %}'>test</a>").length == 3);
});

test("test template compile", function() {
	var f = BetaJS.Templates.compile("<a href='{%= 2*x %}'>test</a>");
	ok(f({x: 3}) == "<a href='6'>test</a>");
});
