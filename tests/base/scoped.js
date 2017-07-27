QUnit.test("test unresolved", function (assert) {
	assert.deepEqual(Scoped.unresolved("global:BetaJS"), []);
});