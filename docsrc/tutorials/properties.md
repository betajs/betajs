Instances of type Properties allow setting and getting of arbitrary attributes (even nested JSON).

```
	var properties = new BetaJS.Properties.Properties({
		a: "initial value"
	});
	
	properties.set("a", "other value");
	
	var x = properties.get("a");
	// x === "other value"
```

It implements the Events Mixin and emits change events whenever attributes are introduced, changed or removed.
```
	properties.on("change:a", function (value) {
		console.log("a has been changed: ", value);
	});
	
	properties.set("a", "even other value");
	// will fire the change event
```

It supports uni-directional and bi-directional data-binding to other properties instances.

Finally, it supports computed attributes that depend on other attributes in the object. 
