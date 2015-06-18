test("test route parser", function() {
	var routeParser = new BetaJS.Router.RouteParser({
		"simple": "/simple",
		"polymorphic": "/polymorphic/(key:first|second)"
	});
	QUnit.deepEqual(routeParser.parse("/foobar"), null);
	QUnit.deepEqual(routeParser.parse("/simple"), {name: "simple", args: {}});
	QUnit.deepEqual(routeParser.parse("/polymorphic/first"), {name: "polymorphic", args: {key: "first"}});
	QUnit.deepEqual(routeParser.parse("/polymorphic/second"), {name: "polymorphic", args: {key: "second"}});
	QUnit.equal(routeParser.format("simple"), "/simple");
	QUnit.equal(routeParser.format("polymorphic", {key: "first"}), "/polymorphic/first");
	QUnit.equal(routeParser.format("polymorphic", {key: "second"}), "/polymorphic/second");
});

test("test router", function () {
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
	QUnit.equal(result_simple, true);
	router.navigate("/polymorphic/second");
	QUnit.equal(result_poly, "second");	
});

test("test router history", function () {
	var router = new BetaJS.Router.Router();
	router.bind("simple", "/simple");
	router.bind("polymorphic", "/polymorphic/(key:first|second)");
	var history = new BetaJS.Router.RouterHistory(router);
	router.navigate("/simple");
	router.navigate("/polymorphic/second");
	QUnit.equal(history.count(), 2);
	history.back();
	QUnit.equal(router.current().name, "simple");
});

test("test router with states", function () {
	var router = new BetaJS.Router.Router();
	var host = new BetaJS.States.Host();
	var binder = new BetaJS.Router.StateRouteBinder(router, host);
	
	binder.register("simple", "/simple");
	binder.register("polymorphic", "/polymorphic/(key:first|second)");
	
	router.navigate("/simple");	
	QUnit.equal(host.state().state_name(), "Simple");
	router.navigate("/polymorphic/second");
	QUnit.equal(host.state().state_name(), "Polymorphic");
	QUnit.equal(host.get("key"), "second");
	host.next("Simple");
	QUnit.equal(router.current().route, "/simple");
	host.next("Polymorphic", {key: "first"});
	QUnit.equal(router.current().route, "/polymorphic/first");
});
