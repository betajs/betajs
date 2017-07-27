
QUnit.test("test context registry", function (assert) {
	
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
	
	assert.deepEqual(registry.register(datas[0], ctxs[0]), datas[0]);
	assert.deepEqual(registry.register(datas[0], ctxs[1]), null);
	assert.deepEqual(registry.register(datas[1], ctxs[1]), datas[1]);
	assert.deepEqual(registry.register(datas[1], ctxs[0]), null);
	assert.deepEqual(registry.register(datas[2], ctxs[2]), datas[2]);
	assert.deepEqual(registry.register(datas[3], ctxs[2]), datas[3]);
	assert.deepEqual(registry.unregister(datas[1], ctxs[0]), []);
	assert.deepEqual(registry.unregister(datas[1], ctxs[1]), [datas[1]]);
	assert.deepEqual(registry.unregister(datas[0], null), [datas[0]]);
	assert.deepEqual(registry.unregister(null, ctxs[2]), [datas[2], datas[3]]);
	
});