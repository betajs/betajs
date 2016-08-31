Scoped.define("module:Ajax.AjaxException", [
    "module:Exceptions.Exception"
], function (Exception, scoped) {
	return Exception.extend({scoped: scoped});
});


Scoped.define("module:Ajax.NoCandidateAjaxException", [
	"module:Ajax.AjaxException"
], function (Exception, scoped) {
	return Exception.extend({scoped: scoped});
});


Scoped.define("module:Ajax.ReturnDataParseException", [
	"module:Ajax.AjaxException"
], function (Exception, scoped) {
   	return Exception.extend({scoped: scoped}, function (inherited) {
   		return {
   			
   			constructor: function (data, decodeType) {
   				inherited.constructor.call(this, "Could not decode data with type " + decodeType);
   				this.__decodeType = decodeType;
   				this.__data = data;
   			}
   			
   		};
   	});
});
