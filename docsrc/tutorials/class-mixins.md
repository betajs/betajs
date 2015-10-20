A mixin is an additional set of methods and attributes that can be mixed in while extending a class:

```javascript
  SubClass = ParentClass.extend(null, [Mixin1, Mixin2, ..., {
    // actual code of sub class
  }]);
```

A mixin itself is a simple json object:
```javascript
  Mixin1 = {
    method1: function () {...},
    attr1: "foobar"
  };
```

Instances of ``SubClass`` contain all methods and attributes from all mixins:
```javascript
    var instance = new SubClass();
    instance.method1();
    var a = instance.attr1;
```

Mixins cannot inherit from a parent class, but they can react to instance notifications, e.g.:
```javascript
  Mixin2 = {
    _notifications: {
      "construct": function () {
        // TODO
      },
      "destroy": function () {
        // TODO
      }
    }
  };
```