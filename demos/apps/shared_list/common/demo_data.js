DemoData = [];

for (var i = 0; i < 200; ++i)
	DemoData.push({text: "Demo " + i});

try {
	module.exports = DemoData;
} catch (e) {}
