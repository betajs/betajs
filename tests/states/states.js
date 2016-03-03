test("test states w register", function() {
	var host = new BetaJS.States.Host();
	host.register("A", {});
	host.register("B", {});
	host.initialize("A");
	QUnit.equal(host.state().state_name(), "A");
	host.state().next("B");
	QUnit.equal(host.state().state_name(), "B");
	host.destroy();
});

test("test states w extend", function() {
	var host = new BetaJS.States.Host();
	var S = BetaJS.States.State.extend("BetaJS.Test.S");
	var A = S.extend("BetaJS.Test.A");
	var B = S.extend("BetaJS.Test.B");
	host.initialize("BetaJS.Test.A");
	QUnit.equal(host.state().state_name(), "A");
	host.state().next("B");
	QUnit.equal(host.state().state_name(), "B");
	host.destroy();
});

test("test states w router", function () {
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
	QUnit.equal(router.currentRoute(), "a");
	router.navigateRoute("c");
	QUnit.equal(host.state().state_name(), "C");
	QUnit.equal(host.get("x"), 42);
	host.destroy();
});