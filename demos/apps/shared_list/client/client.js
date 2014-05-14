App = {};

App.Options = {
	
	cached_store: true,
	server_store: true,
	active_store: true
	
};

App.Models = {
	
	Item: BetaJS.Modelling.Model.extend("App.Models.Item", {}, {
		defaultTable: function () {
			return App.Tables.Items;
		},
		
		_initializeScheme: function () {
			return BetaJS.Objs.extend({
				"text": {
					type: "string"
				}
			}, this._inherited(App.Models.Item, "_initializeScheme"));
		}
	})
	
};

App.Stores = {};

if (App.Options.server_store) {
	App.Stores.BackendItems = new BetaJS.Stores.QueryGetParamsRemoteStore("http://localhost:3000/items", new BetaJS.Browser.JQueryAjax(),
	           {skip: "skip", limit: "limit", sort: "sort", query: "query"});
	if (App.Options.active_store)
		App.Stores.BackendItems = new BetaJS.Stores.ActiveStore(App.Stores.BackendItems,
			new BetaJS.Stores.SocketListenerStore({}, io.connect('http://localhost:3000'), "items"));
} else {
	App.Stores.BackendItems = new BetaJS.Stores.MemoryStore();
}

			
	


if (!App.Options.server_store)
	App.Stores.BackendItems.insert_all(DemoData);

if (App.Options.cached_store)
	App.Stores.Items = new BetaJS.Stores.CachedStore(App.Stores.BackendItems);
else
	App.Stores.Items = App.Stores.BackendItems;


App.Tables = {
	
	Items: new BetaJS.Modelling.Table(App.Stores.Items, App.Models.Item, {
		auto_materialize: true
	})
	
};

