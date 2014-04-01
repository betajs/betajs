test("test sync to async", function() {
	BetaJS.SyncAsync.syncToAsync({
		success : function(result) {
			ok(result == 5);
		},
		exception : function(except) {
			ok(false);
		}
	}, function() {
		return 5;
	});
});

test("test sync to async 2", function() {
	BetaJS.SyncAsync.syncToAsync({
		success : function(result) {
			ok(false);
		},
		exception : function(except) {
			ok(except == 5);
		}
	}, function() {
		throw 5;
	});
});

test("test object.callback", function() {
	var obj = BetaJS.Objs.extend({
		_supportsAsync: true,
		_supportsSync: true
	}, BetaJS.SyncAsync.SyncAsyncMixin);
	obj.callback({
		success: function (result) {
			ok(result == 4);
		}, exception: function (e) {
			ok(false);
		}
	}, "success", 4);
	obj.callback({
		success: function (result) {
			ok(false);
		}, exception: function (e) {
			ok(e == 6);
		}
	}, "exception", 6);
});

test("test promise", function () {
	var promise = BetaJS.SyncAsync.promise(function (callbacks) {
		BetaJS.SyncAsync.callback(callbacks, "success", 1234);
	});
	BetaJS.SyncAsync.reveal(promise, {
		success: function (result) {
			ok(result == 1234);
		}
	});
});


test("test promise join", function () {
	var promise1 = BetaJS.SyncAsync.promise(function (callbacks) {
		BetaJS.SyncAsync.callback(callbacks, "success", 1234);
	});
	var promise2 = BetaJS.SyncAsync.promise(function (callbacks) {
		BetaJS.SyncAsync.callback(callbacks, "success", 5678);
	});
	BetaJS.SyncAsync.join([promise1, promise2], {
		success: function (result1, result2) {
			ok(result1 == 1234);
			ok(result2 == 5678);
		}
	});
});


test("test then", function () {
	BetaJS.SyncAsync.then(function (x, callbacks) {
		callbacks.success(2 * x);
	}, [5], {
		success: function (x) {
			QUnit.equal(x, 13);
		}
	}, function (x, callbacks) {
		callbacks.success(x + 3);
	});
});

test("test then sync", function () {
	BetaJS.SyncAsync.then(function (x, callbacks) {
		return 2 * x;
	}, [5], BetaJS.SyncAsync.SYNC, {
		success: function (x) {
			QUnit.equal(x, 13);
		}
	}, function (x, callbacks) {
		callbacks.success(x + 3);
	});
});



test("test eitherSync", function() {
	BetaJS.SyncAsync.eitherSync({
		success: function (z) {
			QUnit.equal(z, 2 * 5 + 3);
		}
	}, function (x) {
		return 2 * x + this.y;
	}, [5], {
		y: 3
	});
});



test("test object.eitherFactory", function() {
	var obj = BetaJS.Objs.extend({
		_supportsAsync: true,
		_supportsSync: true,
		dummy: 3
	}, BetaJS.SyncAsync.SyncAsyncMixin);
	QUnit.equal(obj.eitherFactory("test", null, function () {
		return 5 + this.dummy;
	}, function () {
		return 7;
	}), 8);
});
