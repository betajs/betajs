QUnit.test("test timezone conversion", function (assert) {
    var T = BetaJS.Time;

    var t1 = 1523708589349;
    var t2 = 1523661789349;

    var utcDelta = t1-t2;
    T.setTimezoneOffset(-120);
    var cetDelta = T.timeToTimezoneBasedDate(t1, true).getTime() - T.timeToTimezoneBasedDate(t2, true).getTime();
    T.setTimezoneOffset(240);
    var estDelta = T.timeToTimezoneBasedDate(t1, true).getTime() - T.timeToTimezoneBasedDate(t2, true).getTime();
    T.setTimezoneOffset(undefined);

    assert.equal(utcDelta, cetDelta);
    assert.equal(utcDelta, estDelta);
});

