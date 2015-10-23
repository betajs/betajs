The ``Promise`` module has additional functionality for advanced use. We highlight some of it here.

Often, you want to transform the successful result value into something else but leave the error message alone:
```javascript
   var promise2 = promise1.mapSuccess(function (value) {
     return do-computation-with-value;
   });
```
This results in a new promise.

You can even combine two dependent promise calls this way:

```javascript
   var promise3 = promise1.mapSuccess(function (value) {
     var promise2 = call_function_that_returns_a_promise(value);
     return promise2;
   });
```
The success call of ``promise3`` then depends on the successful calls of ``promise1`` and subsequently ``promise2``.
