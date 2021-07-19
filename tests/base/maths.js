QUnit.test("infinity", function (assert) {
	assert.equal(!Infinity, false);
});

QUnit.test("clamp", function(assert) {
	assert.strictEqual(BetaJS.Maths.clamp(5, 1, 7), 5);
	assert.strictEqual(BetaJS.Maths.clamp(0, 1, 7), 1);
	assert.strictEqual(BetaJS.Maths.clamp(10, 1, 7), 7);

	assert.strictEqual(BetaJS.Maths.clamp(-5, -1, 7), -1);
	assert.strictEqual(BetaJS.Maths.clamp(0, -7, -1), -1);
	assert.strictEqual(BetaJS.Maths.clamp(-2, -3, 0), -2);

	assert.strictEqual(BetaJS.Maths.clamp(-10.2, -5.5, 5.5), -5.5);
	assert.strictEqual(BetaJS.Maths.clamp(-Infinity, -5.5, 5.5), -5.5);
	assert.strictEqual(BetaJS.Maths.clamp(5, -Infinity, 5.5), 5);
	assert.strictEqual(BetaJS.Maths.clamp(5.5, -Infinity, Infinity), 5.5);
});