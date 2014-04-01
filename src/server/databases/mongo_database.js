BetaJS.Databases.Database.extend("BetaJS.Databases.MongoDatabase", {
	
	constructor: function (db, options) {
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
		this.__mongodb_sync = null;
		this.__mongodb_async = null;
		this.__mongo_module_sync = null;
		this.__mongo_module_async = null;
		options = options || {};
		this._supportsAsync = "async" in options ? options.async : false;
		this._supportsSync = "sync" in options ? options.sync : !this.__supportsAsync;
	},
	
	_tableClass: function () {
		return BetaJS.Databases.MongoDatabaseTable;
	},
	
	mongo_module_sync: function () {
		if (!this.__mongo_module_sync)
			this.__mongo_module_sync = require("mongo-sync");
		return this.__mongo_module_sync;
	},

	mongo_module_async: function () {
		if (!this.__mongo_module_async)
			this.__mongo_module_async = require("mongodb");
		return this.__mongo_module_async;
	},
	
	mongodb_sync: function (callbacks) {
		return this.eitherSyncFactory("__mongodb_sync", callbacks, function () {
			var mod = this.mongo_module_sync();
			this.__mongo_server_sync = new mod.Server(this.__dbObject.server + ":" + this.__dbObject.port);
			var db = this.__mongo_server_sync.db(this.__dbObject.database);
			if (this.__dbObject.username)
				db.auth(this.__dbObject.username, this.__dbObject.password);
			return db;
		});
	},
	
	mongodb_async: function (callbacks) {
		return this.eitherFactory("__mongodb_async", callbacks, function () {
			var mod = this.mongo_module_async();
			this.__mongo_server_async = new mod.Server(this.__dbObject.server + ":" + this.__dbObject.port);
			var db = this.__mongo_server_async.db(this.__dbObject.database);
			if (this.__dbObject.username)
				db.auth(this.__dbObject.username, this.__dbObject.password);
			return db;
		}, function () {
			var MongoClient = this.mongo_module_async().MongoClient;
			MongoClient.connect('mongodb://' + this.__dbUri, function(err, db) {
				if (!err) 
					callbacks.success.call(callbacks.context || this, db);
				else
					callbacks.failure.call(callbacks.context || this, err);
			});
		});
	},

	destroy: function () {
		if (this.__mongo_server_sync)
			this.__mongo_server_sync.close();
		if (this.__mongo_server_async)
			this.__mongo_server_async.close();
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