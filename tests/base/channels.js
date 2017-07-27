
QUnit.test("test channels 1", function(assert) {
	var done = assert.async();
	var receiver_x = new BetaJS.Channels.Receiver();
	var receiver_y = new BetaJS.Channels.Receiver();
	var sender_x = new BetaJS.Channels.ReceiverSender(receiver_y);
	var sender_y = new BetaJS.Channels.ReceiverSender(receiver_x);
	var transport_x = new BetaJS.Channels.TransportChannel(sender_x, receiver_x);
	var transport_y = new BetaJS.Channels.TransportChannel(sender_y, receiver_y);
	transport_y._reply = function(message, data) {
		return BetaJS.Promise.eventualValue("return:" + message);
	};
	transport_x.send("test").success(function(result) {
		assert.equal(result, "return:test");
		done();
		BetaJS.Async.eventually(function () {
            transport_x.destroy();
            transport_y.destroy();
		});
	});
});

QUnit.test("test channels 2", function(assert) {
	var done = assert.async(2);
	var receiver_x = new BetaJS.Channels.Receiver();
	var receiver_y = new BetaJS.Channels.Receiver();
	var sender_x = new BetaJS.Channels.ReceiverSender(receiver_y);
	var sender_y = new BetaJS.Channels.ReceiverSender(receiver_x);
	var transport_x = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_x, "x"), new BetaJS.Channels.ReceiverMultiplexer(receiver_x, "y"));
	var transport_y = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_y, "y"), new BetaJS.Channels.ReceiverMultiplexer(receiver_y, "x"));
	var transport_a = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_x, "a"), new BetaJS.Channels.ReceiverMultiplexer(receiver_x, "b"));
	var transport_b = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_y, "b"), new BetaJS.Channels.ReceiverMultiplexer(receiver_y, "a"));
	transport_y._reply = function(message, data) {
		return BetaJS.Promise.eventualValue("return:" + message);
	};
	transport_x.send("test").success(function(result) {
		assert.equal(result, "return:test");
		done();
	});
	transport_b._reply = function(message, data) {
		return BetaJS.Promise.eventualValue("ret:" + message);
	};
	transport_a.send("foo").success(function(result) {
		assert.equal(result, "ret:foo");
		done();
        BetaJS.Async.eventually(function () {
        	transport_x.destroy();
            transport_y.destroy();
            transport_a.destroy();
            transport_b.destroy();
        });
	});
});

