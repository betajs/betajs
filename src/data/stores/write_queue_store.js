BetaJS.Stores.PassthroughStore.extend("BetaJS.Stores.WriteQueueStore", {
	
	constructor: function (store, options) {		
		this._inherited(BetaJS.Stores.WriteQueueStore, "constructor", store, options);
		options = options || {};
		this.__update_queue = {};
		this.__revision_id = 1;
		this.__id_to_queue = {};
		this.__combine_updates = "combine_updates" in options ? options.combine_updates : true;
		this.__auto_clear_updates = "auto_clear_updates" in options ? options.auto_clear_updates : true;
		this.__flushing = false;
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
		for (var rev in revs)
			delete this.__update_queue[rev];
		delete this.__cache[id];
	},
	
	__remove_revision: function (revision_id) {
		var revision = this.__update_queue[revision_id];
		delete this.__update_queue[revision_id];
		var revs = this.__id_to_queue[revision.id];
		delete revs[revision_id];
		if (BetaJS.Types.is_empty(revs)) {
			delete this.__id_to_queue[revision.id];
			delete this.__cache[revision.id];
		}
	},
	
	__insert_update: function (id, data) {
		if (this.__combine_updates && this.__id_to_queue[id] && !this.__flushing) {
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
	
	flush: function (callbacks) {
		if (this.__flushing)
			return;
		this.__flushing = true;
		var revision_id = this.__revision_id;
		if (callbacks) {
			var next = function () {
				var item = BetaJS.Objs.peek(this.__update_queue);
				if (!item || item.revision_id >= revision_id) {
					BetaJS.SyncAsync.callback(callbacks, "success");
					this.__flushing = false;
					return;
				}
				this.__store.update(item.id, item.data, {
					context: this,
					success: function () {
						this.__remove_revision(item.revision_id);
						next.apply(this);
					},
					exception: function (e) {
						BetaJS.SyncAsync.callback(callbacks, "exception", e);
						this.__flushing = false;
					}
				});
			};
			next.apply(this);
		} else {
			var exc = null;
			while (true) {
				var item = BetaJS.Objs.peek(this.__update_queue);
				if (!item || item.revision_id >= revision_id)
					break;
				try {
					this.__store.update(item.id, item.data);
					this.__remove_revision(item.revision_id);
				} catch (e) {
					exc = e;
					break;
				}
			}
			this.__flushing = false;
			if (exc)
				throw exc;
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
		this.__flushing = false;
		this.__async = "async" in options ? options.async : false;
		this.__min_delay = options.min_delay ? options.min_delay : null;
		this.__max_delay = options.max_delay ? options.max_delay : null;
		if (this.__min_delay || this.__max_delay) {
			this.on("changed", function () {
				if (this.__async)
					this.flush({
						success: function () {},
						exception: function () {}
					});
				else
					this.flush();
			}, this, {min_delay: this.__min_delay, max_delay: this.__max_delay});
		}
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
		if (this.__flushing)
			return;
		this.__flushing = true;
		this.trigger("flush_start");
		this.trigger("flush");
		if (callbacks) {
			var promises = [];
			BetaJS.Objs.iter(this.__stores, function (store) {
				promises.push(BetaJS.SyncAsync.promise(store, store.flush));
			});
			BetaJS.SyncAsync.join(promises, {
				context: this,
				success: function () {
					this.trigger("flush_end");
					this.__flushing = false;
					BetaJS.SyncAsync.callback(callbacks, "success");
					this.__changed = false;
					BetaJS.Objs.iter(this.__stores, function (store) {
						this.__changed = this.__changed || store.changed();
					}, this);
				},
				exception: function (exc) {
					this.trigger("flush_error");
					this.__flushing = false;
						BetaJS.SyncAsync.callback(callbacks, "exception", exc);
					this.__changed = false;
					BetaJS.Objs.iter(this.__stores, function (store) {
						this.__changed = this.__changed || store.changed();
					}, this);
				}
			});
		} else {
			var exc = null;
			BetaJS.Objs.iter(this.__stores, function (store) {
				try {
					store.flush();
				} catch (e) {
					exc = e;
					return false;
				}
				return true;
			}, this);
			this.__flushing = false;
			if (exc) {
				this.trigger("flush_error");
				throw exc;
			} else
				this.trigger("flush_end");
			this.__changed = false;
			BetaJS.Objs.iter(this.__stores, function (store) {
				this.__changed = this.__changed || store.changed();
			}, this);
		}
	}	
	
}]);