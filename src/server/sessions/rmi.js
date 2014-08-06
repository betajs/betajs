BetaJS.Class.extend("BetaJS.Server.Session.RMIManagerHelper", {
	
	__add_active_session: function (session, active_session) {
		active_session.addHelper(BetaJS.Server.Session.RMIHelper);
	}
	
});

BetaJS.Class.extend("BetaJS.Server.Session.RMIHelper", {

    constructor: function (active_session) {
        this._inherited(BetaJS.Server.Session.RMIHelper, "constructor");
        this.__active_session = active_session;
        active_session.rmi = this;
        this.__rmi_sender = new BetaJS.Net.SocketSenderChannel(null, "rmi", false);
        this.__rmi_receiver = new BetaJS.Net.SocketReceiverChannel(null, "rmi");
        this.__rmi_peer = new BetaJS.RMI.Peer(this.__rmi_sender, this.__rmi_receiver);
        active_session.rmi_peer = this.__rmi_peer;
        this.stubs = {};
        this.skeletons = {};
        active_session.stubs = this.stubs;
        active_session.skeletons = this.skeletons;
        active_session.on("bind_socket", function (socket) {
	        this.__rmi_receiver.socket(socket);
	        this.__rmi_sender.socket(socket);
	        this.__rmi_sender.ready();
        }, this);
        active_session.on("unbind_socket", function () {
        	this.__rmi_sender.unready();
        }, this);
        if ("initialize_rmi" in active_session)
        	active_session.initialize_rmi();
    },
    
    destroy: function () {
        for (var key in this.stubs)
            this.stubs[key].destroy;
        for (key in this.skeletons)
            this.skeletons[key].destroy;
        this.__rmi_peer.destroy();
        this.__rmi_receiver.destroy();
        this.__rmi_sender.destroy();
        this._inherited(BetaJS.Server.Session.RMIHelper, "destroy");
    }
      
});
