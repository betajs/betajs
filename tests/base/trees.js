QUnit.test("test tree query engine", function(assert) {
	
	var root = {
		name: "root",
		data: {},
		children: {},
		parent: null
	};
	
	var events = new BetaJS.Events.Events();
	
	var SimpleTree = {
		
		nodeRoot: function () {
			return root;
		},
		
		nodeId: function (node) {
			return node.name;
		},
		
		nodeParent: function (node) {
			return node.parent;
		},
		
		nodeChildren: function (node) {
			return node.children;
		},
		
		nodeWatch: function (node, func, context) {
			events.on("node:" + this.nodeId(node), func, context);
		},
		
		nodeUnwatch: function (node, func, context) {
			events.off("node:" + this.nodeId(node), func, context);
		},	
		
		nodeData: function (node) {
			return node.data;
		},
		
		nodeSetData: function (node, key, value) {
			node.data[key] = value;
			events.trigger("node:" + this.nodeId(node), "data");
		},
		
		nodeRemoveNode: function (node) {
			BetaJS.Objs.iter(node.children, this.nodeRemoveNode, this);
			events.trigger("node:" + this.nodeId(node), "remove");
			if (node.parent)
				delete node.parent.children[this.nodeId(node)];
		},
		
		nodeAddNode: function (parent, name, data) {
			var node = {
				name: parent.name + "." + name,
				data: data || {},
				children: {},
				parent: parent
			};
			node.parent.children[this.nodeId(node)] = node;
			events.trigger("node:" + this.nodeId(parent), "addChild", node);
			return node;
		}
			
	};
	
	var left = SimpleTree.nodeAddNode(root, "left", {foo: "bar"});
	var right = SimpleTree.nodeAddNode(root, "right", {bar: "baz"});
	var leftleft = SimpleTree.nodeAddNode(left, "left", {test: "tester"});
	var leftright = SimpleTree.nodeAddNode(left, "right", {other: "value"});
	
	var engine = new BetaJS.Trees.TreeQueryEngine(SimpleTree);
	var query = engine.query(root, ">>");
	
	assert.deepEqual(query.result(), [leftleft, leftright]);

	var leftmid = SimpleTree.nodeAddNode(left, "mid", {other: "value"});
	
	var cmp = function (x, y) {
		return BetaJS.Ids.objectId(x) > BetaJS.Ids.objectId(y) ? 1 : -1;
	};

	assert.deepEqual(query.result(), [leftleft, leftright, leftmid]);
	
	SimpleTree.nodeRemoveNode(leftleft);
	
	assert.deepEqual(query.result(), [leftright, leftmid]);
	
	leftleft = SimpleTree.nodeAddNode(left, "left", {test: "tester"});
	
	assert.deepEqual(query.result().sort(cmp), [leftright, leftmid, leftleft].sort(cmp));
	
	var query2 = engine.query(root, ">>[label='foobar']");
	
	assert.deepEqual(query2.result(), []);
	
	var query2x = engine.query(root, '>>[label="foobar"]');
	
	assert.deepEqual(query2x.result(), []);

	SimpleTree.nodeSetData(leftleft, "label", "foobar");
	
	assert.deepEqual(query2.result(), [leftleft]);
	
	var query3 = engine.query(leftleft, "<");
	
	assert.deepEqual(query3.result(), [left]);

	var query4 = engine.query(left, "><");
	
	assert.deepEqual(query4.result(), [left]);
	
	var query5 = engine.query(leftleft, "<+");
	
	assert.deepEqual(query5.result(), [root, left]);
});
