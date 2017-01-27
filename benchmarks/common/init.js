require("betajs-scoped");
var BetaJS = require(__dirname + "/../../dist/beta-noscoped.js");
Scoped.nextScope().binding("module", "global:BetaJSOld", {
	readonly : true
});
var BetaJSOld = require(__dirname + "/../../vendors/old-beta-noscoped.js");
