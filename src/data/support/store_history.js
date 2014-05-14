BetaJS.Class.extend("BetaJS.Stores.StoreHistory", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (store, options) {
		this._inherited(BetaJS.Stores.StoreHistory, "constructor");
		options = options || {};
		this._combine_update_update = options.combine_update_update || false;
		this._combine_insert_update = options.combine_insert_update || false;
		this._combine_insert_remove = options.combine_insert_remove || false;
		this._combine_update_remove = options.combine_update_remove || false;
		this._commits = {};
		this._revision_id = null;
		this._store = store;
		this._item_commits = {};
		this._store.on("insert", function (data) {
			this.__add_commit({action: "insert", id: data[this._store.id_key()], data: data});
		}, this);
		this._store.on("remove", function (id) {
			this.__add_commit({action: "remove", id: id});
		}, this);
		this._store.on("update", function (id, data) {
			this.__add_commit({action: "update", id: id, data: data});
		}, this);
	},
	
	__remove_commit: function (revision_id) {
		this.trigger("remove", this._commits[revision_id]);
		var id = this._commits[revision_id].id;
		delete this._commits[revision_id];
		delete this._item_commits[id];
		if (BetaJS.Objs.is_empty(this._item_commits[id]))
			delete this._item_commits[id];
	},
	
	__add_commit: function (object) {
		object.revision_id = this._new_revision_id();
		var has_insert = false;
		var has_update = false;
		var last_rev_id = null;
		for (var rev_id in this._item_commits[object.id]) {
			var obj = this._commits[rev_id];
			has_insert = has_insert || obj.action == "insert";
			has_update = has_update || obj.action == "update";
			last_rev_id = rev_id;
		}	
		this._revision_id = object.revision_id;
		this._commits[this._revision_id] = object;
		this._item_commits[object.id] = this._item_commits[object.id] || {};
		this._item_commits[object.id][object.revision_id] = true;
		this.trigger("commit", object);
		if (object.action == "update") {
			if ((this._combine_insert_update && !has_update && has_insert) || (this._combine_update_update && has_update)) {
				this.__remove_commit(object.revision_id);
				this._commits[last_rev_id].data = BetaJS.Objs.extend(this._commits[last_rev_id].data, object.data);
			}
		} else if (object.action == "remove") {
			for (rev_id in this._item_commits[object.id]) {
				obj = this._commits[rev_id];
				if ((has_insert && this._combine_insert_remove) || (obj.action == "update" && this._combine_update_remove))
					this.__remove_commit(rev_id);
			}
		}
	},
	
	flush: function (revision_id) {
		revision_id = revision_id || this._revision_id;
		for (var id in this._commits) {
			if (id > revision_id)
				break;
			this.__remove_commit(id);
		}
	},
	
	serialize: function (revision_id) {
		var commit = this._commits[revision_id];
		if (commin.action == "insert")
			return {
				"insert": commit.data
			};
		else if (commit.action == "remove")
			return {
				"remove": commit.id
			};
		else if (commit == "update")
			return {
				"update": BetaJS.Objs.objectBy(commit.id, commit.data) 
			};
		return null;
	},
	
	serialize_bulk: function (revision_id) {
		revision_id = revision_id || this._revision_id;
		var result = [];
		for (var id in this._commits) {
			if (id > revision_id)
				break;
			result.push(this.serialize(id));
		}
		return result;
	},
	
	revision_id: function () {
		return this._revision_id;
	},
	
	_new_revision_id: function () {
		return this.cls.__revision_id + 1;
	}
	
}], {
	
	__revision_id: 0
	
});