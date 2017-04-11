Scoped.define("module:States.CompetingComposite", [
    "module:Class",
    "module:Objs"
], function(Class, Objs, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Competing Composite Class
         * 
         * @class BetaJS.States.CompetingComposite
         */
        return {

            /**
             * Register a competing host
             * 
             * @param {object} competing_host Competing host
             */
            _register_host: function(competing_host) {
                this._hosts = this._hosts || [];
                this._hosts.push(this._auto_destroy(competing_host));
            },

            /**
             * Returns all other hosts of a competing host
             * 
             * @param {object} competing_host competing hosts in question
             * @return {array} other hosts
             */
            other_hosts: function(competing_host) {
                return Objs.filter(this._hosts || [], function(other) {
                    return other != competing_host;
                }, this);
            },

            /**
             * Transcend to another state of a competing host
             * 
             * @param {object} competing_host Competing host
             * @param {object} state State
             */
            _next: function(competing_host, state) {
                var others = this.other_hosts(competing_host);
                for (var i = 0; i < others.length; ++i) {
                    var other = others[i];
                    var other_state = other.state();
                    if (!other_state.can_coexist_with(state))
                        other_state.retreat_against(state);
                }
            }

        };
    });
});


Scoped.define("module:States.CompetingHost", ["module:States.Host"], function(Host, scoped) {
    return Host.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * CompetingHost Class
         * 
         * @class BetaJS.States.CompetingHost
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} composite Associated composite object
             * @param {object} options Host options
             */
            constructor: function(composite, options) {
                inherited.constructor.call(this, options);
                this._composite = composite;
                if (composite)
                    composite._register_host(this);
            },

            /**
             * Returns the associated composite.
             * 
             * @return {object} Composite
             */
            composite: function() {
                return this._composite;
            },

            /**
             * @override
             */
            _can_transition_to: function(state) {
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

            /**
             * @override
             */
            _next: function(state) {
                if (this._composite)
                    this._composite._next(this, state);
                inherited._next.call(this, state);
            }

        };
    });
});


Scoped.define("module:States.CompetingState", ["module:States.State"], function(State, scoped) {
    return State.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * ComponentState Class
         * 
         * @class BetaJS.States.CompetingState
         */
        return {

            /**
             * Determines whether this state can coexist with a foreign state
             * 
             * @param {object} foreign_state Foreign state
             * @return {boolean} true if it can coexist
             */
            can_coexist_with: function(foreign_state) {
                return true;
            },

            /**
             * Determines whether this state can prevail against a foreign state
             * 
             * @param {object} foreign_state Foreign state
             * @return {boolean} true if it can prevail
             */
            can_prevail_against: function(foreign_state) {
                return false;
            },

            /**
             * Retreat against foreign state
             * 
             * @param {object} foreign_state Foreign state
             */
            retreat_against: function(foreign_state) {}

        };
    });
});