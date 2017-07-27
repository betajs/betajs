
QUnit.test("test route parser", function(assert) {
	var routeParser = new BetaJS.Router.RouteParser({
		"simple": "/simple",
		"polymorphic": "/polymorphic/(key:first|second)"
	});
	assert.deepEqual(routeParser.parse("/foobar"), null);
	assert.deepEqual(routeParser.parse("/simple"), {name: "simple", args: {}});
	assert.deepEqual(routeParser.parse("/polymorphic/first"), {name: "polymorphic", args: {key: "first"}});
	assert.deepEqual(routeParser.parse("/polymorphic/second"), {name: "polymorphic", args: {key: "second"}});
	assert.equal(routeParser.format("simple"), "/simple");
	assert.equal(routeParser.format("polymorphic", {key: "first"}), "/polymorphic/first");
	assert.equal(routeParser.format("polymorphic", {key: "second"}), "/polymorphic/second");
});

QUnit.test("test router", function (assert) {
	var router = new BetaJS.Router.Router();
	var result_simple = false;
	router.bind("simple", "/simple", function () {
		result_simple = true;
	});
	var result_poly = false;
	router.bind("polymorphic", "/polymorphic/(key:first|second)", function (args) {
		result_poly = args.key;
	});
	router.navigate("/simple");
	assert.equal(result_simple, true);
	router.navigate("/polymorphic/second");
	assert.equal(result_poly, "second");
});

QUnit.test("test router history", function (assert) {
	var router = new BetaJS.Router.Router();
	router.bind("simple", "/simple");
	router.bind("polymorphic", "/polymorphic/(key:first|second)");
	var history = new BetaJS.Router.RouterHistory(router);
	router.navigate("/simple");
	router.navigate("/polymorphic/second");
	assert.equal(history.count(), 2);
	history.back();
	assert.equal(router.current().name, "simple");
});

QUnit.test("test router with states", function (assert) {
	var router = new BetaJS.Router.Router();
	var host = new BetaJS.States.Host();
	var binder = new BetaJS.Router.StateRouteBinder(router, host, {
		capitalizeStates: true
	});
	
	binder.register("simple", "/simple");
	binder.register("polymorphic", "/polymorphic/(key:first|second)");
	
	router.navigate("/simple");	
	assert.equal(host.state().state_name(), "Simple");
	router.navigate("/polymorphic/second");
	assert.equal(host.state().state_name(), "Polymorphic");
	assert.equal(host.get("key"), "second");
	host.next("Simple");
	assert.equal(router.current().route, "/simple");
	host.next("Polymorphic", {key: "first"});
	assert.equal(router.current().route, "/polymorphic/first");
});
