Scoped.define("module:Properties.ObservableMixin", [], function() {

    /**
     * Properties Observable Mixin
     *
     * @mixin BetaJS.Properties.ObservableMixin
     */
    return {

        __observable_guid: "48994ac3-7e0b-4ed5-8995-f146215dc795",

        /**
         * Returns the value associated with a key.
         *
         * @param {string} key key to read value for
         *
         * @return value for key
         */
        get: function(key) {},

        /**
         * Checks whether a key is set.
         *
         * @param {string} key key in question
         *
         * @return {boolean} true if key is set
         */
        hasKey: function(key) {}

    };
});


Scoped.define("module:Properties.PropertiesMixin", [
    "module:Objs.Scopes",
    "module:Objs",
    "module:Strings",
    "module:Types",
    "module:Functions"
], function(Scopes, Objs, Strings, Types, Functions) {

    /**
     * Properties Mixin
     * 
     * @mixin BetaJS.Properties.PropertiesMixin
     */
    return {

        __properties_guid: "ec816b66-7284-43b1-a945-0600c6abfde3",

        _notifications: {
            "construct": function() {
                this.__properties = {
                    // hierarchical organization
                    data: {},
                    // hierarchical organization
                    watchers: {
                        children: {},
                        eventCount: 0,
                        parent: null,
                        key: null
                    },
                    // flat organization
                    computed: {},
                    // flat organization
                    bindings: {}
                };
                Objs.iter(this.materializes, function(key) {
                    this.materializeAttr(key);
                }, this);
            },
            "destroy": function() {
                Objs.iter(this.__properties.bindings, function(value, key) {
                    this.unbind(key);
                }, this);
                Objs.iter(this.__properties.computed, function(value, key) {
                    this.uncompute(key);
                }, this);
                /**
                 * @event BetaJS.Properties.PropertiesMixin#destroy
                 */
                this.trigger("destroy");
            },
            "register_event": function(event) {
                Objs.iter(["change", "unset", "deepchange", "deepunset", "strongdeepchange", "strongchange"], function(eventType) {
                    if (Strings.starts_with(event, eventType + ":"))
                        this.__registerWatcher(Strings.strip_start(event, eventType + ":"), eventType);
                }, this);
            },
            "unregister_event": function(event) {
                Objs.iter(["change", "unset", "deepchange", "deepunset", "strongdeepchange", "strongchange"], function(eventType) {
                    if (Strings.starts_with(event, eventType + ":"))
                        this.__unregisterWatcher(Strings.strip_start(event, eventType + ":"), eventType);
                }, this);
            }
        },

        __registerWatcher: function(key, event) {
            var keys = key ? key.split(".") : [];
            var current = this.__properties.watchers;
            for (var i = 0; i < keys.length; ++i) {
                if (!(keys[i] in current.children)) {
                    current.children[keys[i]] = {
                        parent: current,
                        eventCount: 0,
                        children: {},
                        key: keys[i]
                    };
                }
                current = current.children[keys[i]];
            }
            current.eventCount++;
        },

        __unregisterWatcher: function(key, event) {
            var keys = key ? key.split(".") : [];
            var current = this.__properties.watchers;
            for (var i = 0; i < keys.length; ++i) {
                if (current)
                    current = current.children[keys[i]];
            }
            if (!current)
                return;
            current.eventCount--;
            while (current.eventCount <= 0 && Types.is_empty(current.children) && current.parent) {
                var parent = current.parent;
                delete parent.children[current.key];
                current = parent;
            }
        },

        __unsetChanged: function(key, oldValue) {
            /**
             * @event BetaJS.Properties.PropertiesMixin#unset
             */
            this.trigger("unset", key, oldValue);
            var keys = key ? key.split(".") : [];
            var current = this.__properties.watchers;
            var head = "";
            var tail = key;
            for (var i = 0; i < keys.length; ++i) {
                if (current.eventCount > 0) {
                    /**
                     * @event BetaJS.Properties.PropertiesMixin#deepunset
                     */
                    this.trigger("deepunset:" + head, oldValue, tail);
                }
                if (!(keys[i] in current.children))
                    return this;
                current = current.children[keys[i]];
                head = head ? (head + "." + keys[i]) : keys[i];
                tail = Strings.first_after(tail, ".");
            }

            function process_unset(current, key, oldValue) {
                if (Types.is_undefined(oldValue))
                    return;
                if (current.eventCount > 0) {
                    /**
                     * @event BetaJS.Properties.PropertiesMixin#unset
                     */
                    this.trigger("unset:" + key, oldValue);
                }
                Objs.iter(current.children, function(child, subkey) {
                    process_unset.call(this, child, key ? (key + "." + subkey) : subkey, oldValue[subkey]);
                }, this);
            }
            process_unset.call(this, current, key, oldValue);
            return this;
        },

        __setChanged: function(key, value, oldValue, notStrong) {
            /**
             * @event BetaJS.Properties.PropertiesMixin#change
             */
            this.trigger("change", key, value, oldValue);
            this._afterSet(key, value);
            if (this.destroyed())
                return;
            var keys = key ? key.split(".") : [];
            var current = this.__properties.watchers;
            var head = "";
            var tail = key;
            for (var i = 0; i < keys.length; ++i) {
                if (current.eventCount > 0) {
                    if (!notStrong) {
                        /**
                         * @event BetaJS.Properties.PropertiesMixin#strongdeepchange
                         */
                        this.trigger("strongdeepchange:" + head, value, oldValue, tail);
                    }
                    /**
                     * @event BetaJS.Properties.PropertiesMixin#deepchange
                     */
                    this.trigger("deepchange:" + head, value, oldValue, tail);
                }
                if (!(keys[i] in current.children))
                    return;
                current = current.children[keys[i]];
                head = head ? (head + "." + keys[i]) : keys[i];
                tail = Strings.first_after(tail, ".");
            }

            function process_set(current, key, value, oldValue) {
                if (value == oldValue)
                    return;
                if (current.eventCount > 0) {
                    if (!notStrong) {
                        /**
                         * @event BetaJS.Properties.PropertiesMixin#strongchange
                         */
                        this.trigger("strongchange:" + key, value, oldValue);
                    }
                    /**
                     * @event BetaJS.Properties.PropertiesMixin#change
                     */
                    this.trigger("change:" + key, value, oldValue);
                }
                Objs.iter(current.children, function(child, subkey) {
                    process_set.call(this, child, key ? (key + "." + subkey) : subkey, Types.is_object(value) && value ? value[subkey] : null, Types.is_object(oldValue) && oldValue ? oldValue[subkey] : null);
                }, this);
            }
            process_set.call(this, current, key, value, oldValue);
        },

        /**
         * Attributes that will be materialized upon initialization.
         */
        materializes: [],

        /**
         * Resolve the scope associated with a key.
         * 
         * @param {string} key key to resolve
         * @return associated scope
         * 
         * @protected
         */
        _resolveProps: function(key) {
            var result = {
                props: this,
                key: key
            };
            var scope = this.data();
            while (key) {
                if (!scope || !Types.is_object(scope))
                    return result;
                if (scope.__properties_guid === this.__properties_guid)
                    return scope._resolveProps(key);
                var spl = Strings.splitFirst(key, ".");
                if (!(spl.head in scope))
                    return result;
                key = spl.tail;
                scope = scope[spl.head];
            }
            return result;
        },

        /**
         * Check whether a key can be set to a value.
         * 
         * @param {string} key key in question
         * @param value value in question
         * 
         * @return {boolean} true if can be set
         * 
         * @protected
         */
        _canSet: function(key, value) {
            return true;
        },

        /**
         * Called before setting a value.
         * 
         * @param {string} key key in question
         * @param value value in question
         * @param oldValue oldValue in question
         * 
         * @return value, possibly altered
         * 
         * @protected
         */
        _beforeSet: function(key, value, oldValue) {
            return value;
        },

        /**
         * Called after setting a value.
         * 
         * @param {string} key key in question
         * @param value value in question
         * 
         * @protected
         */
        _afterSet: function(key, value) {},

        /**
         * Get value for key, resolving intermediate properties instances.
         * 
         * @param {string} key key to read
         * 
         * @return associated value
         */
        getProp: function(key) {
            var resolved = this._resolveProps(key);
            return resolved.props.get(resolved.key);
        },

        /**
         * Set value for key, resolving intermediate properties instances.
         * 
         * @param {string} key to read
         * @param value value to write
         */
        setProp: function(key, value) {
            var resolved = this._resolveProps(key);
            resolved.props.set(resolved.key, value);
            return this;
        },

        /**
         * Remove computation of a key.
         * 
         * @param {string} key key to remove computation for
         */
        uncomputeProp: function(key) {
            var resolved = this._resolveProps(key);
            return resolved.props.uncompute(resolved.key);
        },

        /**
         * Add computation of a key.
         * 
         * @param {string} key key to add computation for
         * @param {function} func function to compute the key
         */
        computeProp: function(key, func) {
            var resolved = this._resolveProps(key);
            var args = Functions.getArguments(arguments);
            args[0] = resolved.key;
            return resolved.props.compute.apply(resolved.props.compute, args);
        },

        /**
         * Returns the value associated with a key.
         * 
         * @param {string} key key to read value for
         * 
         * @return value for key
         */
        get: function(key) {
            return Scopes.get(key, this.__properties.data);
        },

        /**
         * Checks whether a key is set.
         * 
         * @param {string} key key in question
         * 
         * @return {boolean} true if key is set
         */
        has: function(key) {
            return Scopes.has(key, this.__properties.data);
        },

        /**
         * Checks whether a key is set.
         *
         * @param {string} key key in question
         *
         * @return {boolean} true if key is set
         */
        hasKey: function(key) {
            return this.has(key);
        },

        /**
         * Sets all attributes in a JSON object.
         * 
         * @param {object} obj JSON object data
         * 
         */
        setAll: function(obj) {
            for (var key in obj)
                this.set(key, obj[key]);
            return this;
        },

        /**
         * Returns all keys of the instance, possibly mapped.
         * 
         * @param {function} mapped optional key mapping
         * 
         * @return {array} all keys
         */
        keys: function(mapped) {
            return Objs.keys(this.__properties.data, mapped);
        },

        /**
         * Returns a data pointer to the raw data. Read only.
         * 
         * @return {object} data pointer
         */
        data: function() {
            return this.__properties.data;
        },

        /**
         * Returns a raw data copy.
         * 
         * @return {object} raw data copy
         */
        getAll: function() {
            return Objs.clone(this.__properties.data, 1);
        },

        clone: function() {
            return new(this.cls)(this.getAll());
        },

        /**
         * Iterates over all key-value pairs.
         *
         * @param {function} cb callback function
         * @param {object} ctx optional context
         *
         */
        iterate: function(cb, ctx) {
            Objs.iter(this.getAll(), cb, ctx);
            return this;
        },

        /**
         * Materializes an attribute as a function.
         * 
         * @param {string} attr attribute to be materialized
         * 
         */
        materializeAttr: function(attr) {
            this[attr] = function(value) {
                if (arguments.length === 0)
                    return this.get(attr);
                this.set(attr, value);
            };
            return this;
        },

        /**
         * Remove the computation of a key.
         * 
         * @param {string} key key for which the computation should be removed
         */
        uncompute: function(key) {
            if (key in this.__properties.computed) {
                Objs.iter(this.__properties.computed[key].dependencies, function(dependency) {
                    dependency.properties.off("change:" + dependency.key, null, dependency);
                    if (dependency.value && !dependency.value.destroyed())
                        dependency.value.off("change update", null, dependency);
                }, this);
                delete this.__properties.computed[key];
            }
            return this;
        },

        bicompute: function(left, right, leftToRight, rightToLeft) {
            leftToRight.call(this);
            var exclusive = false;
            [
                [left, leftToRight],
                [right, rightToLeft]
            ].forEach(function(direction) {
                direction[0].forEach(function(key) {
                    this.on("change:" + key, function() {
                        if (exclusive)
                            return;
                        try {
                            exclusive = true;
                            direction[1].call(this);
                            exclusive = false;
                        } catch (e) {
                            exclusive = false;
                            throw e;
                        }
                    }, this);
                }, this);
            }, this);
            return this;
        },

        /**
         * Add a computation for a key.
         * 
         * @param {string} key key to add computation for
         * @param {function} func function to compute the key
         */
        compute: function(key, func) {
            var args = Functions.matchArgs(arguments, 2, {
                setter: "function",
                context: {
                    type: "object",
                    def: this
                },
                dependencies: true
            });
            this.uncompute(key);
            var deps = [];
            Objs.iter(args.dependencies, function(dep) {
                if (Types.is_string(dep))
                    deps.push({
                        properties: this,
                        key: dep
                    });
                else
                    deps.push({
                        properties: dep[0],
                        key: dep[1]
                    });
            }, this);
            var computed = {
                ignore: 0,
                func: func,
                context: args.context,
                setter: args.setter,
                dependencies: deps
            };
            this.__properties.computed[key] = computed;
            var self = this;

            function recompute() {
                if (computed.ignore > 0)
                    return;
                var values = Objs.map(deps, function(dep) {
                    return dep.properties.get(dep.key);
                });
                self.set(key, func.apply(args.context, values));
            }
            Objs.iter(deps, function(dep) {
                var value = dep.properties.get(dep.key);
                // Ugly way of checking whether an EventsMixin is present - please improve in the future on this
                if (value && typeof value == "object" && "on" in value && "off" in value && "trigger" in value) {
                    dep.value = value;
                    value.on("change update", function() {
                        recompute();
                    }, dep);
                }
                dep.properties.on("change:" + dep.key, function(value, oldValue) {
                    dep.value = null;
                    if (oldValue && typeof oldValue == "object" && "on" in oldValue && "off" in oldValue && "trigger" in oldValue) {
                        oldValue.off("change update", null, dep);
                    }
                    if (value && typeof value == "object" && "on" in value && "off" in value && "trigger" in value) {
                        dep.value = value;
                        value.on("change update", function() {
                            recompute();
                        }, dep);
                    }
                    recompute();
                }, dep);
            }, this);
            recompute();
            return this;
        },

        /**
         * Removes a binding for a key and another properties instance.
         * 
         * @param {string} key key for which the binding should be removed
         * @param {object} props other properties instance
         */
        unbind: function(key, props) {
            if (key in this.__properties.bindings) {
                for (var i = this.__properties.bindings[key].length - 1; i >= 0; --i) {
                    var binding = this.__properties.bindings[key][i];
                    if (!props || props == binding) {
                        if (binding.left)
                            binding.properties.off(null, null, binding);
                        if (binding.right)
                            this.off(null, null, binding);
                        this.__properties.bindings[key].splice(i, 1);
                        i--;
                    }
                }
                if (this.__properties.bindings[key].length === 0)
                    delete this.__properties.bindings[key];
            }
            return this;
        },

        /**
         * Adds a binding for a key and another properties instance.
         * 
         * @param {string} key key for which the binding should be added
         * @param {object} props other properties instance
         * @param {object} options optional options
         */
        bind: function(key, properties, options) {
            options = Objs.extend({
                secondKey: key,
                left: true,
                right: true,
                deep: false
            }, options);
            var binding = {
                key: options.secondKey,
                left: options.left,
                right: options.right,
                deep: options.deep,
                properties: properties
            };
            this.__properties.bindings[key] = this.__properties.bindings[key] || [];
            this.__properties.bindings[key].push(binding);
            var self = this;
            if (binding.left) {
                binding.properties.on("strongchange:" + binding.key, function(value) {
                    self.set(key, value);
                }, binding);
                binding.properties.on("unset:" + binding.key, function(value) {
                    self.unset(key);
                }, binding);
                if (binding.deep) {
                    binding.properties.on("strongdeepchange:" + binding.key, function(value, oldValue, subKey) {
                        if (self.get(key ? key + "." + subKey : subKey) === value)
                            self.__setChanged(key ? key + "." + subKey : subKey, value, oldValue, true);
                        else
                            self.set(key ? key + "." + subKey : subKey, value);
                    }, binding);
                    binding.properties.on("deepunset:" + binding.key, function(oldValue, subKey) {
                        if (!self.has(key ? key + "." + subKey : subKey))
                            self.__unsetChanged(key ? key + "." + subKey : subKey, oldValue);
                        else
                            self.unset(key ? key + "." + subKey : subKey);
                    }, binding);
                }
                if (!binding.right || !this.has(key))
                    this.set(key, binding.properties.get(binding.key));
                if (key === "") {
                    Objs.iter(binding.properties.data(), function(value, k) {
                        this.set(k, value);
                    }, this);
                }
            }
            if (binding.right) {
                this.on("strongchange:" + key, function(value) {
                    binding.properties.set(binding.key, value);
                }, binding);
                this.on("unset:" + key, function(value) {
                    binding.properties.unset(binding.key);
                }, binding);
                if (binding.deep) {
                    this.on("strongdeepchange:" + key, function(value, oldValue, subKey) {
                        if (binding.properties.get(binding.key ? binding.key + "." + subKey : subKey) === value)
                            binding.properties.__setChanged(binding.key ? binding.key + "." + subKey : subKey, value, oldValue, true);
                        else
                            binding.properties.set(binding.key ? binding.key + "." + subKey : subKey, value);
                    }, binding);
                    this.on("deepunset:" + key, function(oldValue, subKey) {
                        if (!binding.properties.has(binding.key ? binding.key + "." + subKey : subKey))
                            binding.properties.__unsetChanged(binding.key ? binding.key + "." + subKey : subKey, oldValue);
                        else
                            binding.properties.unset(binding.key ? binding.key + "." + subKey : subKey);
                    }, binding);
                }
                if (!binding.left || this.has(key))
                    binding.properties.set(binding.key, this.get(key));
                if (key === "") {
                    Objs.iter(this.data(), function(value, k) {
                        binding.properties.set(k, value);
                    }, this);
                }
            }
            binding.properties.on("destroy", function() {
                if (!self.destroyed())
                    self.unbind(key);
            }, binding);
            return this;
        },

        /**
         * Removes a key from the properties instance.
         * 
         * @param {string} key key to be removed
         */
        unset: function(key) {
            if (this.has(key)) {
                var oldValue = this.get(key);
                Scopes.unset(key, this.__properties.data);
                this.__unsetChanged(key, oldValue);
            }
            return this;
        },

        /**
         * Sets a key in the properties instance.
         * 
         * @param {string} key key to be set
         * @param value value to be set
         * @param {boolean} force optional force argument
         */
        set: function(key, value, force) {
            if (Types.is_object(value) && value && value.guid == this.__properties_guid) {
                if (value.properties)
                    this.bind(key, value.properties, {
                        secondKey: value.key
                    });
                if (value.func)
                    this.compute(key, value.func, value.dependencies);
                return this;
            }
            var oldValue = this.get(key);
            value = this._beforeSet(key, value, oldValue);
            if (oldValue !== value) {
                Scopes.set(key, value, this.__properties.data);
                this.__setChanged(key, value, oldValue);
            } else if (force) {
                /**
                 * @event BetaJS.Properties.PropertiesMixin#change
                 */
                this.trigger("change", key, value, oldValue, true);
                /**
                 * @event BetaJS.Properties.PropertiesMixin#change
                 */
                this.trigger("change:" + key, value, oldValue, true);
            }
            return this;
        },

        /**
         * @deprecated
         */
        binding: function(key) {
            return {
                guid: this.__properties_guid,
                properties: this,
                key: key
            };
        },

        /**
         * @deprecated
         */
        computed: function(f, dependencies) {
            return {
                guid: this.__properties_guid,
                func: f,
                dependencies: dependencies
            };
        },

        /**
         * Returns the properties unique id.
         * 
         * @return {string} unique properties id
         */
        pid: function() {
            return this.cid();
        },

        /**
         * Checks whether this properties instance is a subset of another properties instance.
         *  
         * @param {object} props another properties instance or JSON object
         * 
         * @return {boolean} true if this instance is a subset of the other properties object
         */
        isSubsetOf: function(props) {
            return Objs.subset_of(this.data(), props.data ? props.data() : props);
        },

        /**
         * Checks whether this properties instance is a superset of another properties instance.
         *  
         * @param {object} props another properties instance or JSON object
         * 
         * @return {boolean} true if this instance is a superset of the other properties object
         */
        isSupersetOf: function(props) {
            return Objs.superset_of(this.data(), props.data ? props.data() : props);
        }

    };
});


Scoped.define("module:Properties.Properties", [
    "module:Class",
    "module:Objs",
    "module:Events.EventsMixin",
    "module:Properties.ObservableMixin",
    "module:Properties.PropertiesMixin"
], function(Class, Objs, EventsMixin, ObservableMixin, PropertiesMixin, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, ObservableMixin, PropertiesMixin, function(inherited) {

        /**
         * Properties Class
         * 
         * @class BetaJS.Properties.Properties
         */
        return {

            /**
             * Creates a new instance.
             * 
             * @param {object} obj optional initial attributes
             * @param {array} materializes optional initial attributes that should be materialized
             */
            constructor: function(obj, materializes) {
                inherited.constructor.call(this);
                if (obj)
                    this.setAll(obj);
                if (materializes) {
                    Objs.iter(materializes, function(key) {
                        this.materializeAttr(key);
                    }, this);
                }
            }

        };
    }]);
});