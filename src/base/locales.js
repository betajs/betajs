Scoped.define("module:Locales", function () {
	return {
		
		__data: {},
		
		language: null,
		
		get: function (key) {
		    if (this.language && (this.language + "." + key) in this.__data)
		        return this.__data[this.language + "." + key];
			return key in this.__data ? this.__data[key] : key;
		},
		
		register: function (strings, prefix) {
			prefix = prefix ? prefix + "." : "";
			for (var key in strings)
				this.__data[prefix + key] = strings[key];
		},
		
		view: function (base) {
			return {
				context: this,
				prefix: base,
				get: function (key) {
					return this.context.get(this.prefix + "." + key);
				},
				view: function (key) {
					return this.context.view(this.prefix + "." + key);
				},
				register: function (strings, prefix) {
					this.context.register(strings, this.prefix + (prefix ? "." + prefix : ""));
				}
			};
		}
		
	};
	
});	