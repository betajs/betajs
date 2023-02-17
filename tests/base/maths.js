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

QUnit.test("range", function(assert) {
	assert.deepEqual(BetaJS.Maths.range(0, 10, -1), [], "returns empty array on invalid range");
	assert.deepEqual(BetaJS.Maths.range(1, 1), [1], "can return range with length 1");
	assert.deepEqual(BetaJS.Maths.range(1, 5), [1, 2, 3, 4, 5], "returns expected range");
	assert.deepEqual(BetaJS.Maths.range(1, 8, 2), [1, 3, 5, 7], "returns expected range");
	assert.deepEqual(BetaJS.Maths.range(0, -3), [0, -1, -2, -3], "returns expected range for negative numbers");
	assert.deepEqual(BetaJS.Maths.range(0, -3, -2), [0, -2], "returns expected range for negative numbers");
	assert.deepEqual(BetaJS.Maths.range(1, 2, 0.25), [1, 1.25, 1.5, 1.75, 2], "returns expected range for float numbers");
});

QUnit.test("randomInt", function(assert) {
	var random = BetaJS.Maths.randomInt(0,0);
	assert.ok(random === 0, "returns value within boundaries");
	random = BetaJS.Maths.randomInt(9, 12);
	assert.ok(random >= 9 && random <= 12, "returns value within boundaries");
	random = BetaJS.Maths.randomInt(1);
	assert.ok(random === 0 || random === 1, "treats single argument as upper boundary");
	random = BetaJS.Maths.randomInt(12);
	assert.ok(random <= 12, "treats single argument as upper boundary");
});
