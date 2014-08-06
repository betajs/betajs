BetaJS.Class.extend("BetaJS.Server.Session.SocketsManagerHelper", {
	
	constructor: function (manager) {
		this._inherited(BetaJS.Server.Session.SocketsManagerHelper, "constructor");
		this.__manager = manager;
		manager.bind_socket = function (socket, session_cookie, data) {
			var session_token = BetaJS.Strings.read_cookie_string(socket.handshake.headers.cookie, session_cookie, data);
	        var session = this.find_session(session_token);
	        if (!session) {
	            socket.disconnect();
	            return null;
	        }
	        var active_session = session.active_sessions.find_active_session(data.active_session_token);
	        if (!active_session) {
	            socket.disconnect();
	            return null;
	        }
	        active_session.socket.bind(socket);        
			return active_session;
		};
	},

	__add_active_session: function (session, active_session) {
		active_session.addHelper(BetaJS.Server.Session.SocketsHelper);
	}
	
});

BetaJS.Class.extend("BetaJS.Server.Session.SocketsHelper", {

    constructor: function (active_session) {
        this._inherited(BetaJS.Server.Session.SocketsHelper, "constructor");
        this.__active_session = active_session;
        active_session.socket = this;
    },
    
    destroy: function () {
        this.unbind_socket();
        this._inherited(BetaJS.Server.Session.SocketsHelper, "destroy");
    },    

    suspended: function () {
    	return !this.socket();
    },
    
    bind: function (socket) {
        if (socket == this.__socket)
            return;
        this.unbind();
        this.__socket = socket;
        var self = this;
        socket.on("disconnect", function() {
            self.unbind();
        });
        this.__active_session.trigger("bind_socket", socket);
    },
    
    unbind: function () {
        this.__socket = null;
        this.__active_session.activity();
        this.__active_session.trigger("unbind_socket");
    },
    
    socket: function () {
        return this.__socket;
    }
      
});
