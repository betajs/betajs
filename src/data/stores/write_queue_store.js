BetaJS.Stores.PassthroughStore.extend("BetaJS.Stores.WriteQueueStore", {
	
	constructor: function (store, options) {		
		this._inherited(BetaJS.Stores.WriteQueueStore, "constructor", store, options);
		options = options || {};
		this.__update_queue = {};
		this.__revision_id = 1;
		this.__id_to_queue = {};
		this.__combine_updates = "combine_updates" in options ? options.combine_updates : true;
		this.__auto_clear_updates = "auto_clear_updates" in options ? options.auto_clear_updates : true;
		this.__cache = {};
		if (this.__auto_clear_updates)
			this.on("remove", function (id) {
				this.__remove_update(id);
			}, this);
	},
	
	update: function (id, data, callbacks) {
		this.__insert_update(id, data);
		if (callbacks && callbacks.success)
			callbacks.success(id, data, data);
		return data;
	},
	
	__remove_update: function (id) {
		var revs = this.__id_to_queue[id];
		delete this.__id_to_queue[id];
		for (var rev in rev)
			delete this.__update_queue[rev];
		delete this.__cache[id];
	},
	
	__insert_update: function (id, data) {
		if (this.__combine_updates && this.__id_to_queue[id]) {
			var comm = {};
			for (var rev in this.__id_to_queue[id]) {
				comm = BetaJS.Objs.extend(comm, this.__update_queue[rev].data);
				delete this.__update_queue[rev];
			}
			comm = BetaJS.Objs.extend(comm, data);				 
			this.__id_to_queue[id] = {};
		} 
		this.__id_to_queue[id] = this.__id_to_queue[id] || {};
		this.__id_to_queue[id][this.__revision_id] = true;
		this.__update_queue[this.__revision_id] = {
			id: id,
			data: data,
			revision_id: this.__revision_id
		};
		this.__cache[id] = BetaJS.Objs.extend(this.__cache[id] || {}, data);
		this.__revision_id++;
		this.trigger("queue", "update", id, data);
		this.trigger("queue:update", id, data);
	},
	
	flush: function (callbacks, revision_id) {
		if (!revision_id)
			revision_id = this.__revision_id;
		if (this.async_write()) {
			var first = null;
			var self = this;
			for (var key in this.__update_queue) {
				first = this.__update_queue[key];
				break;
			}
			if (first) {
				if (first.revision_id >= revision_id)
					return;
				this.__store.update(first.id, first.data, {
					exception: callbacks.exception,
					success: function () {
						delete this.__update_queue[first.revision_id];
						delete this.__id_to_queue[first.id][first.revision_id];
						self.flush(callbacks, revision_id);
					}
				});
			} else {
				if (callbacks)
					callbacks.success();
			}
		} else {
			try {
				BetaJS.Objs.iter(this.__update_queue, function (item) {
					if (item.revision_id >= revision_id)
						return false;
					this.__store.update(item.id, item.data);
					return true;
				}, this);
				if (callbacks && callbacks.success)
					callbacks.success();
			} catch (e) {
				if (callbacks && callbacks.exception)
					callbacks.exception(e);
				else
					throw e;
			}
		}
	},
	
	changed: function () {
		return !BetaJS.Types.is_empty(this.__update_queue);
	},
	
	get: function (id) {
		var obj = this.__store.get(id);
		if (obj && this.__cache[id])
			return BetaJS.Objs.extend(obj, this.__cache[id]);
		return obj;
	},
	
	query: function (query, options) {
		var self = this;
		return new BetaJS.Iterators.MappedIterator(this.__store.query(query, options), function (item) {
			if (self.__cache[item[self.id_key()]])
				return BetaJS.Objs.extend(item, self.__cache[item[self.id_key()]]);
			return item;
		});
	}
	
});



BetaJS.Class.extend("BetaJS.Stores.WriteQueueStoreManager", [
	BetaJS.Events.EventsMixin,
	{
	
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.WriteQueueStoreManager, "constructor");
		options = options || {};
		this.__stores = {};
		this.__changed = false;
		this.__min_delay = options.min_delay ? options.min_delay : null;
		this.__max_delay = options.max_delay ? options.max_delay : null;
		if (this.__min_delay || this.__max_delay)
			this.on("changed", function () {
				this.flush();
			}, this, {min_delay: this.__min_delay, max_delay: this.__max_delay});
	},
	
	destroy: function () {
		this.off(null, null, this);
		BetaJS.Objs.iter(this.__stores, function (store) {
			this.unregister(store);
		}, this);
		this._inherited(BetaJS.Stores.WriteQueueStoreManager, "destroy");
	},
	
	__get: function (store) {
//		return store.instance_of(BetaJS.Stores.WriteQueueCachedStore) ? store.second() : store;
		return store;
	},
	
	register: function (store) {
		store = this.__get(store);
		this.__stores[BetaJS.Ids.objectId(store)] = store;
		store.on("queue:update", function () {
			this.__changed = true;
			this.trigger("changed");
		}, this);
	},
	
	unregister: function (store) {
		store = this.__get(store);
		delete this.__stores[BetaJS.Ids.objectId(store)];
		store.off(null, null, this);
	},
	
	flush: function (callbacks) {
		this.trigger("flush_start");
		this.trigger("flush");
		var success_count = 0;
		var count = BetaJS.Objs.count(this.__stores);
		var self = this;
		BetaJS.Objs.iter(this.__stores, function (store) {
			store.flush({
				exception: function (e) {
					self.trigger("flush_error");
					if (callbacks && callbacks.exception)
						callbacks.exception(e);
					else
						throw e;
				},
				success: function () {
					success_count++;
					if (success_count == count) {
						self.trigger("flush_end");
						if (callbacks && callbacks.success)
							callbacks.success();
					}
				}
			});
		}, this);
		this.__changed = false;
		BetaJS.Objs.iter(this.__stores, function (store) {
			this.__changed = this.__changed || store.changed();
		}, this);
	}	
	
}]);