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
	
    /** Returns the object's unique identifier
     * 
     * @param object the object
     * @return object's unique identifier
     */
	objectId: function (object) {
		if (!object.__cid)
			object.__cid = this.uniqueId("cid_");
		return object.__cid;
	}
	
};