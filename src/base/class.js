Scoped.define("module:Class", ["module:Types", "module:Objs", "module:Functions", "module:Ids"], function(Types, Objs, Functions, Ids) {
    var Class = function() {};

    /** @suppress {checkTypes} */
    Class.extend = function(options, objects, statics, class_statics) {
        objects = objects || [];
        if (!Types.is_array(objects))
            objects = [objects];
        statics = statics || [];
        if (!Types.is_array(statics))
            statics = [statics];
        class_statics = class_statics || [];
        if (!Types.is_array(class_statics))
            class_statics = [class_statics];

        var parent = this;

        objects = Objs.map(objects, function(obj) {
            if (Types.is_function(obj))
                obj = obj(parent.prototype);
            return obj;
        });

        var result;

        // Setup JavaScript Constructor
        Objs.iter(objects, function(obj) {
            if (obj.hasOwnProperty("constructor"))
                result = obj.constructor;
        });
        var has_constructor = Types.is_defined(result);
        if (!has_constructor) {
            result = function() {
                parent.prototype.constructor.apply(this, arguments);
            };
        }

        // Add Parent Statics
        Objs.extend(result, parent);

        // Add External Statics
        Objs.iter(statics, function(stat) {
            stat = Types.is_function(stat) ? stat(parent) : stat;
            var extender = result._extender;
            Objs.extend(result, stat);
            if (stat._extender)
                result._extender = Objs.extend(Objs.clone(extender, 1), stat._extender);
        });


        // Add Class Statics
        var class_statics_keys = {};
        if (parent.__class_statics_keys) {
            for (var key in parent.__class_statics_keys)
                result[key] = Objs.clone(parent[key], 1);
        }
        Objs.iter(class_statics, function(stat) {
            Objs.extend(result, stat);
            Objs.extend(class_statics_keys, Objs.keys(stat, true));
        });
        if (parent.__class_statics_keys)
            Objs.extend(class_statics_keys, parent.__class_statics_keys);
        result.__class_statics_keys = class_statics_keys;

        // Parent & Children Hierarchy
        result.parent = parent;
        result.children = [];
        result.extend = this.extend;
        if (!parent.children)
            parent.children = [];
        parent.children.push(result);

        // Setup Prototype
        var ctor = function() {};
        ctor.prototype = parent.prototype;
        result.prototype = new ctor();

        result.prototype.cls = result;


        options = Objs.extend({}, Types.is_string(options) ? {
            classname: options,
            register: true
        } : options);

        var classname = options.classname;
        if (options.scoped)
            classname = options.scoped.ns.path;

        result.classname = classname;
        if (classname && options.register)
            Scoped.setGlobal(classname, result);

        // Setup Prototype
        result.__notifications = {};
        result.__implements = {};

        if (parent.__notifications)
            Objs.extend(result.__notifications, parent.__notifications, 1);
        if (parent.__implements)
            Objs.extend(result.__implements, parent.__implements, 1);

        Objs.iter(objects, function(object) {
            for (var objkey in object)
                result.prototype[objkey] = result._extender && objkey in result._extender ? result._extender[objkey](result.prototype[objkey], object[objkey]) : object[objkey];
            //Objs.extend(result.prototype, object);

            // Note: Required for Internet Explorer
            if ("constructor" in object)
                result.prototype.constructor = object.constructor;

            if (object._notifications) {
                for (var key in object._notifications) {
                    if (!result.__notifications[key])
                        result.__notifications[key] = [];
                    result.__notifications[key].push(object._notifications[key]);
                }
            }
            if (object._implements) {
                Objs.iter(Types.is_string(object._implements) ? [object._implements] : object._implements, function(impl) {
                    result.__implements[impl] = true;
                });
            }
        });
        delete result.prototype._notifications;
        delete result.prototype._implements;

        if (!has_constructor) {
            result.prototype.constructor = function() {
                parent.prototype.constructor.apply(this, arguments);
            };
        }

        return result;
    };


    /*
     * 
     * Extending the Class
     * 
     */

    Objs.extend(Class, {

        classname: "Class",

        __class_guid: "0f5499f9-f0d1-4c6c-a561-ef026a1eee05",

        __notifications: {},

        /**
         * Determines whether this cls is an ancestor of another class.
         * 
         * @param {object} cls in question
         * 
         * @return {boolean} true if ancestor
         */
        ancestor_of: function(cls) {
            return (this == cls) || (this != Class && this.parent.ancestor_of(cls));
        },

        /**
         * Determines whether something is of type class.
         * 
         * @param cls class in question
         * 
         * @return {boolean} true if class
         */
        is_class: function(cls) {
            return cls && Types.is_object(cls) && ("__class_guid" in cls) && cls.__class_guid == this.__class_guid;
        },

        /**
         * Determines whether something is of type class instance.
         * 
         * @param obj instance in question
         * 
         * @return {boolean} true if class instance
         */
        is_class_instance: function(obj) {
            return obj && Types.is_object(obj) && ("__class_instance_guid" in obj) && obj.__class_instance_guid == this.prototype.__class_instance_guid;
        },

        /**
         * Determines whether something is pure json and not a class instance.
         * 
         * @param obj json in question
         * 
         * @return {boolean} true if pure json
         */
        is_pure_json: function(obj) {
            return obj && Types.is_object(obj) && !this.is_class_instance(obj) && Types.is_pure_object(obj);
        },

        /**
         * Determines whether an object is an instance of this class.
         * 
         * @param {object} obj object in question
         * 
         * @return {boolean} true if instance of class
         */
        is_instance_of: function(obj) {
            return obj && this.is_class_instance(obj) && obj.instance_of(this);
        },

        /**
         * Adhoc defines a new class.
         * 
         * @param parent scoped string of parent class or parent class
         * @param current scoped string of new class
         */
        define: function(parent, current) {
            var args = Functions.getArguments(arguments, 2);
            if (Types.is_object(parent)) {
                return Scoped.define(current, [], function(scoped) {
                    args.unshift({
                        scoped: scoped
                    });
                    return parent.extend.apply(parent, args);
                });
            } else {
                return Scoped.define(current, [parent], function(parent, scoped) {
                    args.unshift({
                        scoped: scoped
                    });
                    return parent.extend.apply(parent, args);
                });
            }
        },

        /**
         * Placeholder for an abstract function that should never be called.
         */
        abstractFunction: function() {
            throw "AbstractFunction";
        },

        /**
         * @deprecated
         */
        _inherited: function(cls, func) {
            return cls.parent[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
        }

    });






    /*
     * 
     * Extending the Object
     * 
     */

    Class.prototype.__class_instance_guid = "e6b0ed30-80ee-4b28-af02-7d52430ba45f";

    //Class.prototype.supportsGc = false;

    /**
     * Creates a new instance.
     */
    Class.prototype.constructor = function() {
        this._notify("construct");
    };

    /**
     * Destroys this instance.
     */
    Class.prototype.destroy = function() {
        this._notify("destroy");
        if (this.__auto_destroy_list) {
            this.__auto_destroy_list.forEach(function(obj) {
                if ("destroy" in obj)
                    obj.weakDestroy();
            }, this);
        }
        if (this.__auto_decrease_ref_list) {
            this.__auto_decrease_ref_list.forEach(function(obj) {
                if ("decreaseRef" in obj)
                    obj.decreaseRef(this);
            }, this);
        }
        var cid = this.cid();
        for (var key in this)
            delete this[key];
        Ids.objectId(this, cid);
        this.destroy = this.__destroyedDestroy;
    };

    /**
     * Determines whether this instance has already been destroyed.
     * 
     * @return {boolean} true if this instance has been destroyed
     */
    Class.prototype.destroyed = function() {
        return this.destroy === this.__destroyedDestroy;
    };

    /**
     * Weakly destroy this instance, only destroying it if it hasn't been destroyed already.
     */
    Class.prototype.weakDestroy = function() {
        if (!this.destroyed()) {
            if (this.__gc) {
                this.__gc.queue(this);
                return;
            }
            this.destroy();
        }
    };

    Class.prototype.__destroyedDestroy = function() {
        throw ("Trying to destroy destroyed object " + this.cid() + ": " + this.cls.classname + ".");
    };

    /**
     * Protects a function from being called recursively.
     *
     * @param ident string identifier of function
     * @param func function to be called
     */
    Class.prototype.recursionProtection = function(ident, func) {
        this.__recursionProtection = this.__recursionProtection || {};
        if (this.__recursionProtection[ident])
            return undefined;
        this.__recursionProtection[ident] = true;
        try {
            var result = func.apply(this);
            if (this && this.__recursionProtection)
                delete this.__recursionProtection[ident];
            return result;
        } catch (e) {
            if (this && this.__recursionProtection)
                delete this.__recursionProtection[ident];
            throw e;
        }
    };

    /**
     * Enable garbage collection for this instance.
     */
    Class.prototype.enableGc = function(gc) {
        if (this.supportsGc)
            this.__gc = gc;
        return this;
    };

    /**
     * Destroy another instance depending on this one.
     * 
     * @param {object} other other object that should be destroyed
     */
    Class.prototype.dependDestroy = function(other) {
        if (other.destroyed())
            return;
        if (this.__gc)
            other.enableGc();
        other.weakDestroy();
        return this;
    };

    /**
     * Returns the unique id of the object.
     * 
     * @return {string} unique id
     */
    Class.prototype.cid = function() {
        return Ids.objectId(this);
    };

    Class.prototype.cls = Class;

    /**
     * Generates a context-free function of a method.
     * 
     * @param {string} s name of method
     * 
     * @return {function} context-free function
     */
    Class.prototype.as_method = function(s) {
        return Functions.as_method(this[s], this);
    };

    /**
     * Automatically destroys an object when this object is being destroyed.
     * 
     * @param {object} obj
     * @param {boolean} returnSource return source object instead of obj
     */
    Class.prototype.auto_destroy = function(obj, returnSource) {
        if (obj) {
            if (!this.__auto_destroy_list)
                this.__auto_destroy_list = [];
            var target = obj;
            if (!Types.is_array(target))
                target = [target];
            for (var i = 0; i < target.length; ++i)
                this.__auto_destroy_list.push(target[i]);
        }
        return returnSource ? this : obj;
    };

    /**
     * Automatically decreases an object reference when this object is being destroyed.
     *
     * @param {object} obj
     * @param {boolean} returnSource return source object instead of obj
     */
    Class.prototype.auto_decrease_ref = function(obj, returnSource) {
        if (obj) {
            if (!this.__auto_decrease_ref_list)
                this.__auto_decrease_ref_list = [];
            var target = obj;
            if (!Types.is_array(target))
                target = [target];
            for (var i = 0; i < target.length; ++i)
                this.__auto_decrease_ref_list.push(target[i]);
        }
        return returnSource ? this : obj;
    };

    /**
     * Notify all notifications listeners of an internal notification event.
     * 
     * @param {string} name notification name
     * 
     * @protected
     */
    Class.prototype._notify = function(name) {
        if (!this.cls.__notifications)
            return;
        var rest = Array.prototype.slice.call(arguments, 1);
        Objs.iter(this.cls.__notifications[name], function(entry) {
            var method = Types.is_function(entry) ? entry : this[entry];
            if (!method)
                throw this.cls.classname + ": Could not find " + name + " notification handler " + entry;
            method.apply(this, rest);
        }, this);
    };

    /**
     * Checks whether this instance implements a certain mixin.
     *
     * @param identifier mixin identifier
     * 
     * @return {boolean} true if it implements the mixin
     */
    Class.prototype.impl = function(identifier) {
        return !!(this.cls.__implements && this.cls.__implements[Types.is_string(identifier) ? identifier : identifier._implements]);
    };

    /**
     * Determines whether this instance is an instance of a certain class.
     * 
     * @param {object} cls class in question
     * 
     * @return {boolean} true if instance is instance of class
     */
    Class.prototype.instance_of = function(cls) {
        return this.cls.ancestor_of(cls);
    };

    /**
     * Increases the reference counter of this instance.
     * 
     * @param {object} reference optional reference object
     * @param {boolean} autoDecreaseRef automatically decrease reference upon destruction
     */
    Class.prototype.increaseRef = function(reference, autoDecreaseRef) {
        this.__referenceCount = this.__referenceCount || 0;
        this.__referenceCount++;
        this.__referenceObjects = this.__referenceObjects || {};
        if (reference) {
            if (!this.__referenceObjects[reference.cid()])
                this.__referenceObjects[reference.cid()] = reference;
            else
                this.__referenceCount--;
            if (autoDecreaseRef)
                reference.auto_decrease_ref(this);
        }
        return this;
    };

    /**
     * Decreases the reference counter of this instance.
     * 
     * @param {object} reference optional reference object
     */
    Class.prototype.decreaseRef = function(reference) {
        this.__referenceCount = this.__referenceCount || 0;
        this.__referenceCount--;
        this.__referenceObjects = this.__referenceObjects || {};
        if (reference) {
            if (this.__referenceObjects[reference.cid()])
                delete this.__referenceObjects[reference.cid()];
            else
                this.__referenceCount++;
        }
        if (this.__referenceCount <= 0 && Types.is_empty(this.__referenceObjects))
            this.weakDestroy();
        return this;
    };

    /**
     * Inspects the instance for debugging purposes.
     * 
     * @return {object} json object describing the instance
     */
    Class.prototype.inspect = function() {
        return {
            header: {
                cid: this.cid(),
                classname: this.cls.classname,
                destroyed: this.destroyed()
            },
            attributes: {
                attributes_public: Objs.filter(this, function(value, key) {
                    return !Types.is_function(value) && key.indexOf("_") !== 0;
                }, this),
                attributes_protected: Objs.filter(this, function(value, key) {
                    return !Types.is_function(value) && key.indexOf("_") === 0 && key.indexOf("__") !== 0;
                }, this),
                attributes_private: Objs.filter(this, function(value, key) {
                    return !Types.is_function(value) && key.indexOf("__") === 0;
                }, this)
            },
            methods: {
                methods_public: Objs.filter(this, function(value, key) {
                    return Types.is_function(value) && key.indexOf("_") !== 0;
                }, this),
                methods_protected: Objs.filter(this, function(value, key) {
                    return Types.is_function(value) && key.indexOf("_") === 0 && key.indexOf("__") !== 0;
                }, this),
                method_private: Objs.filter(this, function(value, key) {
                    return Types.is_function(value) && key.indexOf("__") === 0;
                }, this)
            }
        };
    };



    /**
     * @deprecated
     */
    Class.prototype._auto_destroy = function(obj) {
        return this.auto_destroy(obj);
    };

    /**
     * @deprecated
     */
    Class.prototype._inherited = function(cls, func) {
        return cls.parent.prototype[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
    };

    return Class;

});