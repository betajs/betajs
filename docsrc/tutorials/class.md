BetaJS adds basic object orientation with static methods, object methods, attributes, class variables,
inheritance, mixins, helper classes and more to JavaScript.

Define a class uses the following syntax
```javascript
  ChildClass = ParentClass.extend(Namespace, InstanceExtension, ClassExtension, ClassStaticExtension);
```
- ``ChildClass`` is the newly created Class object
- ``ParentClass`` is an existing Class object; in many cases, this is ``BetaJS.Class``
- ``Namespace`` an optional namespace that the class should attach to; can be ``null``; see below
- ``InstanceExtension`` a json object defining methods and attributes; see below
- ``ClassExtension`` a json object defining class methods and class variables; see below
- ``ClassStaticExtension`` a json object defining class methods and class variables not shared with child classes

Here is a basic example:
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

And here is how we would use it:
```javascript
  TestClass.staticFooBar(5);
  var first = new TestClass();
  first.y = 1;
  first.foobar(2);
  var second = new TestClass();
  second.y = 3;
  second.foobar(4);
```

Resulting in the following output:
```
  Test Class  staticFooBar  5
  Test Class Instance  fooBar  2  1
  Test Class Instance  fooBar  4  3
```

If we need inheritance by calling a parent method, we need the following extension syntax:
```javascript
  TestClass2 = TestClass.extend(null, function (inherited) {
    return {
    
        fooBar: function (x) {
          console.log("TestClass2 Instance", "fooBar", x);
          inherited.fooBar.call(this, x);
        }
        
    };
  });
```

And here is how we would use it:
```javascript
  var third = new TestClass2();
  third.y = 6;
  third.foobar(7);
```

Resulting in the following output:
```
  Test Class2 Instance  fooBar  7
  Test Class Instance  fooBar  7  6
```

In many cases, you'd want to write code that get executed upon creation of the class, as well as code for the explicit deallocation of the object. 
```javascript
  TestClass3 = TestClass2.extend(null, function (inherited) {
    return {
    
        constructor: function (y) {
          console.log("Create Object");
          inherited.constructor.call(this);
          this.y = y;
        },
        
        destroy: function () {
          console.log("Destroy Object");
          inherited.destroy.call(this);
        }
        
    };
  });
```

Here is how we would use it:
```javascript
  var fourth = new TestClass3(8);
  fourth.foobar(9);
  fourth.destroy();
```

Resulting in the following output:
```
  Create Object
  Test Class2 Instance  fooBar  9
  Test Class Instance  fooBar  9  8
  Destroy Object
```
