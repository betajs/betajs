The *Objs* module includes support functions for handling javascript objects and arrays.

You can, for instance, iterate over arrays and objects as follows:

```
	BetaJS.Objs.iter({key1: "value1", key2: "value2"}, function (value, key) {
	   console.log(key, " : ", value):
	});
	// Will print:
	//   key1 : value1
	//   key2 : value2

	BetaJS.Objs.iter(["value1", "value2"], function (value, index) {
	   console.log(index, " : ", value):
	});
	// Will print:
	//   0 : value1
	//   1 : value2
	
```

You can also map all values in an array or object:

```
	var result = BetaJS.Objs.map({key1: 4, key2: 5}, function (value, key) {
	   return value * value:
	});
	// result === {key1: 16, key2: 25}

	var result = BetaJS.Objs.map([4, 5], function (value, index) {
	   return value;
	});
	// result === [16, 25]
	
```
