function test_timer(options, expected_time, check) {
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
	
	stop();
	setTimeout(function () {
		QUnit.equal(count, timer.fire_count(), "matching fire count");
		check(count);
		start();
	}, expected_time * multiplier);
}


test("timer once", function () {
	
	test_timer({once: true, delay: 1}, 1, function (count) {
		QUnit.equal(count, 1, "expected fire count");
	});
	
});


test("timer fire_max", function () {
	
	test_timer({delay: 1, fire_max: 5}, 5, function (count) {
		QUnit.equal(count, 5, "expected fire count");
	});
	
});


test("timer duration", function () {
	
	test_timer({delay: 1, duration: 5}, 5, function (count) {
		ok(count <= 5, "expected fire count");
	});
	
});