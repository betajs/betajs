var express = require("express");
var app = express();
app.use(express.bodyParser());

var BetaJS = require("../../../dist/beta-server.js");

var store = new BetaJS.Stores.MemoryStore();

store.insert({"first": "Anna", "last": "Master"});
store.insert({"first": "Alexander", "last": "Fischer"});
store.insert({"first": "Benno", "last": "Lustig"});
store.insert({"first": "Cecilia", "last": "Zensch"});
store.insert({"first": "Dorian", "last": "Janitzer"});

app.get('/users', function (request, response) {
	var opts = request.query;
	opts.sort = "sort" in request.query ? JSON.parse(request.query.sort) : null;
	var query = request.query.query ? JSON.parse(request.query.query) : {};
	console.log("Query: " + JSON.stringify(query) + " with " + JSON.stringify(opts));
	response.send(store.query(query, opts).asArray());
});

app.post('/users', function (request, response) {
	console.log("Insert");
	store.insert(request.body);
	response.send(request.body);
});

app.delete('/users/:id', function (request, response) {
	console.log("Delete");
	store.remove(request.param("id"));
	response.send({});
});

var server = app.listen(3000);

console.log("Listening on port 3000"); 
