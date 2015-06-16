Scoped.define("module:Ids", function () {
	/** Id Generation
	 * @module BetaJS.Ids
	 */
	return {
	
		__uniqueId: 0,
		
	    /** Returns a unique identifier
	     * 
	     * @param prefix a prefix string for the identifier (optional)
	     * @return unique identifier
	     */
		uniqueId: function (prefix) {
			return (prefix || "") + (this.__uniqueId++);
		},
		
	    /** Returns the object's unique identifier or sets it
	     * 
	     * @param object the object
	     * @param id (optional)
	     * @return object's unique identifier
	     */
		objectId: function (object, id) {
			if (typeof id != "undefined")
				object.__cid = id;
			else if (!object.__cid)
				object.__cid = this.uniqueId("cid_");
			return object.__cid;
		}
	
	};
});


Scoped.define("module:IdGenerators.IdGenerator", ["module:Class"], function (Class, scoped) {
	return Class.extend({scoped: scoped}, {
	
		generate: function () {}
	
	});
});	


Scoped.define("module:IdGenerators.PrefixedIdGenerator", ["module:IdGenerators.IdGenerator"], function (IdGenerator, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (prefix, generator) {
				inherited.constructor.call(this);
				this.__prefix = prefix;
				this.__generator = generator;
			},
			
			generate: function () {
				return this.__prefix + this.__generator.generate();
			}
			
		};
	});
});


Scoped.define("module:Ids.RandomIdGenerator", ["module:Ids.IdGenerator", "module:Tokens"], function (IdGenerator, Tokens, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (length) {
				inherited.constructor.call(this);
				this.__length = length || 16;
			},
			
			generate: function () {
				return Tokens.generate_token(this.__length);
			}

		};
	});
});


Scoped.define("module:IdGenerators.ConsecutiveIdGenerator", ["module:IdGenerators.IdGenerator"], function (IdGenerator, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (initial) {
				inherited.constructor.call(this);
				this.__current = initial || 0;
			},
			
			generate: function () {
				this.__current++;
				return this.__current;
			}

		};
	});
});

	
Scoped.define("module:IdGenerators.TimedIdGenerator", ["module:IdGenerators.IdGenerator", "module:Time"], function (IdGenerator, Time, scoped) {
	return IdGenerator.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function () {
				inherited.constructor.call(this);
				this.__current = Time.now() - 1;
			},
			
			generate: function () {
				var now = Time.now();
				this.__current = now > this.__current ? now : (this.__current + 1); 
				return this.__current;
			}

		};
	});
});

