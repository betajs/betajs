Scoped.define("module:RMI.Stub", [
                                  "module:Class",
                                  "module:Classes.InvokerMixin",
                                  "module:Functions"
                                  ], function (Class, InvokerMixin, Functions, scoped) {
	return Class.extend({scoped: scoped}, [InvokerMixin, function (inherited) {
		return {

			intf: [],

			constructor: function () {
				inherited.constructor.call(this);
				this.invoke_delegate("invoke", this.intf);
			},

			destroy: function () {
				this.invoke("_destroy");
				inherited.destroy.call(this);
			},

			invoke: function (message) {
				return this.__send(message, Functions.getArguments(arguments, 1));
			}

		};
	}]);
});


Scoped.define("module:RMI.StubSyncer", [
                                        "module:Class",
                                        "module:Classes.InvokerMixin",
                                        "module:Functions",
                                        "module:Promise"
                                        ], function (Class, InvokerMixin, Functions, Promise, scoped) {
	return Class.extend({scoped: scoped}, [InvokerMixin, function (inherited) {
		return {

			constructor: function (stub) {
				inherited.constructor.call(this);
				this.__stub = stub;
				this.__current = null;
				this.__queue = [];
				this.invoke_delegate("invoke", this.__stub.intf);
			},

			invoke: function () {
				var object = {
						args: Functions.getArguments(arguments),
						promise: Promise.create()
				};
				this.__queue.push(object);
				if (!this.__current)
					this.__next();
				return object.promise;		
			},

			__next: function () {
				if (this.__queue.length === 0)
					return;
				this.__current = this.__queue.shift();
				this.__stub.invoke.apply(this.__stub, this.__current.args).forwardCallback(this.__current.promise).callback(this.__next, this);
			}

		};
	}]);
});

