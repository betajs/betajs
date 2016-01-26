Scoped.define("module:Classes.Taggable", [
    "module:Objs"
], function (Objs) {
	return {
		
		__tags: {},
		
		hasTag: function (tag) {
			return tag in this.__tags;
		},
		
		getTags: function () {
			return Objs.keys(this.__tags);
		},
		
		removeTag: function (tag) {
			delete this.__tags[tag];
			this._notify("tags-changed");
			return this;
		},
		
		removeTags: function (tags) {
			Objs.iter(tags, this.removeTag, this);
		},
		
		addTag: function (tag) {
			this.__tags[tag] = true;
			this._notify("tags-changed");
			return this;
		},
		
		addTags: function (tags) {
			Objs.iter(tags, this.addTag, this);
		},

		tagIntersect: function (tags) {
			return Objs.filter(tags, this.hasTag, this);
		}
		
	};
});


Scoped.define("module:Classes.StringTable", [
    "module:Class",
    "module:Classes.Taggable",
    "module:Functions",
    "module:Objs"
], function (Class, Taggable, Functions, Objs, scoped) {
	return Class.extend({scoped: scoped}, [Taggable, function (inherited) {
		return {
			
			_notifications: {
				"tags-changed": function () {
					this.__cache = {};
				}
			},
			
			__strings: {},
			__cache: {},
			
			__resolveKey: function (key, prefix) {
				if (prefix)
					key = prefix + "." + key;
				key = key.replace(/[^\.]+\.</g, "");
				return key;
			},
			
			__betterMatch: function (candidate, reference) {
				var c = this.tagIntersect(candidate.tags).length - this.tagIntersect(reference.tags).length;
				if (c !== 0)
					return c > 0;
				c = candidate.priority - reference.priority;
				if (c !== 0)
					return c > 0;
				c = reference.tags.length - candidate.tags.length;
				return c > 0;
			},
			
			register: function () {
				var args = Functions.matchArgs(arguments, {
					strings: true,
					prefix: "string",
					tags: "array",
					priority: "int"
				});
				Objs.iter(args.strings, function (value, key) {
					key = this.__resolveKey(key, args.prefix);
					this.__strings[key] = this.__strings[key] || [];
					this.__strings[key].push({
						value: value,
						tags: args.tags || [],
						priority: args.priority || 0
					});
					delete this.__cache[key];
				}, this);
			},
			
			get: function (key, prefix) {
				key = this.__resolveKey(key, prefix);
				if (key in this.__cache)
					return this.__cache[key];
				if (!(key in this.__strings))
					return null;
				var current = null;
				Objs.iter(this.__strings[key], function (candidate) {
					if (!current || this.__betterMatch(candidate, current))
						current = candidate;
				}, this);
				this.__cache[key] = current.value;
				return current.value;
			},
			
			all: function () {
				return Objs.map(this.__strings, function (value, key) {
					return this.get(key);
				}, this);
			}

		};
	}]);
});



Scoped.define("module:Classes.LocaleTable", [
	"module:Classes.StringTable",
	"module:Classes.LocaleMixin"
], function (StringTable, LocaleMixin, scoped) {
	return StringTable.extend({scoped: scoped}, [LocaleMixin, {

		_localeTags: function (locale) {
			if (!locale)
				return null;
			var result = [];
			result.push("language:" + locale);
			if (locale.indexOf("-") > 0)
				result.push("language:" + locale.substring(0, locale.indexOf("-")));
			return result;
		},

		_clearLocale: function () {
			this.removeTags(this._localeTags(this.getLocale()));
		},

		_setLocale: function (locale) {
			this.addTags(this._localeTags(locale));
		}
			
	}]);
});