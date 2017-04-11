Scoped.define("module:Trees.TreeNavigator", function() {

    /**
     * Abstract Tree Navigator Mixin
     * 
     * @mixin BetaJS.Trees.TreeNavigator
     */
    return {

        /**
         * Returns the root node of a tree.
         * 
         * @return {object} Root node
         */
        nodeRoot: function() {},

        /**
         * Retrusns the id of a node.
         * 
         * @param {object} node Node
         * @return {string} Id of node
         */
        nodeId: function(node) {},

        /**
         * Returns the parent of a node.
         * 
         * @param {object} node Node
         * @return {object} Parent node
         */
        nodeParent: function(node) {},

        /**
         * Returns the children of a node.
         * 
         * @param {object} node Node
         * @return {array} Children of the node
         */
        nodeChildren: function(node) {},

        /**
         * Watches a node for changes.
         * 
         * @param {object} node Node
         * @param {function} func Change callback function
         * @param {object} context Optional change callback context
         */
        nodeWatch: function(node, func, context) {},

        /**
         * Unwatches a node for changes.
         * 
         * @param {object} node Node
         * @param {function} func Change callback function
         * @param {object} context Optional change callback context
         */
        nodeUnwatch: function(node, func, context) {},

        /**
         * Returns the data associated with a node.
         * 
         * @param {object} node Node
         * @return {object} Node data
         */
        nodeData: function(node) {}

    };
});


Scoped.define("module:Trees.TreeQueryEngine", [
    "module:Class",
    "module:Parser.Lexer",
    "module:Trees.TreeQueryObject"
], function(Class, Lexer, TreeQueryObject, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {

        /**
         * Tree Query Engine Class
         * 
         * @class BetaJS.Trees.TreeQueryEngine
         */
        return {

            /**
             * Create a new instance.
             * 
             * @param {object} navigator Navigator instance
             */
            constructor: function(navigator) {
                inherited.constructor.call(this);
                this.__navigator = navigator;
                this.__lexer = this._auto_destroy(new Lexer({
                    "<\\+": {
                        token: "Up"
                    },
                    "<": {
                        token: "Up",
                        single: true
                    },
                    ">\\+": {
                        token: "Down"
                    },
                    ">": {
                        token: "Down",
                        single: true
                    },
                    "\\[\s*([a-zA-Z]+)\s*=\s*\'([^']*)\'\s*\\]": {
                        token: "Selector",
                        key: "$1",
                        value: "$2"
                    },
                    "\\[\s*([a-zA-Z]+)\s*=\s*\"([^']*)\"\s*\\]": {
                        token: "Selector",
                        key: "$1",
                        value: "$2"
                    },
                    "\s": null
                }));
            },

            /**
             * Query the tree.
             * 
             * @param {object} node Node to start the query from
             * @param {string} query Query string
             * 
             * @return {object} Tree query object for the query
             */
            query: function(node, query) {
                return new TreeQueryObject(this.__navigator, node, this.__lexer.lex(query));
            }

        };
    });
});


