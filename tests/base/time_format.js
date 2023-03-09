QUnit.module("TimeFormat", function() {
	var TimeFormat = BetaJS.TimeFormat;
	QUnit.test("formatMappings", function(assert) {
		assert.equal(TimeFormat.format("l", 1), "001", "Milliseconds 3 digits (1)");
		assert.equal(TimeFormat.format("l", 100), "100", "Milliseconds 3 digits (100)");
		assert.equal(TimeFormat.format("L", 1), "00", "Milliseconds 2 digits (1)");
		assert.equal(TimeFormat.format("L", 10), "01", "Milliseconds 2 digits (10)");
		assert.equal(TimeFormat.format("L", 100), "10", "Milliseconds 2 digits (100)");
	});
});

QUnit.test("test 0", function(assert) {
	assert.equal(BetaJS.TimeFormat.format(BetaJS.TimeFormat.ELAPSED_HOURS_MINUTES_SECONDS, 0), "0:00:00");
	assert.equal(BetaJS.TimeFormat.format(BetaJS.TimeFormat.ELAPSED_HOURS_MINUTES_SECONDS, 1000), "0:00:01");
	assert.equal(BetaJS.TimeFormat.format(BetaJS.TimeFormat.ELAPSED_MINUTES_SECONDS, 0), "0:00");
	assert.equal(BetaJS.TimeFormat.format(BetaJS.TimeFormat.ELAPSED_MINUTES_SECONDS, 1000), "0:01");
});

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
	var t = BetaJS.Time.dateToTime(new Date(2018, 0, 1)); //2018-1-1
	assert.equal(BetaJS.TimeFormat.weekNumber(t), 1);
	t = BetaJS.Time.dateToTime(new Date(2017, 0, 1)); // 2017-1-1
	assert.equal(BetaJS.TimeFormat.weekNumber(t), 52);
	t = BetaJS.Time.dateToTime(new Date(1988, 8, 23)); // 1988-9-23
	assert.equal(BetaJS.TimeFormat.weekNumber(t), 38);
});

QUnit.test("test plus day format", function(assert) {
	// Without added hour GMT+ timezones get wrong date
	var t = BetaJS.Time.dateToTime(new Date(2018, 0, 1, 6));
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Monday");
	t = BetaJS.Time.updateTime(t, {day: (BetaJS.Time.timeComponentGet(t,("day")) + 1)});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Tuesday");
	t = BetaJS.Time.dateToTime(new Date(2018, 0, 31, 6)); //2018-1-31
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Wednesday");
	t = BetaJS.Time.updateTime(t, {day: (BetaJS.Time.timeComponentGet(t,("day")) + 1)});
	assert.equal(BetaJS.TimeFormat.format("dddd", t), "Thursday");
	assert.equal(BetaJS.TimeFormat.format("m", t), 2);
	assert.equal(BetaJS.TimeFormat.format("d", t), 1);
});

QUnit.test("millisecond", function (assert) {
	assert.equal(BetaJS.TimeFormat.format("ss.l", 1234), "01.234");
    assert.equal(BetaJS.TimeFormat.format("ss.L", 1234), "01.23");
});
