BetaJS.Lists = {};

BetaJS.Lists.AbstractList = BetaJS.Class.extend("AbstractList", {
	
	_add: function (object) {},
	_remove: function (ident) {},
	_get: function (ident) {},
	_iterate: function (callback) {},
	
	constructor: function () {
		this._inherited(BetaJS.Lists.AbstractList, "constructor");
		this.__count = 0;
	},
	
	add: function (object) {
		var ident = this._add(object);
		if (BetaJS.Types.is_defined(ident))
			this.__count++;
		return ident;
	},
	
	count: function () {
		return this.__count;
	},
	
	clear: function () {
		var self = this;
		this._iterate(function (object, ident) {
			self.remove_by_ident(ident);
			return true;
		});
	},
	
	remove_by_ident: function (ident) {
		var ret = this._remove(ident);
		if (BetaJS.Types.is_defined(ret))
			this.__count--;
		return ret;
	},
	
	getIdent: function (object) {
		var id = null;
		this._iterate(function (obj, id) {
			if (obj == object) {
				ident = id;
				return false;
			}
			return true;	
		});
		return id;
	},
	
	remove: function (object) {
		return this.remove_by_ident(this.getIdent(object));
	},
	
	remove_by_filter: function (filter) {
		var self = this;
		this._iterate(function (object, ident) {
			if (filter(object))
				self.remove_by_ident(ident);
			return true;
		});
	},
	
	get: function (ident) {
		return this._get(ident);
	},
	
	iterate: function (cb) {
		this._iterate(function (object, ident) {
			var ret = cb(object, ident);
			return BetaJS.Types.is_defined(ret) ? ret : true;
		});
	}

});

BetaJS.Lists.IdObjectList = BetaJS.Lists.AbstractList.extend("IdObjectList", {
	
	constructor: function () {
		this._inherited(BetaJS.Lists.IdObjectList, "constructor");
		this.__objects = {};
		this.__last_id = 0;
	},
	
	_add: function (object) {
		var id = this.__last_id++;
		this.__objects[id] = object;
		return id;
	},
	
	_get: function (id) {
		return this.__objects[id];
	},
	
	_remove: function (id) {
		var obj = this.__objects[id];
		delete this.__objects[id];
		return obj;
	},
	
	_iterate: function (cb) {
		for (var key in this.__objects) 
			if (!cb(this.__objects[key], key))
				return;
	}
	
});

BetaJS.Lists.LinkedList = BetaJS.Lists.AbstractList.extend("LinkedList", {
	
	constructor: function () {
		this._inherited(BetaJS.Lists.LinkedList, "constructor");
		this.__first = null;
		this.__last = null;
	},
	
	_add: function (obj) {
		this.__last = {
			obj: obj,
			prev: this.__last,
			next: null
		};
		if (this.__first)
			this.__last.prev.next = this.__last
		else
			this.__first = this.__last;
		return this.__last;
	},
	
	_remove: function (container) {
		if (container.next)
			container.next.prev = container.prev;
		else
			this.__last = container.prev;
		if (container.prev)
			container.prev.next = container.next;
		else
			this.__first = container.next;
		return container.obj;
	},
	
	_get: function (container) {
		return container.obj;
	},
	
	_iterate: function (cb) {
		var current = this.__first;
		while (current != null) {
			var prev = current;
			current = current.next;
			if (!cb(prev.obj, prev))
				return;
		}
	}
});
