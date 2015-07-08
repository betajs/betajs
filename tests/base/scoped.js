test("test unresolved", function () {
	QUnit.deepEqual(Scoped.unresolved("global:BetaJS"), []);
});