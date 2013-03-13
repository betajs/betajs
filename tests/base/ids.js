test("test ids", function() {
	ok(BetaJS.Ids.uniqueId("testid") != BetaJS.Ids.uniqueId("testid"));
});
