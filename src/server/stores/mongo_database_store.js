BetaJS.Stores.ConversionStore.extend("BetaJS.Stores.MongoDatabaseStore", {
	
	constructor: function (database, table_name, types) {
		var store = new BetaJS.Stores.DatabaseStore(database, table_name);
		var encoding = {};
		var decoding = {};
		types = types || {};
		types.id = "id";
		var ObjectId = database.mongo_object_id();
		for (var key in types) {
			if (types[key] == "id") {
				encoding[key] = function (value) {
					return value ? new ObjectId(value) : null;
				};
				decoding[key] = function (value) {
					return value ? value + "" : null;
				};
			}
		}
		this._inherited(BetaJS.Stores.MongoDatabaseStore, "constructor", store, {
			value_encoding: encoding,
			value_decoding: decoding
		});
	}

});
