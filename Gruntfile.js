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
		 	var script_regex = /<script\s+type\s*=\s*["']text\/template["']\s+id\s*=\s*["']([^"']*)["']\s*>([\w\W]*?)<\/script>/ig;
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
		  });
	
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		templates: {
			dist: {
			    files: {
				      "dist/beta-ui-templates.js": [ 
							'src/views/containers/holygrail_view/template.html',
							'src/views/containers/list_container_view/template.html',
							'src/views/containers/switch_container_view/template.html',
							 
							'src/views/controls/button_view/icon_button_view/template.html',
							'src/views/controls/button_view/template.html',
							'src/views/controls/check_box_view/template.html',
							'src/views/controls/input_view/template.html',
							'src/views/controls/label_view/template.html',
							'src/views/controls/link_view/template.html',
							'src/views/controls/textarea_view/template.html',
							'src/views/controls/textview_view/template.html',
							'src/views/controls/progress_view/template.html',
							
							'src/views/lists/list_view/template.html',

							'src/views/overlays/overlay_view/template.html',
							'src/views/overlays/fullscreen_overlay_view/template.html',
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
			dist_beta_base : {
				dest : 'dist/beta-base.js',
				src : [
					'src/base/base.js', 
					'src/base/types.js',
					'src/base/strings.js',
					'src/base/functions.js',
					'src/base/scopes.js', 
					'src/base/objs.js',
					'src/base/ids.js', 
					'src/base/class.js',
					'src/base/exceptions.js',
					'src/base/lists.js',
					'src/base/iterators.js', 
					'src/base/events.js',
					'src/base/classes.js',
					'src/base/properties.js',
					'src/base/collections.js',
					'src/base/comparators.js',
					'src/base/sort.js',
					'src/base/tokens.js',
					'src/base/locales.js',
					'src/base/time.js',
					'src/base/timers.js',
					'src/net/uri.js',
				]
			},
			dist_beta_data : {
				dest : 'dist/beta-data.js',
				src : [
					'src/net/ajax.js',
					'src/data/queries/queries.js', 
					'src/data/queries/constrained_queries.js', 
					'src/data/queries/query_collection.js',
					'src/data/queries/active_queries.js',
					'src/data/stores/base_store.js',
					'src/data/stores/stores_monitor.js',
					'src/data/stores/assoc_store.js',
					'src/data/stores/memory_store.js',
					'src/data/stores/dumb_store.js',
					'src/data/stores/assoc_dumb_store.js',
					'src/data/stores/local_store.js',
					'src/data/stores/dual_store.js',
					'src/data/stores/cached_stores.js',
					'src/data/stores/remote_store.js',
					'src/data/stores/conversion_store.js',
					'src/data/stores/passthrough_store.js',
					'src/data/stores/write_queue_store.js',
				]
			},
			dist_beta_models : {
				dest : 'dist/beta-models.js',
				src : [
					'src/net/http_header.js',
					'src/modelling/properties.js',
					'src/modelling/models.js',
					'src/modelling/tables.js',
					'src/modelling/associations/associations.js', 
					'src/modelling/associations/table_associations.js', 
					'src/modelling/associations/has_many_associations.js', 
					'src/modelling/associations/has_many_through_array_associations.js', 
					'src/modelling/associations/has_one_associations.js', 
					'src/modelling/associations/belongs_to_associations.js', 
					'src/modelling/validations/validators.js', 
					'src/modelling/validations/present_validators.js', 
				]
			},
			dist_beta_ui : {
				dest : 'dist/beta-ui.js',
				src : [
					'src/net/browser.js',
					'src/views/templates.js', 
					'src/views/template.js', 
					'src/views/views.js',
					'src/views/router.js',
					 
					'dist/beta-ui-templates.js',
					
					'src/views/containers/holygrail_view/view.js',
					'src/views/containers/list_container_view/view.js', 
					'src/views/containers/single_container_view/view.js', 
					'src/views/containers/switch_container_view/view.js', 
					
					'src/views/controls/button_view/view.js',
					'src/views/controls/input_view/view.js',
					'src/views/controls/check_box_view/view.js',
					'src/views/controls/label_view/view.js',
					'src/views/controls/input_label_view/view.js',
					'src/views/controls/link_view/view.js',
					'src/views/controls/textarea_view/view.js',
					'src/views/controls/progress_view/view.js',
					
					'src/views/lists/list_view/view.js',
					'src/views/lists/item_list_view/view.js',

					'src/views/overlays/overlay_view/view.js',
					'src/views/overlays/fullscreen_overlay_view/view.js',
				]
			},
			dist_beta_common : {
				dest : 'dist/beta-common.js',
				src : [
					'dist/beta-base.js', 
					'dist/beta-data.js',
					'dist/beta-models.js',
				]
			},
			dist_beta : {
				dest : 'dist/beta.js',
				src : [
					'dist/beta-common.js', 
					'dist/beta-ui.js'
				]
			},
			dist_profiler: {
				dest : 'dist/beta-profiler.js',
				src : [
				    'src/tools/profiling/profiler.js',
				]
			},
			dist_server: {
				dest: 'dist/beta-server.js',
				src: [
					'dist/beta-common.js',
					
					'src/net/http_header.js',
					'src/server/databases/databases.js',
					'src/server/databases/database_tables.js',
					'src/server/databases/mongo_database.js',
					'src/server/databases/mongo_database_table.js',
					'src/server/stores/database_store.js',
					'src/server/stores/mongo_database_store.js',
					'src/server/stores/migrator.js',
					'src/server/net/http_header.js'
				]
			},
			dist_strict: {
				dest: 'dist/beta.strict.js',
				src: [
					'src/base/strict.js',
					'dist/beta.js'
				]
			},
		    dist_ui_scss: {
		    	files: {
			        'dist/beta-ui.scss': [
			            'src/views/containers/holygrail_view/styles.scss',
			            'src/views/controls/textarea_view/styles.css',
						'src/views/overlays/overlay_view/styles.css',
						'src/views/overlays/fullscreen_overlay_view/styles.css',
						'src/views/controls/progress_view/styles.css',
			        ]
		    	}
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
					'dist/beta-base.min.js' : [ 'dist/beta-base.js' ],
					'dist/beta-data.min.js' : [ 'dist/beta-data.js' ],
					'dist/beta-models.min.js' : [ 'dist/beta-models.js' ],
					'dist/beta-common.min.js' : [ 'dist/beta-common.js' ],					
					'dist/beta-ui.min.js' : [ 'dist/beta-ui.js' ],
					'dist/beta-server.min.js' : [ 'dist/beta-server.js' ],					
					'dist/beta.min.js' : [ 'dist/beta.js' ],					
				}
			}
		},
		sass: {
		    dist: {
		    	files: {
			        'dist/beta-ui.css': 'dist/beta-ui.scss'
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
		},
		clean: ["dist/beta-ui-templates.js", "dist/beta-ui.scss"]
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');	
	grunt.loadNpmTasks('grunt-contrib-cssmin');	
	grunt.loadNpmTasks('grunt-contrib-clean');	
	

	grunt.registerTask('default', ['templates', 'concat', 'uglify', 'sass', 'cssmin', 'clean']);

};