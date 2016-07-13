Scoped.define("module:States.CompetingComposite", [
                                                   "module:Class",
                                                   "module:Objs"
                                                   ], function (Class, Objs, scoped) {
	return Class.extend({scoped: scoped}, {

		_register_host: function (competing_host) {
			this._hosts = this._hosts || [];
			this._hosts.push(this._auto_destroy(competing_host));
		},

		other_hosts: function (competing_host) {
			return Objs.filter(this._hosts || [], function (other) {
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
});


Scoped.define("module:States.CompetingHost", ["module:States.Host"], function (Host, scoped) {
	return Host.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (composite, options) {
				inherited.constructor.call(this, options);
				this._composite = composite;
				if (composite)
					composite._register_host(this);
			},

			composite: function () {
				return this._composite;
			},

			_can_transition_to: function (state) {
				if (!inherited._can_transition_to.call(this, state))
					return false;
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
				inherited._next.call(this, state);
			}

		};
	});    
});


Scoped.define("module:States.CompetingState", ["module:States.State"], function (State, scoped) {
	return State.extend({scoped: scoped}, {

		can_coexist_with: function (foreign_state) {
			return true;
		},

		can_prevail_against: function (foreign_state) {
			return false;
		},

		retreat_against: function (foreign_state) {
		}

	});
});
