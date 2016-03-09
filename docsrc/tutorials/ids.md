The BetaJS system has a small library for generating unique IDs. This can be used for all kinds of purposes, but primarily for uniquely identifiying objects.

Since JavaScript has no notion of using pointers (to objects) as keys in hashes, it is impossible to save an identifier to an object without artificial ids.

Unique ids can be generated as follows:
```javascript
    var id = BetaJS.Ids.uniqueId(); // e.g. "123"
    var idx = BetaJS.Ids.unqueId("prefix"); // e.g. "prefix123"
```

Given an object, we can read (if already set) or set and read its unique id as follows:
```javascript
   var obj = {...};
   var id = BetaJS.Objs.objectId(obj);
```

Note that ``objectId`` creates a new attribute within ``obj`` called cid.


### Id Generators

There is also a collection of different id generating classes that you can use for specific use cases:
- ``IdGenerator``: Abstract Id Generator class
- ``PrefixedIdGenerator``: Takes a given generator and prefixes it with a string
- ``RandomIdGenerator``: Generates ids randomly; no collision test.
- ``ConsecutiveIdGenerator``: Generates ids in a consecutive fashion using ints.
- ``TimedIdGenerator``: Uses the current time as ids in a unique fashion.

Generators can be used as follows:
```javascript
    var generator = new TimedIdGenerator();
    var id = generator.generate();
```