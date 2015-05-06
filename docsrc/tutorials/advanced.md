
Declaring a property and assigning new values to it

```js

	var property_a = new BetaJS.Properties.Properties();

	var x = property_a.get("value_1");
	// x === undefined

	var property_b = new BetaJS.Properties.Properties({
		value_2: "This is Value 2"
	});

	var x = property_b.get("value_2");
	// x === "This is Value 2"

	property_a.set("value_1", "Some Property Value");
	
	var x = property_a.get("value_1");
	// x === "Some Property Value"

```

Nested Properties

```js

	var property = new BetaJS.Properties.Properties();

	property.set("prop.value_a","This is value_a");

	var x = property.get("prop.value_a");
	// x === "This is value_a"

```