function test_timer(options, expected_time, check, assert) {
	var count = 0;
	var multiplier = 10;
	try {
		if (window && window.BrowserStack)
			multiplier = 1000;
	} catch (e) {}
	
	var timer = new BetaJS.Timers.Timer(BetaJS.Objs.extend(options, {
		start: true,
		fire: function () {
			count++;
		}
	}));
	
	var done = assert.async();
	setTimeout(function () {
		assert.equal(count, timer.fire_count(), "matching fire count");
		check(count);
		done();
	}, expected_time * multiplier);
}


QUnit.test("timer once", function (assert) {
	
	test_timer({once: true, delay: 1}, 1, function (count) {
		assert.equal(count, 1, "expected fire count");
	}, assert);
	
});


QUnit.test("timer fire_max", function (assert) {
	
	test_timer({delay: 1, fire_max: 5}, 5, function (count) {
		assert.equal(count, 5, "expected fire count");
	}, assert);
	
});


QUnit.test("timer duration", function (assert) {
	
	test_timer({delay: 1, duration: 5}, 5, function (count) {
		assert.ok(count <= 5, "expected fire count");
	}, assert);
	
});