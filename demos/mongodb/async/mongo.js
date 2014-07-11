var BetaJS = require("../../../dist/beta-server.js");

var db = new BetaJS.Databases.MongoDatabase({
	database: "betajs-test"
}, {
	sync: false,
	async: true
});
var table = new BetaJS.Databases.MongoDatabaseTable(db, "test-table");
table.insertRow({"foo": "bar"}, {
	success: function (row) {
		table.find({}, {}, {
			success: function (rows) {
				rows = rows.asArray();
				console.log(rows);
				table.findById(row.id, {
				   success: function (row) {
                        table.removeById(row.id, {
                            success: function () {
                                table.destroy();
                                db.destroy();
                            }
                        });
				   } 
				});
			}
		});
	}
});
