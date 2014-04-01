test("test belongs to all", function() {
	var Model2 = BetaJS.Modelling.Model.extend("Model2", {});
	var table2 = new BetaJS.Modelling.Table(new BetaJS.Stores.MemoryStore(), Model2, {});
	var Model1 = BetaJS.Modelling.Model.extend("Model1", {
		_initializeAssociations: function () {
			assocs = this._inherited(Model1, "_initializeAssociations");
			assocs["model2"] = new BetaJS.Modelling.Associations.BelongsToAssociation(
				this,
				table2,
				"model2id",
				{
					cached: true
				}
			);
			return assocs;
		},		
	}, {
		_initializeScheme: function () {
			scheme = this._inherited(Model1, "_initializeScheme");
			scheme["model2id"] = {
				type: "id",
				index: true
			};
			return scheme;
		}
	});
	var table1 = new BetaJS.Modelling.Table(new BetaJS.Stores.MemoryStore(), Model1, {});
	var model1 = new Model1({}, {
		table : table1
	});
	model1.save();
	QUnit.equal(model1.model2(), null);
	var model2 = new Model2({}, {
		table : table2
	});
	model2.save();
	model1.update({
		model2id: model2.id()
	});
	QUnit.equal(model1.model2(), model2);
});
