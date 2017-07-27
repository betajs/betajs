QUnit.test("test multi delegatable", function(assert) {
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
	assert.equal(sum, 2 * 7 * 13 + 2 * 11 * 17 + 3 * 7 * 13 + 3 * 11 * 17 + 5 * 7 * 13 + 5 * 11 * 17);
});
