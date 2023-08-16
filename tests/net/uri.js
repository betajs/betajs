QUnit.test("test encode uri params", function (assert) {
	assert.equal(BetaJS.Net.Uri.encodeUriParams({
		foo: "bar",
		test: "tester"
	}), "foo=bar&test=tester");
	assert.equal(BetaJS.Net.Uri.encodeUriParams({
		foo: "Simon&Garfunkel",
		test: "tester"
	}), "foo=Simon%26Garfunkel&test=tester");
});


QUnit.test("cross domain check", function (assert) {
	assert.equal(BetaJS.Net.Uri.isCrossDomainUri("http://a.com/test", "http://b.com/test"), true);
	assert.equal(BetaJS.Net.Uri.isCrossDomainUri("http://a.com/test", "http://a.com/foobar"), false);
	assert.equal(BetaJS.Net.Uri.isCrossDomainUri("http://a.com/test", "/foobar"), false);
});


QUnit.test("test encode uri params nested", function (assert) {
	assert.equal(BetaJS.Net.Uri.encodeUriParams({
	    "a": "foo",
	    "b": 5,
	    "c": {"d": "a long string"},
	    "e": {
	        "f": {
	            "g": {
	                "h": [1, 0, -2.1, 1.43]
	            }
	        },
	        "i": {
	            "j": {
	                "k": [-3.2, 3.003, 0, 0]
	            }
	        }
	    }
	}, undefined, true), "a=foo&b=5&c[d]=a%20long%20string&e[f][g][h][]=1&e[f][g][h][]=0&e[f][g][h][]=-2.1&e[f][g][h][]=1.43&e[i][j][k][]=-3.2&e[i][j][k][]=3.003&e[i][j][k][]=0&e[i][j][k][]=0");
});

QUnit.test("test normalize uri", function (assert) {
	assert.equal(BetaJS.Net.Uri.normalizeUri("http://foobar.com?b=1&a=2"), "http://foobar.com?a=2&b=1");
});


QUnit.test("test upsert uri", function (assert) {
	assert.equal(BetaJS.Net.Uri.upsertUriParams("http://foobar.com?b=1&a=2", {b:3, c:4}), "http://foobar.com?b=3&a=2&c=4");
});

QUnit.test("test upsert uri 2", function (assert) {
	assert.equal(BetaJS.Net.Uri.upsertUriParams("http://foobar.com?b=1&a=2", {b:3, c:4}, {a: 5, d: 6}), "http://foobar.com?b=3&a=2&c=4&d=6");
});