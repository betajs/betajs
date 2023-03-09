QUnit.module("Strings", function() {
    var Strings = BetaJS.Strings;
    QUnit.test(".padZeros", function(assert) {
        assert.equal(Strings.padZeros("A", 3), "00A", "should pad left with zeroes");
    });
    QUnit.test(".padLeft", function(assert) {
        assert.equal(Strings.padLeft("A", "b", 3), "bbA", "should pad left");
    });
    QUnit.test(".padRight", function(assert) {
        assert.equal(Strings.padRight("A", "b", 3), "Abb", "should pad right");
    });
});

QUnit.test("test strings format method", function(assert) {
  assert.equal(
    BetaJS.Strings.format("{0} formatted, and {1} formatted! Also no format {2}", "First", "Second"),
    "First formatted, and Second formatted! Also no format {2}"
  );

  assert.equal(
    BetaJS.Strings.format("{0} + {1} = {2} to: {3}", 1, 3, "equal", 4),
    "1 + 3 = equal to: 4"
  );
});

QUnit.test("test nl2br", function(assert) {
	assert.ok(BetaJS.Strings.nl2br("abc\ndef\ngeh") == "abc<br />\ndef<br />\ngeh");
});

QUnit.test("test strip end", function(assert) {
    assert.ok(BetaJS.Strings.strip_end("/foo/bar", "/"), "/foo/bar");
    assert.ok(BetaJS.Strings.strip_end("/foo/bar/", "/"), "/foo/bar");
});

QUnit.test("test htmlentities", function(assert) {
	assert.ok(BetaJS.Strings.htmlentities("<test>") == "&lt;test&gt;");
});

QUnit.test("test email", function(assert) {
	assert.equal(BetaJS.Strings.email_get_email("tester <test@test.com>"), "test@test.com");
	assert.equal(BetaJS.Strings.email_get_email("tester foobar <test@test.com>"), "test@test.com");
	assert.equal(BetaJS.Strings.email_get_email("test@test.com"), "test@test.com");
	assert.equal(BetaJS.Strings.email_get_name("tester <test@test.com>"), "Tester");
	assert.equal(BetaJS.Strings.email_get_name("tester foobar <test@test.com>"), "Tester Foobar");
	assert.equal(BetaJS.Strings.email_get_name("test@test.com"), "Test");
	assert.equal(BetaJS.Strings.email_get_name("test.abc@test.com"), "Test Abc");
});


QUnit.test("named capture groups", function (assert) {
	var regex = "/abc/(def)/geh/(test:ijk)/lmn/(opq)/(foobar:\\d+)";
	var capture = BetaJS.Strings.namedCaptureRegex(regex);
	var test = "/abc/def/geh/ijk/lmn/opq/123";
	assert.deepEqual(capture.exec(test), {test: "ijk", foobar: "123"});
	var back = capture.mapBack({test: "ijk", foobar:"456"});
	var str = BetaJS.Strings.regexReplaceGroups(regex, back);
	assert.equal(str, "/abc/def/geh/ijk/lmn/opq/456");
});

QUnit.test("pascal case", function (assert) {
	assert.equal(BetaJS.Strings.pascalCase("pascalCase"), "PascalCase");
    assert.equal(BetaJS.Strings.pascalCase("PascalCase"), "PascalCase");
    assert.equal(BetaJS.Strings.pascalCase("pascal_case"), "PascalCase");
    assert.equal(BetaJS.Strings.pascalCase("pascal-case"), "PascalCase");
    assert.equal(BetaJS.Strings.pascalCase("pascal case"), "PascalCase");
    assert.equal(BetaJS.Strings.pascalCase("PASCAL_CASE"), "PascalCase");
    assert.equal(BetaJS.Strings.pascalCase("PASCAL-CASE"), "PascalCase");
    assert.equal(BetaJS.Strings.pascalCase("PASCAL CASE"), "PascalCase");
});

QUnit.test("camel case", function (assert) {
    assert.equal(BetaJS.Strings.camelCase("camelCase"), "camelCase");
    assert.equal(BetaJS.Strings.camelCase("CamelCase"), "camelCase");
    assert.equal(BetaJS.Strings.camelCase("camel_case"), "camelCase");
    assert.equal(BetaJS.Strings.camelCase("camel-case"), "camelCase");
    assert.equal(BetaJS.Strings.camelCase("camel case"), "camelCase");
    assert.equal(BetaJS.Strings.camelCase("CAMEL_CASE"), "camelCase");
    assert.equal(BetaJS.Strings.camelCase("CAMEL-CASE"), "camelCase");
    assert.equal(BetaJS.Strings.camelCase("CAMEL CASE"), "camelCase");
});

