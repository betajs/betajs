
test("test context registry", function () {
	
	var registry = new BetaJS.Classes.ContextRegistry();
	var datas = [];
	var ctxs = [];
	for (var i = 0; i <= 3; ++i) {
		datas.push({
			ident: "data" + i,
			__cid: "data" + i
		});
	}
	for (var j = 0; j <= 2; ++j) {
		ctxs.push({
			ident: "ctx" + j,
			__cid: "ctx" + j
		});
	}
	
	QUnit.deepEqual(registry.register(datas[0], ctxs[0]), datas[0]);
	QUnit.deepEqual(registry.register(datas[0], ctxs[1]), null);
	QUnit.deepEqual(registry.register(datas[1], ctxs[1]), datas[1]);
	QUnit.deepEqual(registry.register(datas[1], ctxs[0]), null);
	QUnit.deepEqual(registry.register(datas[2], ctxs[2]), datas[2]);
	QUnit.deepEqual(registry.register(datas[3], ctxs[2]), datas[3]);
	QUnit.deepEqual(registry.unregister(datas[1], ctxs[0]), []);
	QUnit.deepEqual(registry.unregister(datas[1], ctxs[1]), [datas[1]]);
	QUnit.deepEqual(registry.unregister(datas[0], null), [datas[0]]);
	QUnit.deepEqual(registry.unregister(null, ctxs[2]), [datas[2], datas[3]]);
	
});