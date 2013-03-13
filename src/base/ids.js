BetaJS.Ids = {
	
	__uniqueId: 0,
	
	uniqueId: function (prefix) {
		return (prefix || "") + (this.__uniqueId++);
	}
	
}

BetaJS.Ids.ClientIdMixin = {
	
	cid: function () {
		if (!this.__cid)
			this.__cid = BetaJS.Ids.uniqueId("cid_");
		return this.__cid;
	}
	
}
