Scoped.binding("module", "global:BetaJS");

Scoped.define("global:BetaJS", function () {
	return {};
});

Scoped.require(["global:BetaJS"], function (mod) {
	Scoped.exports(mod);
});
