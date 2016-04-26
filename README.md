# betajs 1.0.51
[![Build Status](https://api.travis-ci.org/betajs/betajs.svg?branch=master)](https://travis-ci.org/betajs/betajs)
[![Code Climate](https://codeclimate.com/github/betajs/betajs/badges/gpa.svg)](https://codeclimate.com/github/betajs/betajs)


BetaJS is a general-purpose JavaScript helper module. It contains a variety of helper functions and classes.



## Getting Started


You can use the library in the browser, in your NodeJS project and compile it as well.

#### Browser

```javascript
	<script src="betajs/dist/betajs.min.js"></script>
``` 

#### NodeJS

```javascript
	var BetaJS = require('betajs/dist/beta.js');
```

#### Compile

```javascript
	git clone https://github.com/betajs/betajs.git
	npm install
	grunt
```



## Basic Usage


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



## Links
| Resource   | URL |
| :--------- | --: |
| Homepage   | [http://betajs.com](http://betajs.com) |
| Git        | [git://github.com/betajs/betajs.git](git://github.com/betajs/betajs.git) |
| Repository | [http://github.com/betajs/betajs](http://github.com/betajs/betajs) |
| Blog       | [http://blog.betajs.com](http://blog.betajs.com) | 
| Twitter    | [http://twitter.com/thebetajs](http://twitter.com/thebetajs) | 



## Compatability
| Target | Versions |
| :----- | -------: |
| Firefox | 4 - Latest |
| Chrome | 15 - Latest |
| Safari | 4 - Latest |
| Opera | 12 - Latest |
| Internet Explorer | 6 - Latest |
| Edge | 12 - Latest |
| iOS | 7.0 - Latest |
| Android | 4.0 - Latest |
| NodeJS | 0.10 - Latest |


## CDN
| Resource | URL |
| :----- | -------: |
| beta.js | [http://cdn.rawgit.com/betajs/betajs/master/dist/beta.js](http://cdn.rawgit.com/betajs/betajs/master/dist/beta.js) |
| beta.min.js | [http://cdn.rawgit.com/betajs/betajs/master/dist/beta.min.js](http://cdn.rawgit.com/betajs/betajs/master/dist/beta.min.js) |
| beta-noscoped.js | [http://cdn.rawgit.com/betajs/betajs/master/dist/beta-noscoped.js](http://cdn.rawgit.com/betajs/betajs/master/dist/beta-noscoped.js) |
| beta-noscoped.min.js | [http://cdn.rawgit.com/betajs/betajs/master/dist/beta-noscoped.min.js](http://cdn.rawgit.com/betajs/betajs/master/dist/beta-noscoped.min.js) |


## Unit Tests
| Resource | URL |
| :----- | -------: |
| Test Suite | [Run](http://rawgit.com/betajs/betajs/master/tests/tests.html) |



## Weak Dependencies
| Name | URL |
| :----- | -------: |
| betajs-scoped | [Open](https://github.com/betajs/betajs-scoped) |


## Contributors

- Oliver Friedmann
- Victor Lingenthal


## License

Apache-2.0


## Credits

This software may include modified and unmodified portions of:
- Underscore, MIT Software License, (c) 2009-2013 Jeremy Ashkenas, DocumentCloud
- parseUri, MIT Software License, (c) Steven Levithan
