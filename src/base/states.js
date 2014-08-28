BetaJS.Class.extend("BetaJS.States.Host", [
    BetaJS.Events.EventsMixin,
    {
    
    initialize: function (initial_state, initial_args) {
        var cls = BetaJS.Scopes.resolve(initial_state);
        var obj = new cls(this, initial_args, {});
        obj.start();
    },
    
    finalize: function () {
        if (this._state)
            this._state.destroy();
		this._state = null;    	
    },
    
    destroy: function () {
    	this.finalize();
        this._inherited(BetaJS.States.Host, "destroy");
    },
    
    state: function () {
        return this._state;
    },

    _start: function (state) {
        this._stateEvent(state, "before_start");
        this._state = state;
    },
    
    _afterStart: function (state) {
        this._stateEvent(state, "start");
    },
    
    _end: function (state) {
        this._stateEvent(state, "end");
        this._state = null;
    },
    
    _afterEnd: function (state) {
        this._stateEvent(state, "after_end");
    },
    
    _next: function (state) {
        this._stateEvent(state, "next");
    },
    
    _afterNext: function (state) {
        this._stateEvent(state, "after_next");
    },
    
    _can_transition_to: function (state) {
        return true;
    },
    
    _stateEvent: function (state, s) {
        this.trigger("event", s, state.state_name(), state.description());
        this.trigger(s, state.state_name(), state.description());
        this.trigger(s + ":" + state.state_name(), state.description());
    }

}]);


BetaJS.Class.extend("BetaJS.States.State", {

    _locals: [],
    _persistents: [],

    constructor: function (host, args, transitionals) {
        this._inherited(BetaJS.States.State, "constructor");
        this.host = host;
        this.transitionals = transitionals;
        this._starting = false;
        this._started = false;
        this._stopped = false;
        this.__next_state = null;
        this.__suspended = 0;
        args = args || {};
        this._locals = BetaJS.Types.is_function(this._locals) ? this._locals() : this._locals;
        for (var i = 0; i < this._locals.length; ++i)
            this["_" + this._locals[i]] = args[this._locals[i]];
        this._persistents = BetaJS.Types.is_function(this._persistents) ? this._persistents() : this._persistents;
        for (i = 0; i < this._persistents.length; ++i)
            this["_" + this._persistents[i]] = args[this._persistents[i]];
    },

    state_name: function () {
        return BetaJS.Strings.last_after(this.cls.classname, ".");
    },
    
    description: function () {
        return this.state_name();
    },
    
    start: function () {
    	if (this._starting)
    		return;
        this._starting = true;
        this.host._start(this);
        this._start();
        if (this.host) {
            this.host._afterStart(this);
            this._started = true;
        }
    },
    
    end: function () {
    	if (this._stopped)
    		return;
    	this._stopped = true;
        this.host._end(this);
        this._end();
        this.host._afterEnd(this);
        this.destroy();
    },
    
    next: function (state_name, args, transitionals) {
    	if (!this._starting || this._stopped || this.__next_state)
    		return;
        var clsname = this.cls.classname;
        var scope = BetaJS.Scopes.resolve(clsname.substring(0, clsname.lastIndexOf(".")));
        var cls = scope[state_name];
        args = args || {};
        for (var i = 0; i < this._persistents.length; ++i) {
            if (!(this._persistents[i] in args))
                args[this._persistents[i]] = this["_" + this._persistents[i]];
        }
        var obj = new cls(this.host, args, transitionals);
        if (!this.can_transition_to(obj)) {
            obj.destroy();
            return;
        }
        if (!this._started) {
            this.host._afterStart(this);
            this._started = true;
        }
        this.__next_state = obj;
        if (this.__suspended <= 0)
        	this.__next();
    },
    
    __next: function () {
        var host = this.host;
        var obj = this.__next_state;
        host._next(obj);
        this.end();
        obj.start();
        host._afterNext(obj);
    },
    
    suspend: function () {
    	this.__suspended++;
    },
    
    resume: function () {
    	this.__suspended--;
    	if (this.__suspended === 0 && !this._stopped && this.__next_state)
    		this.__next();
    },

    can_transition_to: function (state) {
        return this.host && this.host._can_transition_to(state) && this._can_transition_to(state);
    },
    
    _start: function () {},
    
    _end: function () {},
    
    _can_transition_to: function (state) {
        return true;
    }

});



BetaJS.Class.extend("BetaJS.States.CompetingComposite", {

    _register_host: function (competing_host) {
        this._hosts = this._hosts || [];
        this._hosts.push(this._auto_destroy(competing_host));
    },
    
    other_hosts: function (competing_host) {
        return BetaJS.Objs.filter(this._hosts || [], function (other) {
            return other != competing_host;
        }, this);
    },
    
    _next: function (competing_host, state) {
        var others = this.other_hosts(competing_host);
        for (var i = 0; i < others.length; ++i) {
            var other = others[i];
            var other_state = other.state();
            if (!other_state.can_coexist_with(state))
                other_state.retreat_against(state);
        }
    }

});


BetaJS.States.Host.extend("BetaJS.States.CompetingHost", {

    constructor: function (composite) {
        this._inherited(BetaJS.States.CompetingHost, "constructor");
        this._composite = composite;
        if (composite)
            composite._register_host(this);
    },
    
    composite: function () {
        return this._composite;
    },

    _can_transition_to: function (state) {
        if (!this._composite)
            return true;
        var others = this._composite.other_hosts(this);
        for (var i = 0; i < others.length; ++i) {
            var other = others[i];
            var other_state = other.state();
            if (!state.can_coexist_with(other_state) && !state.can_prevail_against(other_state))
                return false;
        }
        return true;
    },
    
    _next: function (state) {
        if (this._composite)
            this._composite._next(this, state);
        this._inherited(BetaJS.States.CompetingHost, "_next", state);
    }
    
});


BetaJS.States.State.extend("BetaJS.States.CompetingState", {

    can_coexist_with: function (foreign_state) {
        return true;
    },
    
    can_prevail_against: function (foreign_state) {
        return false;
    },
    
    retreat_against: function (foreign_state) {
    }
    
});
