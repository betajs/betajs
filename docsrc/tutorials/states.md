The system includes an abstract state machine that can be used for internal business logic as well as in combination with the router.

A state machine consists of a ``state machine host`` instance which holds the ``current state`` instance. States itself are defined by subclassing the ``abstract state class``.

To initialize a state machine, simply call:
```javascript
   var host = new BetaJS.States.Host();
```

There are different ways to define new states. An adhoc way, if the state machine is used as a singleton, is as follows:
```javascript
    host.register("A", {});
```
which registers a new state ``A``.

A more general way is by directly subclassing it:
```javascript
    var S = BetaJS.States.State.extend("BetaJS.Test.S");
    var A = S.extend("BetaJS.Test.A");
    var B = S.extend("BetaJS.Test.B");
```

After setting up the state machine, we start with an initial state:
```javascript
   host.initialize("A");
```

The current state can now be accessed via ``host.state()``.

To transition to the next state, we simply call ``host.state().next("B")``.
