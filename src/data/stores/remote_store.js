BetaJS.Stores.RemoteStore = BetaJS.Stores.BaseStore.extend("RemoteStore", {
	
	constructor: function (uri) {
		this._inherited(BetaJS.Stores.RemoteStore, "constructor");
		this.__uri = uri;
	},

	_insert: function (data) {
		var row = null;
		$.ajax({
			type: "POST",
			async: false,
			url: this.__uri,
			data: JSON.stringify(data),
			success: function (response) {
				row = response;
			}
		});
		return row;
	},
	
	_remove: function (id) {
		var row = null;
		$.ajax({
			type: "DELETE",
			async: false,
			url: this.__uri + "/" + id,
			success: function (response) {
				if (response)
					row = response
				else
					row = {id: id};
			}
		});
		return row;
	},
	
	_get: function (id) {
		var row = null;
		$.ajax({
			type: "GET",
			async: false,
			url: this.__uri + "/" + id,
			data: JSON.stringify(data),
			success: function (response) {
				row = response;
			}
		});
		return row;
	},
	
	_update: function (id, data) {
		var row = null;
		$.ajax({
			type: "PUT",
			async: false,
			url: this.__uri + "/" + id,
			data: JSON.stringify(data),
			success: function (response) {
				row = response;
			}
		});
		return row;
	},
	
	_query: function (query, options) {
		var data = null;
		$.ajax({
			type: "GET",
			async: false,
			url: this.__uri,
			success: function (response) {
				data = response;
			}
		});
		if (data == null)
			return BetaJS.Iterators.ArrayIterator([]);			
		return new BetaJS.Iterators.FilteredIterator(
			new BetaJS.Iterators.ArrayIterator(data),
			function (row) {
				return BetaJS.Queries.evaluate(query, row);
			}
		);
	}
	
});
