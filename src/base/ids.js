/** @class */
BetaJS.Ids = {
	
	__uniqueId: 0,
	
    /** Returns a unique identifier
     * 
     * @param prefix a prefix string for the identifier (optional)
     * @return unique identifier
     */
	uniqueId: function (prefix) {
		return (prefix || "") + (this.__uniqueId++);
	},
	
    /** Returns the object's unique identifier or sets it
     * 
     * @param object the object
     * @param id (optional)
     * @return object's unique identifier
     */
	objectId: function (object, id) {
		if (typeof id != "undefined")
			object.__cid = id;
		else if (!object.__cid)
			object.__cid = this.uniqueId("cid_");
		return object.__cid;
	}
	
};