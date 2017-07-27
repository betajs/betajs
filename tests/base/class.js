QUnit.test("test object inheritance", function(assert) {
	var A = BetaJS.Class.extend(null, {
		test: function (x) {
			return x + "a";
		},
		test2: function () {
			return "z";
		}
	});
	var B = A.extend(null);
	var C = B.extend(null, {
		test: function (x) {
			return x + "c" + this._inherited(C, "test", "c");
		}
	});
	var D = C.extend(null);
	var E = D.extend(null, {
		test: function (x) {
			return x + "e" + this._inherited(E, "test", "e");
		}
	});
	var e = new E();
	assert.ok(e.test("g") == "geecca" && e.test2() == "z");
	assert.ok(e.instance_of(B) && !B.ancestor_of(C));
});


QUnit.test("test object inheritance 2", function(assert) {
	var A = BetaJS.Class.extend(null, {
		test: function (x) {
			return x + "a";
		},
		test2: function () {
			return "z";
		}
	});
	var B = A.extend(null);
	var C = B.extend(null, function (inherited) {
		return {
			test: function (x) {
				return x + "c" + inherited.test.call(this, "c");
			}
		};
	});
	var D = C.extend(null);
	var E = D.extend(null, function (inherited) {
		return {
			test: function (x) {
				return x + "e" + inherited.test.call(this, "e");
			}
		};
	});
	var e = new E();
	assert.equal(e.test("g"), "geecca");
	assert.equal(e.test2(), "z");
	assert.ok(e.instance_of(B) && !B.ancestor_of(C));
});


QUnit.test("test constructor & destructor", function(assert) {
	var A = BetaJS.Class.extend(null, {
		_notifications: {
			"construct": "__z"
		},
		__z: function() {
			this.z = 3;
		},
		constructor: function (x) {
			this._inherited(A, "constructor");
			this.x = x;
		},
		destroy: function () {
			this.y = 20;
			this._inherited(A, "destroy");
		}
	});
	var B = A.extend(null, {
		constructor: function (x, y) {
			this._inherited(B, "constructor", x);
			this.y = y;
		},
		destroy: function () {
			this.x = 10;
			this._inherited(B, "destroy");
		}
	});
	var b = new B(1, 2);
	assert.equal(b.x, 1);
	assert.equal(b.y, 2);
	assert.equal(b.z, 3);
	b.destroy();
	assert.equal(typeof b.x, "undefined");
	assert.equal(typeof b.y, "undefined");
	assert.equal(typeof b.z, "undefined");
});


QUnit.test("test notifications", function(assert) {
	var A = BetaJS.Class.extend(null, {
		_notifications: {
			"test": "test_a"
		},
		test_a: function(a, b) {
			this.x = b-a;
		}
	});
	var B = A.extend(null, {
		_notifications: {
			"test": "test_b"
		},
		test_b: function() {
			this.y = 2;
		},
		test: function () {
			this._notify("test", 8, 9);
		}
	});
	var b = new B();
	b.test();
	assert.ok(b.x == 1 && b.y == 2);
});

QUnit.test("test static inheritance", function(assert) {
	var A = BetaJS.Class.extend(null, {}, {
		test: function (x) {
			return x + "a";
		},
		test2: function () {
			return "z";
		}
	});
	var B = A.extend(null);
	var C = B.extend(null, {}, {
		test: function (x) {
			return x + "c" + this._inherited(C, "test", "c");
		}
	});
	var D = C.extend(null);
	var E = D.extend(null, {}, {
		test: function (x) {
			return x + "e" + this._inherited(E, "test", "e");
		}
	});
	assert.ok(E.test("g") == "geecca" && E.test2() == "z");
});

QUnit.test("test static variables", function(assert) {
	var A = BetaJS.Class.extend(null, {}, {
		obj: {x: 1}
	});
	var B = A.extend(null);
	A.obj.x = 5;
	assert.ok(B.obj.x == 5);
});

QUnit.test("test class static variables", function(assert) {
	var A = BetaJS.Class.extend(null, {}, {}, {
		obj: {x: 1}
	});
	var B = A.extend(null);
	A.obj.x = 5;
	assert.ok(B.obj.x == 1);
});


QUnit.test("test inheritance", function(assert) {
	var A = BetaJS.Class.extend(null, {
		constructor: function () {
			this._inherited(A, "constructor");
			this.x = 1;
		}
	});
	var B = A.extend(null, {
	});
	var C = B.extend(null, {
		constructor: function () {
			this._inherited(C, "constructor");
			this.y = 1;
		}
	});
	var instance = new C();
	assert.ok(instance.y == 1);
	assert.ok(instance.x == 1);
});


QUnit.test("test weak destroy", function (assert) {
	var obj = new BetaJS.Class();
	assert.equal(obj.destroyed(), false);
	obj.weakDestroy();
	assert.equal(obj.destroyed(), true);
	obj.weakDestroy();
});

QUnit.test("test implements", function (assert) {
	var obj = new BetaJS.Class();
	assert.equal(obj.impl(BetaJS.Events.EventsMixin), false);
	obj = new BetaJS.Properties.Properties();
	assert.equal(obj.impl(BetaJS.Events.EventsMixin), true);
});