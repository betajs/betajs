BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.HasManyAssociation", {

	_id: function () {
		return this._primary_key ? this._model.get(this._primary_key) : this._model.id();
	},

	_yield: function (callbacks) {
		return this.allBy({}, callbacks);
	},

	yield: function (callbacks) {
		if (!this._options["cached"])
			return this._yield(callbacks);
		if (this.__cache) {
			var iter = new BetaJS.Iterators.ArrayIterator(this.__cache);
			if (callbacks)
				this.callback(callbacks, "success", iter);
			return iter;
		} else {
			return this.then(this._yield, callbacks, function (result, callbacks) {
				this.__cache = result.asArray();
				BetaJS.Objs.iter(this.__cache, function (model) {
					model.on("destroy", function () {
						this.invalidate();
					}, this);
				}, this);
				this.callback(callbacks, "success", new BetaJS.Iterators.ArrayIterator(this.__cache));
			});
		}
	},
	
	invalidate: function () {
		BetaJS.Objs.iter(this.__cache, function (model) {
			model.off(null, null, this);
		}, this);
		this._inherited(BetaJS.Modelling.Associations.HasManyAssociation, "invalidate");
	},

	findBy: function (query, callbacks) {
		query[this._foreign_key] = this._id();
		return this._foreign_table.findBy(query, callbacks);
	},

	allBy: function (query, callbacks, id) {
		query[this._foreign_key] = id ? id : this._id();
		return this._foreign_table.allBy(query, {}, callbacks);
	},

	_change_id: function (new_id, old_id) {
		this.allBy({}, {
			content: this,
			success: function (objects) {
				while (objects.hasNext()) {
					var object = objects.next();
					object.set(this._foreign_key, new_id);
					object.save();
				}
			}
		}, old_id);
	}

});