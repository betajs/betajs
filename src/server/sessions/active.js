BetaJS.Class.extend("BetaJS.Server.Session.ActiveSessionManagerHelper", {
	
	_active_session_class: "BetaJS.Server.Sessions.ActiveSession",

	constructor: function (manager, options) {
		this._inherited(BetaJS.Server.Session.ActiveSessionManagerHelper, "constructor");
        options = BetaJS.Objs.tree_extend({
        	invalidation: {
        		// All times are in milliseconds; null to disable
        		// hard timeout to remove active sessions
        		active_session_timeout: 1000 * 60 * 60,
        		// kill active session if there is no active session after time
        		active_session_inactivity_timeout: 1000 * 60
        	}
        }, options);
        this.__options = options;
        this._active_session_class = options.active_session_class || this._active_session_class;
        if (BetaJS.Types.is_string(this._active_session_class))
        	this._active_session_class = BetaJS.Scopes.resolve(this._active_session_class);
        manager.__add_active_session = function (session, active_session) {
        	this._helper("__add_active_session", session, active_session);
        };
	},
	
	__add_session: function (session) {
		session.addHelper(BetaJS.Server.Session.ActiveSessionHelper, this);
	},
	
	options: function () {
		return this.__options;
	}
	
});

BetaJS.Class.extend("BetaJS.Server.Session.ActiveSessionHelper", [
	BetaJS.Classes.HelperClassMixin,
	{
	
	constructor: function (session, helper) {
		this._inherited(BetaJS.Server.Session.ActiveSessionHelper, "constructor");
		this.__helper = helper;
		this.__session = session;
		session.active_sessions = this;
		this.__active_sessions = new BetaJS.Lists.ObjectIdList();
	},
	
	destroy: function () {
        this.iterate(function (active_session) {
            active_session.destroy();
        }, this);
        this.__active_sessions.destroy();
		this._inherited(BetaJS.Server.Session.ActiveSessionHelper, "destroy");
	},
	
	session: function () {
		return this.__session;
	},
	
	helper: function () {
		return this.__helper;
	},
	
    invalidate: function () {
        this.iterate(function (active_session) {
            active_session.invalidate();
        }, this);
    },

    iterate: function (cb, ctx) {
    	this.__active_sessions.iterate(cb, ctx || this);
    },
	
	is_active: function () {
		return this.__active_sessions.count() > 0;
	},
	
	find_active_session: function (token) {
	    return this.__active_sessions.get(token);
	},
	
    __generate_token: function () {
    	return BetaJS.Tokens.generate_token();
    },

    __remove_active_session: function (active_session) {
    	if (this.__active_sessions.exists(active_session)) {
	    	this.__active_sessions.remove(active_session);
	    	this.__session.activity();
	    }
    },
    
    delete_active_session: function (active_session) {
    	active_session.destroy();
    },
    
    obtain_active_session: function (token, options) {
    	return this.find_active_session(token) || this.new_active_session(token, options);
    },
    
    __add_active_session: function (active_session) {
        this.__active_sessions.add(active_session);
    	this.session().manager().__add_active_session(this.session(), active_session);
    },

    new_active_session: function (token, options) {
        active_session = new this.__helper._active_session_class(this, token || this.__generate_token(), options);
        this.__add_active_session(active_session);
        return active_session;
    },
    
    continue_active_session: function (options) {
		var active_session = null;
		this.iterate(function (as) {
			if (as.suspended() && as.can_continue(options)) {
				active_session = as;
				return false; 
			}
			return true;
		});
		return active_session;
    },
    
    attach_active_session: function (options) {
    	return this.continue_active_session(options) || this.new_active_session(null, options);
    }
	
}]);


BetaJS.Class.extend("BetaJS.Server.Sessions.ActiveSession", [
	BetaJS.Classes.HelperClassMixin,
	BetaJS.Events.EventsMixin,
	{

    constructor: function (helper, token, options) {
        this._inherited(BetaJS.Server.Sessions.ActiveSession, "constructor");
        this.__helper = helper;
        this.__options = options || {};
        BetaJS.Ids.objectId(this, token);
        this.initiation_time = BetaJS.Time.now();
        this.active_time = this.initiation_time;
    },
    
    destroy: function () {
    	this.trigger("destroy");
    	this.__helper.__remove_active_session(this);
        this._inherited(BetaJS.Server.Sessions.ActiveSession, "destroy");
    },
    
    options: function () {
        return this.__options;
    },
    
    activity: function () {
    	this.active_time = BetaJS.Time.now();
    },
    
    suspended: function () {
    	return this._helper({
    		method: "suspended",
    		fold_start: false,
    		fold: function (acc, result) {
    			return acc || result;
    		}
    	});
    },
    
    can_continue: function (options) {
    	return false;
    },
    
    invalidate: function () {
    	var opts = this.__helper.helper().options().invalidation;
    	var now = BetaJS.Time.now();
    	if ((opts.active_session_timeout && now > this.initiation_time + opts.active_session_timeout) ||
    		(this.suspended() && opts.active_session_inactivity_timeout && now > this.active_time + opts.active_session_inactivity_timeout)) {
    		this.destroy();
    	}
    }    
    
}]);