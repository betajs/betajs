BetaJS.Class.extend("BetaJS.Server.Sessions.Manager", [
	BetaJS.Events.EventsMixin,
	BetaJS.Classes.HelperClassMixin,
	{
		
	_session_class: "BetaJS.Server.Sessions.Session",

    constructor: function (options) {
        this._inherited(BetaJS.Server.Sessions.Manager, "constructor");
        options = BetaJS.Objs.tree_extend({
        	invalidation: {
        		// All times are in milliseconds; null to disable
        		// hard timeout to remove sessions
        		session_timeout: 1000 * 60 * 60 * 24,
        		// kill session if there is no active session after time
        		session_inactivity_timeout: 1000 * 60 * 60,
        		// invalidate; null to disable
        		timer: 1000 * 60 
        	}
        }, options);
        this.__options = options;
        this._session_class = options.session_class || this._session_class;
        if (BetaJS.Types.is_string(this._session_class))
        	this._session_class = BetaJS.Scopes.resolve(this._session_class);
        if (options.invalidation.timer) {
        	this.__timer = this._auto_destroy(new BetaJS.Timers.Timer({
			    fire : this.invalidate,
			    context : this,
			    delay : options.invalidation.timer
        	}));
        }
        this.__sessions = new BetaJS.Lists.ObjectIdList();
    },
    
    destroy: function () {
    	this.iterate(function (session) {
    		session.destroy();
    	});
    	this.__sessions.destroy();
    	this._inherited(BetaJS.Server.Sessions.Manager, "destroy");
    },
    
    iterate: function (cb, ctx) {
    	this.__sessions.iterate(cb, ctx || this);
    },

    obtain_session: function (token, options) {
    	return this.find_session(token) || this.new_session(token, options);
    },
    
    __generate_token: function () {
    	return BetaJS.Tokens.generate_token();
    },
    
    find_session: function (token) {
    	return this.__sessions.get(token);
    },
    
    __add_session: function (session) {
    	this.__sessions.add(session);
    	this._helper("__add_session", session);
    },
    
    new_session: function (token, options) {
        session = new this._session_class(this, token || this.__generate_token(), options);
        this.__add_session(session);
        return session;
    },
    
    invalidate: function () {
        this.iterate(function (session) {
            session.invalidate();
        });
    },
    
    options: function () {
    	return this.__options;
    },
    
    __remove_session: function (session) {
    	if (this.__sessions.exists(session)) {
	    	this._helper("remove_session", session);
	    	this.__sessions.remove(session);
	    }
    },
    
    delete_session: function (session) {
    	session.destroy();
    }
    
}]);


BetaJS.Class.extend("BetaJS.Server.Sessions.Session", [
	BetaJS.Classes.HelperClassMixin,
	{
		
    constructor: function (manager, token, options) {
        this._inherited(BetaJS.Server.Sessions.Session, "constructor");
        this.__manager = manager;
        this.__options = options;
        BetaJS.Ids.objectId(this, token);
        this.initiation_time = BetaJS.Time.now();
        this.active_time = this.initiation_time;
    },
    
    destroy: function () {
    	this.__manager.__remove_session(this);
        this._inherited(BetaJS.Server.Sessions.Session, "destroy");
    },
    
    is_active: function () {
    	return this._helper({
    		method: "is_active",
    		fold_start: false,
    		fold: function (acc, result) {
    			return acc || result;
    		}
    	});
    },
    
    activity: function () {
    	this.active_time = BetaJS.Time.now();
    },
    
    invalidate: function () {
    	this._helper("invalidate");
    	var opts = this.__manager.options().invalidation;
    	var now = BetaJS.Time.now();
    	if ((opts.session_timeout && now > this.initiation_time + opts.session_timeout) ||
    		(!this.is_active() && opts.session_inactivity_timeout && now > this.active_time + opts.session_inactivity_timeout)) {
    		this.destroy();
    	}
    },

    manager: function () {
    	return this.__manager;
    }
    
}]);
