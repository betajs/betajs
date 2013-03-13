test("test auto destroy mixin", function() {
	var destroyed = false;
	var A = BetaJS.Class.extend("A", [BetaJS.Classes.AutoDestroyMixin, {
		destroy: function () {
			destroyed = true;
			this._inherited(A, "destroy");
		}
	}]);
	var a = new A();
	a.enter();
	a.leave();
	ok(destroyed);
});
