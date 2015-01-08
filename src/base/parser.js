BetaJS.Class.extend("BetaJS.Parser.Lexer", {
	
	constructor: function (patterns) {
		this._inherited(BetaJS.Parser.Lexer, "constructor");
		this.__patterns = [];
		BetaJS.Objs.iter(patterns, function (value, key) {
			this.__patterns.push({
				regex: new RegExp("^" + key, "m"),
				data: BetaJS.Types.is_string(value) ? {token: value} : value
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
					data = BetaJS.Objs.clone(this.__patterns[i].data, 1);
					break;
				}
			}
			if (!match)
				throw new BetaJS.Parser.LexerException(head, tail);
			head += match[0];
			tail = tail.substring(match[0].length);
			if (!data)
				continue;
			for (var key in data) {
				if (BetaJS.Types.is_string(data[key])) {
					for (var j = 0; j < match.length; ++j)
						data[key] = data[key].replace("$" + j, match[j]);
				}
			}
			result.push(data);
		}
		return result;
	}
	
});

BetaJS.Exceptions.Exception.extend("BetaJS.Parser.LexerException", {
	
	constructor: function (head, tail) {
		this._inherited(BetaJS.Parser.LexerException, "constructor", "Lexer error: Unrecognized identifier at " + head.length + ".");
		this.__head = head;
		this.__tail = tail;
	}
	
});
