module.exports = function(grunt) {

	 grunt.registerMultiTask('templates', 'Converts templates javascript', function() {
		 
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
		 	var script_regex = /<script\s+type\s*=\s*["']text\/template["']\s+id\s*=\s*["']([^"']*)["']\s*>([\w\W]*)<\/script>/ig;
		 	this.files.forEach(function(fileObj) {
			      var files = grunt.file.expand({nonull: true}, fileObj.src);
			      var namespace = "BetaJS.Templates.Cached";
			      var src = namespace + " = " + namespace + " || {};\n";
			      src += files.map(function(filepath) {
			    	  if (!grunt.file.exists(filepath)) {
			    		  grunt.log.error('Source file "' + filepath + '" not found.');
			    		  return '';
			    	  }
			    	  var source = grunt.file.read(filepath);
			    	  source = source.replace(new RegExp('[\n\t\r]', 'g'), '');
			    	  var result = "";
			    	  source.replace(script_regex, function (match, id, content) {
			    		  result += namespace + "['" + id + "'] = '" + Helper.js_escape(content) + "';";
			    	  });
			    	  return result;
			      }).join("\n");
			      grunt.file.write(fileObj.dest, src);
			      grunt.log.writeln('File "' + fileObj.dest + '" created.');
		 	});
		  });
	
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		templates: {
			dist: {
			    files: {
				      "dist/beta-ui-templates.js": [ 
							'src/views/containers/holygrail_view/template.html',
							'src/views/containers/list_container_view/template.html', 
							'src/views/controls/button_view/template.html'
						]
				}
			}
		},
		concat : {
			options : {
				banner : '/*!\n'
						+ '  <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'
						+ '  Copyright (c) Oliver Friedmann & Victor Lingenthal\n'
						+ '  MIT Software License.\n' + '*/\n'
			},
			dist_beta : {
				dest : 'dist/beta.js',
				src : [
					'src/base/base.js', 
					'src/base/types.js',
					'src/base/strings.js',
					'src/base/functions.js', 
					'src/base/objs.js',
					'src/base/ids.js', 
					'src/base/class.js',
					'src/base/classes.js', 
					'src/base/lists.js',
					'src/base/iterators.js', 
					'src/base/events.js'
				]
			},
			dist_beta_ui : {
				dest : 'dist/beta-ui.js',
				src : [
					'src/views/templates.js', 
					'src/views/template.js', 
					'src/views/views.js', 
					'dist/beta-ui-templates.js',
					
					'src/views/containers/holygrail_view/view.js',
					'src/views/containers/list_container_view/view.js', 
					'src/views/controls/button_view/view.js',
				]
			}
		},
		uglify : {
			options : {
				banner : '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>, '
						+ 'Copyright (c) Oliver Friedmann & Victor Lingenthal, '
						+ 'MIT Software License. ' + '*/'
			},
			dist : {
				files : {
					'dist/beta.min.js' : [ 'dist/beta.js' ],
					'dist/beta-ui.min.js' : [ 'dist/beta-ui.js' ]
				}
			}
		},
		sass: {
		    dist: {
		    	files: {
			        'dist/beta-ui.css': [
			            'src/views/containers/holygrail_view/styles.scss',
			        ]
		    	}
		    }
		},
		cssmin: {
			options : {
				banner : '/*!\n'
						+ '  <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'
						+ '  Copyright (c) Oliver Friedmann & Victor Lingenthal\n'
						+ '  MIT Software License.\n' + '*/\n'
			},
			dist : {
				files : {
					'dist/beta-ui.min.css' : [ 'dist/beta-ui.css' ]
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');	
	grunt.loadNpmTasks('grunt-contrib-cssmin');	
	

	grunt.registerTask('default', ['templates', 'concat', 'uglify', 'sass', 'cssmin']);

};