Notifications allow you to send messages within an instance. This is particularly useful in combination with Mixins as it allows multiple methods to be executed when a certain event happens.

To trigger a notification, you call ``_notify`` within the scope of an instance method:
```javascript
    this._notify("my_internal_event", param1, param2);
```

The same instance, derived instances as well as derived instances using mixins can now listen to it as follows:
```javascript
   _notifications: {
      "my_internal_event": function (param1, param2) {
        // handler code
      }
   }
```

You can also outsource the function:
```javascript
   _notifications: {
      "my_internal_event": "internal_event_call_handler"
   },
   
   internal_event_call_handler: function (param1, param2) {
     // handler code
   }
```
