test("test object inheritance", function() {
	var A = BetaJS.Class.extend("A", {
		test: function (x) {
			return x + "a";
		},
		test2: function () {
			return "z";
		}
	});
	var B = A.extend("B");
	var C = B.extend("C", {
		test: function (x) {
			return x + "c" + this._inherited(C, "test", "c");
		},
	});
	var D = C.extend("D");
	var E = D.extend("E", {
		test: function (x) {
			return x + "e" + this._inherited(E, "test", "e");
		},
	});
	var e = new E();
	ok(e.test("g") == "geecca" && e.test2() == "z");
});


test("test constructor & destructor", function() {
	var A = BetaJS.Class.extend("A", {
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
	var B = A.extend("B", {
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
	ok(b.x == 1 && b.y == 2 && b.z == 3);
	b.destroy();
	ok(typeof b.x == "undefined" && typeof b.y == "undefined" && typeof b.z == "undefined");
});


test("test notifications", function() {
	var A = BetaJS.Class.extend("A", {
		_notifications: {
			"test": "test_a"
		},
		test_a: function() {
			this.x = 1;
		}
	});
	var B = A.extend("B", {
		_notifications: {
			"test": "test_b"
		},
		test_b: function() {
			this.y = 2;
		},
		test: function () {
			this._notify("test");
		}
	});
	var b = new B();
	b.test();
	ok(b.x == 1 && b.y == 2);
});

test("test static inheritance", function() {
	var A = BetaJS.Class.extend("A", {}, {
		test: function (x) {
			return x + "a";
		},
		test2: function () {
			return "z";
		}
	});
	var B = A.extend("B");
	var C = B.extend("C", {}, {
		test: function (x) {
			return x + "c" + this._inherited(C, "test", "c");
		},
	});
	var D = C.extend("D");
	var E = D.extend("E", {}, {
		test: function (x) {
			return x + "e" + this._inherited(E, "test", "e");
		},
	});
	ok(E.test("g") == "geecca" && E.test2() == "z");
});

test("test static variables", function() {
	var A = BetaJS.Class.extend("A", {}, {
		obj: {x: 1}
	});
	var B = A.extend("B");
	A.obj.x = 5;
	ok(B.obj.x == 5);
});

test("test class static variables", function() {
	var A = BetaJS.Class.extend("A", {}, {}, {
		obj: {x: 1}
	});
	var B = A.extend("B");
	A.obj.x = 5;
	ok(B.obj.x == 1);
});
