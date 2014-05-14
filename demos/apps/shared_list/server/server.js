var express = require("express");
var app = express();
app.use(express.bodyParser());

var BetaJS = require("../../../../dist/beta-server.js");

var DemoData = require("../common/demo_data.js");

App = {};

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

App.Stores = {
	
	Items: new BetaJS.Stores.MemoryStore()
	
};

App.Stores.Items.insert_all(DemoData);

App.Tables = {
	
	Items: new BetaJS.Modelling.Table(App.Stores.Items, App.Models.Item)
	
};


app.get('/items', function (request, response) {
	var opts = request.query;
	opts.sort = "sort" in request.query ? JSON.parse(request.query.sort) : null;
	var query = request.query.query ? JSON.parse(request.query.query) : {};
	console.log("Query Items " + JSON.stringify(query) + " with " + JSON.stringify(opts));
	App.Tables.Items.allBy(query, opts, {
		success: function (iterator) {
			response.send(iterator.asArrayDelegate("asRecord"));
		}
	});
});

app.post('/items', function (request, response) {
	console.log("Creating Item");
	var model = new App.Models.Item(request.body);
	model.save({
		success: function () {
			response.send(model.asRecord());
		}
	});
});

app.put('/items/:id', function (request, response) {
	console.log("Updating Item with id " + request.param("id"));
	App.Tables.Items.findById(request.param("id"), {
		success: function (model) {
			model.update(request.body, {
				success: function () {
					response.send(model.asRecord());
				}
			});
		}
	});
});

app.delete('/items/:id', function (request, response) {
	console.log("Deleting Item with id " + request.param("id"));
	App.Tables.Items.findById(request.param("id"), {
		success: function (model) {
			model.remove({
				success: function () {
					response.send({});
				}
			});
		}
	});
});

var io = require('socket.io').listen(app.listen(3000));

App.Stores.Items.on("insert", function (row) {
	io.sockets.emit("items:insert", row);
});

App.Stores.Items.on("update", function (row, data) {
	io.sockets.emit("items:update", BetaJS.Objs.objectBy(row[App.Stores.Items.id_key()], data));
});

App.Stores.Items.on("remove", function (id) {
	io.sockets.emit("items:remove", id);
});

console.log("Listening on port 3000"); 
