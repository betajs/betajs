
#### Declaring a property and assigning new values to it

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

#### Nested Properties

```js

	var property = new BetaJS.Properties.Properties();

	property.set("prop.value_a","This is value_a");

	var x = property.get("prop.value_a");
	// x === "This is value_a"

```


#### Computed Properties

Computed Properties are Properties that use other Properties as a Basis and the value
of the computed Property will be changed automatically if the Properties they are based on are changed.
This is done automatically by the Events System.

```js

	var properties = new BetaJS.Properties.Properties();

	properties.set("value1","This is value 1");
	properties.set("value2","This is value 2");

	properties.compute("computed_value", function () {
		return "The Values are: " + this.get("value1") + ", " + this.get("value2");
	},["value1"],["value2"]);
	properties.get("computed_value");
	//Will compute to: "The Values are: This is value 1, This is value 2"

	properties.set("value1","Value 1 has changed");
	properties.get("computed_value");
	//Will now compute to: "The Values are: Value 1 has changed, This is value 2"

```