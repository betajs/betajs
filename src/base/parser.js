Scoped.define("module:Parser.LexerException", ["module:Exceptions.Exception"], function (Exception, scoped) {
	return Exception.extend({scoped: scoped}, function (inherited) {
		return {
			constructor: function (head, tail) {
				inherited.constructor.call(this, "Lexer error: Unrecognized identifier at " + head.length + ".");
				this.__head = head;
				this.__tail = tail;
			}
		};
	});
});


Scoped.define("module:Parser.Lexer", ["module:Class", "module:Types", "module:Objs", "module:Parser.LexerException"], function (Class, Types, Objs, LexerException, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (patterns) {
				inherited.constructor.call(this);
				this.__patterns = [];
				BetaJS.Objs.iter(patterns, function (value, key) {
					this.__patterns.push({
						regex: new RegExp("^" + key, "m"),
						data: Types.is_string(value) ? {token: value} : value
					});
				}, this);
			},
			
			lex: function (source) {
				var result = [];
				var head = "";
				var tail = source;
				while (tail) {
					var match = null;
					var data = null;
					for (var i = 0; i < this.__patterns.length; ++i) {
						match = this.__patterns[i].regex.exec(tail);
						if (match) { 
							data = Objs.clone(this.__patterns[i].data, 1);
							break;
						}
					}
					if (!match)
						throw new LexerException(head, tail);
					head += match[0];
					tail = tail.substring(match[0].length);
					if (!data)
						continue;
					for (var key in data) {
						if (Types.is_string(data[key])) {
							for (var j = 0; j < match.length; ++j)
								data[key] = data[key].replace("$" + j, match[j]);
						}
					}
					result.push(data);
				}
				return result;
			}			
			
		};
	});
});

