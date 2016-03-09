
Given a collection, you might want to derive one (or many) subcollections that filter the content of the base collection.

```
	var collection = new BetaJS.Collections.Collection();
```

You can then define the filtered collection as follows:

```
	var filtered_collection = new BetaJS.Collections.FilteredCollection(collection, function (item) {
		// return true if item should be contained in this collection.
	}, optional_context);
```

The filtered collection updates automatically when the parent collection is updated, and vice versa.

#### Example:

```
	var collection = new BetaJS.Collections.Collection(
		{
			item1: {
				string: "This is Item 1",
				value: 1
			}
			item2: {
				string: "This is Item 2",
				value: 2
			}
			item3: {
				string: "This is Item 3",
				value: 3
			}
		}
	);

	var filtered_collection = new BetaJS.Collections.FilteredCollection(collection, function (item) {
		return item.get("value") === 2;
		// The new collection will only contain item2 from the collection above.
		// i.e. filtered_collection.count() == 1
	}, optional_context);

	// However if you now add an item to the original collection that has also a value of 2, it will also be in the filtered collection, i.e.:
	collection.add({
		string : "This is a fourth Item also with value 2",
		value : 2
	})
	// i.e. filtered_collection.count() == 2

```
