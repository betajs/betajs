var BetaJS = require("../../../dist/beta-server.js");
var Fiber = require("fibers");

Fiber(function () {
	var db = new BetaJS.Databases.MongoDatabase({
		database: "betajs-test"
	}, {
		sync: true,
		async: false
	});
	var table = new BetaJS.Databases.MongoDatabaseTable(db, "test-table");
	var row = table.insertRow({"foo": "bar"});
	var rows = table.find({}).asArray();
	console.log(rows);
	table.removeById(row.id);	
	table.destroy();
	db.destroy();
}).run();

