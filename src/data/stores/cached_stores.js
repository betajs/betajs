BetaJS.Stores.DualStore.extend("BetaJS.Stores.CachedStore", {
	constructor: function (parent, options) {
		options = options || {};
		this._inherited(BetaJS.Stores.CachedStore, "constructor",
			parent,
			new BetaJS.Stores.MemoryStore({
				id_key: parent.id_key(),
				query_model: new BetaJS.Queries.DefaultQueryModel()
			}),
			BetaJS.Objs.extend({
				get_options: {
					start: "second",
					strategy: "or"
				},
				query_options: {
					start: "second",
					strategy: "or",
					clone: true,
					or_on_null: false
				}
			}, options));
	},
	
	cache: function () {
		return this.second();
	},
	
	store: function () {
		return this.first();
	}
});