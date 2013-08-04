BetaJS.Stores.IndexedStore = BetaJS.Stores.BaseStore.extend("IndexedStore", {
	
	constructor: function (store, indices, options) {
		options = options || {};
		options.rebuild = "rebuild" in options ? options.rebuild : true;
		options.id_key = store._id_key;
		this._inherited(BetaJS.Stores.IndexedStore, "constructor", options);
		this._store = store;
		this._indices = {};
		BetaJS.Objs.iter(indices || {}, function (value, key) {
			value.type = value.type || "StoreIndex";
			this._indices[key] = new BetaJS.Stores[value.type](store, key);
			if (options.rebuild)
				this._indices[key].rebuild();
		}, this);
	},
	
	rebuild: function () {
		BetaJS.Objs.iter(this._indices, function (index) {
			index.rebuild();
		}, this);
	},
	
	_query: function (query, options) {
		var initialized = false;
		var ids = {};
		for (var key in query) 
			if (key in this._indices) {
				if (initialized) {
					var new_ids = this._indices[key].get(query[key]);
					ids = BetaJS.Objs.intersect(ids, new_ids);
				} else {
					initialized = true;
					ids = this._indices[key].get(query[key]);
				}
				if (BetaJS.Types.is_empty(ids))
					return {};
			}
		if (!initialized)
			return this._store.query(query, options);
		var self = this;
		return new BetaJS.Iterators.MappedIterator(
			       new BetaJS.Iterators.FilteredIterator(
			           new BetaJS.Iterators.ObjectKeysIterator(ids),
			           function (id) {
			           	   return self._query_applies_to_id(query, id);
			           }
			       ),
			       function (id) {
                       return self.get(id);
			       }
			 );
	},
	
	_insert: function (data) {
		return this._store.insert(data);
	},

	_remove: function (id) {
		return this._store.remove(id);
	},
	
	_get: function (id) {
		return this._store.get(id);
	},
	
	_update: function (id, data) {
		return this._store.update(id, data);
	},
		
});

BetaJS.Stores.StoreIndex = BetaJS.Class.extend("StoreIndex", {
	
	constructor: function (base_store, index_key) {
		this._inherited(BetaJS.Stores.StoreIndex, "constructor");
		this._base_store = base_store;
		this._index_key = index_key;
		this._id_to_key = {};
		this._key_to_ids = {};
		this._base_store.on("insert", function (row) {
			this._insert(row);
		}, this);
		this._base_store.on("remove", function (id) {
			this._remove(id);
		}, this);
		this._base_store.on("update", function (row) {
			if (!this._exists(row)) {
				this._remove(this._id(row));
				this._insert(row);
			}
		}, this);
	},
	
	destroy: function () {
		this._base_store.off(null, null, this);
		this._inherited(BetaJS.Stores.StoreIndex, "destroy");
	},
	
	rebuild: function () {
		var iter = this._base_store.query();
		while (iter.hasNext())
			this.insert(iter.next());
	},
	
	_id: function (row) {
		return row[this._base_store._id_key];
	},
	
	_key: function (row) {
		return row[this._index_key];
	},

	_insert: function (row) {
		var id = this._id(row);
		var key = this._key(row);
		this._id_to_key[id] = key;
		if (!(key in this._key_to_ids))
			this._key_to_ids[key] = {};
		this._key_to_ids[key][id] = true;
	},
	
	_remove: function (id) {
		var key = this._id_to_key[id];
		delete this._id_to_key[id];
		delete this._key_to_ids[id];
	},
	
	_exists: function (row) {
		return this._id(row) in this._id_to_key;
	},
	
	get: function (key) {
		return key in this._key_to_ids ? this._key_to_ids[key] : [];
	}
	
});

/*
BetaJS.Stores.SubStringStoreIndex = BetaJS.Stores.StoreIndex.extend("SubStringStoreIndex", {

	constructor: function (base_store, index_key) {
		this._inherited(BetaJS.Stores.SubStringStoreIndex, "constructor", base_store, index_key);
		this._substrings = {};
	},

	_insert: function (row) {
		this._inherited(BetaJS.Stores.SubStringStoreIndex, "_insert", row);
		var id = this._id(row);
		var key = this._key(row) + "";
		var current = this._substrings;
		while (key != "") {
			var c = key.charAt(0);
			key = key.substr(1);
			if (!(c in current))
				current[c] = {
					sub: {},
					ids: {}
				};
			current[c].ids[id] = true;
			current = current[c].sub;
		}
	},
	
	__remove_helper: function (current, key, id) {
		if (key == "")
			return;
		var c = key.charAt(0);
		key = key.substr(1);
		this.__remove_helper(current[c].sub, key, id);
		delete current[c].ids[id];
		if (BetaJS.Types.is_empty(current[c].ids))
			delete current[c];
	},

	_remove: function (id) {
		this.__remove_helper(this._substrings, this._id_to_key[id], id);
		this._inherited(BetaJS.Stores.SubStringStoreIndex, "_remove", id);		
	},

	get: function (key) {
		if (!BetaJS.Types.is_object(key)) 
			return this._inherited(BetaJS.Stores.SubStringStoreIndex, "get", key);
		key = key.value;
		if (key == "")
			return {};
		var current = this._substrings; 
		while (key != "") {
			var c = key.charAt(0);
			key = key.substr(1);
			if (!(c in current))
				return {};
			if (key == "")
				return current[c].ids;
			current = current[c].sub;
		}
		return {};
	}
	
});
*/