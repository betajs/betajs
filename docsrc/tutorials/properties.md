
Instances of type Properties allow setting and getting of arbitrary attributes (including nested JSON).

```
	var properties = new BetaJS.Properties.Properties({
		a: "initial value"
	});
	
	properties.set("a", "second value");
	
	var x = properties.get("a");
	// x === "second value"
```

It implements the Events Mixin and emits change events whenever attributes are introduced, changed or removed.
```
	properties.on("change:a", function (value, oldValue) {
		console.log("a has been changed: ", value);
	});
	
	properties.set("a", "third value");
	// will trigger the change event
```

It supports uni-directional and bi-directional data-binding to other properties instances.

Finally, it supports computed attributes that depend on other attributes in the object. 
