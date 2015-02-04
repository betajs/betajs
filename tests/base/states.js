test("test states w register", function() {
	var host = new BetaJS.States.Host();
	host.register("A", {});
	host.register("B", {});
	host.initialize("A");
	QUnit.equal(host.state().state_name(), "A");
	host.state().next("B");
	QUnit.equal(host.state().state_name(), "B");
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
});
