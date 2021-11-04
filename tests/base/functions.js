QUnit.test("test as_method", function(assert) {
	var Obj = {
		a: 1,
		
		test: function () {
			return this.a;
		}
	};
	
	var func = BetaJS.Functions.as_method(Obj.test, Obj);
	assert.ok(func() == 1);
});

QUnit.test("test throttle", function(assert) {
	var done = assert.async();
	var timeInterval;
	var x = 0, n = 0;
	var func = function() {
		x++;
	};
	var throttled = BetaJS.Functions.throttle(func, 100);
	timeInterval = setInterval(function() {
		throttled();
		n++;
		if (n === 10) {
			clearInterval(timeInterval);
			assert.equal(x, 5, "failed to throttle function");
			done();
		}
	}, 50);
});

QUnit.test("test debounce", function(assert) {
	var done = assert.async();
	var x = 0;
	var func = function() {
		x++;
	};
	var debounced = BetaJS.Functions.debounce(func, 100);

	for (i = 0; i < 1000; i++) debounced();

	setTimeout(function() {
		assert.equal(x, 1, "failed executing debounced function only once");
		done();
	}, 150);
});

QUnit.test("test debounce immediately", function(assert) {
	var x;
	var func = function(argument) {
		x = argument;
	};
	var debouncedImmediate = BetaJS.Functions.debounce(func, 100, true);

	for (i = 0; i < 1000; i++) debouncedImmediate(i);

	assert.equal(x, 0, "failed executing debounced function at the start of the sequence");
});