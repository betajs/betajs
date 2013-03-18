test("test template tokenization", function() {
	ok(BetaJS.Templates.tokenize("<a href='{%= 2*x %}'>test</a>").length == 3);
});

test("test template compile", function() {
	var f = BetaJS.Templates.compile("<a href='{%= 2*x %}'>test</a>");
	ok(f({x: 3}) == "<a href='6'>test</a>");
});

test("test template compile internal", function() {
	var f = BetaJS.Templates.compile("<p>test</p>{%! mark('foo') %}<p>test2</p>", {
		callbacks: {
			mark: function (s) {
				return "<span style='display:none' data-mark='" + s + "'></span>";
			}
		}
	});
	ok(f() == "<p>test</p><span style='display:none' data-mark='foo'></span><p>test2</p>");
});
