BetaJS.Modelling.Associations = {};

BetaJS.Modelling.Associations.Association = BetaJS.Class.extend("Assocation", {

	constructor: function (model, foreign_table, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.Association, "constructor");
		this._model = model;
		this._foreign_table = foreign_table;
		this._foreign_key = foreign_key;
		this._options = options || {};
		this.__cache = null;
		if (options["delete_cascade"])
			model.on("remove", function () {
				this.__delete_cascade();
			}, this);
	},
	
	__delete_cascade: function () {
		var iter = BetaJS.Iterators.ensure(this.yield());
		while (iter.hasNext())
			iter.next().remove();
	},
	
	yield: function () {
		if (this.__cache)
			return this.__cache;
		var obj = this._yield();
		if (this._options["cached"])
			this.__cache = obj;
		return obj;
	},
	
	invalidate: function () {
		delete this["__cache"];
	}

});