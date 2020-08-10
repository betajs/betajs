# betajs 1.0.213
[![Build Status](https://api.travis-ci.org/betajs/betajs.svg?branch=master)](https://travis-ci.org/betajs/betajs)
[![Code Climate](https://codeclimate.com/github/betajs/betajs/badges/gpa.svg)](https://codeclimate.com/github/betajs/betajs)
[![NPM](https://img.shields.io/npm/v/betajs.svg?style=flat)](https://www.npmjs.com/package/betajs)
[![Gitter Chat](https://badges.gitter.im/betajs/betajs.svg)](https://gitter.im/betajs/betajs)

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
| Homepage   | [https://betajs.com](https://betajs.com) |
| Git        | [git://github.com/betajs/betajs.git](git://github.com/betajs/betajs.git) |
| Repository | [https://github.com/betajs/betajs](https://github.com/betajs/betajs) |
| Blog       | [https://blog.betajs.com](https://blog.betajs.com) | 
| Twitter    | [https://twitter.com/thebetajs](https://twitter.com/thebetajs) | 
| Gitter     | [https://gitter.im/betajs/betajs](https://gitter.im/betajs/betajs) | 



## Compatability
| Target | Versions |
| :----- | -------: |
| Firefox | 3 - Latest |
| Chrome | 18 - Latest |
| Safari | 4 - Latest |
| Opera | 12 - Latest |
| Internet Explorer | 6 - Latest |
| Edge | 12 - Latest |
| iOS | 3.0 - Latest |
| Yandex | Latest |
| Android | 4.4 - Latest |
| NodeJS | 4.0 - Latest |


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
| betajs-shims | [Open](https://github.com/betajs/betajs-shims) |


## Main Contributors

- Oliver Friedmann
- Victor Lingenthal

## License

Apache-2.0


## Credits

This software may include modified and unmodified portions of:
- Underscore, MIT Software License, (c) 2009-2013 Jeremy Ashkenas, DocumentCloud
- parseUri, MIT Software License, (c) Steven Levithan




## Sponsors

- Ziggeo
- Browserstack


