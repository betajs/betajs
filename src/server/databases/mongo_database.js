BetaJS.Databases.Database.extend("BetaJS.Databases.MongoDatabase", {
	
	constructor: function (db, async) {
		if (BetaJS.Types.is_string(db)) {
			this.__dbUri = db;
			this.__dbObject = this.cls.uriToObject(db);
		} else {
			db = BetaJS.Objs.extend({
				database: "database",
				server: "localhost",
				port: 27017		
			}, db);
			this.__dbObject = db;
			this.__dbUri = this.cls.objectToUri(db);
		}
		this._inherited(BetaJS.Databases.MongoDatabase, "constructor");
		this.__mongodb = null;
		this.__mongo_module = null;
		this._is_async = !!async;
	},
	
	_tableClass: function () {
		return BetaJS.Databases.MongoDatabaseTable;
	},
	
	mongo_module: function () {
		if (!this.__mongo_module)
			this.__mongo_module = require(this.isSync() ? "mongo-sync" : "mongodb");
		return this.__mongo_module;
	},
	
	mongodb: function (callbacks) {
		return this.eitherFactory("__mongodb", callbacks, function () {
			var mod = this.mongo_module();
			this.__mongo_server = new mod.Server(this.__dbObject.server + ":" + this.__dbObject.port);
			var db = this.__mongo_server.db(this.__dbObject.database);
			if (this.__dbObject.username)
				db.auth(this.__dbObject.username, this.__dbObject.password);
			return db;
		}, function () {
			var MongoClient = this.mongo_module().MongoClient;
			MongoClient.connect('mongodb://' + this.__dbUri, function(err, db) {
				if (!err) 
					callbacks.success.call(callbacks.context || this, db);
				else
					callbacks.failure.call(callbacks.context || this, err);
			});
		});
	},
	
	destroy: function () {
		if (this.__mongo_server)
			this.__mongo_server.close();
		this._inherited(BetaJS.Databases.MongoDatabase, "destroy");
	}
	
}, {
	
	uriToObject: function (uri) {
		var parsed = BetaJS.Net.Uri.parse(uri);
		return {
			database: BetaJS.Strings.strip_start(parsed.path, "/"),
			server: parsed.host,
			port: parsed.port,
			username: parsed.user,
			password: parsed.password
		};
	},
	
	objectToUri: function (object) {
		object["path"] = object["database"];
		return BetaJS.Net.Uri.build(object);
	}
	
});