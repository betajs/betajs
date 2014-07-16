BetaJS.Stores.ConversionStore.extend("BetaJS.Stores.MongoDatabaseStore", {
	
	constructor: function (database, table_name, types, foreign_id) {
		var store = new BetaJS.Stores.DatabaseStore(database, table_name, foreign_id);
		var encoding = {};
		var decoding = {};
		types = types || {};
        var ObjectId = database.mongo_object_id();
        if (!foreign_id)
		    types.id = "id";
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
		var opts = {
            value_encoding: encoding,
            value_decoding: decoding
		};
		if (foreign_id) {
		    opts.key_encoding = {
		        "id": foreign_id
		    };
		    opts.key_encoding[foreign_id] = null;
            opts.key_decoding = {
                "id": null
            };
            opts.key_encoding[foreign_id] = "id";
		}
		this._inherited(BetaJS.Stores.MongoDatabaseStore, "constructor", store, opts);
	}

});
