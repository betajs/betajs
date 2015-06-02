test("test multi delegatable", function() {
	var sum = 0;
	var Cls = BetaJS.Class.extend("", {
		constructor: function (ident) {
			this._inherited(Cls, "constructor");
			this.ident = ident;
		},
		methodA: function (arg) {
			sum += this.ident * arg * 13;
		},
		methodB: function (arg) {
			sum += this.ident * arg * 17;
		}
	});
	var objs = [new Cls(2), new Cls(3), new Cls(5)];
	var multi = new BetaJS.Classes.MultiDelegatable(objs, ["methodA", "methodB"]);
	multi.methodA(7).methodB(11);	
	QUnit.equal(sum, 2 * 7 * 13 + 2 * 11 * 17 + 3 * 7 * 13 + 3 * 11 * 17 + 5 * 7 * 13 + 5 * 11 * 17);
});


test("test context registry", function () {
	
	var registry = new BetaJS.Classes.ContextRegistry();
	var data1 = {};
	var data2 = {};
	var ctx1 = {};
	var ctx2 = {};
	QUnit.equal(registry.register(data1, ctx1), true);
	QUnit.equal(registry.register(data1, ctx2), false);
	QUnit.equal(registry.register(data2, ctx2), true);
	QUnit.equal(registry.register(data2, ctx1), false);
	QUnit.equal(registry.unregister(data2, ctx1), false);
	QUnit.equal(registry.unregister(data2, ctx2), true);
	QUnit.equal(registry.unregister(data1, null), true);
	
});