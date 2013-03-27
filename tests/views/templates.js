test("test template tokenization", function() {
	ok(BetaJS.Templates.tokenize("<a href='{%= 2*x %}'>test</a>").length == 3);
});

test("test template compile", function() {
	var f = BetaJS.Templates.compile("<a href='{%= 2*x %}'>test</a>");
	ok(f({x: 3}) == "<a href='6'>test</a>");
});
