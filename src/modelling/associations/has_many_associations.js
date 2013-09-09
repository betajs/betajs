BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.HasManyAssociation", {

	_id: function () {
		return this._primary_key ? this._model.get(this._primary_key) : this._model.id();
	},

	_yield: function () {
		return this.allBy({});
	},

	yield: function () {
		if (!this._options["cached"])
			return this._yield();
		if (!this.__cache)
			this.__cache = this._yield().asArray();
		BetaJS.Objs.iter(this.__cache, function (model) {
			model.on("destroy", function () {
				this.invalidate();
			}, this);
		}, this);
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
	},
	
	invalidate: function () {
		BetaJS.Objs.iter(this.__cache, function (model) {
			model.off(null, null, this);
		}, this);
		this._inherited(BetaJS.Modelling.Associations.HasManyAssociation, "invalidate");
	},

	findBy: function (query) {
		query[this._foreign_key] = this._id();
		return this._foreign_table.findBy(query);
	},

	allBy: function (query) {
		query[this._foreign_key] = this._id();
		return this._foreign_table.allBy(query);
	},

	_change_id: function (new_id, old_id) {
		var objects = this._yield();
		while (objects.hasNext()) {
			var object = objects.next();
			object.set(this._foreign_key, new_id);
			object.save();
		}
	},

});