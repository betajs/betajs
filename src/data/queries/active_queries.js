BetaJS.Class.extend("BetaJS.Queries.ActiveQueryEngine", {
	
	constructor: function () {
		this._inherited(BetaJS.Queries.ActiveQueryEngine, "constructor");
		this.__aqs = {};
		this.__object_to_aqs = {};
	},
	
	__valid_for_aq: function (raw, aq) {
		return BetaJS.Queries.evaluate(aq.query(), raw);
	},
	
	insert: function (object) {
		if (this.__object_to_aqs[BetaJS.Ids.objectId(object)])
			return;
		var raw = object.getAll();
		var aqs = {};
		this.__object_to_aqs[BetaJS.Ids.objectId(object)] = aqs;
		BetaJS.Objs.iter(this.__aqs, function (aq) {
			if (this.__valid_for_aq(raw, aq)) {
				aq._add(object);
				aqs[aq.cid()] = aq;
			}
		}, this);
		object.on("change", function () {
			this.update(object);
		}, this);
	},
	
	remove: function (object) {
		BetaJS.Objs.iter(this.__object_to_aqs[BetaJS.Ids.objectId(object)], function (aq) {
			aq._remove(object);
		}, this);
		delete this.__object_to_aqs[BetaJS.Ids.objectId(object)];
		object.off(null, this, null);
	},
	
	update: function (object) {
		var raw = object.getAll();
		var aqs = this.__object_to_aqs[BetaJS.Ids.objectId(object)];
		BetaJS.Objs.iter(this.__object_to_aqs[BetaJS.Ids.objectId(object)], function (aq) {
			if (!this.__valid_for_aq(raw, aq)) {
				aq._remove(object);
				delete aqs[aq.cid()];
			}
		}, this);
		BetaJS.Objs.iter(this.__aqs, function (aq) {
			if (this.__valid_for_aq(raw, aq)) {
				aq._add(object);
				aqs[aq.cid()] = aq;
			}
		}, this);
	},
	
	register: function (aq) {
		this.__aqs[aq.cid()] = aq;
		var query = aq.query();
		var result = this._query(query);
		while (result.hasNext()) {
			var object = result.next();
			if (this.__object_to_aqs[BetaJS.Ids.objectId(object)]) {
				this.__object_to_aqs[BetaJS.Ids.objectId(object)][aq.cid()] = aq;
				aq._add(object);
			} else
				this.insert(object);
		}
	},
	
	unregister: function (aq) {
		delete this.__aqs[aq.cid()];
		var self = this;
		aq.collection().iterate(function (object) {
			delete self.__object_to_aqs[BetaJS.Ids.objectId(object)][aq.cid()];
		});
	},
	
	_query: function (query) {
	}
	
});

BetaJS.Class.extend("BetaJS.Queries.ActiveQuery", [

	BetaJS.Ids.ClientIdMixin,
	{
	
	constructor: function (engine, query) {
		this._inherited(BetaJS.Queries.ActiveQuery, "constructor");
		this.__engine = engine;
		this.__query = query;
		this.__collection = new BetaJS.Collections.Collection();
		this.__collection.on("destroy", function () {
			this.destroy();
		}, this);
		engine.register(this);
	},
	
	destroy: function () {
		this.__engine.unregister(this);
		this._inherited(BetaJS.Queries.ActiveQuery, "destroy");
	},
	
	isUniform: function () {
		return BetaJS.Types.is_empty(this.query());
	},
	
	engine: function () {
		return this.__engine;
	},
	
	query: function () {
		return this.__query;
	},
	
	collection: function () {
		return this.__collection;
	},
	
	_add: function (object) {
		this.__collection.add(object);		
	},
	
	_remove: function (object) {
		this.__collection.remove(object);
	},
	
	change_query: function (query) {
		this.__engine.unregister(this);
		this.__query = query;
		this.__collection.clear();
		this.__engine.register(this);
	}
	
}]);
