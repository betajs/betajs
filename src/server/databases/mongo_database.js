/* Needs to be executed within Fiber; requires Mongo-Sync. */

BetaJS.Databases.MongoDatabase = BetaJS.Databases.Database.extend("MongoDatabase", {
	
	constructor: function (mongo_sync, database_name, server, port) {
		this._inherited(BetaJS.Databases.MongoDatabase, "constructor");
		this.__server = server || "localhost";
		this.__port = port || 27017;
		this.__database_name = database_name;
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
			this.__mongo_server = new this.__mongo_sync.Server(this.__server, this.__port);
			this.__mongodb = this.__mongo_server.db(this.__database_name);
		}
		return this.__mongodb;
	},
	
	destroy: function () {
		if (this.__mongo_server)
			this.__mongo_server.close();
		this._inherited(BetaJS.Databases.MongoDatabase, "destroy");
	}
	
});