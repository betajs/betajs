The BetaJS module contains a variety of low-level helper libraries, particularly:
- Asynchronous behaviour and Promises
- Object Orientation
- Event Handling
- Dynamic Lists and Collections
- Dynamic Properties
- Remote Method Invocation
- String Manipulation and Templating
- Binary Search Trees
- Timers and Time
- Iterators
- Uris
- State Machine and Abstract Routing

#### Properties

```js

	var properties = new BetaJS.Properties.Properties({foobar: "initial value"});

	properties.set("foobar", "second value");

	var value = properties.get("foobar");
	// value === "second value"
	
	properties.of('change:foobar', function(newValue, oldValue) {
		console.log('The value of foobar has been changed from', oldValue, 'to', newValue);
	});

```


#### Object Orientation

```javascript
  TestClass = BetaJS.Class.extend(null, {
  
    y: 0,
  
    fooBar: function (x) {
      console.log("Test Class Instance", "fooBar", x, y);
    }
    
  }, {
  
    staticFooBar: function (x) {
      console.log("Test Class", "staticFooBar", x);
    }
    
  });
```

```javascript
  TestClass.staticFooBar(5);
  var first = new TestClass();
  first.y = 1;
  first.foobar(2);
  var second = new TestClass();
  second.y = 3;
  second.foobar(4);
```

```
  Test Class  staticFooBar  5
  Test Class Instance  fooBar  2  1
  Test Class Instance  fooBar  4  3
```


#### Events


```javascript
	var events = new BetaJS.Events.Events();

	events.trigger("event_name", event_data1, event_data2);

	events.on("event_name", function (event_arg1, event_arg2) {
		// Do something
	}, function_context);

	events.off("event_name", null, function_context);
```
