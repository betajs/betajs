/*!
  betajs - v0.0.1 - 2013-04-16
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Stores = BetaJS.Stores || {};


BetaJS.Stores.BaseStore = BetaJS.Class.extend("BaseStore", [BetaJS.Events.EventsMixin, {
	
	_insert: function (data) {
	},
	
	_remove: function (id) {
	},
	
	_get: function (id) {
	},
	
	_update: function (id, data) {
	},
	
	_query: function (query, options) {
	},	
	
	_insertEvent: function (row, external) {
		this.trigger("insert", row, external);		
		this.trigger("insert-" + external ? 'external' : 'internal', row);
	},
	
	_updateEvent: function (row, row_changed, external) {
		this.trigger("update", row, row_changed, external)
		this.trigger("update-" + external ? 'external' : 'internal', row, row_changed);
	},

	_removeEvent: function (row, external) {
		this.trigger("remove", row, external)
		this.trigger("remove-" + external ? 'external' : 'internal', row);
	},

	insert: function (data) {
		var row = this._insert(data);
		if (row)
			this._insertEvent(row, true);
		return row;
	},
	
	remove: function (id) {
		var row = this._remove(id);
		if (row)
			this._removeEvent(row, true);
		return row;
	},
	
	get: function (id) {
		return this._get(id);
	},
	
	update: function (id, data) {
		var row = this._update(id, data);
		if (row)
			this._updateEvent(row, data, true);
		return row;
	},
	
	query: function (query, options) {
		return this._query(query, options);
	},
	
	_query_applies_to_id: function (query, id) {
		var row = this.get(id);
		return row && BetaJS.Queries.evaluate(query, row);
	},
	
	clear: function () {
		var iter = this.query({});
		while (iter.hasNext())
			this.remove(iter.next().id);
	}

}]);

BetaJS.Stores.DumbStore = BetaJS.Stores.BaseStore.extend("DumbStore", {
	
	_read_last_id: function () {},
	_write_last_id: function (id) {},
	_remove_last_id: function () {},
	_read_first_id: function () {},
	_write_first_id: function (id) {},
	_remove_first_id: function () {},
	_read_item: function (id) {},
	_write_item: function (id, data) {},
	_remove_item: function (id) {},
	_read_next_id: function (id) {},
	_write_next_id: function (id, next_id) {},
	_remove_next_id: function (id) {},
	_read_prev_id: function (id) {},
	_write_prev_id: function (id, prev_id) {},
	_remove_prev_id: function (id) {},
	
	_insert: function (data) {
		var last_id = this._read_last_id();
		var id = 1;
		if (last_id != null) {
			id = last_id + 1;
			this._write_next_id(last_id, id);
			this._write_prev_id(id, last_id);
		} else
			this._write_first_id(id);
		data.id = id;
		this._write_last_id(id);
		this._write_item(id, data);
		return data;
	},
	
	_remove: function (id) {
		var row = this._read_item(id);
		if (row) {
			this._remove_item(id);
			var next_id = this._read_next_id(id);
			var prev_id = this._read_prev_id(id);
			if (next_id != null) {
				this._remove_next_id(id);
				if (prev_id != null) {
					this._remove_prev_id(id);
					this._write_next_id(prev_id, next_id);
					this._write_prev_id(next_id, prev_id);
				} else {
					this._remove_prev_id(next_id);
					this._write_first_id(next_id);
				}
			} else if (prev_id != null) {
				this._remove_next_id(prev_id);
				this._write_last_id(prev_id);
			} else {
				this._remove_first_id();
				this._remove_last_id();
			}
		}
		return row;
	},
	
	_get: function (id) {
		return this._read_item(id);
	},
	
	_update: function (id, data) {
		var row = this._get(id);
		if (row) {
			delete data.id;
			BetaJS.Objs.extend(row, data);
			this._write_item(id, row);
		}
		return row;
	},
	
	_query: function (query, options) {
		var iter = new BetaJS.Iterators.Iterator();
		var store = this;
		var fid = this._read_first_id();
		BetaJS.Objs.extend(iter, {
			__id: fid == null ? 1 : fid,
			__store: store,
			__query: query,
			
			hasNext: function () {
				var last_id = this.__store._read_last_id();
				if (last_id == null)
					return false;
				while (this.__id < last_id && !this.__store._read_item(this.__id))
					this.__id++;
				while (this.__id <= last_id) {
					if (this.__store._query_applies_to_id(query, this.__id))
						return true;
					if (this.__id < last_id)
						this.__id = this.__store._read_next_id(this.__id)
					else
						this.__id++;
				}
				return false;
			},
			
			next: function () {
				if (this.hasNext()) {
					var item = this.__store.get(this.__id);
					if (this.__id == this.__store._read_last_id())
						this.__id++
					else
						this.__id = this.__store._read_next_id(this.__id);
					return item;
				}
				return null;
			}
		});
		return iter;
	},	
	
	
});

BetaJS.Stores.AssocStore = BetaJS.Stores.DumbStore.extend("AssocStore", {
	
	_read_key: function (key) {},
	_write_key: function (key, value) {},
	_remove_key: function (key) {},
	
	__read_id: function (key) {
		var raw = this._read_key(key);
		return raw ? parseInt(raw) : null;
	},
	
	_read_last_id: function () {
		return this.__read_id("last_id");
	},
	
	_write_last_id: function (id) {
		this._write_key("last_id", id);
	},

	_remove_last_id: function () {
		this._remove_key("last_id");
	},

	_read_first_id: function () {
		return this.__read_id("first_id");
	},
	
	_write_first_id: function (id) {
		this._write_key("first_id", id);
	},
	
	_remove_first_id: function () {
		this._remove_key("first_id");
	},

	_read_item: function (id) {
		return this._read_key("item_" + id);
	},

	_write_item: function (id, data) {
		this._write_key("item_" + id, data);
	},
	
	_remove_item: function (id) {
		this._remove_key("item_" + id);
	},
	
	_read_next_id: function (id) {
		return this.__read_id("next_" + id);
	},

	_write_next_id: function (id, next_id) {
		this._write_key("next_" + id, next_id);
	},
	
	_remove_next_id: function (id) {
		this._remove_key("next_" + id);
	},
	
	_read_prev_id: function (id) {
		return this.__read_id("prev_" + id);
	},

	_write_prev_id: function (id, prev_id) {
		this._write_key("prev_" + id, prev_id);
	},

	_remove_prev_id: function (id) {
		this._remove_key("prev_" + id);
	}
	
});

BetaJS.Stores.LocalStore = BetaJS.Stores.AssocStore.extend("LocalStore", {
	
	constructor: function (prefix) {
		this._inherited(BetaJS.Stores.LocalStore, "constructor");
		this.__prefix = prefix;
	},
	
	__key: function (key) {
		return this.__prefix + key;
	},
	
	_read_key: function (key) {
		var prfkey = this.__key(key);
		return prfkey in localStorage ? JSON.parse(localStorage[prfkey]) : null;
	},
	
	_write_key: function (key, value) {
		localStorage[this.__key(key)] = JSON.stringify(value);
	},
	
	_remove_key: function (key) {
		delete localStorage[this.__key(key)];
	},
	
});

BetaJS.Stores.MemoryStore = BetaJS.Stores.AssocStore.extend("MemoryStore", {
	
	_read_key: function (key) {
		return this[key];
	},
	
	_write_key: function (key, value) {
		this[key] = value;
	},
	
	_remove_key: function (key) {
		delete this[key];
	}
	
});
