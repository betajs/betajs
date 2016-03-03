An iterator is an object that allows you to enumerate items of some list. The most commonly used iterator is based on an array:

```
	var iterator = new BetaJS.Iterators.ArrayIterator(["a", "b", "c"]);
```

An iterator instance exposes two methods: *hasNext*, telling you whether there are more elements in the iterator
that you haven't seen yet, and *next*, which returns the next element in the iterator and moves the internal
position forward.

A typical iterator use looks as follows, enumerating all items:

```
	while (iterator.hasNext()) {
		var item = iterator.next();
		// process the item
	}
```

Iterators in general do not know how many elements are in the list. If you need to know the number of elements,
you need to iterate through the whole list.

The main advantages of iterators over using arrays or objects are as follows:
- Independence of the underlying data structure: the algorithm consuming the iterator does not depend on the data being an array
- Stream-like data consumption: lazy iterators can build up the data as you move along in the iteration
- Chaining iterators to create new iterators

If you have an object instead of an array, you can create an object key iterator as follows:

```
	var iterator = new BetaJS.Iterators.ObjectKeysIterator({a: 1, b: 2, c: 3});
```

As well as a value iterator:

```
	var iterator = new BetaJS.Iterators.ObjectValuesIterator({a: 1, b: 2, c: 3});
```
