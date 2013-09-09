BetaJS.Modelling.Associations.HasManyAssociation.extend("BetaJS.Modelling.Associations.HasManyThroughArrayAssociation", {

	_yield: function () {
		var result = [];
		BetaJS.Objs.iter(this._model.get(this._foreign_key), function ($id) {
			var item = this._foreign_table.findById($id);
			if (item)
				result.push(item);
		}, this);
		return result;
	},

	yield: function () {
		if (!this._options["cached"])
			return new BetaJS.Iterators.ArrayIterator(this._yield());
		if (!this.__cache)
			this.__cache = this._yield();
		BetaJS.Objs.iter(this.__cache, function (model) {
			model.on("destroy", function () {
				this.invalidate();
			}, this);
		}, this);
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
	},

});