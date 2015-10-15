You can combine routers with state machines. State machines in general provide a richer abstraction for state spaces while routers can be thought of a string serialization and parsing system for states.


### Initialization

Initialize the router, the state machine and the binder as follows:

```javascript
    var router = new BetaJS.Router.Router();
    var host = new BetaJS.States.Host();
    var binder = new BetaJS.Router.StateRouteBinder(router, host);
``` 


### Registration

You can now register routes and state separately and connect some of them, or you bind them automatically:

```javascript
    binder.register("simple", "/simple");
    binder.register("polymorphic", "/polymorphic/(key:first|second)");
```

This results in two routes, ``/simple`` and ``/polymorphic/(key:first|second)`` in the router, saved under the route names ``simple`` and ``polymorphic``. Additionally states named ``Simple`` and ``Polymorphic`` are created within the state machine.


### Navigation

You can now perform navigation using the router:

```javascript 
    router.navigate("/simple"); 
    router.navigate("/polymorphic/second");
``` 

As well as state transitions using the state machine:

```javascript
    host.next("Simple");
    host.next("Polymorphic", {key: "first"});
``` 

Since the router and state machine are linked to each other, transitions to either one are reflected in the other.