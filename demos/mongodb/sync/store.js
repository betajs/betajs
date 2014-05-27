var BetaJS = require("../../../dist/beta-server.js");
var Fiber = require("fibers");

Fiber(function () {
	var db = new BetaJS.Databases.MongoDatabase({
		database: "betajs-test"
	}, {
		sync: true,
		async: false
	});
	var store = new BetaJS.Stores.MongoDatabaseStore(db,  "test-table");
	var row = store.insert({"foo": "bar"});	
	var rows = store.query().asArray();
	console.log(rows);
	store.remove(row.id);
	store.destroy();
	db.destroy();
}).run();

