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
