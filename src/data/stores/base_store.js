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
