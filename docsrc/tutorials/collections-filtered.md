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