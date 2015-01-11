test("test tree query engine", function() {
	
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
	
	QUnit.deepEqual(query.result(), [leftleft, leftright]);

	var leftmid = SimpleTree.nodeAddNode(left, "mid", {other: "value"});

	QUnit.deepEqual(query.result(), [leftleft, leftright, leftmid]);
	
	SimpleTree.nodeRemoveNode(leftleft);
	
	QUnit.deepEqual(query.result(), [leftright, leftmid]);
	
	var leftleft = SimpleTree.nodeAddNode(left, "left", {test: "tester"});
	
	QUnit.deepEqual(query.result(), [leftright, leftmid, leftleft]);
	
	var query2 = engine.query(root, ">>[label='foobar']");
	
	QUnit.deepEqual(query2.result(), []);
	
	SimpleTree.nodeSetData(leftleft, "label", "foobar");
	
	QUnit.deepEqual(query2.result(), [leftleft]);
	
	var query3 = engine.query(leftleft, "<");
	
	QUnit.deepEqual(query3.result(), [left]);

	var query4 = engine.query(left, "><");
	
	QUnit.deepEqual(query4.result(), [left]);
});
