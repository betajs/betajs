BetaJS.Class.extend("BetaJS.Modelling.Associations.Association", [
	BetaJS.SyncAsync.SyncAsyncMixin,
	{

	constructor: function (model, options) {
		this._inherited(BetaJS.Modelling.Associations.Association, "constructor");
		this._model = model;
		this._options = options || {};
		this.__cache = null;
		if (options["delete_cascade"])
			model.on("remove", function () {
				this.__delete_cascade();
			}, this);
		if (!options["ignore_change_id"])
			model.on("change_id", function (new_id, old_id) {
				this._change_id(new_id, old_id);
			}, this);
	},
	
	_change_id: function () {},
	
	__delete_cascade: function () {
		this.yield({
			success: function (iter) {
				iter = BetaJS.Iterators.ensure(iter).toArray();
				var promises = [];
				while (iter.hasNext()) {
					var obj = iter.next();
					promises.push(obj.promise(obj.remove));
				}
				this.join(promises, {success: function () {}});
			}
		});
	},
	
	yield: function (callbacks) {
		if (this._options["cached"])
			return this.eitherFactory("__cache", callbacks, this._yield, this._yield);
		else
			return this._yield(callbacks);
	},
	
	invalidate: function () {
		delete this["__cache"];
	}

}]);