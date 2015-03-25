test("test as_method", function() {
	var Obj = {
		a: 1,
		
		test: function () {
			return this.a;
		}
	};
	
	var func = BetaJS.Functions.as_method(Obj.test, Obj);
	ok(func() == 1);
});
