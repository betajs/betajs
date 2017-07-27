QUnit.test("test ids", function(assert) {
	assert.ok(BetaJS.Ids.uniqueId("testid") != BetaJS.Ids.uniqueId("testid"));
});