Scoped.define("module:Trees.TreeQueryObject", [
    "module:Class",
    "module:Events.EventsMixin",
    "module:Objs",
    "module:Types"
], function(Class, EventsMixin, Objs, Types, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {

        /**
         * Object representing a tree query on a node
         *
         * @class BetaJS.Trees.TreeQueryObject
         */
        return {

            /**
             * Create new instance.
             * 
             * @param {object} navigator Navigator object
             * @param {object} node Node of the query
             * @param {object} query Lexed query
             */
            constructor: function(navigator, node, query) {
                inherited.constructor.call(this);
                this.__navigator = navigator;
                this.__node = node;
                this.__query = query;
                this.__result = {};
                this.__partials = {};
                this.__ids = 0;
                this.__register(node, 0, {});
            },

            /**
             * @override
             */
            destroy: function() {
                Objs.iter(this.__partials, function(partials) {
                    Objs.iter(partials.partials, function(partial) {
                        this.__navigator.nodeUnwatch(partials.node, null, partial);
                    }, this);
                }, this);
                inherited.destroy.call(this);
            },

            /**
             * Returns the currently matching nodes.
             * 
             * @return {array} Matching nodes.
             */
            result: function() {
                var result = [];
                Objs.iter(this.__result, function(value) {
                    result.push(value.node);
                });
                return result;
            },

            __register: function(node, index) {
                var node_id = this.__navigator.nodeId(node);
                if (!this.__partials[node_id]) {
                    this.__partials[node_id] = {
                        node: node,
                        partials: {}
                    };
                }
                var partials = this.__partials[node_id];
                this.__ids++;
                var partial = {
                    owner: partials,
                    id: this.__ids,
                    query_index_start: index,
                    query_index_next: index,
                    query_index_last: index,
                    partial_match: false,
                    partial_final: index >= this.__query.length,
                    partial_data: false,
                    partial_children: false,
                    partial_parent: false,
                    partial_star: false,
                    parent: null,
                    deps: {}
                };
                partials.partials[partial.id] = partial;
                for (var i = partial.query_index_start; i < this.__query.length; ++i) {
                    if (this.__query[i].token == "Selector")
                        partial.partial_data = true;
                    else {
                        if (this.__query[i].token == "Up")
                            partial.partial_parent = true;
                        else if (this.__query[i].token == "Down")
                            partial.partial_children = true;
                        partial.partial_star = !this.__query[i].single;
                        if (!partial.partial_star)
                            partial.query_index_next = i + 1;
                        break;
                    }
                    partial.query_index_next = i + 1;
                    partial.partial_final = i + 1 == this.__query.length;
                }
                partial.query_index_last = partial.partial_star ? partial.query_index_next + 1 : partial.query_index_next;
                var self = this;
                this.__navigator.nodeWatch(node, function(action, node) {
                    if (action == "data" && partial.partial_data)
                        self.__update(partial);
                    if (action == "remove")
                        self.__unregisterPartial(partial);
                    if (action == "addChild" && partial.partial_children && partial.partial_match)
                        self.__addDependentPartial(partial, node);
                }, partial);
                this.__update(partial);
                return partial;
            },

            __unregisterPartial: function(partial) {
                var owner = partial.owner;
                var node = owner.node;
                var node_id = this.__navigator.nodeId(node);
                if (partial.partial_final && this.__result[node_id]) {
                    this.__result[node_id].count--;
                    if (this.__result[node_id].count <= 0) {
                        delete this.__result[node_id];
                        /**
                         * @event BetaJS.Trees.TreeQueryObject#remove
                         */
                        this.trigger("remove", node);
                        /**
                         * @event BetaJS.Trees.TreeQueryObject#change
                         */
                        this.trigger("change");
                    }
                }
                Objs.iter(partial.deps, this.__unregisterPartial, this);
                if (partial.parent)
                    delete partial.parent.deps[partial.id];
                this.__navigator.nodeUnwatch(node, null, partial);
                delete owner.partials[partial.id];
                if (Types.is_empty(owner.partials))
                    delete this.__partials[node_id];
            },

            __addDependentPartial: function(partial, node) {
                var partials = [];
                partials.push(this.__register(node, partial.query_index_next));
                if (partial.partial_star)
                    partials.push(this.__register(node, partial.query_index_next + 1));
                Objs.iter(partials, function(p) {
                    partial.deps[p.id] = p;
                    p.parent = partial;
                }, this);
            },

            __update: function(partial) {
                var matching = true;
                var node = partial.owner.node;
                var node_id = this.__navigator.nodeId(node);
                var node_data = this.__navigator.nodeData(node);
                for (var i = partial.query_index_start; i < partial.query_index_last; ++i) {
                    var q = this.__query[i];
                    if (q.token != "Selector")
                        break;
                    if (node_data[q.key] != q.value) {
                        matching = false;
                        break;
                    }
                }
                if (matching == partial.partial_match)
                    return;
                partial.partial_match = matching;
                if (matching) {
                    if (partial.partial_final) {
                        if (!this.__result[node_id]) {
                            this.__result[node_id] = {
                                node: node,
                                count: 1
                            };
                            /**
                             * @event BetaJS.Trees.TreeQueryObject#add
                             */
                            this.trigger("add", node);
                            /**
                             * @event BetaJS.Trees.TreeQueryObject#change
                             */
                            this.trigger("change");
                        } else
                            this.__result[node_id].count++;
                    } else if (partial.partial_parent) {
                        var parent = this.__navigator.nodeParent(node);
                        if (parent)
                            this.__addDependentPartial(partial, parent);
                    } else if (partial.partial_children) {
                        Objs.iter(this.__navigator.nodeChildren(node), function(child) {
                            this.__addDependentPartial(partial, child);
                        }, this);
                    }
                } else {
                    if (partial.partial_final) {
                        this.__result[node_id].count--;
                        if (this.__result[node_id].count <= 0) {
                            delete this.__result[node_id];
                            /**
                             * @event BetaJS.Trees.TreeQueryObject#remove
                             */
                            this.trigger("remove", node);
                            /**
                             * @event BetaJS.Trees.TreeQueryObject#change
                             */
                            this.trigger("change");
                        }
                    }
                    Objs.iter(partial.deps, this.__unregisterPartial, this);
                }
            }
        };
    }]);
});