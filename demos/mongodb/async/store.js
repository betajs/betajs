var BetaJS = require("../../../dist/beta-server.js");

var db = new BetaJS.Databases.MongoDatabase({
	database: "betajs-test"
}, {
	sync: false,
	async: true
});
var store = new BetaJS.Stores.MongoDatabaseStore(db, "test-table");
store.insert({"foo": "bar"}, {
	success: function (row) {
		store.query({}, {}, {
			success: function (rows) {
				rows = rows.asArray();
				console.log(rows);
				store.remove(row.id, {
					success: function () {
						store.destroy();
						db.destroy();
					}
				});	
			}
		});
	}
});
