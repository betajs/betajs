module.exports = function (grunt, namespace) {
	return function() {
 
 	var Helper = {
		keys: function(obj) {
			var result = [];
			for (var key in obj)
				result.push(key);
			return result;
		},
		
		JS_ESCAPES: {
			"'":      "'",
			'\\':     '\\',
			'\r':     'r',
			'\n':     'n',
			'\t':     't',
			'\u2028': 'u2028',
			'\u2029': 'u2029'
		},
		
		JS_ESCAPER_REGEX: function () {
			if (!this.JS_ESCAPER_REGEX_CACHED)
				this.JS_ESCAPER_REGEX_CACHED = new RegExp(this.keys(this.JS_ESCAPES).join("|"), 'g');
			return this.JS_ESCAPER_REGEX_CACHED;
		},
		
		js_escape: function (s) {
			var self = this;
			return s.replace(this.JS_ESCAPER_REGEX(), function(match) {
				return '\\' + self.JS_ESCAPES[match];
			});
		}
 			
 	};
 	var script_regex = /<script\s+type\s*=\s*["']text\/template["']\s+id\s*=\s*["']([^"']*)["']\s*>([\w\W]*?)<\/script>/ig;
 	this.files.forEach(function(fileObj) {
	      var files = grunt.file.expand({nonull: true}, fileObj.src);
	      var src = namespace + " = " + namespace + " || {};\n";
	      src += files.map(function(filepath) {
	    	  if (!grunt.file.exists(filepath)) {
	    		  grunt.log.error('Source file "' + filepath + '" not found.');
	    		  return '';
	    	  }
	    	  var source = grunt.file.read(filepath);
	    	  source = source.replace(new RegExp('[\n\t\r]', 'g'), ' ');
	    	  var result = "";
	    	  source.replace(script_regex, function (match, id, content) {
	    		  result += namespace + "['" + id + "'] = '" + Helper.js_escape(content) + "';\n";
	    	  });
	    	  return result;
	      }).join("\n");
	      grunt.file.write(fileObj.dest, src);
	      grunt.log.writeln('File "' + fileObj.dest + '" created.');
 	});
  }};