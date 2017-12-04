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

QUnit.test("test week number", function(assert) {
	var t = BetaJS.Time.updateTime(1514775600000); //2018-1-1
	assert.equal(BetaJS.TimeFormat.weekNumber(t), 1);
	t = 1483239600000; // 2017-1-2
	assert.equal(BetaJS.TimeFormat.weekNumber(t), 52);
	t = 590986800000; // 1988-9-23
	assert.equal(BetaJS.TimeFormat.weekNumber(t), 38);
});

QUnit.test("test plus day format", function(assert) {
	var t = BetaJS.Time.updateTime(1514775600000); //2018-1-1
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Monday");
	t = BetaJS.Time.updateTime(t, {day: (BetaJS.Time.timeComponentGet(t,("day")) + 1)});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Tuesday");
	t = BetaJS.Time.updateTime(1517367600000); //2018-1-31
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Wednesday");
	t = BetaJS.Time.updateTime(t, {day: (BetaJS.Time.timeComponentGet(t,("day")) + 1)});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Thursday");
	assert.equal(BetaJS.TimeFormat.format("m", t), 2);
	assert.equal(BetaJS.TimeFormat.format("d", t), 1);
});