QUnit.test("snake case", function (assert) {
    assert.equal(BetaJS.Strings.snakeCase("snakeCase"), "snake_case");
    assert.equal(BetaJS.Strings.snakeCase("SnakeCase"), "snake_case");
    assert.equal(BetaJS.Strings.snakeCase("snake_case"), "snake_case");
    assert.equal(BetaJS.Strings.snakeCase("snake-case"), "snake_case");
    assert.equal(BetaJS.Strings.snakeCase("snake case"), "snake_case");
    assert.equal(BetaJS.Strings.snakeCase("SNAKE_CASE"), "snake_case");
    assert.equal(BetaJS.Strings.snakeCase("SNAKE-CASE"), "snake_case");
    assert.equal(BetaJS.Strings.snakeCase("SNAKE CASE"), "snake_case");
});

QUnit.test("kebab case", function (assert) {
    assert.equal(BetaJS.Strings.kebabCase("kebabCase"), "kebab-case");
    assert.equal(BetaJS.Strings.kebabCase("KebabCase"), "kebab-case");
    assert.equal(BetaJS.Strings.kebabCase("kebab_case"), "kebab-case");
    assert.equal(BetaJS.Strings.kebabCase("kebab-case"), "kebab-case");
    assert.equal(BetaJS.Strings.kebabCase("kebab case"), "kebab-case");
    assert.equal(BetaJS.Strings.kebabCase("KEBAB_CASE"), "kebab-case");
    assert.equal(BetaJS.Strings.kebabCase("KEBAB-CASE"), "kebab-case");
    assert.equal(BetaJS.Strings.kebabCase("KEBAB CASE"), "kebab-case");
});

QUnit.test("train case", function (assert) {
    assert.equal(BetaJS.Strings.trainCase("trainCase"), "Train-Case");
    assert.equal(BetaJS.Strings.trainCase("TrainCase"), "Train-Case");
    assert.equal(BetaJS.Strings.trainCase("train_case"), "Train-Case");
    assert.equal(BetaJS.Strings.trainCase("train-case"), "Train-Case");
    assert.equal(BetaJS.Strings.trainCase("train case"), "Train-Case");
    assert.equal(BetaJS.Strings.trainCase("TRAIN_CASE"), "Train-Case");
    assert.equal(BetaJS.Strings.trainCase("TRAIN-CASE"), "Train-Case");
    assert.equal(BetaJS.Strings.trainCase("TRAIN CASE"), "Train-Case");
});

QUnit.test("asterisk pattern escape", function (assert) {
    var pattern = BetaJS.Strings.asteriskPatternToRegex("Foo*Bar");
    assert.equal(pattern, "Foo.*Bar");
    var r = new RegExp("^" + pattern + "$", "g");
    assert.equal(!!("FooBar".match(r)), true);
    assert.equal(!!("Foo Baz Bar".match(r)), true);
    assert.equal(!!("Foo Bar Baz".match(r)), false);
});

QUnit.test("normalize search text", function (assert) {
    assert.equal(BetaJS.Strings.normalizeSearchText("Foo\nBar"), "Foo Bar");
    assert.equal(BetaJS.Strings.normalizeSearchText("Question"), "Question");
});

QUnit.test("insert string", function(assert) {
    assert.equal(BetaJS.Strings.insert("ello, world!", 0, "H"), "Hello, world!", "should work with index");
    assert.equal(BetaJS.Strings.insert("Hello world!", 5, ","), "Hello, world!", "should work with index");
    assert.equal(BetaJS.Strings.insert("Hello world!", "Hello", ","), "Hello, world!", "should work with string");
    assert.equal(BetaJS.Strings.insert("<div></div><div itemscope></div>", /<div\s*itemscope[^>]*>/, "Hello, world!"), "<div></div><div itemscope>Hello, world!</div>", "should work with regex");
    assert.equal(BetaJS.Strings.insert("Hello world!", "Hi!", ","), "Hello world!", "should return original str if no match");
    assert.equal(BetaJS.Strings.insert("<div></div><div></div>", /<div\s*itemscope[^>]*>/, "Hello, world!"), "<div></div><div></div>", "should return original str if no match");
});
