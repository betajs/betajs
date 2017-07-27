QUnit.test("test day format", function(assert) {
	var t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 0});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Sunday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 1});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Monday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 2});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Tuesday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 3});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Wednesday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 4});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Thursday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 5});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Friday");
	t = BetaJS.Time.updateTime(BetaJS.Time.now(), {weekday: 6});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Saturday");
	
	t = 1470847573479;
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Wednesday");
});
