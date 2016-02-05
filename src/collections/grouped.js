Scoped.define("module:Collections.GroupedCollection", [
    "module:Collections.Collection",
    "module:Objs",
    "module:Properties.Properties"
], function (Collection, Objs, Properties, scoped) {
	return Collection.extend({scoped: scoped}, function (inherited) {
		return {

			constructor : function(parent, options) {
				this.__parent = parent;
				options = options || {};
				delete options.objects;
				this.__groupby = options.groupby;
				this.__insertCallback = options.insert;
				this.__removeCallback = options.remove;
				this.__callbackContext = options.context || this;
				inherited.constructor.call(this, options);
				Objs.iter(this.__groupby, this.add_secondary_index, this);
				this.__parent.iterate(this.__addParentObject, this);
				this.__parent.on("add", this.__addParentObject, this);
				this.__parent.on("remove", this.__removeParentObject, this);
			},
			
			destroy: function () {
				this.__parent.off(null, null, this);
				inherited.destroy.call(this);
			},
			
			__addParentObject: function (object) {
				var group = this.__objectToGroup(object);
				if (!group) {
					group = new Properties();
					group.objects = {};
					group.object_count = 0;
					Objs.iter(this.__groupby, function (key) {
						group.set(key, object.get(key));
					});
					this.__addObjectToGroup(object, group);
					this.add(group);
				} else
					this.__addObjectToGroup(object, group);
			},
			
			__removeParentObject: function (object) {
				var group = this.__objectToGroup(object);
				if (group) {
					this.__removeObjectFromGroup(object, group);
					if (group.object_count === 0)
						this.remove(group);
				}
			},
			
			__objectToGroup: function (object) {
				var query = {};
				Objs.iter(this.__groupby, function (key) {
					query[key] = object.get(key);
				});
				return this.query(query).nextOrNull();
			},
			
			__addObjectToGroup: function (object, group) {
				group.objects[this.__parent.get_ident(object)] = object;
				group.object_count++;
				this.__insertCallback.call(this.__callbackContext, object, group);
			},
			
			__removeObjectFromGroup: function (object, group) {
				if (!(this.__parent.get_ident(object) in group.objects))
					return;
				delete group.objects[this.__parent.get_ident(object)];
				group.object_count--;
				if (group.object_count > 0)
					this.__removeCallback.call(this.__callbackContext, object, group);
			},
			
			increase_forwards: function (steps) {
				return this.__parent.increase_forwards(steps);
			}
			
		};	
	});
});
