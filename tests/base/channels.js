test("test channels", function() {
	var receiver_x = new BetaJS.Channels.Receiver();
	var receiver_y = new BetaJS.Channels.Receiver();
	var sender_x = new BetaJS.Channels.ReveiverSender(receiver_y);
	var sender_y = new BetaJS.Channels.ReveiverSender(receiver_x);
	var transport_x = new BetaJS.Channels.TransportChannel(sender_x, receiver_x);
	var transport_y = new BetaJS.Channels.TransportChannel(sender_y, receiver_y);
	transport_y._reply = function(message, data, callbacks) {
		BetaJS.SyncAsync.callback(callbacks, "success", "return:" + message);
	};
	transport_x.send("test", [], {
		success : function(result) {
			QUnit.equal(result, "return:test");
		}
	});
});

test("test channels", function() {
	var receiver_x = new BetaJS.Channels.Receiver();
	var receiver_y = new BetaJS.Channels.Receiver();
	var sender_x = new BetaJS.Channels.ReveiverSender(receiver_y);
	var sender_y = new BetaJS.Channels.ReveiverSender(receiver_x);
	var transport_x = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_x, "x"), new BetaJS.Channels.ReceiverMultiplexer(receiver_x, "y"));
	var transport_y = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_y, "y"), new BetaJS.Channels.ReceiverMultiplexer(receiver_y, "x"));
	var transport_a = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_x, "a"), new BetaJS.Channels.ReceiverMultiplexer(receiver_x, "b"));
	var transport_b = new BetaJS.Channels.TransportChannel(new BetaJS.Channels.SenderMultiplexer(sender_y, "b"), new BetaJS.Channels.ReceiverMultiplexer(receiver_y, "a"));
	transport_y._reply = function(message, data, callbacks) {
		BetaJS.SyncAsync.callback(callbacks, "success", "return:" + message);
	};
	transport_x.send("test", [], {
		success : function(result) {
			QUnit.equal(result, "return:test");
		}
	});
	transport_b._reply = function(message, data, callbacks) {
		BetaJS.SyncAsync.callback(callbacks, "success", "ret:" + message);
	};
	transport_a.send("foo", [], {
		success : function(result) {
			QUnit.equal(result, "ret:foo");
		}
	});
});

