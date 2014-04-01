BetaJS.Class.extend("BetaJS.Databases.Database", [
	BetaJS.SyncAsync.SyncAsyncMixin, {
	
	_tableClass: function () {
		return null;
	},
	
	getTable: function (table_name) {
		var cls = this._tableClass();		
		return new cls(this, table_name);
	}
		
}]);
