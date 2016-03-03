In some cases, you want to perform certain transformations on a list before actually processing it. Such transformations
include filtering items, sorting the list, skipping items and limiting the number of items. You might even want to
combine some of these transformations.

Iterators can be chained in the following sense: given an iterator, you can automatically create a new iterator based on
it while performing a transformation on it.

For the sake of this paragraph, assume that we already have an iterator object called *baseIterator* (which could be an ArrayIterator).

For filtering items, you can use the *FilteredIterator*:  

```
	var iterator = new BetaJS.Iterators.FilteredIterator(baseIterator, function (item) {
		// return true if item should be contained in iterator 
	}, this);
```

For sorting items, you can use the *SortedIterator*:

```
	var iterator = new BetaJS.Iterators.SortedIterator(baseIterator, function (item1, item2) {
		// return 1 if item1 > item2, -1 if item1 < item2 and 0 if item1 == item2 
	});
```

For skipping e.g. 10 items, you can use the *SkipIterator*:

```
	var iterator = new BetaJS.Iterators.SkipIterator(baseIterator, 10);
```

For limiting the result to e.g. 50 items, you can use the *LimitIterator*:

```
	var iterator = new BetaJS.Iterators.SkipIterator(baseIterator, 50);
```

You can also combine these iterators to, e.g. skip 10 items and return 50:

```
	var iterator = new BetaJS.Iterators.LimitIterator(new BetaJS.Iterators.SkipIterator(baseIterator, 10), 50);
```

