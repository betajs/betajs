
A collection is a dynamic list that allows for observers to listen for change events. Every item in a collection is based on a properties instance.

Create a Collection:
```
	var collection = new BetaJS.Collections.Collection();
```

Create a Collection with Data inside:
```
	var collection = new BetaJS.Collections.Collection({
		objects: [
			{title: "This is Item 1"},
			{title: "This is Item 2"},
			{title: "This is Item 3"}
		]
	});
```

You can add, remove and access items as follows:

```
	collection.add(item);
	collection.remove(item);
	collection.getByIndex(0);
```

Item can either implement *Properties* or be a bare JSON object in which case it will be converted to a Properties instance.

It implements the Events Mixin and emits change events whenever items are added, changed or removed.
```
	collection.on("add", function (item) {
		// TODO: item has been added
	});
	
	collection.on("remove", function (item) {
		// TODO: item has been removed
	});
	
	collection.on("update", function (item, key, value) {
		// TODO: item has been updated
	});	
```
