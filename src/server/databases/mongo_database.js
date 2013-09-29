/* Needs to be executed within Fiber; requires Mongo-Sync. */

BetaJS.Databases.Database.extend("BetaJS.Databases.MongoDatabase", {
	
	constructor: function (mongo_sync, options) {
		this.__options = BetaJS.Objs.extend({
			database: "database",
			server: "localhost",
			port: 27017		
		}, options || {});
		this._inherited(BetaJS.Databases.MongoDatabase, "constructor");
		this.__mongodb = null;
		this.__mongo_sync = mongo_sync;
	},

	_tableClass: function () {
		return BetaJS.Databases.MongoDatabaseTable;
	},
	
	mongo_sync: function () {
		return this.__mongo_sync;
	},
	
	mongodb: function () {
		if (!this.__mongodb) {
			this.__mongo_server = new this.__mongo_sync.Server(this.__options.server + ":" + this.__options.port);
			this.__mongodb = this.__mongo_server.db(this.__options.database);
			if (this.__options.username)
				this.__mongodb.auth(this.__options.username, this.__options.password);
		}
		return this.__mongodb;
	},
	
	destroy: function () {
		if (this.__mongo_server)
			this.__mongo_server.close();
		this._inherited(BetaJS.Databases.MongoDatabase, "destroy");
	}
	
});