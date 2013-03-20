module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
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
			            
			            'src/views/controls/button_view/styles.scss',
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

	grunt.registerTask('default', ['concat', 'uglify', 'sass', 'cssmin']);

};