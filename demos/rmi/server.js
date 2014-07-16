BetaJS = require("../../dist/beta-server.js");

Express = require("express");
SocketIO = require('socket.io');
express =  Express();

socketio = SocketIO.listen(express.listen(5000, function() {
    console.log("Listening on 5000");
}));

App = {};


/* Skeleton Definition Start */

BetaJS.RMI.Skeleton.extend("App.Skeleton", {
    intfSync : ["test"],
    
    test: function (a, b, c) {
        console.log("Adding", a, b, c);
        return a + b + c;
    }
});

/* Skeleton Definition End */



socketio.sockets.on('connection', function(socket) {
    rmi_sender = new BetaJS.Net.SocketSenderChannel(socket, "rmi");
    rmi_receiver = new BetaJS.Net.SocketReceiverChannel(socket, "rmi");
    rmi_peer = new BetaJS.RMI.Peer(rmi_sender, rmi_receiver);
    
    /* Skeleton Registration Start */
   
    var skeleton = new App.Skeleton();
    rmi_peer.registerInstance(skeleton, {
        name : "object_name"
    });
    
    /* Skeleton Registration End */
});
