A ``promise`` is an abstraction for handling asynchronous callbacks. It allows you to disconnect the handling of an asynchronous event from the emitter.

Normally, you'd write a function that requires an asynchronous callback as follows:
```javascript
   function emitter(callback) {
      // some code that ends up calling callback()
   }
```

You would consume it as follows:
```javascript
   emitter(function (...) {
     // some code that should be called in the callback
   });
```

Promises try to disconnect this as follows:
```javascript
   function emitter() {
      var promise = BetaJS.Promise.create();
      // some code that ends up calling promise.asyncSuccess();
      return promise;
   }
```

You would consume it as follows:
```javascript
   var promise = emitter();
   // do some other stuff
   promise.success(function (...) {
     // some code that should be called in the callback
   });
```

Now the handling of the event is disconnected from the emitting part.


## Emitting Promises

Emitting promises is easy, and requires three steps:
- Create a promise instance: ``var promise = BetaJS.Promise.create();``
- Return the promise instance in the end: ``return promise;``
- Call the asynchronous success and error handlers for callbacks: ``promise.asyncSuccess(value)`` and ``promise.asyncError(error)`


## Handling Promises

Once you receive a promise from an emitter, you can react to both ``success`` and ``error`` callbacks:
```javascript
   var promise = emitter();
  
   promise.success(function (value) {
     // code
   });

   promise.error(function (error) {
     // code
   });
```
