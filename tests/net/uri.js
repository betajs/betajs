test("test encode uri params", function () {
	QUnit.equal(BetaJS.Net.Uri.encodeUriParams({
		foo: "bar",
		test: "tester"
	}), "foo=bar&test=tester");
	QUnit.equal(BetaJS.Net.Uri.encodeUriParams({
		foo: "Simon&Garfunkel",
		test: "tester"
	}), "foo=Simon%26Garfunkel&test=tester");
});


test("cross domain check", function () {
	QUnit.equal(BetaJS.Net.Uri.isCrossDomainUri("http://a.com/test", "http://b.com/test"), true);
	QUnit.equal(BetaJS.Net.Uri.isCrossDomainUri("http://a.com/test", "http://a.com/foobar"), false);	
	QUnit.equal(BetaJS.Net.Uri.isCrossDomainUri("http://a.com/test", "/foobar"), false);
});


test("test encode uri params nested", function () {
	QUnit.equal(BetaJS.Net.Uri.encodeUriParams({
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
