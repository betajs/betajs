BetaJS.Modelling.Associations.HasManyAssociation = BetaJS.Modelling.Associations.TableAssociation.extend("HasManyAssocation", {

	_yield: function () {
		var query = {};
		query[this._foreign_key] = this._model.id();
		return this._foreign_table.allBy(query);
	},

	yield: function () {
		if (!this._options["cached"])
			return this._yield();
		if (!this.__cache)
			this.__cache = this._yield().asArray();
		return new BetaJS.Iterators.ArrayIterator(this.__cache);
	},
	
	findBy: function (query) {
		query[this._foreign_key] = this._model.id();
		return this._foreign_table.findBy(query);
	},

	allBy: function (query) {
		query[this._foreign_key] = this._model.id();
		return this._foreign_table.allBy(query);
	},

	_change_id: function (new_id, old_id) {
		var objects = this._yield();
		BetaJS.Objs.iter(this._yield())
		if (object) {
			object.set(this._foreign_key, new_id);
			object.save();
		}
	},

});