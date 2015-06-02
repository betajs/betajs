
BetaJS is a 'lightweight' Javascript Framework with several independent, combinable Frameworks
to for writing full stack web applications.

For this some parts build on other current well-established web technologies: NodesJS, JQuery and Socket.io

One of the goals of BetaJS is to be rapidly and easily deployable for demos and prototypes,
with the added benefit of being able to scale these into production ready Products/


## Overview of core features

BetaJS is the core component that provides several features that are used widely among all the BetaJS Frameworks.
The main concepts are:
 - Object Orientation
 - Properties
 	- Events

## Example Code

```js

	var property = new BetaJS.property.property({a: "initial value"});
	// x === "second value"

	property.set("a", "second value");

	var x = property.get("a");
	// x === "second value"
	
	property.on('change',function(){
		console.log('The value of property has been changed');
	});

```

