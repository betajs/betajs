QUnit.test("test states w register", function(assert) {
	var host = new BetaJS.States.Host();
	host.register("A", {});
	host.register("B", {});
	host.initialize("A");
	assert.equal(host.state().state_name(), "A");
	host.state().next("B");
	assert.equal(host.state().state_name(), "B");
	host.destroy();
});

QUnit.test("test states w extend", function(assert) {
	var host = new BetaJS.States.Host();
	var S = BetaJS.States.State.extend("BetaJS.Test.S");
	var A = S.extend("BetaJS.Test.A");
	var B = S.extend("BetaJS.Test.B");
	host.initialize("BetaJS.Test.A");
	assert.equal(host.state().state_name(), "A");
	host.state().next("B");
	assert.equal(host.state().state_name(), "B");
	host.destroy();
});

QUnit.test("test states w router", function (assert) {
	var host = new BetaJS.States.Host();
	var S = BetaJS.States.State.extend("BetaJS.Test.S");
	var A = S.extend("BetaJS.Test.A");
	var B = S.extend("BetaJS.Test.B");
	var C = S.extend("BetaJS.Test.C");
	var router = new BetaJS.States.StateRouter(host);
	router.registerRoute("a", "A");
	router.registerRoute("b", "B");
	router.registerRoute("c", "C");
	host.initialize("BetaJS.Test.A");
	host.state().host.set("x", 42);
	assert.equal(router.currentRoute(), "a");
	router.navigateRoute("c");
	assert.equal(host.state().state_name(), "C");
	assert.equal(host.get("x"), 42);
	host.destroy();
});

QUnit.test("test states host attributes", function(assert) {
	var host = new BetaJS.States.Host();
	var S = BetaJS.States.State.extend("BetaJS.Test.S");
	var A = S.extend("BetaJS.Test.A");
	var B = S.extend("BetaJS.Test.B");
	host.initialize("BetaJS.Test.A", {
		foobar: 42
	});
	assert.equal(host.get("foobar"), 42);
	host.state().next("B", {
		test: 123
	});
	assert.equal(host.get("foobar"), undefined);
	assert.equal(host.get("test"), 123);
});
