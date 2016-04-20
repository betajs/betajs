Scoped.define("module:Classes.ClassRegistry", [
    "module:Class",
    "module:Types",
    "module:Functions",
    "module:Objs"
], function (Class, Types, Functions, Objs, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (classes, lowercase) {
				inherited.constructor.call(this);
				this._classes = Types.is_array(classes) ? classes : [classes || {}];
				this._lowercase = lowercase;
			},
			
			_sanitize: function (key) {
				return this._lowercase ? key.toLowerCase() : key;
			},
			
			register: function (key, cls) {
				this._classes[this._classes.length - 1][this._sanitize(key)] = cls;
			},
			
			get: function (key) {
				if (!Types.is_string(key))
					return key;
				key = this._sanitize(key);
				for (var i = this._classes.length - 1; i >= 0; --i)
					if (key in this._classes[i])
						return this._classes[i][key];
				return null;
			},
			
			create: function (key) {
				var cons = Functions.newClassFunc(this.get(key));
				return cons.apply(this, Functions.getArguments(arguments, 1));
			},
			
			classes: function () {
				var result = {};
				Objs.iter(this._classes, function (classes) {
					result = Objs.extend(result, classes);
				});
				return result;
			}
			
		};
	});
});


Scoped.define("module:Classes.ContextRegistry", [
    "module:Class",
    "module:Ids",
    "module:Types",
    "module:Objs",
    "module:Iterators.MappedIterator",
    "module:Iterators.ObjectValuesIterator"
], function (Class, Ids, Types, Objs, MappedIterator, ObjectValuesIterator, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (serializer, serializerContext) {
				inherited.constructor.apply(this);
				this.__data = {};
				this.__contexts = {};
				this.__serializer = serializer || this.__defaultSerializer;
				this.__serializerContext = serializerContext || this;
			},
			
			__defaultSerializer: function (data) {
				return Types.is_object(data) ? Ids.objectId(data) : data;
			},
			
			_serializeContext: function (ctx) {
				return ctx ? Ids.objectId(ctx) : null;
			},
			
			_serializeData: function (data) {
				return this.__serializer.call(this.__serializerContext, data);
			},
			
			get: function (data) {
				var serializedData = this._serializeData(data);
				return this.__data[serializedData];
			},
			
			/*
			 * Registers data with respect to an optional context
			 *
			 * @param data - data (mandatory)
			 * @param context - context (optional)
			 * 
			 * @return data if data was not registered before, null otherwise
			 * 
			 */
			register: function (data, context) {
				var serializedData = this._serializeData(data);
				var serializedCtx = this._serializeContext(context);
				var result = false;
				if (!(serializedData in this.__data)) {
					this.__data[serializedData] = {
						data: data,
						contexts: {}
					};
					result = true;
				}
				if (!(serializedCtx in this.__contexts)) {
					this.__contexts[serializedCtx] = {
						context: context,
						datas: {}
					};
				}
				this.__data[serializedData].contexts[serializedCtx] = true;
				this.__contexts[serializedCtx].datas[serializedData] = true;
				return result ? this.__data[serializedData].data : null;
			},
			
			/*
			 * Unregisters data with respect to a context.
			 * If no data is given, all data with respect to the context is unregistered.
			 * If no context is given, all context with respect to the data are unregistered.
			 * If nothing is given, everything is unregistered.
			 * 
			 * @param data - data (optional)
			 * @param context - context (optional)
			 * 
			 * @result unregistered data in an array
			 */
			
			unregister: function (data, context) {
				var result = [];
				if (data) {
					var serializedData = this.__serializer.call(this.__serializerContext, data);
					if (this.__data[serializedData]) {
						if (context) {
							var serializedCtx = this._serializeContext(context);
							if (this.__contexts[serializedCtx]) {
								delete this.__contexts[serializedCtx].datas[serializedData];
								if (Types.is_empty(this.__contexts[serializedCtx].datas))
									delete this.__contexts[serializedCtx];
							}
							delete this.__data[serializedData].contexts[serializedCtx];
							if (Types.is_empty(this.__data[serializedData].contexts)) {
								result.push(this.__data[serializedData].data);
								delete this.__data[serializedData];
							}
						} else {
							Objs.iter(this.__data[serializedData].contexts, function (dummy, serializedCtx) {
								if (this.__contexts[serializedCtx]) {
									delete this.__contexts[serializedCtx].datas[serializedData];
									if (Types.is_empty(this.__contexts[serializedCtx].datas))
										delete this.__contexts[serializedCtx];
								}
							}, this);
							result.push(this.__data[serializedData].data);
							delete this.__data[serializedData];
						}
					}
				} else if (context) {
					var serializedCtx2 = this._serializeContext(context);
					if (this.__contexts[serializedCtx2]) {
						Objs.iter(this.__contexts[serializedCtx2].datas, function (dummy, serializedData) {
							if (this.__data[serializedData]) {
								delete this.__data[serializedData].contexts[serializedCtx2];
								if (Types.is_empty(this.__data[serializedData].contexts)) {
									result.push(this.__data[serializedData].data);
									delete this.__data[serializedData];
								}
							}
						}, this);
						delete this.__contexts[serializedCtx2];
					}
				} else {
					Objs.iter(this.__data, function (data) {
						result.push(data.data);
					}, this);
					this.__data = {};
					this.__contexts = [];
				}
				return result;
			},
			
			customIterator: function () {
				return new ObjectValuesIterator(this.__data);
			},
			
			iterator: function () {
				return new MappedIterator(this.customIterator(), function (item) {
					return item.data;
				});
			}

		};
	});
});
