QUnit.test("test rmi", function(assert) {
	var Stub = BetaJS.RMI.Stub.extend("", {
		intf : ["test", "failTest"]
	});

	var Skeleton = BetaJS.RMI.Skeleton.extend("", {

		intf : ["test", "failTest"],

		test : function(a, b, c) {
			return a + b + c;
		},

		failTest: function () {
			throw "Failed";
		}
	});

	var stub = new Stub();

	var skeleton = new Skeleton();

	stub.__send = function () {
		return skeleton.invoke.apply(skeleton, arguments);
	};

	assert.expect(2);
	var done1 = assert.async();
    var done2 = assert.async();

	stub.test(1, 2, 3).success(function(result) {
		assert.equal(result, 6);
		done1();
	});

	stub.failTest().error(function (err) {
		assert.equal(err, "Failed");
		done2();
	});

});

QUnit.test("test rmi client server", function(assert) {
	var receiver_x = new BetaJS.Channels.Receiver();
	var receiver_y = new BetaJS.Channels.Receiver();
	var sender_x = new BetaJS.Channels.ReceiverSender(receiver_y);
	var sender_y = new BetaJS.Channels.ReceiverSender(receiver_x);
	var transport_x = new BetaJS.Channels.TransportChannel(sender_x, receiver_x);
	var transport_y = new BetaJS.Channels.TransportChannel(sender_y, receiver_y);

	var Stub = BetaJS.RMI.Stub.extend("", {
		intf : ["test", "test2", "failTest"]
	});

	var Skeleton = BetaJS.RMI.Skeleton.extend("", {

		intf : ["test", "test2", "failTest"],

		constructor : function(d) {
			this._inherited(Skeleton, "constructor");
			this.__d = d;
		},

		test : function(a, b, c) {
			return this._success(a + b + c + this.__d);
		},

		test2 : function(a, b, c) {
			return a + b + c + this.__d;
		},

		failTest: function () {
			throw "Failed";
		}
	});

	var server = new BetaJS.RMI.Server();
	server.registerInstance(new Skeleton(100), {
		name : "x"
	});
	server.registerInstance(new Skeleton(1000), {
		name : "y"
	});
	server.registerClient(transport_x);

	var client = new BetaJS.RMI.Client();
	client.connect(transport_y);

	var stub_x = client.acquire(Stub, "x");
	var stub_y = client.acquire(Stub, "y");

	assert.expect(4);
	var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();

	stub_x.test(1, 2, 3).success(function(result) {
		assert.equal(result, 106);
		done1();
	});

	stub_x.test2(1, 2, 3).success(function(result) {
		assert.equal(result, 106);
		done2();
	});

	stub_y.test(1, 2, 3).success(function(result) {
		assert.equal(result, 1006);
		done3();
	});

	stub_x.failTest().error(function (err) {
		assert.equal(err, "Failed");
		done4();
        BetaJS.Async.eventually(function () {
        	transport_x.destroy();
        	transport_y.destroy();
        });
	});

});



QUnit.test("test rmi client server create instance", function(assert) {
	var receiver_x = new BetaJS.Channels.Receiver();
	var receiver_y = new BetaJS.Channels.Receiver();
	var sender_x = new BetaJS.Channels.ReceiverSender(receiver_y);
	var sender_y = new BetaJS.Channels.ReceiverSender(receiver_x);
	var transport_x = new BetaJS.Channels.TransportChannel(sender_x, receiver_x);
	var transport_y = new BetaJS.Channels.TransportChannel(sender_y, receiver_y);

	var Stub = BetaJS.RMI.Stub.extend("BetaJS.Test.Stub", {
		intf : ["generate"]
	});

	var StubX = BetaJS.RMI.Stub.extend("BetaJS.Test.StubX", {
		intf : ["foo"]
	});

	var Skeleton = BetaJS.RMI.Skeleton.extend("BetaJS.Test.Skeleton", {

		intf : ["generate"],

		generate : function() {
			return new SkeletonX();
		}
	});

	var SkeletonX = BetaJS.RMI.Skeleton.extend("BetaJS.Test.SkeletonX", {

		intf : ["foo"],

		foo : function() {
			return "bar";
		}
	});

	var server = new BetaJS.RMI.Server();
	server.registerInstance(new Skeleton(), {
		name : "generator"
	});
	server.registerClient(transport_x);

	var client = new BetaJS.RMI.Client();
	client.connect(transport_y);

	var stub = client.acquire(Stub, "generator");
	stub.generate().success(function (x) {
		x.foo().success(function (y) {
			assert.equal(y, "bar");
            BetaJS.Async.eventually(function () {
                transport_x.destroy();
                transport_y.destroy();
            });
		});
	});

});
