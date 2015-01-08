test("promise test 1", function() {
	stop();
	var promise = BetaJS.Promise.create();
	promise.success(function (value) {
		QUnit.equal(value, 4);
		start();
	});
	promise.asyncSuccess(4);
});

test("promise test 2", function() {
	stop();
	var promise1 = BetaJS.Promise.create();
	var promise2 = BetaJS.Promise.create();
	promise1.and(promise2).success(function (values) {
		QUnit.equal(values[0], 4);
		QUnit.equal(values[1], 10);
		start();
	}).end();
	promise1.asyncSuccess(4);
	promise2.asyncSuccess(10);
});

test("promise test 3", function() {
	stop();
	var promise = BetaJS.Promise.create(5);
	promise.success(function (value) {
		QUnit.equal(value, 5);
		start();
	});
});

test("promise test 4", function () {
	stop();
	var promise1 = BetaJS.Promise.create();
	var promise2 = BetaJS.Promise.create();
	var f = function (pr1, x, pr2, y) {
		return pr1 + x + pr2 + y;
	};
	var pr = BetaJS.Promise.func(f, promise1, 2, promise2, 4);
	pr.success(function (value) {
		QUnit.equal(value, 10);
		start();
	});
	promise1.asyncSuccess(1);
	promise2.asyncSuccess(3);
});

test("promise test 5", function () {
	stop();
	var promise1 = BetaJS.Promise.create();
	var promise2 = BetaJS.Promise.create();
	var f = function (pr1, x, pr2, y) {
		var pr = BetaJS.Promise.create(pr1 + x + pr2 + y);;
		return pr;
	};
	var pr = BetaJS.Promise.func(f, promise1, 2, promise2, 4);
	pr.success(function (value) {
		QUnit.equal(value, 10);
		start();
	});
	promise1.asyncSuccess(1);
	promise2.asyncSuccess(3);
});

test("promise test 6", function () {
	stop();
	var Cls = BetaJS.Class.extend("", {
		constructor: function (x) {
			this._inherited(Cls, "constructor");
			this.x = x;
		}
	});
	var promise1 = BetaJS.Promise.create();
	var promise2 = BetaJS.Promise.newClass(Cls, promise1);
	promise2.success(function (obj) {
		QUnit.equal(obj.x, 10);
		start();
	});
	promise1.asyncSuccess(10);
});
