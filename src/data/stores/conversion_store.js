BetaJS.Stores.BaseStore.extend("BetaJS.Stores.ConversionStore", {
	
	constructor: function (store, options) {
		options = options || {};
		options.id_key = store._id_key;
		this._inherited(BetaJS.Stores.ConversionStore, "constructor", options);
		this.__store = store;
		this.__key_encoding = options["key_encoding"] || {};
		this.__key_decoding = options["key_decoding"] || {};
		this.__value_encoding = options["value_encoding"] || {};
		this.__value_decoding = options["value_decoding"] || {};
	},
	
	encode_object: function (obj) {
		var result = {};
		for (var key in obj)
			result[this.encode_key(key)] = this.encode_value(key, obj[key]);
		return result;
	},
	
	decode_object: function (obj) {
		var result = {};
		for (var key in obj)
			result[this.decode_key(key)] = this.decode_value(key, obj[key]);
		return result;
	},
	
	encode_key: function (key) {
		return key in this.__key_encoding ? this.__key_encoding[key] : key;
	},
	
	decode_key: function (key) {
		return key in this.__key_decoding ? this.__key_decoding[key] : key;
	},
	
	encode_value: function (key, value) {
		return key in this.__value_encoding ? this.__value_encoding[key](value) : value;
	},
	
	decode_value: function (key, value) {
		return key in this.__value_decoding ? this.__value_decoding[key](value) : value;
	},	

	_insert: function (data) {
		return this.decode_object(this.__store.insert(this.encode_object(data)));
	},
	
	_remove: function (id) {
		return this.__store.remove(this.encode_value(this._id_key, id));
	},

	_get: function (id) {
		return this.decode_object(this.__store.get(this.encode_value(this._id_key, id)));
	},
	
	_update: function (id, data) {
		return this.decode_object(this.__store.update(this.encode_value(this._id_key, id), this.encode_object(data)));
	},
	
	_query_capabilities: function () {
		return this.__store._query_capabilities();
	},
	
	_query: function (query, options) {
		var self = this;
		var result = this.__store.query(this.encode_object(query), options);
		return new BetaJS.Iterators.MappedIterator(result, function (row) {
			return self.decode_object(row);
		});
	}

});
