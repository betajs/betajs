BetaJS.Modelling.Associations.HasManyAssociation.extend("BetaJS.Modelling.Associations.HasManyThroughArrayAssociation", {

	_yield: function (callbacks) {
		if (callbacks) {
			var promises = [];		
			BetaJS.Objs.iter(this._model.get(this._foreign_key), function (id) {
				promises.push(this._foreign_table.promise(this._foreign_table.findById, [id]));
			}, this);
			return this.join(promises, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
				this.callback(callbacks, "success", BetaJS.Objs.filter(result, function (item) {
					return !!item;
				}));
			}));
		} else {
			var result = [];		
			BetaJS.Objs.iter(this._model.get(this._foreign_key), function (id) {
				var item = this._foreign_table.findById(id);
				if (item)
					result.push(item);
			}, this);
			return result;
		}
	},

	yield: function (callbacks) {
		if (!this._options["cached"])
			return new BetaJS.Iterators.ArrayIterator(this._yield(callbacks));
		if (this.__cache) {
			var iter = new BetaJS.Iterators.ArrayIterator(this.__cache);
			if (callbacks)
				this.callback(callbacks, "success", iter);
			return iter;
		} else {
			return this.then(this._yield, callbacks, function (result, callbacks) {
				this.__cache = result;
				BetaJS.Objs.iter(this.__cache, function (model) {
					model.on("destroy", function () {
						this.invalidate();
					}, this);
				}, this);
				this.callback(callbacks, "success", new BetaJS.Iterators.ArrayIterator(this.__cache));
			});
		}
	}

});