test("test channels", function() {
	var receiver_x = new BetaJS.Channels.Receiver(); 
	var receiver_y = new BetaJS.Channels.Receiver(); 
	var sender_x = new BetaJS.Channels.ReveiverSender(receiver_y); 
	var sender_y = new BetaJS.Channels.ReveiverSender(receiver_x);
	var transport_x = new BetaJS.Channels.TransportChannel(sender_x, receiver_x);
	var transport_y = new BetaJS.Channels.TransportChannel(sender_y, receiver_y);
	transport_y._reply = function (message, data, callbacks) {
		BetaJS.SyncAsync.callback(callbacks, "success", "return:" + message);
	};
	transport_x.send("test", [], {
		success: function (result) {
			QUnit.equal(result, "return:test");
		}
	});
});

