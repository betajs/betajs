test("test day format", function() {
	var t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 0});
	QUnit.equal(BetaJS.TimeFormat.format("dddd", t), "Sunday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 1});
	QUnit.equal(BetaJS.TimeFormat.format("dddd", t), "Monday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 2});
	QUnit.equal(BetaJS.TimeFormat.format("dddd", t), "Tuesday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 3});
	QUnit.equal(BetaJS.TimeFormat.format("dddd", t), "Wednesday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 4});
	QUnit.equal(BetaJS.TimeFormat.format("dddd", t), "Thursday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 5});
	QUnit.equal(BetaJS.TimeFormat.format("dddd", t), "Friday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 6});
	QUnit.equal(BetaJS.TimeFormat.format("dddd", t), "Saturday");
	
	t = 1470847573479;
	QUnit.equal(BetaJS.TimeFormat.format("dddd", t), "Wednesday");
});
