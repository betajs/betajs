/*
 * Inspired by Underscore's Templating Engine
 * (which itself is inspired by John Resig's implementation)
 */

Scoped.define("module:Templates", ["module:Types", "module:Strings"], function(Types, Strings) {
    /**
     * A very simple templating engine.
     *
     * @module BetaJS.Templates
     */
    return {

        /**
         * Tokenizes a string comprised of escaped javascript code and normal text.
         * 
         * @param {string} s input string
         *
         * @return {array} array of token objects
         */
        tokenize: function(s) {
            // Already tokenized?
            if (Types.is_array(s))
                return s;
            var tokens = [];
            var index = 0;
            var self = this;
            s.replace(self.SYNTAX_REGEX(), function(match, expr, esc, code, offset) {
                if (index < offset)
                    tokens.push({
                        type: self.TOKEN_STRING,
                        data: Strings.js_escape(s.slice(index, offset))
                    });
                if (code)
                    tokens.push({
                        type: self.TOKEN_CODE,
                        data: code
                    });
                if (expr)
                    tokens.push({
                        type: self.TOKEN_EXPR,
                        data: expr
                    });
                if (esc)
                    tokens.push({
                        type: self.TOKEN_ESC,
                        data: esc
                    });
                index = offset + match.length;
                return match;
            });
            return tokens;
        },

        /**
         * Compiles a template string into a function that evaluates the template w.r.t. a given environment.
         * 
         * @param {string} s input string
         * @param {object} options options hash, allowing to specify start_index and end_index within the input string (optional)
         * @return {function} evaluation function
         */
        compile: function(source, options) {
            if (Types.is_string(source))
                source = this.tokenize(source);
            options = options || {};
            var start_index = options.start_index || 0;
            var end_index = options.end_index || source.length;
            var result = "__p+='";
            for (var i = start_index; i < end_index; ++i) {
                switch (source[i].type) {
                    case this.TOKEN_STRING:
                        result += source[i].data;
                        break;
                    case this.TOKEN_CODE:
                        result += "';\n" + source[i].data + "\n__p+='";
                        break;
                    case this.TOKEN_EXPR:
                        result += "'+\n((__t=(" + source[i].data + "))==null?'':__t)+\n'";
                        break;
                    case this.TOKEN_ESC:
                        result += "'+\n((__t=(" + source[i].data + "))==null?'':Helpers.Strings.htmlentities(__t))+\n'";
                        break;
                    default:
                        break;
                }
            }
            result += "';\n";
            result = 'with(obj||{}){\n' + result + '}\n';
            result = "var __t,__p='',__j=Array.prototype.join," +
                "echo=function(){__p+=__j.call(arguments,'');};\n" +
                result + "return __p;\n";
            /*jslint evil: true */
            var func = new Function('obj', 'Helpers', result);
            var func_call = function(data) {
                return func.call(this, data, {
                    Strings: Strings
                });
            };
            func_call.source = 'function(obj, Helpers){\n' + result + '}';
            return func_call;
        },

        SYNTAX: {
            OPEN: "{%",
            CLOSE: "%}",
            MODIFIER_CODE: "",
            MODIFIER_EXPR: "=",
            MODIFIER_ESC: "-"
        },

        SYNTAX_REGEX: function() {
            var syntax = this.SYNTAX;
            if (!this.SYNTAX_REGEX_CACHED) {
                this.SYNTAX_REGEX_CACHED = new RegExp(
                    syntax.OPEN + syntax.MODIFIER_EXPR + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
                    syntax.OPEN + syntax.MODIFIER_ESC + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
                    syntax.OPEN + syntax.MODIFIER_CODE + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
                    "$",
                    'g');
            }
            return this.SYNTAX_REGEX_CACHED;
        },

        TOKEN_STRING: 1,
        TOKEN_CODE: 2,
        TOKEN_EXPR: 3,
        TOKEN_ESC: 4

    };
});


Scoped.define("module:Templates.Template", ["module:Class", "module:Templates"], function(Class, Templates, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(template_string) {
                inherited.constructor.call(this);
                this.__tokens = Templates.tokenize(template_string);
                this.__compiled = Templates.compile(this.__tokens);
            },

            evaluate: function(obj) {
                return this.__compiled.apply(this, [obj]);
            }

        };
    });
});