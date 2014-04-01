BetaJS.Modelling.Associations.HasManyAssociation.extend("BetaJS.Modelling.Associations.HasManyViaAssociation", {

	constructor: function (model, intermediate_table, intermediate_key, foreign_table, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.HasManyViaAssociation, "constructor", model, foreign_table, foreign_key, options);
		this._intermediate_table = intermediate_table;
		this._intermediate_key = intermediate_key;
	},

	findBy: function (query, callbacks) {
		var intermediate_query = {};
		intermediate_query[this._intermediate_key] = this._id();
		return this.then(this._intermediate_table, this._intermediate_table.findBy, [intermediate_query], function (intermediate) {
			if (!intermediate)
				return this.callback(callbacks, "success", null);
			else {
				query[this._foreign_table.primary_key()] = intermediate.get(this._foreign_key);
				return this._foreign_table.findBy(query, callbacks);
			}
		});
	},

	allBy: function (query, callbacks, id) {
		var intermediate_query = {};
		intermediate_query[this._intermediate_key] = id ? id : this._id();
		return this.then(this._intermediate_table, this._intermediate_table.allBy, [intermediate_query], callbacks, function (intermediates, callbacks) {
			var promises = [];
			while (intermediates.hasNext()) {
				var intermediate = intermediates.next();
				var query_clone = BetaJS.Objs.clone(query, 1);
				query_clone[this._foreign_table.primary_key()] = intermediate.get(this._foreign_key);
				promises.push(this._foreign_table.promise(this._foreign_table.allBy, query_clone));
			}
			this.join(promises, BetaJS.SyncAsync.mapSuccess(callbacks, function (foreignss) {
				var results = [];
				BetaJS.Objs.iter(foreignss, function (foreigns) {
					while (foreigns.hasNext())
						results.push(foreigns.next());
				});
				this.callback(callbacks, "success", results);
			}));
		});
	}

});