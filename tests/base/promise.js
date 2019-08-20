QUnit.test("promise test 1", function(assert) {
	var done = assert.async();
	var promise = BetaJS.Promise.create();
	promise.success(function (value) {
		assert.equal(value, 4);
		done();
	});
	promise.asyncSuccess(4);
});

QUnit.test("promise test 2", function(assert) {
	var done = assert.async();
	var promise1 = BetaJS.Promise.create();
	var promise2 = BetaJS.Promise.create();
	promise1.and(promise2).success(function (values) {
		assert.equal(values[0], 4);
		assert.equal(values[1], 10);
		done();
	}).end();
	promise1.asyncSuccess(4);
	promise2.asyncSuccess(10);
});

QUnit.test("promise test 3", function(assert) {
	var done = assert.async();
	var promise = BetaJS.Promise.create(5);
	promise.success(function (value) {
		assert.equal(value, 5);
		done();
	});
});

QUnit.test("promise test 4", function (assert) {
	var done = assert.async();
	var promise1 = BetaJS.Promise.create();
	var promise2 = BetaJS.Promise.create();
	var f = function (pr1, x, pr2, y) {
		return pr1 + x + pr2 + y;
	};
	var pr = BetaJS.Promise.func(f, promise1, 2, promise2, 4);
	pr.success(function (value) {
		assert.equal(value, 10);
		done();
	});
	promise1.asyncSuccess(1);
	promise2.asyncSuccess(3);
});

QUnit.test("promise test 5", function (assert) {
	var done = assert.async();
	var promise1 = BetaJS.Promise.create();
	var promise2 = BetaJS.Promise.create();
	var f = function (pr1, x, pr2, y) {
		var pr = BetaJS.Promise.create(pr1 + x + pr2 + y);
		return pr;
	};
	var pr = BetaJS.Promise.func(f, promise1, 2, promise2, 4);
	pr.success(function (value) {
		assert.equal(value, 10);
		done();
	});
	promise1.asyncSuccess(1);
	promise2.asyncSuccess(3);
});

QUnit.test("promise test 6", function (assert) {
	var done = assert.async();
	var Cls = BetaJS.Class.extend("", {
		constructor: function (x) {
			this._inherited(Cls, "constructor");
			this.x = x;
		}
	});
	var promise1 = BetaJS.Promise.create();
	var promise2 = BetaJS.Promise.newClass(Cls, promise1);
	promise2.success(function (obj) {
		assert.equal(obj.x, 10);
		done();
	});
	promise1.asyncSuccess(10);
});

QUnit.test("promise test 7", function(assert) {
	var done = assert.async();
	var promise1 = BetaJS.Promise.create();
	var promise2 = BetaJS.Promise.create();
	promise1.and(promise2).success(function (values) {
		QUnit.assert.ok(false);
		done();
	}).error(function () {
		QUnit.assert.ok(true);
		done();
	}).end();
	promise1.asyncSuccess(4);
	promise2.asyncError(10);
});

QUnit.test("promise mapSuccess", function (assert) {
	var done = assert.async();
	var log = "";

	var promise = BetaJS.Promise.create();

	promise.mapSuccess(function (v) {
		log += "3";
		return v * 2;
	}).success(function (r) {
		log += "4";
		assert.equal(r, 10);
		assert.equal(log, "134");
	});

	log += "1";
	promise.asyncSuccess(5);
	log += "2";
	assert.equal(log, "1342");
	done();

});

QUnit.test("promise mapASuccess", function (assert) {
	var done = assert.async();
	var log = "";

	var promise = BetaJS.Promise.create();

	promise.mapASuccess(function (v) {
		log += "3";
		return v * 2;
	}).success(function (r) {
		log += "4";
		assert.equal(r, 10);
		assert.equal(log, "1234");
		done();
	});

	log += "1";
	promise.asyncSuccess(5);
	log += "2";
	assert.equal(log, "12");

});