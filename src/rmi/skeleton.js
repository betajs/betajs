

Scoped.define("module:RMI.Skeleton", [
                                      "module:Class",
                                      "module:Objs",
                                      "module:Promise"
                                      ], function (Class, Objs, Promise, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			_stub: null,
			intf: [],
			_intf: {},
			__superIntf: ["_destroy"],

			constructor: function (options) {
				this._options = Objs.extend({
					destroyable: false
				}, options);
				inherited.constructor.call(this);
				this.intf = this.intf.concat(this.__superIntf);
				for (var i = 0; i < this.intf.length; ++i)
					this._intf[this.intf[i]] = true;
			},

			_destroy: function () {
				if (this._options.destroyable)
					this.destroy();
			},

			invoke: function (message, data) {
				if (!(this._intf[message]))
					return Promise.error(message);
				try {
					var result = this[message].apply(this, data);
					return Promise.is(result) ? result : Promise.value(result);
				} catch (e) {
					return Promise.error(e);
				}
			},

			_success: function (result) {
				return Promise.value(result);
			},

			_error: function (result) {
				return Promise.error(result);
			},

			stub: function () {
				if (this._stub)
					return this._stub;
				var stub = this.cls.classname;
				return stub.indexOf("Skeleton") >= 0 ? stub.replace("Skeleton", "Stub") : stub;
			}

		};
	});
});
