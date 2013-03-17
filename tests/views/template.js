test("test template", function() {
	var t = new BetaJS.Templates.Template("<a href='{%= 2*x %}'>test</a>");
	ok(t.evaluate({x:3}) == "<a href='6'>test</a>");
});
