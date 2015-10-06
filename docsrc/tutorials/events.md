The event system allows you to emit different events with custom event data from class instances
that other components can listen to.

Event emitters can either inherit from the *BetaJS.Events.Events* class or include the *BetaJS.Events.EventsMixin* mixin.

```
	var events = new BetaJS.Events.Events();
```

Events can be emitted by calling the *trigger* function. The first argument is the name of the event, all following arguments are custom data that is passed along.

```
	events.trigger("event_name", event_data1, event_data2);
```

Other components can listen to events by using the *on* method:

```
	events.on("event_name", function (event_arg1, event_arg2) {
		// Do something
	}, function_context);
```

The function context is optional.

Once the component is done listening for events, it can unregister by calling *off*:

```
	events.off("event_name", null, function_context);
```
