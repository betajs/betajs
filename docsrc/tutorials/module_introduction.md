
BetaJS is the module/library at the Core of the BetaJS Framework.

Almost all other modules use parts of this library (with the exception of BetaJS scoped).
If you will it is the engine roome of the Framework containing many
of the main concepts used in the Framework as well as a couple of "Helper Functions".


## Dependencies

-

## Overview of core features

BetaJS is the core component that provides several features that are used widely among all the BetaJS Frameworks.
The main concepts are:
 - Object Orientation
 - Properties
 	- Events

## Example Code

```js

	var property = new BetaJS.Properties.Properties({a: "initial value"});

	property.set("a", "second value");

	var x = property.get("a");
	// x === "second value"
	
	property.of('change:a', function(newValue, oldValue) {
		console.log('The value of a has been changed');
	});

```

