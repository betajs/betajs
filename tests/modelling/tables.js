test("test tables findById", function() {
	var store = new BetaJS.Stores.MemoryStore();
	var Model = BetaJS.Modelling.Model.extend("Model", {});
	var table = new BetaJS.Modelling.Table(store, Model, {});
	var model = new Model({}, {
		table : table
	});
	model.save();
	QUnit.equal(table.findById(model.id()), model);
	QUnit.equal(table.findById(model.id() + 1), null);
});


test("test tables all", function() {
	var store = new BetaJS.Stores.MemoryStore();
	var Model = BetaJS.Modelling.Model.extend("Model", {});
	var table = new BetaJS.Modelling.Table(store, Model, {});
	var model = new Model({}, {
		table : table
	});
	model.save();
	var models = table.all().asArray();
	QUnit.equal(models.length, 1);
	QUnit.equal(models[0], model);
});

test("test tables all async", function() {
	var store = new BetaJS.Stores.MemoryStore();
	var Model = BetaJS.Modelling.Model.extend("Model", {});
	var table = new BetaJS.Modelling.Table(store, Model, {});
	var model = new Model({}, {
		table : table
	});
	model.save();
	var models = table.all({}, {
		success: function (result) {
			var models = result.asArray();
			QUnit.equal(models.length, 1);
			QUnit.equal(models[0], model);
		},
		exception: function () {
			ok(false);
		}
	});
});

test("test tables findBy", function() {
	var store = new BetaJS.Stores.MemoryStore();
	var Model = BetaJS.Modelling.Model.extend("Model", {});
	var table = new BetaJS.Modelling.Table(store, Model, {});
	var model = new Model({}, {
		table : table
	});
	model.save();
	var model2 = table.findBy({});
	QUnit.equal(model2, model);
});
