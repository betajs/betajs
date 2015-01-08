test("test channels 1", function() {
	stop();
	var receiver_x = new BetaJS.Channels.Receiver();
	var receiver_y = new BetaJS.Channels.Receiver();
	var sender_x = new BetaJS.Channels.ReveiverSender(receiver_y);
	var sender_y = new BetaJS.Channels.ReveiverSender(receiver_x);
	var transport_x = new BetaJS.Channels.TransportChannel(sender_x, receiver_x);
	var transport_y = new BetaJS.Channels.TransportChannel(sender_y, receiver_y);
	transport_y._reply = function(message, data) {
		return BetaJS.Promise.eventualValue("return:" + message);
	};
	transport_x.send("test").success(function(result) {
		QUnit.equal(result, "return:test");
		start();
	});
});

test("test channels 2", function() {
	stop();stop();
	var receiver_x = new BetaJS.Channels.Receiver();
	var receiver_y = new BetaJS.Channels.Receiver();
	var sender_x = new BetaJS.Channels.ReveiverSender(receiver_y);
	var sender_y = new BetaJS.Channels.ReveiverSender(receiver_x);
	var transport_x = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_x, "x"), new BetaJS.Channels.ReceiverMultiplexer(receiver_x, "y"));
	var transport_y = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_y, "y"), new BetaJS.Channels.ReceiverMultiplexer(receiver_y, "x"));
	var transport_a = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_x, "a"), new BetaJS.Channels.ReceiverMultiplexer(receiver_x, "b"));
	var transport_b = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_y, "b"), new BetaJS.Channels.ReceiverMultiplexer(receiver_y, "a"));
	transport_y._reply = function(message, data) {
		return BetaJS.Promise.eventualValue("return:" + message);
	};
	transport_x.send("test").success(function(result) {
		QUnit.equal(result, "return:test");
		start();
	});
	transport_b._reply = function(message, data) {
		return BetaJS.Promise.eventualValue("ret:" + message);
	};
	transport_a.send("foo").success(function(result) {
		QUnit.equal(result, "ret:foo");
		start();
	});
});

